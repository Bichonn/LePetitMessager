<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Users;
use App\Entity\Messages;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Service\CloudinaryService; 
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class MessagesController extends AbstractController
{
    #[Route('/messages', name: 'app_messages_index', methods: ['GET'])]
    public function index(): Response
    {
        // Si l'utilisateur n'est pas connecté, show_login_message sera true
        $showLoginMessage = !$this->getUser(); 

        return $this->render('messages/index.html.twig', [
            'show_login_message' => $showLoginMessage,
        ]);
    }

    #[Route('/message/create', name: 'app_message_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        CloudinaryService $cloudinaryService // Ajoutez CloudinaryService ici
    ): JsonResponse {
        $content = $request->request->get('content');
        /** @var UploadedFile|null $mediaFile */
        $mediaFile = $request->files->get('media');

        if (empty($content) && !$mediaFile) { // Permettre les messages avec seulement du texte ou seulement un média
            return $this->json(
                ['message' => 'Le contenu du message ou un média est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) { // Assurez-vous que Users est bien App\Entity\Users
            return $this->json(
                ['message' => 'Vous devez être connecté pour envoyer un message'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $fk_user2_id = $request->request->get('fk_user2');
        if (!$fk_user2_id) {
            return $this->json(['message' => 'ID du destinataire manquant'], Response::HTTP_BAD_REQUEST);
        }
        
        $FkUser2 = $entityManager->getRepository(Users::class)->find($fk_user2_id);
        if (!$FkUser2) {
            return $this->json(['message' => 'Destinataire introuvable'], Response::HTTP_NOT_FOUND);
        }

        $message = new Messages();
        $message->setFkUser1($user);
        $message->setFkUser2($FkUser2);
        if (!empty($content)) {
            $message->setContentText($content);
        }
        $message->setCreatedAt(new \DateTimeImmutable());

        if ($mediaFile) {
            $cloudinary = $cloudinaryService->getCloudinary();
            try {
                $originalFilename = pathinfo($mediaFile->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $slugger->slug($originalFilename);
                // Créez un public_id unique, par exemple en utilisant un dossier spécifique pour les messages
                $publicId = 'message_media/' . $safeFilename . '-' . uniqid();

                $uploadResult = $cloudinary->uploadApi()->upload($mediaFile->getRealPath(), [
                    'public_id' => $publicId,
                    'folder' => 'message_media', // Dossier sur Cloudinary pour les médias des messages
                    'resource_type' => 'auto'    // Détection automatique du type (image/vidéo)
                ]);
                $message->setContentMultimedia($uploadResult['secure_url']); // Enregistrez l'URL Cloudinary
            } catch (\Exception $e) {
                // Logguez l'erreur $e->getMessage()
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média sur Cloudinary: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($message);
        $entityManager->flush();

        // Renvoyez les données du message créé, y compris l'URL du média si le frontend en a besoin immédiatement
        return $this->json(
            [
                'message' => 'Message envoyé avec succès',
                // Optionnel: renvoyer les données du message si nécessaire
                // 'sentMessage' => [
                //     'id' => $message->getId(),
                //     'content' => $message->getContentText(),
                //     'media' => $message->getContentMultimedia(),
                //     'created_at' => $message->getCreatedAt()->format('c'),
                //     'from' => $user->getId(),
                //     'to' => $FkUser2->getId()
                // ]
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/messages/users', name: 'app_messages_users', methods: ['GET'])]
    public function getMessagedUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupère tous les messages où l'utilisateur est soit fk_user1 soit fk_user2
        $messages = $entityManager->getRepository(Messages::class)->createQueryBuilder('m')
            ->where('m.fk_user1 = :user OR m.fk_user2 = :user')
            ->setParameter('user', $user)
            ->orderBy('m.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $users = [];
        foreach ($messages as $message) {
            $other = $message->getFkUser1() === $user ? $message->getFkUser2() : $message->getFkUser1();
            if ($other && !isset($users[$other->getId()])) {
                $users[$other->getId()] = [
                    'id' => $other->getId(),
                    'username' => $other->getUsername(),
                    'avatar_url' => $other->getProfilePicture(),
                ];
            }
        }

        return $this->json(array_values($users));
    }

    #[Route('/messages/{id}', name: 'app_messages_discussion', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function discussion(int $id, EntityManagerInterface $entityManager): Response
    {
        $recipient = $entityManager->getRepository(Users::class)->find($id);
        if (!$recipient) {
            throw $this->createNotFoundException('Utilisateur non trouvé');
        }

        return $this->render('messages/discussion.html.twig', [
            'recipientId' => $id,
        ]);
    }

    #[Route('/messages/thread/{id}', name: 'app_messages_thread', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function getThread(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $recipient = $entityManager->getRepository(Users::class)->find($id);
        if (!$recipient) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $qb = $entityManager->createQueryBuilder();
        $qb->select('m')
            ->from(Messages::class, 'm')
            ->where(' (m.fk_user1 = :user AND m.fk_user2 = :recipient) OR (m.fk_user1 = :recipient AND m.fk_user2 = :user) ')
            ->setParameter('user', $user)
            ->setParameter('recipient', $recipient)
            ->orderBy('m.created_at', 'ASC');

        $query = $qb->getQuery();
        $messages = $query->getResult();

        $messagesArray = [];
        foreach ($messages as $messageEntity) {
            /** @var Messages $messageEntity */
            $messagesArray[] = [
                'id' => $messageEntity->getId(),
                'from' => $messageEntity->getFkUser1()->getId(),
                'to' => $messageEntity->getFkUser2()->getId(),
                'content' => $messageEntity->getContentText(),
                'media' => $messageEntity->getContentMultimedia(), // Ceci sera l'URL Cloudinary
                'created_at' => $messageEntity->getCreatedAt()->format('c'), // Format ISO 8601
            ];
        }

        return $this->json($messagesArray);
    }
}
