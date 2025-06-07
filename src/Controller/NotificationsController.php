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


final class NotificationsController extends AbstractController
{

    #[Route('/notifications', name: 'app_notifications')]
    public function index(): Response
    {
        return $this->render('notifications/index.html.twig', [
            'controller_name' => 'NotificationsController',
        ]);
    }

    #[Route('/notifications/list', name: 'notifications_list', methods: ['GET'])]
    public function list(NotificationsRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $notifications = $repo->findBy(['fk_user' => $user], ['created_at' => 'DESC']);
        $data = [];
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

    #[Route('/notifications', name: 'notifications_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['content'])) {
            return $this->json(['message' => 'Contenu manquant'], 400);
        }

        $notif = new Notifications();
        $notif->setFkUser($user);
        $notif->setContent($data['content']);
        $notif->setIsRead(false);
        $notif->setCreatedAt(new \DateTimeImmutable());

        // Optionnel : associer à un post si post_id fourni
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

    #[Route('/notifications/{id}/read', name: 'notifications_read', methods: ['POST'])]
    public function markRead(Notifications $notification, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || $notification->getFkUser() !== $user) {
            return $this->json(['message' => 'Non autorisé'], 403);
        }

        $notification->setIsRead(true);
        $em->flush();

        return $this->json(['success' => true]);
    }

    #[Route('/notifications/read', name: 'notifications_read', methods: ['POST'])]
    public function markAllRead(NotificationsRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }
    
        $notifications = $repo->findBy(['fk_user' => $user, 'is_read' => false]);
        foreach ($notifications as $notif) {
            $notif->setIsRead(true);
        }
        $em->flush();
    
        return $this->json(['success' => true]);
    }
}
