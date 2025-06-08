<?php

namespace App\Controller;

use App\Entity\AccountsReports;
use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use App\Service\CloudinaryService; // Add this line
use App\Repository\UsersRepository;
use App\Repository\PostsRepository; // Add this if not already present
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Posts;
use App\Entity\Reposts; // Add this use statement

final class UsersController extends AbstractController
{
    #[Route('/profil', name: 'app_profil')]
    public function index(): Response
    {
        // This renders the current logged-in user's profile page
        return $this->render('users/index.html.twig');
    }

    #[Route('/profil/view/{id}', name: 'app_view_user_profile', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function viewUserProfilePage(int $id): Response
    {
        // This action renders the Twig template for viewing a specific user's profile.
        // The ShowProfil React component will handle fetching the user data via an API call.
        return $this->render('users/view_profile.html.twig', [
            'id' => $id, // Pass 'id' instead of 'username'
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
        $query = $entityManager->createQuery(
            'SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.bio, u.profile_picture, u.banner, u.created_at, u.private_account
             FROM App\Entity\Users u
             WHERE u.id = :userId'
        )->setParameter('userId', $securityUser->getId());

        $userDataArray = $query->getOneOrNullResult();

        if (!$userDataArray) {
            // Should not happen if user is authenticated and exists
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        // Mapper profile_picture vers avatar_url pour correspondre au frontend
        $userDataArray['avatar_url'] = $userDataArray['profile_picture'];
        // Vous pouvez optionnellement supprimer la clé 'profile_picture' si elle n'est plus nécessaire
        // unset($userDataArray['profile_picture']);

        // Ajouter explicitement is_own_profile car c'est le profil de l'utilisateur connecté
        $userDataArray['is_own_profile'] = true;

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
            return $this->json([
                // 'message' => 'Ce profil est privé.', // Supprimez ou commentez cette ligne
                'username' => $userToView->getUsername(),
                'avatar_url' => $userToView->getProfilePicture(), // Assurez-vous que cela correspond à profile_picture
                'is_private' => true,
                'is_own_profile' => false,
                'private_account' => true, // Assurez la cohérence avec UserProfileInfo
            ], Response::HTTP_FORBIDDEN);
        }

        $userDataArray = [
            'id' => $userToView->getId(),
            'first_name' => $userToView->getFirstName(),
            'last_name' => $userToView->getLastName(),
            'username' => $userToView->getUsername(),
            'banner' => $userToView->getBanner(),
            'profile_picture' => $userToView->getProfilePicture(),
            'avatar_url' => $userToView->getProfilePicture(),
            'bio' => $userToView->getBio(),
            'user_premium' => $userToView->isUserPremium(),
            'created_at' => $userToView->getCreatedAt() ? $userToView->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'private_account' => $userToView->isPrivateAccount(),
            'is_own_profile' => $isOwnProfile,
        ];

        // Ajout du champ followed_by_user
        $followedByUser = false;
        if ($currentUser && !$isOwnProfile) {
            $existingFollow = $entityManager->getRepository(\App\Entity\Follows::class)->findOneBy([
                'fk_follower' => $currentUser,
                'fk_following' => $userToView
            ]);
            $followedByUser = $existingFollow !== null;
        }
        $userDataArray['followed_by_user'] = $followedByUser;

        return $this->json($userDataArray, Response::HTTP_OK);
    }

    #[Route('/user/id/{id}', name: 'app_get_user_by_id', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getUserById(int $id, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $userToView = $usersRepository->find($id); // Find by ID
    
        if (!$userToView) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }
    
        $currentUser = $this->getUser();
        $isOwnProfile = ($currentUser && $currentUser instanceof Users && $currentUser->getId() === $userToView->getId());
    
        // Déterminer si l'utilisateur actuel suit l'utilisateur consulté
        // Cette logique est nécessaire avant la vérification du profil privé pour inclure 'followed_by_user'
        $followedByUser = false;
        if ($currentUser instanceof Users && !$isOwnProfile) {
            $existingFollow = $entityManager->getRepository(\App\Entity\Follows::class)->findOneBy([
                'fk_follower' => $currentUser,
                'fk_following' => $userToView
            ]);
            $followedByUser = $existingFollow !== null;
        }
    
        if ($userToView->isPrivateAccount() && !$isOwnProfile) {
            return $this->json([
                'id' => $userToView->getId(), // Ajouter l'ID de l'utilisateur consulté
                'username' => $userToView->getUsername(),
                'avatar_url' => $userToView->getProfilePicture(),
                'is_private' => true,
                'is_own_profile' => false, // $isOwnProfile sera false ici
                'private_account' => true,
                'message' => "Ce compte est privé.", // Message spécifique pour les profils privés
                'followed_by_user' => $followedByUser // Ajouter le statut de suivi
            ], Response::HTTP_OK); // Changer en HTTP_OK pour que le front reçoive les données et gère l'affichage privé
                                     // Ou garder HTTP_FORBIDDEN si le front gère déjà bien ce statut mais a besoin des données.
                                     // Pour la simplicité de l'affichage des boutons, HTTP_OK avec les données est plus direct.
                                     // Si vous gardez HTTP_FORBIDDEN, assurez-vous que ShowProfil.jsx traite bien la réponse.
        }
    
        $userDataArray = [
            'id' => $userToView->getId(),
            'first_name' => $userToView->getFirstName(),
            'last_name' => $userToView->getLastName(),
            'username' => $userToView->getUsername(),
            'banner' => $userToView->getBanner(),
            'profile_picture' => $userToView->getProfilePicture(),
            'avatar_url' => $userToView->getProfilePicture(), // Assurez la cohérence
            'bio' => $userToView->getBio(),
            'user_premium' => $userToView->isUserPremium(),
            'created_at' => $userToView->getCreatedAt() ? $userToView->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'private_account' => $userToView->isPrivateAccount(),
            'is_own_profile' => $isOwnProfile,
            'followed_by_user' => $followedByUser // Assurez-vous que cela est inclus
        ];
    
        return $this->json($userDataArray, Response::HTTP_OK);
    }

