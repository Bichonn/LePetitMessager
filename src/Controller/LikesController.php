<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Likes;
use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Comments;
use App\Entity\Notifications;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

final class LikesController extends AbstractController
{ 

    /**
     * Toggle like status for a post (like/unlike)
     */
    #[Route('/likes/add', name: 'app_likes_add', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {

        // Check user authentication
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour liker un post'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Verify post exists
        $post = $entityManager->getRepository(Posts::class)->find($request->request->get('post_id'));
        if (!$post) {
            return $this->json(['message' => 'Post introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Check if user already liked this post
        $existingLike = $entityManager->getRepository(Likes::class)->findOneBy([
            'fk_user' => $user,
            'fk_post' => $post
        ]);

        if ($existingLike) {
            // Unlike: remove existing like
            $entityManager->remove($existingLike);
            $entityManager->flush();
            return $this->json(Response::HTTP_OK);
        } else {
            // Like: create new like
            $like = new Likes();
            $like->setFkUser($user);
            $like->setFkPost($post);

            $entityManager->persist($like);

            // Create notification for post author (if not liking own post)
            if ($post->getFkUser() && $post->getFkUser() !== $user) { 
                $notif = new Notifications();
                $notif->setFkUser($post->getFkUser());
                $notif->setFkPost($post);
                $notif->setContent($user->getUsername() . " a approuvé votre message.");
                $notif->setIsRead(false);
                $notif->setCreatedAt(new \DateTimeImmutable());
                $entityManager->persist($notif);
            }

            $entityManager->flush();

            return $this->json(Response::HTTP_CREATED);
        }
    }
}
