<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

use App\Entity\Posts;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;


final class UsersController extends AbstractController
{
    #[Route('/profil', name: 'app_profil')]
    public function index(): Response
    {
        return $this->render('users/index.html.twig');
    }

    #[Route('/user', name: 'app_user')]
    public function profil(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour voir votre profil'],
                Response::HTTP_UNAUTHORIZED
            );
        } else {// Récupérer les données de l'utilisateur
            $data = [
                'id' => $user->getId(),
                'first_name' => $user->getFirstName(),
                'last_name' => $user->getLastName(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'banner' => $user->getBanner(),
                'profile_picture' => $user->getProfilePicture(),
                'bio' => $user->getBio(),
                'user_premium' => $user->isUserPremium(),
                'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
            return $this->json($data, Response::HTTP_OK);

        }


    }
}
