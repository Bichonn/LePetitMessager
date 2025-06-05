<?php

namespace App\Controller;

use App\Entity\Posts;
use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Service\CloudinaryService;
use App\Repository\PostsRepository;

class PostsController extends AbstractController
{
    // Helper function to extract public_id and resource_type from Cloudinary URL
    private function extractPublicIdAndResourceTypeFromUrl(string $url): ?array
    {
        $pattern = '#^https://res\.cloudinary\.com/([^/]+)/([a-z]+)/(upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)/?(?:[^/]+/)?v\d+/(.+)\.(?:[a-zA-Z0-9]+)$#';
        if (preg_match($pattern, $url, $matches)) {
            return [
                'public_id' => $matches[4], // e.g., folder/public_id_value
                'resource_type' => $matches[2] // e.g., image, video
            ];
        }
        return null;
    }

    #[Route('/post/create', name: 'app_post_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        // SluggerInterface $slugger, // Remove if not used for Cloudinary public_id generation
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $content = $request->request->get('content');
        /** @var UploadedFile|null $mediaFile */
        $mediaFile = $request->files->get('media');

        if (empty($content) && !$mediaFile) { // Allow posts with only media or only text
             return $this->json(
                 ['message' => 'Le contenu du post ou un média est obligatoire.'],
                 Response::HTTP_BAD_REQUEST
             );
        }

        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour créer un post'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $post = new Posts();
        $post->setFkUser($user);
        if(!empty($content)) {
            $post->setContentText($content);
        }
        $post->setCreatedAt(new \DateTimeImmutable());

