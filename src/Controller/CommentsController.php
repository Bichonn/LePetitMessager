<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Comments;
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
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        $content = $request->request->get('content');
        $mediaFile = $request->files->get('media');

        if (empty($content)) {
            return $this->json(
                ['message' => 'Le contenu texte est obligatoire'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour poster un commentaire'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $comment = new Comments();
        $comment->setFkUser($user); // Obligatoire
        $comment->setFkPost($entityManager->getRepository(Posts::class)->find($request->request->get('post_id'))); // Obligatoire
        $comment->setContentText($content); // Obligatoire
        $comment->setCreatedAt(new \DateTimeImmutable());

        // Gestion du média (optionnel)
        if ($mediaFile) {
            $originalFilename = pathinfo($mediaFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $mediaFile->guessExtension();

            try {
                if (!file_exists($this->getParameter('uploads_directory'))) {
                    mkdir($this->getParameter('uploads_directory'), 0777, true);
                }

                $mediaFile->move(
                    $this->getParameter('uploads_directory'),
                    $newFilename
                );

                $comment->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier : ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($comment);
        $entityManager->flush();

        return $this->json(
            ['message' => 'Commentaire posté avec succès'],
            Response::HTTP_CREATED
        );
    }

}
