<?php

namespace App\Controller;

use App\Entity\Posts;
use App\Entity\PostsReports;
use App\Entity\Users;
use App\Entity\Hashtags;
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

        $maxLength = $user->isUserPremium() ? 180 : 140;
        if (!empty($content) && mb_strlen($content) > $maxLength) {
            return $this->json(
                ['message' => "Le texte du post ne doit pas dépasser $maxLength caractères."],
                Response::HTTP_BAD_REQUEST
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

        $hashtagsInput = $request->request->get('hashtags', ''); // ex: "#chat #chien"
        $hashtagsArray = array_filter(array_map('trim', explode(' ', $hashtagsInput)));

        foreach ($hashtagsArray as $hashtagContent) {
            if (empty($hashtagContent)) continue;
            $hashtagContent = ltrim($hashtagContent, '#');
            $hashtagRepo = $entityManager->getRepository(Hashtags::class);
            $hashtag = $hashtagRepo->findOneBy(['content' => $hashtagContent]);
            if (!$hashtag) {
                $hashtag = new Hashtags();
                $hashtag->setContent($hashtagContent);
                $entityManager->persist($hashtag);
            }
            $post->addHashtag($hashtag);
        }

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
    public function list(Request $request, PostsRepository $postsRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 20);

        // Use the new repository method to find paginated posts for the feed
        $paginator = $postsRepository->findFeedPostsPaginated($page, $limit);
        
        $postsEntities = [];
        foreach ($paginator as $postEntity) {
            $postsEntities[] = $postEntity;
        }
        $totalPosts = count($paginator);

        if (empty($postsEntities) && $page === 1) {
            return $this->json(
                [
                    'posts' => [],
                    'totalPosts' => 0,
                    'currentPage' => 1, // Corrected to reflect current page even if empty
                    'limit' => $limit
                ],
                Response::HTTP_OK
            );
        }

        // Sérialisation personnalisée pour éviter les références circulaires
        $currentUser = $this->getUser();

        $data = [];
        foreach ($postsEntities as $post) { // Iterate over the correctly ordered $postsEntities
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

            $repostsCollection = $post->getReposts(); // This is already ordered by created_at DESC
            $repostsCount = count($repostsCollection);
            $repostedByUser = false;
            if ($currentUser instanceof Users) {
                foreach ($repostsCollection as $repostEntity) { // Renamed to avoid conflict
                    $repostUser = $repostEntity->getFkUser();
                    if ($repostUser instanceof Users && $repostUser->getId() === $currentUser->getId()) {
                        $repostedByUser = true;
                        break;
                    }
                }
            }

            $commentsCollection = $post->getComments();
            $commentsCount = count($commentsCollection);

            $reposterInfo = null;
            /** @var \App\Entity\Reposts|false $latestRepost */
            $latestRepost = $repostsCollection->first(); // Get the latest repost

            // If there is a latest repost and its creation date is more recent than the post's original creation date,
            // it implies this repost influenced the post's position in the feed.
            if ($latestRepost && $latestRepost->getCreatedAt() > $post->getCreatedAt()) {
                $reposterUser = $latestRepost->getFkUser();
                if ($reposterUser) {
                    $reposterInfo = [
                        'id' => $reposterUser->getId(),
                        'username' => $reposterUser->getUsername(),
                        // 'avatar_url' => $reposterUser->getProfilePicture(), // Optionally include if you want to display avatar
                    ];
                }
            }

            $hashtagData = array_map(fn($h) => [
                'id' => $h->getId(),
                'content' => $h->getContent()
            ], $post->getHashtags()->toArray());

            $favorisByUser = false;
            if ($currentUser instanceof Users) {
                $favorisByUser = $post->getFavoris()->exists(fn($key, $favori) => $favori->getFkUser()->getId() === $currentUser->getId());
            }

            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('c'),
                'updated_at' => $post->getUpdatedAt() ? $post->getUpdatedAt()->format('c') : null,
                'likes_count' => $likesCount,
                'liked_by_user' => $likedByUser,
                'comments_count' => $commentsCount,
                'reposts_count' => $repostsCount,
                'reposted_by_user' => $repostedByUser,
                'favoris_by_user' => $favorisByUser,
                'hashtags' => $hashtagData,
                'user' => [
                    'id' => $post->getFkUser()->getId(),
                    'username' => $post->getFkUser()->getUsername(),
                    'avatar_url' => $post->getFkUser()->getProfilePicture(),
                    'user_premium' => $post->getFkUser()->isUserPremium(), // Ajoutez cette ligne
                ]
            ];

            $data[] = $postData;
        }

        return $this->json([
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
                'created_at' => $post->getCreatedAt()->format('c'), // Format ISO 8601
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar_url' => $user->getProfilePicture(),
                    'user_premium' => $user->isUserPremium(), // Ajoutez cette ligne
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
                'created_at' => $post->getCreatedAt()->format('c'), // Format ISO 8601
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

    #[Route('/post/{id}/report', name: 'app_post_report', methods: ['POST'])]
    public function reportPost(
        Request $request,
        Posts $postToReport,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        /** @var Users|null $currentUser */
        $currentUser = $this->getUser();
        if (!$currentUser instanceof Users) {
            return $this->json(['message' => 'Authentification requise pour signaler un post.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($postToReport->getFkUser() === $currentUser) {
            return $this->json(['message' => 'Vous ne pouvez pas signaler votre propre post.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $reason = $data['reason'] ?? null;

        if (empty($reason)) {
            return $this->json(['message' => 'La raison du signalement est requise.'], Response::HTTP_BAD_REQUEST);
        }

        // Optional: Check for existing report from this user for this post to avoid duplicates
        $existingReport = $entityManager->getRepository(PostsReports::class)->findOneBy([
            'fk_user' => $currentUser, // MODIFIÉ: fk_reporter par fk_user
            'fk_post' => $postToReport,
            // 'content' => $reason, // You might want to allow multiple reports if reasons differ, or only one report per user per post
        ]);

        if ($existingReport) {
            return $this->json(['message' => 'Vous avez déjà signalé ce post.'], Response::HTTP_CONFLICT);
        }

        $report = new PostsReports();
        $report->setFkUser($currentUser); // MODIFIÉ: setFkReporter par setFkUser
        $report->setFkPost($postToReport);
        $report->setContent($reason);
        $report->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($report);
        $entityManager->flush();

        return $this->json(['message' => 'Post signalé avec succès.'], Response::HTTP_OK);
    }
}