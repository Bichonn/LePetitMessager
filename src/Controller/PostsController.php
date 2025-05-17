<?php

namespace App\Controller;

use App\Entity\Posts;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

class PostsController extends AbstractController
{
    #[Route('/post/create', name: 'app_post_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager, SluggerInterface $slugger): JsonResponse
    {
        $content = $request->request->get('content');
        $mediaFile = $request->files->get('media');

        if (empty($content) && !$mediaFile) {
            return $this->json(['message' => 'Le post doit contenir du texte ou une image'], Response::HTTP_BAD_REQUEST);
        }

        $post = new Posts();

        // Si l'utilisateur est connecté, associer le post à cet utilisateur
        // Sinon, laisser fk_user à null
        if ($this->getUser()) {
            $post->setFkUser($this->getUser());
        }
        // Aucun else - cela laissera fk_user à null par défaut

        $post->setContentText($content);
        $post->setCreatedAt(new \DateTimeImmutable());

        // Handle file upload if present
        if ($mediaFile) {
            $originalFilename = pathinfo($mediaFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $mediaFile->guessExtension();

            try {
                // Assurez-vous que le répertoire existe
                if (!file_exists($this->getParameter('uploads_directory'))) {
                    mkdir($this->getParameter('uploads_directory'), 0777, true);
                }

                $mediaFile->move(
                    $this->getParameter('uploads_directory'),
                    $newFilename
                );

                $post->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                return $this->json([
                    'message' => 'Une erreur est survenue lors de l\'upload du fichier: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return $this->json(['message' => 'Post créé avec succès'], Response::HTTP_CREATED);
    }
}