        if ($mediaFile) {
            $cloudinary = $cloudinaryService->getCloudinary();
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($mediaFile->getRealPath(), [
                    'folder' => 'post_media', // Optional: specify a folder in Cloudinary
                    'resource_type' => 'auto' // Automatically detect image or video
                ]);
                $post->setContentMultimedia($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média sur Cloudinary: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return $this->json(
            ['message' => 'Post créé avec succès'], // Consider returning the created post data
            Response::HTTP_CREATED
        );
    }

    #[Route('/post/{id}/update', name: 'app_post_update', methods: ['POST'])]
    public function update(
        Request $request,
        Posts $post,
        EntityManagerInterface $entityManager,
        // SluggerInterface $slugger, // Remove if not used for Cloudinary public_id
        // Filesystem $filesystem, // Remove as local files are not handled
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }
        if ($post->getFkUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à modifier ce post.'], Response::HTTP_FORBIDDEN);
        }

        $newContentText = $request->request->get('content_text');
        /** @var UploadedFile|null $newMediaFile */
        $newMediaFile = $request->files->get('media');
        $removeMediaFlag = $request->request->get('remove_media') === '1';

        $cloudinary = $cloudinaryService->getCloudinary();
        $oldMediaUrl = $post->getContentMultimedia();

        if ($newContentText !== null) {
            $post->setContentText(trim($newContentText) === '' ? null : $newContentText);
        }

        // Handle media removal if flag is set
        if ($removeMediaFlag && $oldMediaUrl) {
            $mediaInfo = $this->extractPublicIdAndResourceTypeFromUrl($oldMediaUrl);
            if ($mediaInfo) {
                try {
                    $cloudinary->uploadApi()->destroy($mediaInfo['public_id'], ['resource_type' => $mediaInfo['resource_type']]);
                } catch (\Exception $e) {
                    // Log error: "Failed to delete old media from Cloudinary: " . $e->getMessage()
                }
            }
            $post->setContentMultimedia(null);
            $oldMediaUrl = null; // Media is now removed
        }

        // Handle new media upload
        if ($newMediaFile instanceof UploadedFile) {
            // Delete old media from Cloudinary if it exists and a new one is uploaded
            if ($oldMediaUrl) {
                $mediaInfo = $this->extractPublicIdAndResourceTypeFromUrl($oldMediaUrl);
                if ($mediaInfo) {
                    try {
                        $cloudinary->uploadApi()->destroy($mediaInfo['public_id'], ['resource_type' => $mediaInfo['resource_type']]);
                    } catch (\Exception $e) {
                        // Log error: "Failed to delete old media from Cloudinary before new upload: " . $e->getMessage()
                    }
                }
            }

            try {
                $uploadResult = $cloudinary->uploadApi()->upload($newMediaFile->getRealPath(), [
                    'folder' => 'post_media',
                    'resource_type' => 'auto'
                ]);
                $post->setContentMultimedia($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                return $this->json(['message' => 'Erreur lors de l\'upload du nouveau fichier média sur Cloudinary: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        if (empty($post->getContentText()) && empty($post->getContentMultimedia())) {
            return $this->json(['message' => 'Le post ne peut pas être vide. Veuillez ajouter du texte ou un média.'], Response::HTTP_BAD_REQUEST);
        }

        $post->setUpdatedAt(new \DateTimeImmutable());
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Post mis à jour avec succès!',
                'post' => [ // Return updated post data for frontend
                    'id' => $post->getId(),
                    'content_text' => $post->getContentText(),
                    'content_multimedia' => $post->getContentMultimedia(), // This will be the Cloudinary URL
                    'updated_at' => $post->getUpdatedAt()?->format('Y-m-d H:i:s'),
                     // Include other fields if your frontend needs them
                ]
            ],
            Response::HTTP_OK
        );
    }

    #[Route('/post/{id}/delete', name: 'app_post_delete', methods: ['DELETE'])]
    public function delete(
        Posts $post,
        EntityManagerInterface $entityManager,
        // Filesystem $filesystem, // Remove
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($post->getFkUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à supprimer ce post.'], Response::HTTP_FORBIDDEN);
        }

        $mediaUrl = $post->getContentMultimedia();
        if ($mediaUrl) {
            $mediaInfo = $this->extractPublicIdAndResourceTypeFromUrl($mediaUrl);
            if ($mediaInfo) {
                $cloudinary = $cloudinaryService->getCloudinary();
                try {
                    $cloudinary->uploadApi()->destroy($mediaInfo['public_id'], ['resource_type' => $mediaInfo['resource_type']]);
                } catch (\Exception $e) {
                    // Log error: "Failed to delete media from Cloudinary: " . $e->getMessage()
                    // Decide if you want to stop the DB deletion or proceed.
                }
            }
        }

        try {
            $entityManager->remove($post);
            $entityManager->flush();
            return $this->json(['message' => 'Post supprimé avec succès.'], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log error
            return $this->json(['message' => 'Erreur lors de la suppression du post: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/posts', name: 'app_posts_list', methods: ['GET'])]
    public function list(
        Request $request, // Add Request object
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        PostsRepository $postsRepository // Inject PostsRepository
    ): JsonResponse {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20); // Default limit to 20 posts per page
        $offset = ($page - 1) * $limit;

        // Use the repository to find paginated posts
        $posts = $postsRepository->findBy([], ['created_at' => 'DESC'], $limit, $offset);
        $totalPosts = $postsRepository->count([]); // Get total count for pagination

        if (empty($posts) && $page === 1) { // Modifié pour retourner OK si aucun post mais pas une erreur
            return $this->json(
                [
                    'posts' => [],
                    'totalPosts' => 0,
                    'currentPage' => 1,
                    'limit' => $limit
                ],
                Response::HTTP_OK
            );
        }

        // Sérialisation personnalisée pour éviter les références circulaires
        $currentUser = $this->getUser();

        $data = [];
        foreach ($posts as $post) {
            $likes = $post->getLikes();
            $likesCount = count($likes);
            $likedByUser = false;
            if ($currentUser instanceof Users) {
                foreach ($likes as $like) {
                    $likeUser = $like->getFkUser();
                    if ($likeUser instanceof Users && $likeUser->getId() === $currentUser->getId()) {
                        $likedByUser = true;
                        break;
                    }
                }
            }

            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => null, // Initialisation
                'likes_count' => $likesCount,
                'liked_by_user' => $likedByUser
            ];

            if ($post->getFkUser()) {
                $postData['user'] = [
                    'id' => $post->getFkUser()->getId(),
                    'username' => $post->getFkUser()->getUsername(),
                    'avatar_url' => $post->getFkUser()->getProfilePicture()
                ];
            }
            $data[] = $postData;
        }

        return new JsonResponse([
            'posts' => $data,
            'totalPosts' => $totalPosts,
            'currentPage' => $page,
            'limit' => $limit
        ]);
    }

    #[Route('/users/{userId}/posts', name: 'app_user_posts_list', methods: ['GET'])]
    public function listUserPosts(
        int $userId,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ): JsonResponse {
        $userRepository = $entityManager->getRepository(Users::class);
        $user = $userRepository->find($userId);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $posts = $entityManager->getRepository(Posts::class)->findBy(
            ['fk_user' => $user],
            ['created_at' => 'DESC']
        );

        if (empty($posts)) {
            return $this->json([], Response::HTTP_OK);
        }

        $data = [];
        foreach ($posts as $post) {
            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar_url' => $user->getProfilePicture()
                ]
            ];
            $data[] = $postData;
        }

        return new JsonResponse($data);
    }

    #[Route('/posts/top-data', name: 'app_posts_top_data', methods: ['GET'])]
    public function topPostsData(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20);

        // Get most liked posts
        $qb = $entityManager->createQueryBuilder();
        $qb->select('p', 'COUNT(l) as likesCount')
           ->from('App\Entity\Posts', 'p')
           ->leftJoin('p.likes', 'l')
           ->groupBy('p.id')
           ->having('COUNT(l) > 0')
           ->orderBy('likesCount', 'DESC')
           ->setFirstResult(($page - 1) * $limit)
           ->setMaxResults($limit);

        // Count total posts with at least one like
        $qbCount = $entityManager->createQueryBuilder();
        $qbCount->select('COUNT(DISTINCT p.id)')
                ->from('App\Entity\Posts', 'p')
                ->leftJoin('p.likes', 'l')
                ->groupBy('p.id')
                ->having('COUNT(l) > 0');  // Même filtre ici
        
        $totalPosts = count($qbCount->getQuery()->getResult());

        $results = $qb->getQuery()->getResult();

        // Format posts data
        $postsData = [];
        $currentUser = $this->getUser();

        foreach ($results as $result) {
            $post = $result[0];
            $likesCount = $result['likesCount'];
            
            $likedByUser = false;
            if ($currentUser) {
                $likedByUser = $post->getLikes()->exists(function($key, $like) use ($currentUser) {
                    return $like->getFkUser() === $currentUser;
                });
            }

            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'likes_count' => $likesCount,
                'liked_by_user' => $likedByUser,
                'user' => [
                    'id' => $post->getFkUser()->getId(),
                    'username' => $post->getFkUser()->getUsername(),
                    'avatar_url' => $post->getFkUser()->getProfilePicture()
                ]
            ];

            $postsData[] = $postData;
        }

        return $this->json([
            'posts' => $postsData,
            'totalPosts' => $totalPosts,
            'currentPage' => $page,
            'limit' => $limit
        ]);
    }

    #[Route('/posts/top', name: 'app_posts_top_page', methods: ['GET'])]
    public function topPostsPage(): Response
    {
        return $this->render('posts/top_posts.html.twig');
    }
}
