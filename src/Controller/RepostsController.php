<?php

namespace App\Controller;

use App\Entity\Posts;
use App\Entity\Reposts;
use App\Entity\Users;
use App\Entity\Notifications;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class RepostsController extends AbstractController
{
    #[Route('/reposts/toggle', name: 'app_reposts_toggle', methods: ['POST'])]
    public function toggleRepost(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var Users|null $user */
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(['message' => 'Vous devez être connecté pour reposter.'], Response::HTTP_UNAUTHORIZED);
        }

        $postId = $request->request->get('post_id');
        if (!$postId) {
            return $this->json(['message' => 'ID de post manquant.'], Response::HTTP_BAD_REQUEST);
        }

        $post = $entityManager->getRepository(Posts::class)->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $existingRepost = $entityManager->getRepository(Reposts::class)->findOneBy([
            'fk_user' => $user,
            'fk_post' => $post
        ]);

        $isNowReposted = false;

        if ($existingRepost) {
            $entityManager->remove($existingRepost);
            $isNowReposted = false;
        } else {
            $repost = new Reposts();
            $repost->setFkUser($user);
            $repost->setFkPost($post);
            $repost->setCreatedAt(new \DateTimeImmutable());
            // $repost->setContentText(null); // Or allow content for quote reposts later

            $entityManager->persist($repost);
            $isNowReposted = true;

            // Create notification for the post author, if not the same user
            if ($post->getFkUser() && $post->getFkUser()->getId() !== $user->getId()) {
                $notification = new Notifications();
                $notification->setFkUser($post->getFkUser());
                $notification->setFkPost($post);
                $notification->setContent($user->getUsername() . " a reposté votre message.");
                $notification->setIsRead(false);
                $notification->setCreatedAt(new \DateTimeImmutable());
                $entityManager->persist($notification);
            }
        }

        $entityManager->flush();

        return $this->json([
            'reposted' => $isNowReposted,
            'repostCount' => count($post->getReposts())
        ]);
    }
}