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
    #[Route('/likes', name: 'app_likes')]
    public function index(): Response
    {
        return $this->render('likes/index.html.twig', [
            'controller_name' => 'LikesController',
        ]);
    }

    #[Route('/likes/add', name: 'app_likes_add', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {

        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour liker un post'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        $post = $entityManager->getRepository(Posts::class)->find($request->request->get('post_id'));
        if (!$post) {
            return $this->json(['message' => 'Post introuvable'], Response::HTTP_NOT_FOUND);
        }

        $existingLike = $entityManager->getRepository(Likes::class)->findOneBy([
            'fk_user' => $user,
            'fk_post' => $post
        ]);

        if ($existingLike) {
            $entityManager->remove($existingLike);
            $entityManager->flush();
            return $this->json(Response::HTTP_OK);
        } else {
            $like = new Likes();
            $like->setFkUser($user);
            $like->setFkPost($post);

            $entityManager->persist($like);

            if ($post->getFkUser() && $post->getFkUser() !== $user) { 
                $notif = new Notifications();
                $notif->setFkUser($post->getFkUser());
                $notif->setFkPost($post);
                $notif->setContent($user->getUsername() . " a aimé votre post.");
                $notif->setIsRead(false);
                $notif->setCreatedAt(new \DateTimeImmutable());
                $entityManager->persist($notif);
            }

            $entityManager->flush();

            return $this->json(Response::HTTP_CREATED);
        }
    }
}
