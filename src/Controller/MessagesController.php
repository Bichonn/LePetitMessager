<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Users;
use App\Entity\Messages;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

final class MessagesController extends AbstractController
{
    #[Route('/messages', name: 'app_messages')]
    public function index(): Response
    {
        return $this->render('messages/index.html.twig', [
            'controller_name' => 'MessagesController',
        ]);
    }

    #[Route('/message/create', name: 'app_message_create', methods: ['POST'])]
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
                ['message' => 'Vous devez être connecté pour envoyer un message'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $fk_user2 = $request->request->get('fk_user2');
        if (!$fk_user2) {
            return $this->json(['message' => 'ID du messager receveur manquant'], Response::HTTP_BAD_REQUEST);
        }

        $FkUser2 = $entityManager->getRepository(Users::class)->find($fk_user2);
        if (!$fk_user2) {
            return $this->json(['message' => 'Messager destinataire introuvable'], Response::HTTP_NOT_FOUND);
        }

        $message = new Messages();
        $message->setFkUser1($user); // Obligatoire
        $message->setFkUser2($FkUser2); // Obligatoire
        $message->setContentText($content); // Obligatoire
        $message->setCreatedAt(new \DateTimeImmutable());

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

                $message->setContentMultimedia($newFilename);
            } catch (\Exception $e) {
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier : ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($message);
        $entityManager->flush();

        return $this->json(
            ['message' => 'Message envoyé avec succès'],
            Response::HTTP_CREATED
        );
    }
}
