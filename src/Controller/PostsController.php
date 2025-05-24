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
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;


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

    #[Route('/post/{id}/update', name: 'app_post_update', methods: ['POST'])] // Using POST for FormData
    public function update(
        Request $request,
        Posts $post, // ParamConverter fetches the Post by ID
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        Filesystem $filesystem
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }
        if ($post->getFkUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à modifier ce post.'], Response::HTTP_FORBIDDEN);
        }

        $newContentText = $request->request->get('content_text');
        $newMediaFile = $request->files->get('media');
        $removeMediaFlag = $request->request->get('remove_media') === '1';

        // Update content text (allow empty string to clear text)
        if ($newContentText !== null) {
            $post->setContentText(trim($newContentText) === '' ? null : $newContentText);
        }

        $oldMediaFilename = $post->getContentMultimedia();

        // Handle media removal if flag is set and there was an old media
        if ($removeMediaFlag && $oldMediaFilename) {
            $oldMediaPath = $this->getParameter('uploads_directory') . '/' . $oldMediaFilename;
            if ($filesystem->exists($oldMediaPath)) {
                $filesystem->remove($oldMediaPath);
            }
            $post->setContentMultimedia(null);
            $oldMediaFilename = null; // Media is now removed
        }

        // Handle new media upload
        if ($newMediaFile instanceof UploadedFile) {
            // Delete old media if it exists and a new one is uploaded
            if ($oldMediaFilename) {
                $oldMediaPath = $this->getParameter('uploads_directory') . '/' . $oldMediaFilename;
                if ($filesystem->exists($oldMediaPath)) {
                    $filesystem->remove($oldMediaPath);
                }
            }

            $originalFilename = pathinfo($newMediaFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $newMediaFile->guessExtension();

            try {
                if (!file_exists($this->getParameter('uploads_directory'))) {
                    mkdir($this->getParameter('uploads_directory'), 0777, true);
                }
                $newMediaFile->move($this->getParameter('uploads_directory'), $newFilename);
                $post->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                return $this->json(['message' => 'Erreur lors de l\'upload du nouveau fichier: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }
        
        // A post must have either text content or multimedia content
        if (empty($post->getContentText()) && empty($post->getContentMultimedia())) {
            return $this->json(['message' => 'Le post ne peut pas être vide. Veuillez ajouter du texte ou un média.'], Response::HTTP_BAD_REQUEST);
        }

        $post->setUpdatedAt(new \DateTimeImmutable());
        $entityManager->flush();

        return $this->json(
            ['message' => 'Post mis à jour avec succès!', 'post' => [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'updated_at' => $post->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]],
            Response::HTTP_OK
        );
    }

    #[Route('/post/{id}/delete', name: 'app_post_delete', methods: ['DELETE'])]
    public function delete(
        Posts $post, // ParamConverter fetches the Post by ID
        EntityManagerInterface $entityManager,
        Filesystem $filesystem
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($post->getFkUser() !== $user) {
            return $this->json(['message' => 'Vous n\'êtes pas autorisé à supprimer ce post.'], Response::HTTP_FORBIDDEN);
        }

        // Delete associated media file if it exists
        $mediaFilename = $post->getContentMultimedia();
        if ($mediaFilename) {
            $mediaPath = $this->getParameter('uploads_directory') . '/' . $mediaFilename;
            if ($filesystem->exists($mediaPath)) {
                try {
                    $filesystem->remove($mediaPath);
                } catch (\Exception $e) {
                    // Log error or handle, but proceed with DB deletion
                    // For example: $this->logger->error('Failed to delete media file: '.$e->getMessage());
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

    #[Route('/posts', name: 'app_posts', methods: ['GET'])]
    public function show(EntityManagerInterface $entityManager, SerializerInterface $serializer): JsonResponse
    {
        $posts = $entityManager->getRepository(Posts::class)->findBy([], ['created_at' => 'DESC']);

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
