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
use Symfony\Component\Serializer\SerializerInterface;

class PostsController extends AbstractController
{
    #[Route('/post/create', name: 'app_post_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        $content = $request->request->get('content');
        $mediaFile = $request->files->get('media');

        // 1. Vérification du contenu texte (obligatoire)
        if (empty($content)) {
            return $this->json(
                ['message' => 'Le contenu texte est obligatoire'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // 2. Vérification de l'utilisateur connecté (obligatoire)
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour créer un post'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $post = new Posts();
        $post->setFkUser($user); // Obligatoire
        $post->setContentText($content); // Obligatoire
        $post->setCreatedAt(new \DateTimeImmutable());

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

                $post->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier : ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($post);
        $entityManager->flush();

        return $this->json(
            ['message' => 'Post créé avec succès'],
            Response::HTTP_CREATED
        );
    }

    #[Route('/posts', name: 'app_posts', methods: ['GET'])]
    public function show(EntityManagerInterface $entityManager, SerializerInterface $serializer): JsonResponse
    {
        $posts = $entityManager->getRepository(Posts::class)->findAll();

        if (!$posts) {
            return $this->json(
                ['message' => 'Aucun post trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Sérialisation personnalisée pour éviter les références circulaires
        $data = [];
        foreach ($posts as $post) {
            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => null
            ];

            // Vérifier si getFkUser() retourne un objet avant d'accéder à ses propriétés
            if ($post->getFkUser()) {
                $postData['user'] = [
                    'id' => $post->getFkUser()->getId(),
                    'username' => $post->getFkUser()->getUsername(),
                ];
            }

            $data[] = $postData;
        }

        return $this->json($data, Response::HTTP_OK);
    }
}
