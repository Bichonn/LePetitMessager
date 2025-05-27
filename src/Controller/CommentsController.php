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
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;


final class CommentsController extends AbstractController
{
    #[Route('/comments', name: 'app_comments')]
    public function index(): Response
    {
        return $this->render('comments/index.html.twig', [
            'controller_name' => 'CommentsController',
        ]);
    }

    #[Route('/comments/add', name: 'app_comments_add', methods: ['POST'])]
    public function add(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger, PostsRepository $postsRepository): JsonResponse
    {
        $content = trim((string) $request->request->get('content'));
        $mediaFile = $request->files->get('media');
        $postId = $request->request->get('post_id');

        // 1. Validate that either content or media is present
        if (empty($content) && !$mediaFile) {
            return $this->json(
                ['message' => 'Un commentaire doit contenir du texte ou un média.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // 2. Check for authenticated user
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour poster un commentaire'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // 3. Check if the post exists
        $post = $postsRepository->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // 4. Create and persist the comment if all checks pass
        $comment = new Comments();
        $comment->setFkUser($user); // $user is guaranteed to be non-null here
        $comment->setFkPost($post);

        if (!empty($content)) {
            $comment->setContentText($content);
        }
        $comment->setCreatedAt(new \DateTimeImmutable());

        if ($mediaFile) {
            $originalFilename = pathinfo($mediaFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $mediaFile->guessExtension();

            try {
                $uploadsDirectory = $this->getParameter('uploads_directory'); // Ensure 'uploads_directory' is defined in services.yaml
                if (!file_exists($uploadsDirectory)) {
                    mkdir($uploadsDirectory, 0777, true);
                }
                $mediaFile->move($uploadsDirectory, $newFilename);
                $comment->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                // It's good practice to log the actual error server-side
                // error_log('Comment media upload error: ' . $e->getMessage());
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média.'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($comment);
        $entityManager->flush();

        return $this->json(
            ['message' => 'Commentaire posté avec succès!'], // Consider returning the created comment data
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
