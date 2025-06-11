<?php


namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Hashtags;
use App\Entity\Posts;
use App\Entity\Users;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;

final class HashtagsController extends AbstractController
{
    #[Route('/hashtags', name: 'app_hashtags')]
    public function index(): Response
    {
        return $this->render('hashtags/index.html.twig', [
            'controller_name' => 'HashtagsController',
        ]);
    }

    #[Route('/hashtags/search', name: 'app_hashtags_search', methods: ['GET'])]
    public function search(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $q = $request->query->get('q', '');
        $hashtags = $em->getRepository(Hashtags::class)
            ->createQueryBuilder('h')
            ->where('h.content LIKE :q')
            ->setParameter('q', '%' . $q . '%')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();
    
        $data = array_map(fn($h) => ['id' => $h->getId(), 'content' => $h->getContent()], $hashtags);
    
        return $this->json($data);
    }
}
