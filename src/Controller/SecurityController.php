<?php

namespace App\Controller;

use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;
use App\Security\AppAuthenticator;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityController extends AbstractController
{
    #[Route(path: '/login', name: 'app_login')]
    public function login(
        Request $request,
        AuthenticationUtils $authenticationUtils,
        \Symfony\Component\Security\Csrf\CsrfTokenManagerInterface $csrfTokenManager,
        \Doctrine\ORM\EntityManagerInterface $entityManager
    ): Response {
        // Vérifier si l'utilisateur est déjà connecté
        if ($this->getUser()) {
            if ($request->isXmlHttpRequest()) {
                return new JsonResponse(['success' => true, 'message' => 'Déjà connecté']);
            }
            return $this->redirectToRoute('app_test'); // Changé de app_home à app_test
        }

        // Récupérer l'erreur de connexion s'il y en a une
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();


        // Si c'est une requête AJAX/fetch et qu'il y a une erreur
        if ($request->isXmlHttpRequest() && $error) {
            // Utiliser le dernier nom d'utilisateur (email) tenté pour la logique AJAX
            $lastAttemptedUsername = $authenticationUtils->getLastUsername();

            if ($lastAttemptedUsername) {
                $userRepository = $entityManager->getRepository(\App\Entity\Users::class);
                $user = $userRepository->findOneBy(['email' => $lastAttemptedUsername]);

                if ($user) {
                    // L'utilisateur existe, c'est donc un problème de mot de passe
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'Mot de passe incorrect'
                    ], 401);
                } else {
                    // L'utilisateur correspondant au lastAttemptedUsername n'existe pas
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'Utilisateur non trouvé'
                    ], 401);
                }
            } else {
                // Si getLastUsername() est vide (par exemple, champ email non soumis ou vide lors de la tentative)
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Identifiant incorrect' // Message générique si l'email n'a pas pu être déterminé
                ], 400);
            }
        }

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
            '_csrf_token' => $csrfTokenManager->getToken('authenticate')->getValue()
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route(path: '/get-csrf-token', name: 'app_get_csrf_token')]
    public function getCsrfToken(\Symfony\Component\Security\Csrf\CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        return new JsonResponse([
            'token' => $csrfTokenManager->getToken('authenticate')->getValue()
        ]);
    }
    
    #[Route('/auth/google', name: 'app_google_auth')]
    public function googleAuth(): RedirectResponse
    {
        $clientId = $_ENV['GOOGLE_CLIENT_ID'];
        $redirectUri = $this->generateUrl('app_google_callback', [], \Symfony\Component\Routing\Generator\UrlGeneratorInterface::ABSOLUTE_URL);
        $scope = 'openid email profile';
        $state = bin2hex(random_bytes(16));
        
        $this->container->get('request_stack')->getSession()->set('oauth_state', $state);
        
        $googleAuthUrl = "https://accounts.google.com/o/oauth2/auth?" . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => $scope,
            'response_type' => 'code',
            'state' => $state,
            'prompt' => 'select_account',  // Force l'affichage de la sélection de compte
            'access_type' => 'offline'     // Optionnel : pour obtenir un refresh token
        ]);
        
        return new RedirectResponse($googleAuthUrl);
    }

    #[Route('/auth/google/callback', name: 'app_google_callback')]
    public function googleCallback(
        Request $request,
        EntityManagerInterface $entityManager,
        UserAuthenticatorInterface $userAuthenticator,
        AppAuthenticator $authenticator,
        UserPasswordHasherInterface $passwordHasher
    ): Response {
        $code = $request->query->get('code');
        $state = $request->query->get('state');
        
        // Vérifier le state pour la sécurité
        if ($state !== $this->container->get('request_stack')->getSession()->get('oauth_state')) {
            throw $this->createAccessDeniedException('Invalid state parameter');
        }
        
        if (!$code) {
            $this->addFlash('error', 'Erreur lors de la connexion avec Google');
            return $this->redirectToRoute('app_test'); // Changé de app_home à app_test
        }

        try {
            // 1. Échanger le code contre un token d'accès
            $tokenResponse = $this->exchangeCodeForToken($code);
            
            if (!$tokenResponse || !isset($tokenResponse['access_token'])) {
                throw new \Exception('Impossible d\'obtenir le token d\'accès');
            }

            // 2. Récupérer les informations utilisateur
            $userInfo = $this->getUserInfoFromGoogle($tokenResponse['access_token']);
            
            if (!$userInfo || !isset($userInfo['email'])) {
                throw new \Exception('Impossible de récupérer les informations utilisateur');
            }

            // 3. Vérifier si l'utilisateur existe déjà
            $existingUser = $entityManager->getRepository(Users::class)
                ->findOneBy(['email' => $userInfo['email']]);

            if ($existingUser) {
                // Utilisateur existant - connexion directe
                $userAuthenticator->authenticateUser(
                    $existingUser,
                    $authenticator,
                    $request
                );
                
                $this->addFlash('success', 'Connexion réussie avec Google !');
                return $this->redirectToRoute('app_test'); // Changé de app_home à app_test
            } else {
                // Nouvel utilisateur - inscription automatique
                $newUser = $this->createUserFromGoogle($userInfo, $entityManager, $passwordHasher);
                
                $userAuthenticator->authenticateUser(
                    $newUser,
                    $authenticator,
                    $request
                );
                
                $this->addFlash('success', 'Compte créé et connexion réussie avec Google !');
                return $this->redirectToRoute('app_test'); // Changé de app_home à app_test
            }

        } catch (\Exception $e) {
            $this->addFlash('error', 'Erreur lors de la connexion avec Google : ' . $e->getMessage());
            return $this->redirectToRoute('app_test'); // Changé de app_home à app_test
        }
    }

    private function exchangeCodeForToken(string $code): ?array
    {
        $clientId = $_ENV['GOOGLE_CLIENT_ID'];
        $clientSecret = $_ENV['GOOGLE_CLIENT_SECRET'];
        
        // Même correction ici
        $redirectUri = $this->generateUrl('app_google_callback', [], \Symfony\Component\Routing\Generator\UrlGeneratorInterface::ABSOLUTE_URL);

        $response = file_get_contents('https://oauth2.googleapis.com/token', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query([
                    'code' => $code,
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirectUri,
                    'grant_type' => 'authorization_code'
                ])
            ]
        ]));

        return $response ? json_decode($response, true) : null;
    }

    private function getUserInfoFromGoogle(string $accessToken): ?array
    {
        $response = file_get_contents(
            'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $accessToken
        );

        return $response ? json_decode($response, true) : null;
    }

    private function createUserFromGoogle(array $userInfo, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Users
    {
        $user = new Users();
        $user->setEmail($userInfo['email']);
        
        // Générer un username unique basé sur l'email ou le nom
        $baseUsername = $userInfo['given_name'] ?? explode('@', $userInfo['email'])[0];
        $username = $this->generateUniqueUsername($baseUsername, $entityManager);
        
        $user->setUsername($username);
        $user->setFirstName($userInfo['given_name'] ?? '');
        $user->setLastName($userInfo['family_name'] ?? '');
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setAccountBan(false);
        $user->setUserPremium(false);
        $user->setPrivateAccount(false);
        $user->setBio('');
        $user->setRoles(['ROLE_USER']);
        
        // Mot de passe aléatoire (l'utilisateur ne s'en servira pas)
        $plainPassword = bin2hex(random_bytes(16));
        $hashedPassword = $passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashedPassword);
        
        // Optionnel : récupérer la photo de profil Google
        if (isset($userInfo['picture'])) {
            $user->setProfilePicture($userInfo['picture']);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return $user;
    }

    private function generateUniqueUsername(string $baseUsername, EntityManagerInterface $entityManager): string
    {
        $username = $baseUsername;
        $counter = 1;

        while ($entityManager->getRepository(Users::class)->findOneBy(['username' => $username])) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }
}
