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
    /**
     * Toggle repost status for a post
     */
    #[Route('/reposts/toggle', name: 'app_reposts_toggle', methods: ['POST'])]
    public function toggleRepost(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // Check if user is authenticated
        /** @var Users|null $user */
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(['message' => 'Vous devez être connecté pour reposter.'], Response::HTTP_UNAUTHORIZED);
        }

        // Validate post ID
        $postId = $request->request->get('post_id');
        if (!$postId) {
            return $this->json(['message' => 'ID de post manquant.'], Response::HTTP_BAD_REQUEST);
        }

        // Find the post
        $post = $entityManager->getRepository(Posts::class)->find($postId);
        if (!$post) {
            return $this->json(['message' => 'Post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Check if user already reposted this post
        $existingRepost = $entityManager->getRepository(Reposts::class)->findOneBy([
            'fk_user' => $user,
            'fk_post' => $post
        ]);

        $isNowReposted = false;

        if ($existingRepost) {
            // Remove existing repost (unrepost)
            $entityManager->remove($existingRepost);
            $isNowReposted = false;
        } else {
            // Create new repost
            $repost = new Reposts();
            $repost->setFkUser($user);
            $repost->setFkPost($post);
            $repost->setCreatedAt(new \DateTimeImmutable());
            // $repost->setContentText(null); // For future quote reposts feature

            $entityManager->persist($repost);
            $isNowReposted = true;

            // Notify post author (if different user)
            if ($post->getFkUser() && $post->getFkUser()->getId() !== $user->getId()) {
                $notification = new Notifications();
                $notification->setFkUser($post->getFkUser());
                $notification->setFkPost($post);
                $notification->setContent($user->getUsername() . " a republié votre message.");
                $notification->setIsRead(false);
                $notification->setCreatedAt(new \DateTimeImmutable());
                $entityManager->persist($notification);
            }
        }

        // Save changes to database
        $entityManager->flush();

        // Return updated status and count
        return $this->json([
            'reposted' => $isNowReposted,
            'repostCount' => count($post->getReposts())
        ]);
    }
}