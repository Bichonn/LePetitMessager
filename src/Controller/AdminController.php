<?php

namespace App\Controller;

use App\Entity\Users;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('', name: 'app_admin_dashboard', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('admin/index.html.twig');
    }

    #[Route('/api/users', name: 'app_admin_api_users', methods: ['GET'])]
    public function getUsers(UsersRepository $usersRepository, SerializerInterface $serializer): JsonResponse
    {
        $users = $usersRepository->findAll();
        // Serialize carefully to avoid circular references and expose only necessary data
        $data = array_map(function (Users $user) {
            return [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'is_banned' => $user->isAccountBan(),
                'created_at' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }, $users);

        return $this->json($data);
    }

    #[Route('/api/users/{id}/toggle-ban', name: 'app_admin_api_toggle_ban', methods: ['POST'])]
    public function toggleBanUser(Users $user, EntityManagerInterface $em): JsonResponse
    {
        /** @var Users $currentUser */
        $currentUser = $this->getUser();
        if ($user->getId() === $currentUser->getId()) {
            return $this->json(['message' => 'Vous ne pouvez pas bannir votre propre compte.'], Response::HTTP_FORBIDDEN);
        }

        $user->setAccountBan(!$user->isAccountBan());
        $em->flush();

        return $this->json([
            'message' => 'Statut de bannissement de l\'utilisateur mis à jour.',
            'is_banned' => $user->isAccountBan(),
        ]);
    }

    #[Route('/api/users/{id}/toggle-admin', name: 'app_admin_api_toggle_admin', methods: ['POST'])]
    public function toggleAdminRole(Users $user, EntityManagerInterface $em): JsonResponse
    {
        /** @var Users $currentUser */
        $currentUser = $this->getUser();
        if ($user->getId() === $currentUser->getId()) {
            return $this->json(['message' => 'Vous ne pouvez pas modifier vos propres droits admin.'], Response::HTTP_FORBIDDEN);
        }

        $user->setAdmin(!$user->isAdmin());
        $em->flush();

        return $this->json([
            'message' => 'Rôle admin de l\'utilisateur mis à jour.',
            'roles' => $user->getRoles(),
        ]);
    }

    #[Route('/api/users/{id}/delete', name: 'app_admin_api_delete_user', methods: ['DELETE'])]
    public function deleteUser(Users $user, EntityManagerInterface $em, Request $request): JsonResponse
    {
        /** @var Users $currentUser */
        $currentUser = $this->getUser();
        if ($user->getId() === $currentUser->getId()) {
            return $this->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], Response::HTTP_FORBIDDEN);
        }

        // Add CSRF token validation for critical operations like delete
        // $submittedToken = $request->headers->get('X-CSRF-TOKEN'); // Or from request body
        // if (!$this->isCsrfTokenValid('delete-user'.$user->getId(), $submittedToken)) {
        //     return $this->json(['message' => 'Token CSRF invalide.'], Response::HTTP_FORBIDDEN);
        // }

        try {
            // Consider implications: what happens to user's posts, comments, etc.?
            // You might need to anonymize or reassign content, or set up cascade deletes in Doctrine.
            // For now, direct removal:
            $em->remove($user);
            $em->flush();
            return $this->json(['message' => 'Utilisateur supprimé avec succès.']);
        } catch (\Exception $e) {
            // Log the error
            return $this->json(['message' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}