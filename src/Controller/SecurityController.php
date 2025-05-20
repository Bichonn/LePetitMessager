<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

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
            return $this->redirectToRoute('app_home');
        }

        // Récupérer l'erreur de connexion s'il y en a une
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();


        // Si c'est une requête AJAX/fetch et qu'il y a une erreur
        if ($request->isXmlHttpRequest() && $error) {
            // Récupérer l'email depuis la requête 
            $email = $request->request->get('email');

            // Vérification que l'email a bien été récupéré
            if ($email) {
                $userRepository = $entityManager->getRepository(\App\Entity\Users::class);
                $user = $userRepository->findOneBy(['email' => $email]);

                if ($user) {
                    // L'utilisateur existe, c'est donc un problème de mot de passe
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'Mot de passe incorrect'
                    ], 401);
                } else {
                    // L'utilisateur n'existe pas
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'Utilisateur non trouvé'
                    ], 401);
                }
            } else {
                // Si l'email n'a pas été récupéré correctement
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Identifiant incorrect'
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
}
