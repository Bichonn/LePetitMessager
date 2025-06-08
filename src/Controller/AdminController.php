<?php

namespace App\Controller;

use App\Entity\Users;
use App\Entity\AccountsReports;
use App\Repository\AccountsReportsRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use App\Entity\PostsReports;
use App\Repository\PostsReportsRepository;

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
    public function deleteUser(Users $user, EntityManagerInterface $em): JsonResponse
    {
        /** @var Users $currentUser */
        $currentUser = $this->getUser();
        if ($user->getId() === $currentUser->getId()) {
            return $this->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], Response::HTTP_FORBIDDEN);
        }

        try {
            $em->remove($user);
            $em->flush();
            return $this->json(['message' => 'Utilisateur supprimé avec succès.']);
        } catch (\Exception $e) {
            // Log the error
            return $this->json(['message' => 'Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/account-reports', name: 'app_admin_api_account_reports', methods: ['GET'])]
    public function getAccountReports(AccountsReportsRepository $reportsRepository): JsonResponse
    {
        $reportsEntities = $reportsRepository->findBy([], ['created_at' => 'DESC']);
        $data = [];
        foreach ($reportsEntities as $report) {
            $data[] = [
                'id' => $report->getId(),
                'reporterUsername' => $report->getFkReporter() ? $report->getFkReporter()->getUsername() : null,
                'reportedUsername' => $report->getFkReported() ? $report->getFkReported()->getUsername() : null,
                'content' => $report->getContent(),
                'created_at' => $report->getCreatedAt() ? $report->getCreatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }
        return $this->json($data);

    }

    #[Route('/api/account-reports/{id}', name: 'app_admin_api_delete_account_report', methods: ['DELETE'])]
    public function deleteAccountReport(AccountsReports $report, EntityManagerInterface $em): JsonResponse
    {
        // Optional: Add security check to ensure only admins can delete
        // $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if (!$report) {
            return $this->json(['message' => 'Signalement introuvable.'], Response::HTTP_NOT_FOUND);
        }

        try {
            $em->remove($report);
            $em->flush();
            return $this->json(['message' => 'Signalement supprimé avec succès.'], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the error: $this->logger->error('Failed to delete account report: ' . $e->getMessage());
            return $this->json(['message' => 'Erreur lors de la suppression du signalement: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/post-reports', name: 'admin_api_post_reports_list', methods: ['GET'])]
    public function getPostReports(PostsReportsRepository $postsReportsRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        // $this->denyAccessUnlessGranted('ROLE_ADMIN'); // Uncomment if you want to restrict access

        $reports = $postsReportsRepository->createQueryBuilder('pr')
            ->select(
                'pr.id',
                'pr.content AS reason', // 'content' is the reason for the report
                'pr.created_at',
                'p.id AS post_id',
                'reporter.username AS reporter_username',
                'post_author.username AS post_author_username'
            )
            ->join('pr.fk_post', 'p')
            ->join('pr.fk_user', 'reporter') // User who reported
            ->join('p.fk_user', 'post_author') // Author of the post
            ->orderBy('pr.created_at', 'DESC')
            ->getQuery()
            ->getResult();

        return $this->json(['reports' => $reports]);
    }

    #[Route('/api/post-reports/{id}', name: 'admin_api_post_report_delete', methods: ['DELETE'])]
    public function deletePostReport(PostsReports $report, EntityManagerInterface $em): JsonResponse
    {
        // $this->denyAccessUnlessGranted('ROLE_ADMIN'); // Uncomment if you want to restrict access

        if (!$report) {
            return $this->json(['message' => 'Signalement de post introuvable.'], Response::HTTP_NOT_FOUND);
        }

        try {
            $em->remove($report);
            $em->flush();
            return $this->json(['message' => 'Signalement de post supprimé avec succès.'], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the error
            return $this->json(['message' => 'Erreur lors de la suppression du signalement de post: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}