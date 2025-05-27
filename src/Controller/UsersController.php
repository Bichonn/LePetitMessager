<?php

namespace App\Controller;

use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use App\Repository\UsersRepository; // Ensure this use statement is present

final class UsersController extends AbstractController
{
    #[Route('/profil', name: 'app_profil')]
    public function index(): Response
    {
        // This renders the current logged-in user's profile page
        return $this->render('users/index.html.twig');
    }

    #[Route('/profil/view/{username}', name: 'app_view_user_profile', methods: ['GET'])]
    public function viewUserProfilePage(string $username): Response
    {
        // This action renders the Twig template for viewing a specific user's profile.
        // The ShowProfil React component will handle fetching the user data via an API call.
        return $this->render('users/view_profile.html.twig', [
            'username' => $username,
        ]);
    }

    #[Route('/user', name: 'app_user', methods: ['GET'])] // Existing endpoint for current user
    public function profil(EntityManagerInterface $entityManager): Response 
    {
        $securityUser = $this->getUser(); // Récupère l'utilisateur authentifié

        // Vérifie si l'utilisateur est bien une instance de votre entité Users
        if (!$securityUser instanceof Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour voir votre profil.'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Utiliser DQL pour sélectionner uniquement les champs nécessaires
        // Cela peut améliorer les performances si l'entité User est volumineuse ou a des relations EAGER non nécessaires ici.
        $userRepository = $entityManager->getRepository(Users::class);
        $userDataArray = $userRepository->createQueryBuilder('u')
            ->select('u.id, u.first_name, u.last_name, u.username, u.email, u.banner, u.profile_picture, u.bio, u.user_premium, u.created_at, u.private_account')
            ->where('u.id = :userId')
            ->setParameter('userId', $securityUser->getId())
            ->getQuery()
            ->getOneOrNullResult(\Doctrine\ORM\Query::HYDRATE_ARRAY); // Récupère les données sous forme de tableau

        if (!$userDataArray) {
            // Ce cas ne devrait pas se produire si $securityUser est valide
            return $this->json(['message' => 'Données utilisateur non trouvées.'], Response::HTTP_NOT_FOUND);
        }

        // Formater la date si elle est un objet DateTimeInterface
        if ($userDataArray['created_at'] instanceof \DateTimeInterface) {
            $userDataArray['created_at'] = $userDataArray['created_at']->format('Y-m-d H:i:s');
        }
        
        // Mapper profile_picture vers avatar_url pour correspondre au frontend
        $userDataArray['avatar_url'] = $userDataArray['profile_picture'];
        // Vous pouvez optionnellement supprimer la clé 'profile_picture' si elle n'est plus nécessaire
        // unset($userDataArray['profile_picture']);


        return $this->json($userDataArray, Response::HTTP_OK);
    }

    #[Route('/user/username/{username}', name: 'app_get_user_by_username', methods: ['GET'])]
    public function getUserByUsername(string $username, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $userToView = $usersRepository->findOneBy(['username' => $username]);

        if (!$userToView) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        $currentUser = $this->getUser();
        $isOwnProfile = ($currentUser && $currentUser instanceof Users && $currentUser->getId() === $userToView->getId());

        if ($userToView->isPrivateAccount() && !$isOwnProfile) {
            // For private profiles, you might return limited data or a specific message.
            // Here, we'll return an error if not the owner.
            return $this->json([
                'message' => 'Ce profil est privé.',
                'username' => $userToView->getUsername(), // Optionally send minimal data
                'avatar_url' => $userToView->getProfilePicture(),
                'is_private' => true,
                'is_own_profile' => false
            ], Response::HTTP_FORBIDDEN); // Or HTTP_OK if sending minimal data
        }

        $userDataArray = [
            'id' => $userToView->getId(),
            'first_name' => $userToView->getFirstName(),
            'last_name' => $userToView->getLastName(),
            'username' => $userToView->getUsername(),
            // 'email' => $userToView->getEmail(), // Be cautious about exposing email
            'banner' => $userToView->getBanner(),
            'profile_picture' => $userToView->getProfilePicture(),
            'avatar_url' => $userToView->getProfilePicture(),
            'bio' => $userToView->getBio(),
            'user_premium' => $userToView->isUserPremium(),
            'created_at' => $userToView->getCreatedAt() ? $userToView->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'private_account' => $userToView->isPrivateAccount(),
            'is_own_profile' => $isOwnProfile,
        ];

        return $this->json($userDataArray, Response::HTTP_OK);
    }

    #[Route('/user/update', name: 'app_user_update', methods: ['POST'])]
    public function updateUser(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        CsrfTokenManagerInterface $csrfTokenManager,
        SluggerInterface $slugger,
        ParameterBagInterface $params
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof Users) {
            return $this->json(['error' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        // For FormData, text fields are in $request->request, files in $request->files
        // CSRF token will also be in $request->request
        $submittedToken = $request->request->get('_csrf_token');
        if (!$csrfTokenManager->isTokenValid(new CsrfToken('authenticate', $submittedToken))) {
            return $this->json(['error' => 'Token CSRF invalide.'], Response::HTTP_FORBIDDEN);
        }

        $formErrors = [];

        // Update fields if present in the request
        if ($request->request->has('firstName')) {
            $user->setFirstName(trim($request->request->get('firstName')));
        }
        if ($request->request->has('lastName')) {
            $user->setLastName(trim($request->request->get('lastName')));
        }
        if ($request->request->has('username')) {
            $user->setUsername(trim($request->request->get('username')));
        }
        if ($request->request->has('bio')) {
            $user->setBio(trim($request->request->get('bio')));
        }
        
        // Handle Profile Picture Upload
        /** @var UploadedFile $profilePictureFile */
        $profilePictureFile = $request->files->get('profilePicture');
        if ($profilePictureFile) {
            $originalFilename = pathinfo($profilePictureFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$profilePictureFile->guessExtension();
            $avatarsDirectory = $params->get('kernel.project_dir').'/public/uploads/avatars';

            try {
                if (!file_exists($avatarsDirectory)) {
                    mkdir($avatarsDirectory, 0777, true);
                }
                // TODO: Delete old profile picture if it exists
                $profilePictureFile->move($avatarsDirectory, $newFilename);
                $user->setProfilePicture('/uploads/avatars/'.$newFilename);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                $formErrors['profilePicture'] = 'Erreur lors de l\'upload de l\'avatar.';
            }
        }

        // Handle Banner Upload
        /** @var UploadedFile $bannerFile */
        $bannerFile = $request->files->get('banner');
        if ($bannerFile) {
            $originalFilename = pathinfo($bannerFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$bannerFile->guessExtension();
            $bannersDirectory = $params->get('kernel.project_dir').'/public/uploads/banners';

            try {
                if (!file_exists($bannersDirectory)) {
                    mkdir($bannersDirectory, 0777, true);
                }
                // TODO: Delete old banner if it exists
                $bannerFile->move($bannersDirectory, $newFilename);
                $user->setBanner('/uploads/banners/'.$newFilename);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                $formErrors['banner'] = 'Erreur lors de l\'upload de la bannière.';
            }
        }

        $violations = $validator->validate($user);
        if (count($violations) > 0) {
            foreach ($violations as $violation) {
                // Add to formErrors, potentially overwriting the manual username check if validator handles it
                $formErrors[$violation->getPropertyPath()] = $violation->getMessage();
            }
        }

        if (!empty($formErrors)) {
            return $this->json(['errors' => $formErrors], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            // Return the updated user data or just a success message
            return $this->json([
                'message' => 'Profil mis à jour avec succès!',
                // Optionally, return the updated user object if the frontend needs it
                'user' => [ 
                    'id' => $user->getId(),
                    'first_name' => $user->getFirstName(),
                    'last_name' => $user->getLastName(),
                    'username' => $user->getUsername(),
                    'bio' => $user->getBio(),
                    'profile_picture' => $user->getProfilePicture(), // Ensure this is the path
                    'banner' => $user->getBanner(), // Ensure this is the path
                    'avatar_url' => $user->getProfilePicture(), // Keep mapping for consistency if used ailleurs
                    'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
                    // ... other fields needed by frontend
                ]
            ]);
        } catch (\Exception $e) {
            // Log the exception: $this->logger->error('Profile update error: '.$e->getMessage());
            return $this->json(['error' => 'Une erreur est survenue lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
