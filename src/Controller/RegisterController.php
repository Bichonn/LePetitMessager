<?php

namespace App\Controller;

use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;
use App\Security\AppAuthenticator;

class RegisterController extends AbstractController
{
    #[Route('/register', name: 'app_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em, UserAuthenticatorInterface $userAuthenticator, AppAuthenticator $authenticator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = new Users();
        $user->setEmail($data['email']);
        $user->setUsername($data['username']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setAccountBan(false);
        $user->setUserPremium(false);
        $user->setPrivateAccount(false);
        $user->setBio('');
        $user->setRoles(['ROLE_USER']);

        $hashedPassword = $hasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        // Authentifier automatiquement l'utilisateur après l'inscription
        $userAuthenticator->authenticateUser(
            $user,
            $authenticator,
            $request
        );

        return new JsonResponse(['status' => 'User created'], 201);
    }
}