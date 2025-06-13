<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Favoris;
use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Comments;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

final class FavorisController extends AbstractController
{
    /**
     * Render favorites index page
     */
    #[Route('/favoris', name: 'app_favoris')]
    public function index(): Response
    {
        return $this->render('favoris/index.html.twig', [
            'controller_name' => 'FavorisController',
        ]);
    }

    /**
     * Toggle favorite status for a post (add/remove from favorites)
     */
    #[Route('/favoris/add', name: 'app_favoris_add', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {

        // Check user authentication
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour le mettre en favoris'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Verify post exists
        $post = $entityManager->getRepository(Posts::class)->find($request->request->get('post_id'));
        if (!$post) {
            return $this->json(['message' => 'Post introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Check if post is already in favorites
        $existingFavoris = $entityManager->getRepository(Favoris::class)->findOneBy([
            'fk_user' => $user,
            'fk_post' => $post
        ]);

        if ($existingFavoris) {
            // Remove from favorites if already exists
            $entityManager->remove($existingFavoris);
            $entityManager->flush();
            return $this->json(['favorited' => false], Response::HTTP_OK);
        } else {
            // Add to favorites if doesn't exist
            $favori = new Favoris();
            $favori->setFkUser($user);
            $favori->setFkPost($post);

            $entityManager->persist($favori);
            $entityManager->flush();

            return $this->json(['favorited' => true], Response::HTTP_CREATED);
        }
    }

    /**
     * Get all favorited posts for a specific user
     */
    #[Route('/users/{userId}/favoris-posts', name: 'app_user_favoris_posts', methods: ['GET'])]
    public function userFavorisPosts(
        int $userId,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // Verify user exists
        $user = $entityManager->getRepository(Users::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }
    
        // Get all favorites for this user
        $favoris = $entityManager->getRepository(\App\Entity\Favoris::class)->findBy(['fk_user' => $user]);
        $posts = [];
        
        // Format favorited posts data
        foreach ($favoris as $fav) {
            $post = $fav->getFkPost();
            if ($post) {
                $posts[] = [
                    'id' => $post->getId(),
                    'content_text' => $post->getContentText(),
                    'content_multimedia' => $post->getContentMultimedia(),
                    'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                    'user' => [
                        'id' => $post->getFkUser()?->getId(),
                        'username' => $post->getFkUser()?->getUsername(),
                        'avatar_url' => $post->getFkUser()?->getProfilePicture(),
                    ],
                    'hashtags' => array_map(fn($h) => [
                        'id' => $h->getId(),
                        'content' => $h->getContent()
                    ], $post->getHashtags()->toArray()),
                ];
            }
        }
    
        return $this->json($posts);
    }
}
