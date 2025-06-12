<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\RememberMeBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\SecurityRequestAttributes;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class AppAuthenticator extends AbstractLoginFormAuthenticator
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'app_login';

    private UrlGeneratorInterface $urlGenerator;

    public function __construct(UrlGeneratorInterface $urlGenerator)
    {
        $this->urlGenerator = $urlGenerator;
    }

    public function authenticate(Request $request): Passport
    {
        if ($request->attributes->get('_programmatic_login')) {
            // Programmatic login after registration
            // The user object is already validated and available to UserAuthenticatorInterface::authenticateUser
            // We need to provide a UserBadge. The email can be taken from the request content.
            $email = '';
            $content = $request->getContent();
            if (!empty($content)) {
                $requestData = json_decode($content, true);
                if (isset($requestData['email']) && is_string($requestData['email'])) {
                    $email = $requestData['email'];
                }
            }
            if (empty($email)) {
                // This should ideally not happen if the registration request was valid.
                // UserAuthenticatorInterface::authenticateUser will use the User object's identifier.
            }

            return new Passport(
                new UserBadge($email), // User identifier for the Passport
                // No PasswordCredentials needed for programmatic login via authenticateUser
                new PasswordCredentials(''),
                [
                    new RememberMeBadge(),
                ]
            );
        }

        // Standard login form submission
        $email = $request->getPayload()->getString('email');
        $request->getSession()->set(SecurityRequestAttributes::LAST_USERNAME, $email);

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($request->getPayload()->getString('password')),
            [
                new CsrfTokenBadge('authenticate', $request->getPayload()->getString('_csrf_token')),
                new RememberMeBadge(),
            ]
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        if ($targetPath = $this->getTargetPath($request->getSession(), $firewallName)) {
            return new RedirectResponse($targetPath);
        }

        // Rediriger vers la page d'accueil après connexion réussie
        return new RedirectResponse($this->urlGenerator->generate('app_test')); // Assurez-vous que c'est app_test
    }

    protected function getLoginUrl(Request $request): string
    {
        return $this->urlGenerator->generate(self::LOGIN_ROUTE);
    }
}