    #[Route('/user/update', name: 'app_user_update', methods: ['POST'])]
    public function update(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        CloudinaryService $cloudinaryService,
        ParameterBagInterface $params // Assuming this was intended to be used or is part of a broader context
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Initialize Cloudinary if needed for other operations, or remove if not used in this specific method block
        $cloudinary = $cloudinaryService->getCloudinary(); // Ensure this line is uncommented

        $formErrors = [];

        // Handle text fields update
        if ($request->request->has('firstName')) {
            $user->setFirstName(trim($request->request->get('firstName')));
        }
        if ($request->request->has('lastName')) {
            $user->setLastName(trim($request->request->get('lastName')));
        }
        if ($request->request->has('bio')) {
            $user->setBio(trim($request->request->get('bio')));
        }

        // Handle username update and uniqueness check
        $newUsername = $request->request->get('username');
        if ($newUsername && $newUsername !== $user->getUsername()) {
            $existingUser = $entityManager->getRepository(\App\Entity\Users::class)->findOneBy(['username' => $newUsername]);
            if ($existingUser) {
                $formErrors['username'] = 'Ce nom d\'utilisateur est déjà pris.';
            } else {
                $user->setUsername($newUsername);
            }
        }

        // Handle private account status
        // Use getBoolean to correctly interpret 'true', '1', 'on', 'yes' as true, and others as false.
        // Provide current user's setting as default if not present, though form should always send it.
        $user->setPrivateAccount($request->request->getBoolean('privateAccount', $user->isPrivateAccount()));

        // Handle Profile Picture Upload
        /** @var UploadedFile $profilePictureFile */
        $profilePictureFile = $request->files->get('profilePicture');
        if ($profilePictureFile) {
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($profilePictureFile->getRealPath(), [
                    'folder' => 'user_avatars',
                    'public_id' => 'avatar_' . $user->getId() . '_' . uniqid(),
                    'overwrite' => true, // Consider if you want to overwrite or create new versions
                    'resource_type' => 'image'
                ]);
                $user->setProfilePicture($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                $formErrors['profilePicture'] = 'Erreur lors de l\'upload de l\'avatar: ' . $e->getMessage();
            }
        }

        // Handle Banner Upload
        /** @var UploadedFile $bannerFile */
        $bannerFile = $request->files->get('banner');
        if ($bannerFile) {
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($bannerFile->getRealPath(), [
                    'folder' => 'user_banners',
                    'public_id' => 'banner_' . $user->getId() . '_' . uniqid(),
                    'overwrite' => true,
                    'resource_type' => 'image'
                ]);
                $user->setBanner($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                $formErrors['banner'] = 'Erreur lors de l\'upload de la bannière: ' . $e->getMessage();
            }
        }

        $violations = $validator->validate($user);
        if (count($violations) > 0) {
            foreach ($violations as $violation) {
                $formErrors[$violation->getPropertyPath()] = $violation->getMessage();
            }
        }

        if (!empty($formErrors)) {
            return $this->json(['errors' => $formErrors], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            return $this->json([
                'message' => 'Profil mis à jour avec succès!',
                'user' => [ 
                    'id' => $user->getId(),
                    'first_name' => $user->getFirstName(),
                    'last_name' => $user->getLastName(),
                    'username' => $user->getUsername(),
                    'bio' => $user->getBio(),
                    'profile_picture' => $user->getProfilePicture(), // This is likely the Cloudinary URL
                    'banner' => $user->getBanner(), // This is likely the Cloudinary URL
                    'avatar_url' => $user->getProfilePicture(), // Ensure consistency for frontend
                    'private_account' => $user->isPrivateAccount(), // Ensure this is returned
                    'is_own_profile' => true, // Since this is the user updating leur own profile
                    'created_at' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                    // Add other fields the frontend might need after update
                ]
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception
            return $this->json(['error' => 'Une erreur est survenue lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/users/search/{term}', name: 'app_users_search_by_username_term', methods: ['GET'])]
    public function searchUsersByUsername(string $term, EntityManagerInterface $entityManager): JsonResponse
    {
        if (empty(trim($term)) || strlen($term) < 2) { // Longueur minimale de 2 caractères pour la recherche
            return $this->json([], Response::HTTP_OK);
        }

        $usersRepository = $entityManager->getRepository(Users::class);
        
        $queryBuilder = $usersRepository->createQueryBuilder('u')
            ->select('u.id, u.username, u.profile_picture')
            ->where('LOWER(u.username) LIKE LOWER(:term)') // Recherche insensible à la casse
            ->setParameter('term', '%' . $term . '%')
            ->setMaxResults(10); // Limiter le nombre de suggestions

        $results = $queryBuilder->getQuery()->getResult();

        $formattedUsers = array_map(function ($user) {
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'avatar_url' => $user['profile_picture'] // Assurez-vous que profile_picture contient l'URL de l'avatar
            ];
        }, $results);

        return $this->json($formattedUsers);
    }

    #[Route('/user/profile/update', name: 'app_user_profile_update', methods: ['POST'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger,
        ValidatorInterface $validator,
        ParameterBagInterface $params, 
        CloudinaryService $cloudinaryService // Inject your CloudinaryService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $cloudinary = $cloudinaryService->getCloudinary(); // Get the Cloudinary client from your service

        $formErrors = [];

        $user->setFirstName($request->request->get('firstName', $user->getFirstName()));
        $user->setLastName($request->request->get('lastName', $user->getLastName()));
        $user->setBio($request->request->get('bio', $user->getBio()));

        // Username validation (example, ensure it's unique if changed)
        $newUsername = $request->request->get('username');
        if ($newUsername && $newUsername !== $user->getUsername()) {
            $existingUser = $entityManager->getRepository(\App\Entity\Users::class)->findOneBy(['username' => $newUsername]);
            if ($existingUser) {
                $formErrors['username'] = 'Ce nom d\'utilisateur est déjà pris.';
            } else {
                $user->setUsername($newUsername);
            }
        }

        // Handle Profile Picture Upload
        /** @var UploadedFile $profilePictureFile */
        $profilePictureFile = $request->files->get('profilePicture');
        if ($profilePictureFile) {
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($profilePictureFile->getRealPath(), [ // Use $cloudinary instance
                    'folder' => 'user_avatars', 
                    'public_id' => 'avatar_' . $user->getId() . '_' . uniqid(), 
                    'overwrite' => true,
                    'resource_type' => 'image'
                ]);
                $user->setProfilePicture($uploadResult['secure_url']);
            } catch (\Exception $e) {
                // Log error $e->getMessage()
                $formErrors['profilePicture'] = 'Erreur lors de l\'upload de l\'avatar.';
            }
        }

        // Handle Banner Upload
        /** @var UploadedFile $bannerFile */
        $bannerFile = $request->files->get('banner');
        if ($bannerFile) {
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($bannerFile->getRealPath(), [ // Use $cloudinary instance
                    'folder' => 'user_banners', 
                    'public_id' => 'banner_' . $user->getId() . '_' . uniqid(), 
                    'overwrite' => true,
                    'resource_type' => 'image'
                ]);
                $user->setBanner($uploadResult['secure_url']);
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
            return $this->json(['message' => 'Profil mis à jour avec succès.']);
        } catch (\Exception $e) {
            // Log the exception
            return $this->json(['error' => 'Une erreur est survenue lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/user/{id}/report', name: 'app_report_user', methods: ['POST'])]
    public function reportUser(Request $request, Users $userToReport, EntityManagerInterface $entityManager): JsonResponse // Removed CsrfTokenManagerInterface as it's not used
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($currentUser === $userToReport) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous signaler vous-même.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $reason = $data['reason'] ?? null; // This will be mapped to 'content'

        if (empty($reason)) {
            return new JsonResponse(['message' => 'La raison du signalement est requise.'], Response::HTTP_BAD_REQUEST);
        }

        // Check if a report already exists from this user for the same reported user and reason to avoid duplicates
        $existingReport = $entityManager->getRepository(AccountsReports::class)->findOneBy([
            'fk_reporter' => $currentUser,
            'fk_reported' => $userToReport, 
            'content' => $reason,
        ]);

        if ($existingReport) {
            return new JsonResponse(['message' => 'Vous avez déjà signalé cet utilisateur pour cette raison.'], Response::HTTP_CONFLICT);
        }
        
        $report = new AccountsReports();
        $report->setFkReporter($currentUser);
        $report->setFkReported($userToReport);
        $report->setContent($reason);
        $report->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($report);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur signalé avec succès.'], Response::HTTP_OK);
    }

    #[Route('/users/{userId}/liked-posts', name: 'app_user_liked_posts_list', methods: ['GET'], requirements: ['userId' => '\d+'])]
    public function listUserLikedPosts(
        int $userId,
        EntityManagerInterface $entityManager,
        PostsRepository $postsRepository // Utilisé pour la cohérence des comptes de likes et du statut liked_by_user
    ): JsonResponse {
        $userRepository = $entityManager->getRepository(Users::class);
        $profileUser = $userRepository->find($userId); // L'utilisateur dont on consulte le profil

        if (!$profileUser) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Logique de confidentialité : si on peut voir le profil, on peut voir ses likes publics.
        // Des règles plus complexes pourraient être ajoutées ici si les posts aimés des profils privés ont une visibilité différente.
        // Par exemple, vérifier si l'utilisateur actuel suit le profil privé.

        $likedPostsEntities = [];
        foreach ($profileUser->getLikes() as $like) { // $profileUser->getLikes() retourne Collection<Likes>
            $post = $like->getFkPost();
            if ($post) {
                // Utiliser l'ID du post comme clé pour éviter les doublons, puis réindexer.
                $likedPostsEntities[$post->getId()] = $post;
            }
        }
        $likedPostsEntities = array_values($likedPostsEntities); // Réindexer le tableau
        
        // Trier les posts aimés par date de création du post, décroissant.
        // Alternativement, trier par date du like si $like->getCreatedAt() est disponible et préféré.
        usort($likedPostsEntities, function (Posts $a, Posts $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        $data = [];
        $currentUser = $this->getUser(); // Pour le statut 'liked_by_user' sur les posts affichés

        foreach ($likedPostsEntities as $post) {
            $likesCollection = $post->getLikes();
            $likesCount = count($likesCollection);
            $likedByCurrentUser = false; // Si l'utilisateur *actuel* (celui qui navigue) a aimé ce post
            if ($currentUser instanceof Users) {
                foreach ($likesCollection as $likeRelation) {
                    if ($likeRelation->getFkUser() instanceof Users && $likeRelation->getFkUser()->getId() === $currentUser->getId()) {
                        $likedByCurrentUser = true;
                        break;
                    }
                }
            }

            $postData = [
                'id' => $post->getId(),
                'content_text' => $post->getContentText(),
                'content_multimedia' => $post->getContentMultimedia(),
                'created_at' => $post->getCreatedAt()->format('Y-m-d H:i:s'),
                'user' => null, // Auteur du post
                'likes_count' => $likesCount,
                'liked_by_user' => $likedByCurrentUser 
            ];

            if ($post->getFkUser()) { // Auteur du post (et non celui qui a liké)
                $postData['user'] = [
                    'id' => $post->getFkUser()->getId(),
                    'username' => $post->getFkUser()->getUsername(),
                    'avatar_url' => $post->getFkUser()->getProfilePicture()
                ];
            }
            $data[] = $postData;
        }

        return $this->json($data, Response::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/users/{userId}/reposted-posts', name: 'app_user_reposted_posts_list', methods: ['GET'], requirements: ['userId' => '\d+'])]
    public function listUserRepostedPosts(
        int $userId,
        EntityManagerInterface $entityManager
        // PostsRepository $postsRepository // Not directly needed here for main query, but for helper logic
    ): JsonResponse {
        $userRepository = $entityManager->getRepository(Users::class);
        $profileUser = $userRepository->find($userId);

        if (!$profileUser) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Similar privacy check as for liked posts can be added here if needed

        $userReposts = $entityManager->getRepository(Reposts::class)->findBy(
            ['fk_user' => $profileUser],
            ['created_at' => 'DESC'] // Order by when the repost was made
        );

        $data = [];
        $currentUser = $this->getUser();

        foreach ($userReposts as $repost) {
            $originalPost = $repost->getFkPost();
            if ($originalPost) {
                $likes = $originalPost->getLikes();
                $likesCount = count($likes);
                $likedByUser = false;
                if ($currentUser instanceof Users) {
                    foreach ($likes as $like) {
                        if ($like->getFkUser() && $like->getFkUser()->getId() === $currentUser->getId()) {
                            $likedByUser = true;
                            break;
                        }
                    }
                }

                $repostsCollection = $originalPost->getReposts();
                $repostsCount = count($repostsCollection);
                $repostedByCurrentUser = false; // Specifically, if the current logged-in user also reposted this *original* post
                if ($currentUser instanceof Users) {
                    foreach ($repostsCollection as $rp) {
                        if ($rp->getFkUser() && $rp->getFkUser()->getId() === $currentUser->getId()) {
                            $repostedByCurrentUser = true;
                            break;
                        }
                    }
                }
                
                $commentsCollection = $originalPost->getComments();
                $commentsCount = count($commentsCollection);

                $postData = [
                    'id' => $originalPost->getId(),
                    'content_text' => $originalPost->getContentText(),
                    'content_multimedia' => $originalPost->getContentMultimedia(),
                    'created_at' => $originalPost->getCreatedAt()->format('Y-m-d H:i:s'), // Original post's creation date
                    'user' => [ // Original author of the post
                        'id' => $originalPost->getFkUser()?->getId(),
                        'username' => $originalPost->getFkUser()?->getUsername(),
                        'avatar_url' => $originalPost->getFkUser()?->getProfilePicture(),
                    ],
                    'likes_count' => $likesCount,
                    'liked_by_user' => $likedByUser,
                    'reposts_count' => $repostsCount, // Total reposts of the original post
                    'reposted_by_user' => $repostedByCurrentUser, 
                    'comments_count' => $commentsCount,
                    'reposter_info' => [ // Info about the user who made THIS repost (whose profile we are viewing)
                        'id' => $profileUser->getId(),
                        'username' => $profileUser->getUsername(),
                        'avatar_url' => $profileUser->getProfilePicture(),
                    ],
                    // We can also add the date of this specific repost if needed by the frontend
                    'repost_created_at' => $repost->getCreatedAt()->format('Y-m-d H:i:s'),
                ];
                $data[] = $postData;
            }
        }

        return $this->json($data);
    }

    #[Route('/api/users/suggestions', name: 'app_api_user_suggestions', methods: ['GET'])]
    public function getUserSuggestions(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();
        $limit = $request->query->getInt('limit', 6); // Default to 6 if not provided

        $usersRepository = $entityManager->getRepository(Users::class);
        
        $qb = $usersRepository->createQueryBuilder('u');
        if ($currentUser instanceof Users) {
            $qb->where('u.id != :currentUserId')
               ->setParameter('currentUserId', $currentUser->getId());
        }

        $allUsers = $qb->getQuery()->getResult();
        
        $allUsers = array_filter($allUsers, function(Users $user) {
            return !$user->isPrivateAccount();
        });

        shuffle($allUsers); // Shuffle the array of users
        $suggestedUsers = array_slice($allUsers, 0, $limit); // Take the limited number

        $data = [];
        foreach ($suggestedUsers as $user) {
            if ($user instanceof Users) { // Ensure it's a Users entity
                $data[] = [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar_url' => $user->getProfilePicture(), // Assuming getProfilePicture() returns the URL
                ];
            }
        }

        return $this->json($data, Response::HTTP_OK);
    }
}
