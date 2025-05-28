<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Comments;
use App\Repository\PostsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Service\CloudinaryService;


final class CommentsController extends AbstractController
{
    // Helper function to extract public_id and resource_type from Cloudinary URL
    // (Consider moving to a Trait or common service if used in many controllers)
    private function extractPublicIdAndResourceTypeFromUrl(string $url): ?array
    {
        $pattern = '#^https://res\.cloudinary\.com/([^/]+)/([a-z]+)/(upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)/?(?:[^/]+/)?v\d+/(.+)\.(?:[a-zA-Z0-9]+)$#';
        if (preg_match($pattern, $url, $matches)) {
            return [
                'public_id' => $matches[4],
                'resource_type' => $matches[2]
            ];
        }
        return null;
    }

    #[Route('/comments', name: 'app_comments')]
    public function index(): Response
    {
        return $this->render('comments/index.html.twig', [
            'controller_name' => 'CommentsController',
        ]);
    }

    #[Route('/comments/add', name: 'app_comments_add', methods: ['POST'])]
    public function add(
        Request $request,
        EntityManagerInterface $entityManager,
        PostsRepository $postsRepository,
        CloudinaryService $cloudinaryService // Add this
    ): JsonResponse {
        $content = trim((string) $request->request->get('content'));
        /** @var UploadedFile|null $mediaFile */
        $mediaFile = $request->files->get('media');
        $postId = $request->request->get('post_id');

        if (empty($content) && !$mediaFile) {
            return $this->json(
                ['message' => 'Un commentaire doit contenir du texte ou un média.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour poster un commentaire'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $post = $postsRepository->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $comment = new Comments();
        $comment->setFkUser($user);
        $comment->setFkPost($post);

        if (!empty($content)) {
            $comment->setContentText($content);
        }
        $comment->setCreatedAt(new \DateTimeImmutable());

        if ($mediaFile) {
            $cloudinary = $cloudinaryService->getCloudinary();
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($mediaFile->getRealPath(), [
                    'folder' => 'comment_media', // Optional: specify a folder
                    'resource_type' => 'auto'
                ]);
                $comment->setContentMultimedia($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média pour le commentaire: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($comment);
        $entityManager->flush();

        // Return the created comment data, including the Cloudinary URL
        $commentData = [
            'id' => $comment->getId(),
            'content_text' => $comment->getContentText(),
            'content_multimedia' => $comment->getContentMultimedia(), // Cloudinary URL
            'created_at' => $comment->getCreatedAt()?->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $comment->getFkUser()?->getId(),
                'username' => $comment->getFkUser()?->getUsername(),
                'avatar_url' => $comment->getFkUser()?->getProfilePicture(), // Assuming this is already a Cloudinary URL
            ]
        ];

        return $this->json(
            ['message' => 'Commentaire posté avec succès!', 'comment' => $commentData],
            Response::HTTP_CREATED
        );
    }

    #[Route('/comments/post/{postId}', name: 'app_comments_by_post', methods: ['GET'])]
    public function getCommentsByPost(int $postId, PostsRepository $postsRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $post = $postsRepository->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $comments = $entityManager->getRepository(Comments::class)->findBy(
            ['fk_post' => $post],
            ['created_at' => 'ASC']
        );

        $data = [];
        foreach ($comments as $comment) {
            $data[] = [
                'id' => $comment->getId(),
                'content_text' => $comment->getContentText(),
                'content_multimedia' => $comment->getContentMultimedia(),
                'created_at' => $comment->getCreatedAt()?->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $comment->getFkUser()?->getId(),
                    'username' => $comment->getFkUser()?->getUsername(),
                    'avatar_url' => $comment->getFkUser()?->getProfilePicture(),
                ]
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }

}
