<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Users;
use App\Entity\Follows;
use App\Entity\Notifications;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

final class FollowsController extends AbstractController
{
    

    /**
     * Toggle follow status for a user (follow/unfollow)
     */
    #[Route('/follows/add', name: 'app_follows_add', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {

        // Check user authentication
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour suivre ce messager'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Validate required parameter
        $followingId = $request->request->get('following_id');
        if (!$followingId) {
            return $this->json(['message' => 'ID du messager à suivre manquant'], Response::HTTP_BAD_REQUEST);
        }

        // Verify target user exists
        $following = $entityManager->getRepository(Users::class)->find($followingId);
        if (!$following) {
            return $this->json(['message' => 'Messager à suivre introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Prevent users from following themselves
        if ($user === $following) {
            return $this->json(['message' => 'Vous ne pouvez pas vous suivre vous-même'], Response::HTTP_BAD_REQUEST);
        }

        // Check if follow relationship already exists
        $existingFollow = $entityManager->getRepository(Follows::class)->findOneBy([
            'fk_follower' => $user,
            'fk_following' => $following
        ]);

        if ($existingFollow) {
            // Unfollow: remove existing relationship
            $entityManager->remove($existingFollow);
            $entityManager->flush();
            return $this->json([
                'followed' => false
            ], Response::HTTP_OK);
        } else {
            // Follow: create new relationship
            $follow = new Follows();
            $follow->setFkFollower($user);
            $follow->setFkFollowing($following);
            $follow->setCreatedAt(new \DateTimeImmutable());

            $entityManager->persist($follow);

            // Create notification for followed user
            $notif = new Notifications();
            $notif->setFkUser($following);
            $notif->setContent($user->getUsername() . " vous suit désormais.");
            $notif->setIsRead(false);
            $notif->setCreatedAt(new \DateTimeImmutable());
            $notif->setFkPost(null); // Not related to a specific post
            $entityManager->persist($notif);

            $entityManager->flush();

            return $this->json([
                'followed' => true
            ], Response::HTTP_CREATED);
        }
    }

    /**
     * Get list of users that current user is following
     */
    #[Route('/following', name: 'app_following', methods: ['GET'])]
    public function getFollowingList(EntityManagerInterface $entityManager): JsonResponse
    {
        // Check user authentication
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Get all follow relationships where current user is the follower
        $follows = $entityManager->getRepository(Follows::class)
            ->findBy(['fk_follower' => $user]);

        // Format following users data
        $data = [];
        foreach ($follows as $follow) {
            $followed = $follow->getFkFollowing();
            $data[] = [
                'id' => $followed->getId(),
                'username' => $followed->getUsername(),
                'avatar_url' => $followed->getProfilePicture(),
            ];
        }

        return $this->json($data);
    }
}
