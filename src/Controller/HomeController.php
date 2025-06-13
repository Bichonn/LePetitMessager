<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HomeController extends AbstractController
{
    /**
     * Render the homepage
     */
    #[Route('/', name: 'app_test')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig');
    }
}