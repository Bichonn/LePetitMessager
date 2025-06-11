<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HashtagsController extends AbstractController
{
    #[Route('/hashtags', name: 'app_hashtags')]
    public function index(): Response
    {
        return $this->render('hashtags/index.html.twig', [
            'controller_name' => 'HashtagsController',
        ]);
    }
}
