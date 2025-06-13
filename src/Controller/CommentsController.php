<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Comments;
use App\Entity\Notifications;
use App\Repository\PostsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Service\CloudinaryService;

final class CommentsController extends AbstractController
{
    /**
     * Extract public_id and resource_type from Cloudinary URL for media management
     * (Consider moving to a Trait or common service if used in many controllers)
     */
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

    /**
     * Render comments index page
     */
    #[Route('/comments', name: 'app_comments')]
    public function index(): Response
    {
        return $this->render('comments/index.html.twig', [
            'controller_name' => 'CommentsController',
        ]);
    }

    /**
     * Add a new comment to a post with optional media
     */
    #[Route('/comments/add', name: 'app_comments_add', methods: ['POST'])]
    public function add(
        Request $request,
        EntityManagerInterface $entityManager,
        PostsRepository $postsRepository,
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $content = trim((string) $request->request->get('content'));
        /** @var UploadedFile|null $mediaFile */
        $mediaFile = $request->files->get('media');
        $postId = $request->request->get('post_id');

        // Validate that comment has either text or media
        if (empty($content) && !$mediaFile) {
            return $this->json(
                ['message' => 'Un commentaire doit contenir du texte ou un média.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Check user authentication
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour poster un commentaire'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Verify post exists
        $post = $postsRepository->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Create new comment entity
        $comment = new Comments();
        $comment->setFkUser($user);
        $comment->setFkPost($post);

        // Set text content if provided
        if (!empty($content)) {
            $comment->setContentText($content);
        }
        $comment->setCreatedAt(new \DateTimeImmutable());

        // Handle media upload if provided
        if ($mediaFile) {
            $cloudinary = $cloudinaryService->getCloudinary();
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($mediaFile->getRealPath(), [
                    'folder' => 'comment_media', // Optional: specify a folder
                    'resource_type' => 'auto'
                ]);
                $comment->setContentMultimedia($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error and return failure response
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média pour le commentaire: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($comment);

        // Create notification for post author (if not commenting on own post)
        if ($post->getFkUser() && $post->getFkUser() !== $user) {
            $notif = new Notifications();
            $notif->setFkUser($post->getFkUser());
            $notif->setFkPost($post);
            $notif->setContent($user->getUsername() . " a commenté votre message.");
            $notif->setIsRead(false);
            $notif->setCreatedAt(new \DateTimeImmutable());
            $entityManager->persist($notif);
        }

        $entityManager->flush();

        // Return created comment data with user information
        $commentData = [
            'id' => $comment->getId(),
            'content_text' => $comment->getContentText(),
            'content_multimedia' => $comment->getContentMultimedia(),
            'created_at' => $comment->getCreatedAt()?->format('Y-m-d H:i:s'),
            'user' => [
                'id' => $comment->getFkUser()?->getId(),
                'username' => $comment->getFkUser()?->getUsername(),
                'avatar_url' => $comment->getFkUser()?->getProfilePicture(),
                'user_premium' => $comment->getFkUser()?->isUserPremium(),
            ]
        ];

        return $this->json(
            ['message' => 'Commentaire posté avec succès!', 'comment' => $commentData],
            Response::HTTP_CREATED
        );
    }

    /**
     * Get all comments for a specific post ordered by creation date
     */
    #[Route('/comments/post/{postId}', name: 'app_comments_by_post', methods: ['GET'])]
    public function getCommentsByPost(int $postId, PostsRepository $postsRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        // Verify post exists
        $post = $postsRepository->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Get comments ordered by creation date (oldest first)
        $comments = $entityManager->getRepository(Comments::class)->findBy(
            ['fk_post' => $post],
            ['created_at' => 'ASC']
        );

        // Format comment data for response
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
                    'user_premium' => $comment->getFkUser()?->isUserPremium(),
                ]
            ];
        }

        return $this->json($data, Response::HTTP_OK);
    }
}
