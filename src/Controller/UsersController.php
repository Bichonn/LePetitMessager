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
use App\Service\CloudinaryService;
use App\Repository\UsersRepository;
use App\Repository\PostsRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Posts;
use App\Entity\Reposts;

final class UsersController extends AbstractController
{
    #[Route('/profil', name: 'app_profil')]
    public function index(): Response
    {
        // Render current logged-in user's profile page
        return $this->render('users/index.html.twig');
    }

    #[Route('/profil/view/{id}', name: 'app_view_user_profile', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function viewUserProfilePage(int $id): Response
    {
        // Render template for viewing specific user's profile
        // ShowProfil React component will handle fetching user data via API
        return $this->render('users/view_profile.html.twig', [
            'id' => $id,
        ]);
    }

    #[Route('/user', name: 'app_user', methods: ['GET'])]
    public function profil(EntityManagerInterface $entityManager): Response 
    {
        // Get authenticated user
        $securityUser = $this->getUser();

        // Check if user is instance of Users entity
        if (!$securityUser instanceof Users) {
            return $this->json(
                ['message' => 'Vous devez être connecté pour voir votre profil.'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Use DQL to select only necessary fields for performance
        $query = $entityManager->createQuery(
            'SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.bio, u.profile_picture, u.banner, u.created_at, u.private_account, u.user_premium
             FROM App\Entity\Users u
             WHERE u.id = :userId'
        )->setParameter('userId', $securityUser->getId());

        $userDataArray = $query->getOneOrNullResult();

        if (!$userDataArray) {
            // Should not happen if user is authenticated and exists
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        // Map profile_picture to avatar_url for frontend consistency
        $userDataArray['avatar_url'] = $userDataArray['profile_picture'];

        // Add is_own_profile flag since this is current user's profile
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

        // Handle private account access
        if ($userToView->isPrivateAccount() && !$isOwnProfile) {
            return $this->json([
                'username' => $userToView->getUsername(),
                'avatar_url' => $userToView->getProfilePicture(),
                'is_private' => true,
                'is_own_profile' => false,
                'private_account' => true,
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

        // Check if current user follows this user
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
        // Find user by ID
        $userToView = $usersRepository->find($id);
    
        if (!$userToView) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }
    
        $currentUser = $this->getUser();
        $isOwnProfile = ($currentUser && $currentUser instanceof Users && $currentUser->getId() === $userToView->getId());
    
        // Check if current user follows the viewed user
        $followedByUser = false;
        if ($currentUser instanceof Users && !$isOwnProfile) {
            $existingFollow = $entityManager->getRepository(\App\Entity\Follows::class)->findOneBy([
                'fk_follower' => $currentUser,
                'fk_following' => $userToView
            ]);
            $followedByUser = $existingFollow !== null;
        }
    
        // Handle private account access
        if ($userToView->isPrivateAccount() && !$isOwnProfile) {
            return $this->json([
                'id' => $userToView->getId(),
                'username' => $userToView->getUsername(),
                'avatar_url' => $userToView->getProfilePicture(),
                'is_private' => true,
                'is_own_profile' => false,
                'private_account' => true,
                'message' => "Ce compte est privé.",
                'followed_by_user' => $followedByUser
            ], Response::HTTP_OK);
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
            'followed_by_user' => $followedByUser
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
        ParameterBagInterface $params
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Initialize Cloudinary service
        $cloudinary = $cloudinaryService->getCloudinary();

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
        $user->setPrivateAccount($request->request->getBoolean('privateAccount', $user->isPrivateAccount()));

        // Handle Profile Picture Upload
        /** @var UploadedFile $profilePictureFile */
        $profilePictureFile = $request->files->get('profilePicture');
        if ($profilePictureFile) {
            try {
                $uploadResult = $cloudinary->uploadApi()->upload($profilePictureFile->getRealPath(), [
                    'folder' => 'user_avatars',
                    'public_id' => 'avatar_' . $user->getId() . '_' . uniqid(),
                    'overwrite' => true,
                    'resource_type' => 'image'
                ]);
                $user->setProfilePicture($uploadResult['secure_url']);
            } catch (\Exception $e) {
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
                $formErrors['banner'] = 'Erreur lors de l\'upload de la bannière: ' . $e->getMessage();
            }
        }

        // Validate user entity
        $violations = $validator->validate($user);
        if (count($violations) > 0) {
            foreach ($violations as $violation) {
                $formErrors[$violation->getPropertyPath()] = $violation->getMessage();
            }
        }

        // Return errors if any
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
                    'profile_picture' => $user->getProfilePicture(),
                    'banner' => $user->getBanner(),
                    'avatar_url' => $user->getProfilePicture(),
                    'private_account' => $user->isPrivateAccount(),
                    'is_own_profile' => true,
                    'created_at' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                ]
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/users/search/{term}', name: 'app_users_search_by_username_term', methods: ['GET'])]
    public function searchUsersByUsername(string $term, EntityManagerInterface $entityManager): JsonResponse
    {
        // Minimum length check for search term
        if (empty(trim($term)) || strlen($term) < 2) {
            return $this->json([], Response::HTTP_OK);
        }

        $usersRepository = $entityManager->getRepository(Users::class);
        
        // Build search query
        $queryBuilder = $usersRepository->createQueryBuilder('u')
            ->select('u.id, u.username, u.profile_picture')
            ->where('LOWER(u.username) LIKE LOWER(:term)')
            ->setParameter('term', '%' . $term . '%')
            ->setMaxResults(10);

        $results = $queryBuilder->getQuery()->getResult();

        // Format results for frontend
        $formattedUsers = array_map(function ($user) {
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'avatar_url' => $user['profile_picture']
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
        CloudinaryService $cloudinaryService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\Users) {
            return $this->json(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        // Get Cloudinary client from service
        $cloudinary = $cloudinaryService->getCloudinary();

        $formErrors = [];

        // Update basic user fields
        $user->setFirstName($request->request->get('firstName', $user->getFirstName()));
        $user->setLastName($request->request->get('lastName', $user->getLastName()));
        $user->setBio($request->request->get('bio', $user->getBio()));

        // Username validation and uniqueness check
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
                $uploadResult = $cloudinary->uploadApi()->upload($profilePictureFile->getRealPath(), [
                    'folder' => 'user_avatars', 
                    'public_id' => 'avatar_' . $user->getId() . '_' . uniqid(), 
                    'overwrite' => true,
                    'resource_type' => 'image'
                ]);
                $user->setProfilePicture($uploadResult['secure_url']);
            } catch (\Exception $e) {
                $formErrors['profilePicture'] = 'Erreur lors de l\'upload de l\'avatar.';
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
                $formErrors['banner'] = 'Erreur lors de l\'upload de la bannière.';
            }
        }

        // Validate user entity
        $violations = $validator->validate($user);
        if (count($violations) > 0) {
            foreach ($violations as $violation) {
                // Add to formErrors, potentially overwriting the manual username check if validator handles it
                $formErrors[$violation->getPropertyPath()] = $violation->getMessage();
            }
        }

        // Return errors if any
        if (!empty($formErrors)) {
            return $this->json(['errors' => $formErrors], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();
            return $this->json(['message' => 'Profil mis à jour avec succès.']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue lors de la mise à jour du profil.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/user/{id}/report', name: 'app_report_user', methods: ['POST'])]
    public function reportUser(Request $request, Users $userToReport, EntityManagerInterface $entityManager): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return new JsonResponse(['message' => 'Authentification requise.'], Response::HTTP_UNAUTHORIZED);
        }

        // Prevent self-reporting
        if ($currentUser === $userToReport) {
            return new JsonResponse(['message' => 'Vous ne pouvez pas vous signaler vous-même.'], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $reason = $data['reason'] ?? null;

        if (empty($reason)) {
            return new JsonResponse(['message' => 'La raison du signalement est requise.'], Response::HTTP_BAD_REQUEST);
        }

        // Check for existing report to avoid duplicates
        $existingReport = $entityManager->getRepository(AccountsReports::class)->findOneBy([
            'fk_reporter' => $currentUser,
            'fk_reported' => $userToReport, 
            'content' => $reason,
        ]);

        if ($existingReport) {
            return new JsonResponse(['message' => 'Vous avez déjà signalé cet utilisateur pour cette raison.'], Response::HTTP_CONFLICT);
        }
        
        // Create new report
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
        PostsRepository $postsRepository
    ): JsonResponse {
        $userRepository = $entityManager->getRepository(Users::class);
        $profileUser = $userRepository->find($userId);

        if (!$profileUser) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Get liked posts and remove duplicates
        $likedPostsEntities = [];
        foreach ($profileUser->getLikes() as $like) {
            $post = $like->getFkPost();
            if ($post) {
                $likedPostsEntities[$post->getId()] = $post;
            }
        }
        $likedPostsEntities = array_values($likedPostsEntities);
        
        // Sort posts by creation date (descending)
        usort($likedPostsEntities, function (Posts $a, Posts $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        $data = [];
        $currentUser = $this->getUser();

        foreach ($likedPostsEntities as $post) {
            $likesCollection = $post->getLikes();
            $likesCount = count($likesCollection);
            
            // Check if current user liked this post
            $likedByCurrentUser = false;
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
                'user' => null,
                'likes_count' => $likesCount,
                'liked_by_user' => $likedByCurrentUser 
            ];

            // Add post author info
            if ($post->getFkUser()) {
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
    ): JsonResponse {
        $userRepository = $entityManager->getRepository(Users::class);
        $profileUser = $userRepository->find($userId);

        if (!$profileUser) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        // Get user's reposts ordered by creation date
        $userReposts = $entityManager->getRepository(Reposts::class)->findBy(
            ['fk_user' => $profileUser],
            ['created_at' => 'DESC']
        );

        $data = [];
        $currentUser = $this->getUser();

        foreach ($userReposts as $repost) {
            $originalPost = $repost->getFkPost();
            if ($originalPost) {
                // Get likes count and check if current user liked
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

                // Get reposts count and check if current user reposted
                $repostsCollection = $originalPost->getReposts();
                $repostsCount = count($repostsCollection);
                $repostedByCurrentUser = false;
                if ($currentUser instanceof Users) {
                    foreach ($repostsCollection as $rp) {
                        if ($rp->getFkUser() && $rp->getFkUser()->getId() === $currentUser->getId()) {
                            $repostedByCurrentUser = true;
                            break;
                        }
                    }
                }
                
                // Get comments count
                $commentsCollection = $originalPost->getComments();
                $commentsCount = count($commentsCollection);

                $postData = [
                    'id' => $originalPost->getId(),
                    'content_text' => $originalPost->getContentText(),
                    'content_multimedia' => $originalPost->getContentMultimedia(),
                    'created_at' => $originalPost->getCreatedAt()->format('Y-m-d H:i:s'),
                    'user' => [ // Original author
                        'id' => $originalPost->getFkUser()?->getId(),
                        'username' => $originalPost->getFkUser()?->getUsername(),
                        'avatar_url' => $originalPost->getFkUser()?->getProfilePicture(),
                    ],
                    'likes_count' => $likesCount,
                    'liked_by_user' => $likedByUser,
                    'reposts_count' => $repostsCount,
                    'reposted_by_user' => $repostedByCurrentUser, 
                    'comments_count' => $commentsCount,
                    'reposter_info' => [ // User who made this repost
                        'id' => $profileUser->getId(),
                        'username' => $profileUser->getUsername(),
                        'avatar_url' => $profileUser->getProfilePicture(),
                    ],
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
        $limit = $request->query->getInt('limit', 6);

        $usersRepository = $entityManager->getRepository(Users::class);
        
        // Build query excluding current user
        $qb = $usersRepository->createQueryBuilder('u');
        if ($currentUser instanceof Users) {
            $qb->where('u.id != :currentUserId')
               ->setParameter('currentUserId', $currentUser->getId());
        }

        $allUsers = $qb->getQuery()->getResult();
        
        // Filter out private accounts
        $allUsers = array_filter($allUsers, function(Users $user) {
            return !$user->isPrivateAccount();
        });

        // Randomize and limit results
        shuffle($allUsers);
        $suggestedUsers = array_slice($allUsers, 0, $limit);

        $data = [];
        foreach ($suggestedUsers as $user) {
            if ($user instanceof Users) {
                $data[] = [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'avatar_url' => $user->getProfilePicture(),
                ];
            }
        }

        return $this->json($data, Response::HTTP_OK);
    }
}
