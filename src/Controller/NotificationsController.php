<?php

namespace App\Controller;

use App\Entity\Notifications;
use App\Entity\Posts;
use App\Repository\NotificationsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')] // Require authentication for all methods
final class NotificationsController extends AbstractController
{
    /**
     * Render notifications index page
     */
    #[Route('/notifications', name: 'app_notifications')]
    public function index(): Response
    {
        return $this->render('notifications/index.html.twig', [
            'controller_name' => 'NotificationsController',
        ]);
    }

    /**
     * Get all notifications for current user ordered by creation date
     */
    #[Route('/notifications/list', name: 'notifications_list', methods: ['GET'])]
    public function list(NotificationsRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Get notifications ordered by newest first
        $notifications = $repo->findBy(['fk_user' => $user], ['created_at' => 'DESC']);
        $data = [];
        
        // Format notification data for response
        foreach ($notifications as $notif) {
            $data[] = [
                'id' => $notif->getId(),
                'content' => $notif->getContent(),
                'is_read' => $notif->isRead(),
                'created_at' => $notif->getCreatedAt()->format('Y-m-d H:i:s'),
                'post_id' => $notif->getFkPost()?->getId(),
            ];
        }
        return $this->json($data);
    }

    /**
     * Create a new notification (admin/system use)
     */
    #[Route('/notifications', name: 'notifications_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content'])) {
            return $this->json(['message' => 'Contenu manquant'], Response::HTTP_BAD_REQUEST);
        }

        // Create new notification
        $notif = new Notifications();
        $notif->setFkUser($user);
        $notif->setContent($data['content']);
        $notif->setIsRead(false);
        $notif->setCreatedAt(new \DateTimeImmutable());

        // Optionally associate with a post if post_id provided
        if (isset($data['post_id'])) {
            $post = $em->getRepository(Posts::class)->find($data['post_id']);
            if ($post) {
                $notif->setFkPost($post);
            }
        }

        $em->persist($notif);
        $em->flush();

        return $this->json(['success' => true, 'id' => $notif->getId()]);
    }

    /**
     * Mark a specific notification as read
     */
    #[Route('/notifications/{id}/read', name: 'notifications_mark_read', methods: ['POST'])]
    public function markRead(Notifications $notification, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        
        // Verify user owns this notification
        if (!$user || $notification->getFkUser() !== $user) {
            return $this->json(['message' => 'Non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $notification->setIsRead(true);
        $em->flush();

        return $this->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for current user
     */
    #[Route('/notifications/read-all', name: 'notifications_read_all', methods: ['POST'])]
    public function markAllRead(NotificationsRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }
    
        // Get all unread notifications for current user
        $notifications = $repo->findBy(['fk_user' => $user, 'is_read' => false]);
        foreach ($notifications as $notif) {
            $notif->setIsRead(true);
        }
        $em->flush();
    
        return $this->json(['success' => true]);
    }
}
