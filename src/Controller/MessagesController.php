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

#[IsGranted('IS_AUTHENTICATED_FULLY')] // Require authentication for all methods
class MessagesController extends AbstractController
{
    /**
     * Render messages index page
     */
    #[Route('/messages', name: 'app_messages_index', methods: ['GET'])]
    public function index(): Response
    {
        // Check if user is authenticated for login message display
        $showLoginMessage = !$this->getUser(); 

        return $this->render('messages/index.html.twig', [
            'show_login_message' => $showLoginMessage,
        ]);
    }

    /**
     * Create and send a new message with optional media
     */
    #[Route('/message/create', name: 'app_message_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $content = $request->request->get('content');
        /** @var UploadedFile|null $mediaFile */
        $mediaFile = $request->files->get('media');

        // Validate that message has either text or media
        if (empty($content) && !$mediaFile) {
            return $this->json(
                ['message' => 'Le contenu du message ou un média est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Verify user authentication
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour envoyer un message'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Validate recipient ID
        $fk_user2_id = $request->request->get('fk_user2');
        if (!$fk_user2_id) {
            return $this->json(['message' => 'ID du destinataire manquant'], Response::HTTP_BAD_REQUEST);
        }
        
        // Verify recipient exists
        $FkUser2 = $entityManager->getRepository(Users::class)->find($fk_user2_id);
        if (!$FkUser2) {
            return $this->json(['message' => 'Destinataire introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Create new message entity
        $message = new Messages();
        $message->setFkUser1($user);
        $message->setFkUser2($FkUser2);
        if (!empty($content)) {
            $message->setContentText($content);
        }
        $message->setCreatedAt(new \DateTimeImmutable());

        // Handle media upload if provided
        if ($mediaFile) {
            $cloudinary = $cloudinaryService->getCloudinary();
            try {
                $originalFilename = pathinfo($mediaFile->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $slugger->slug($originalFilename);
                // Create unique public_id for message media
                $publicId = 'message_media/' . $safeFilename . '-' . uniqid();

                $uploadResult = $cloudinary->uploadApi()->upload($mediaFile->getRealPath(), [
                    'public_id' => $publicId,
                    'folder' => 'message_media', // Cloudinary folder for message media
                    'resource_type' => 'auto'    // Auto-detect file type (image/video)
                ]);
                $message->setContentMultimedia($uploadResult['secure_url']); // Save Cloudinary URL
            } catch (\Exception $e) {
                // Return error on media upload failure
                return $this->json([
                    'message' => 'Erreur lors de l\'upload du fichier média sur Cloudinary: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        $entityManager->persist($message);
        $entityManager->flush();

        // Return success response with optional message data
        return $this->json(
            [
                'message' => 'Message envoyé avec succès',
                // Optional: return message data if needed by frontend
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

    /**
     * Get list of users that current user has messaged with
     */
    #[Route('/messages/users', name: 'app_messages_users', methods: ['GET'])]
    public function getMessagedUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Get all messages where user is either sender or recipient
        $messages = $entityManager->getRepository(Messages::class)->createQueryBuilder('m')
            ->where('m.fk_user1 = :user OR m.fk_user2 = :user')
            ->setParameter('user', $user)
            ->orderBy('m.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        $users = [];
        foreach ($messages as $message) {
            // Get the other user in the conversation
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

    /**
     * Render discussion page with specific user
     */
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

    /**
     * Get message thread between current user and specified user
     */
    #[Route('/messages/thread/{id}', name: 'app_messages_thread', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function getThread(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Verify recipient exists
        $recipient = $entityManager->getRepository(Users::class)->find($id);
        if (!$recipient) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Query messages between current user and recipient
        $qb = $entityManager->createQueryBuilder();
        $qb->select('m')
            ->from(Messages::class, 'm')
            ->where(' (m.fk_user1 = :user AND m.fk_user2 = :recipient) OR (m.fk_user1 = :recipient AND m.fk_user2 = :user) ')
            ->setParameter('user', $user)
            ->setParameter('recipient', $recipient)
            ->orderBy('m.created_at', 'ASC');

        $query = $qb->getQuery();
        $messages = $query->getResult();

        // Format messages for response
        $messagesArray = [];
        foreach ($messages as $messageEntity) {
            /** @var Messages $messageEntity */
            $messagesArray[] = [
                'id' => $messageEntity->getId(),
                'from' => $messageEntity->getFkUser1()->getId(),
                'to' => $messageEntity->getFkUser2()->getId(),
                'content' => $messageEntity->getContentText(),
                'media' => $messageEntity->getContentMultimedia(), // Cloudinary URL
                'created_at' => $messageEntity->getCreatedAt()->format('c'), // ISO 8601 format
            ];
        }

        return $this->json($messagesArray);
    }
}
