# Le Petit Messager

*"La plume d'aujourd'hui écrit l'actualité de demain"*

Le Petit Messager est un réseau social au style ancien développé avec Symfony et React, offrant une expérience utilisateur riche et interactive pour partager, commenter et interagir avec du contenu multimédia.

## Fonctionnalités

### Gestion des utilisateurs
- **Inscription et connexion** sécurisées avec système d'authentification Symfony
- **Profils personnalisables** avec photo de profil et bannière
- **Comptes privés** pour protéger la confidentialité
- **Système de suivi** (suivre/être suivi) avec gestion des relations
- **Suggestions d'utilisateurs** basées sur l'aléatoire
- **Connexion Simplifié** à l'aide Google

### Publications
- **Création de posts** avec texte et/ou médias (images, vidéos)
- **Modification et suppression** de ses propres posts
- **Système de likes** avec compteur
- **Commentaires** avec support multimédia
- **Republication (repost)** de publications
- **Partage** de publications

### Messagerie
- **Messages privés** entre utilisateurs
- **Support multimédia** dans les messages

### Modération
- **Signalement** de posts et d'utilisateurs
- **Système de notifications**
- **Gestion administrative** avec tableau de bord

### Interface utilisateur
- **Mode sombre/clair** avec basculement dynamique
- **Design responsive** adapté à tous les écrans
- **Animations fluides** et interactions intuitives

## Architecture et Choix Techniques

### Architecture générale
Le projet adopte une **architecture hybride** combinant :
- **Backend API REST** avec Symfony pour la logique métier
- **Frontend SPA** avec React pour l'interface utilisateur interactive
- **Intégration Symfony UX** pour une communication fluide entre les deux

### Choix techniques justifiés

#### Backend - Symfony 6.4
**Pourquoi Symfony ?**
- **Maturité et stabilité** : Framework PHP robuste et éprouvé
- **Écosystème riche** : Bundles et composants réutilisables
- **Sécurité native** : Protection CSRF, validation, authentification
- **Performance** : Cache intégré, optimisations avancées
- **Documentation** : Excellente documentation et communauté active
- **Connaissance** : Des cours et des supports nous ont été donné sur ce framework

#### Frontend - React 18
**Pourquoi React ?**
- **Composants réutilisables** : Architecture modulaire et maintenable
- **État réactif** : Mise à jour automatique de l'interface
- **Écosystème mature** : Large choix de librairies
- **Performance** : Virtual DOM et optimisations automatiques
- **Intégration Symfony UX** : Communication native avec le backend
- **Connaissance** : Des cours et des supports nous ont été donné sur ce framework

#### Base de données - MySQL/PostgreSQL
**Choix relationnel justifié :**
- **Relations complexes** : Posts, utilisateurs, commentaires, likes
- **Intégrité référentielle** : Contraintes de clés étrangères
- **Transactions ACID** : Cohérence des données critiques
- **Performance** : Optimisations et indexation avancées

#### Stockage média - Cloudinary
**Avantages :**
- **CDN global** : Livraison rapide des médias
- **Optimisation automatique** : Compression et formats adaptatifs
- **Transformations** : Redimensionnement à la volée
- **Sécurité** : Upload sécurisé et validation des fichiers

## Technologies utilisées

### Backend
- **Symfony 6.4** - Framework PHP pour l'API REST
- **Doctrine ORM** - Mapping objet-relationnel et gestion BDD
- **MySQL/PostgreSQL** - Base de données relationnelle
- **Cloudinary SDK** - Gestion et optimisation des médias

### Frontend
- **React 18** - Librairie pour l'interface utilisateur
- **Symfony UX React** - Intégration React/Symfony native
- **Bootstrap 5** - Framework CSS responsive
- **Webpack Encore** - Build et optimisation des assets

### Infrastructure et outils
- **Composer** - Gestionnaire de dépendances PHP
- **npm/Yarn** - Gestionnaire de dépendances JavaScript
- **PayPal API** - Système de paiement intégré
- **CSRF Protection** - Sécurisation des formulaires

## Installation et Configuration

### Prérequis système
- **PHP 8.1+** avec extensions : `pdo_mysql`, `gd`, `curl`, `zip`
- **Node.js 18+** et npm/yarn
- **Composer 2.0+**
- **MySQL 8.0+** ou **PostgreSQL 13+**
- **Git** pour le versioning

### Installation locale détaillée

#### 1. Clonage et setup initial
```bash
# Cloner le repository
git clone https://github.com/votre-repo/le-petit-messager.git
cd le-petit-messager/LePetitMessager

# Vérifier les prérequis
php --version  # Doit être >= 8.1
node --version # Doit être >= 18
composer --version
```

#### 2. Installation des dépendances
```bash
# Dépendances PHP (backend)
composer install

# Dépendances JavaScript (frontend)
npm install
# ou avec yarn
yarn install
```

###### Les dépendances requis

**Dépendances PHP (Composer) :**

composer require symfony/framework-bundle
composer require symfony/twig-bundle
composer require symfony/security-bundle
composer require symfony/monolog-bundle
composer require symfony/debug-bundle
composer require symfony/web-profiler-bundle
composer require symfony/maker-bundle --dev

**Base de données et ORM :** 

composer require doctrine/doctrine-bundle
composer require doctrine/doctrine-migrations-bundle
composer require doctrine/orm

**UX et Frontend :** 

composer require symfony/ux-stimulus-bundle
composer require symfony/ux-turbo-bundle
composer require symfony/ux-react

**Extensions Twig : **

composer require twig/extra-bundle

**Dépendances JavaScript (NPM) :** 

npm install @symfony/webpack-encore
npm install webpack-notifier
npm install @babel/core @babel/preset-env @babel/preset-react

React : 

npm install react react-dom
npm install @babel/preset-react

CSS et styling : 

npm install bootstrap
npm install sass-loader sass
npm install css-loader style-loader

Build Tools : 

npm install webpack webpack-cli
npm install @symfony/stimulus-bridge



#### 3. Configuration de l'environnement

**Créer le fichier de configuration :**
```bash
cp .env .env.local
```

**Éditer `.env.local` avec vos paramètres :**
```env
# Base de données (exemple MySQL)
DATABASE_URL="mysql://username:password@127.0.0.1:3306/petit_messager"

# Base de données (exemple PostgreSQL)
# DATABASE_URL="postgresql://username:password@127.0.0.1:5432/petit_messager"

# Cloudinary pour les médias
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# PayPal
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"

# Mode de développement
APP_ENV=dev
APP_DEBUG=true
```

#### 4. Configuration de la base de données
```bash
# Créer la base de données
php bin/console doctrine:database:create

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

```

#### 5. Configuration Cloudinary
1. Créer un compte sur [Cloudinary](https://cloudinary.com/)
2. Récupérer vos identifiants dans le dashboard
3. Configurer l'URL dans `.env.local`
4. Tester l'upload avec :
```bash
php bin/console app:test-cloudinary
```

#### 6. Build des assets frontend
```bash
# Développement (avec watch)
npm run dev 

# Production optimisée
npm run build
```

#### 7. Lancement du serveur
```bash
# Serveur de développement Symfony
symfony server start

```

### Configuration avancée

#### Variables d'environnement complètes
```env
# Application
APP_ENV=dev
APP_SECRET=your-secret-key
APP_DEBUG=true

# Base de données
DATABASE_URL="mysql://user:pass@localhost:3306/petit_messager"

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:secret@cloud_name"

# PayPal
PAYPAL_CLIENT_ID="your_client_id"
PAYPAL_CLIENT_SECRET="your_client_secret"

# Google
GOOGLE_CLIENT_ID="996480103601-ifqheo26sqs3fv07p5t56q3uvvuu13tn.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
```

#### Configuration de production
```bash
# Variables d'environnement production
APP_ENV=prod
APP_DEBUG=false

# Optimisations
composer install --no-dev --optimize-autoloader
npm run build
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod

# Migrations base de données
php bin/console doctrine:migrations:migrate --env=prod --no-interaction
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Build en mode développement
npm run watch        # Build avec surveillance des changements
npm run dev-server   # Serveur de développement avec hot reload

# Production
npm run build        # Build optimisé pour la production

# Base de données
php bin/console doctrine:migrations:migrate  # Appliquer les migrations
php bin/console doctrine:fixtures:load       # Charger les données de test
php bin/console doctrine:schema:validate     # Valider le schéma

# Cache et performance
php bin/console cache:clear                   # Vider le cache
php bin/console cache:warmup                  # Préchauffer le cache

# Tests et qualité
php bin/phpunit                              # Lancer les tests
composer cs-fix                              # Corriger le style de code
```

## Structure du projet

```
LePetitMessager/
├── assets/                    # Assets frontend
│   ├── react/                # Composants React
│   │   ├── controllers/      # Contrôleurs React par fonctionnalité
│   │   │   ├── posts/       # Gestion des publications
│   │   │   ├── messagerie/  # Système de messagerie
│   │   │   └── comments/    # Système de commentaires
│   │   └── components/      # Composants réutilisables
│   └── styles/              # Fichiers CSS/SCSS
├── config/                   # Configuration Symfony
│   ├── packages/            # Configuration des bundles
│   └── routes/              # Définition des routes
├── migrations/              # Migrations de base de données
├── public/                  # Fichiers publics (point d'entrée)
├── src/                     # Code source PHP
│   ├── Controller/          # Contrôleurs Symfony (API)
│   ├── Entity/             # Entités Doctrine (modèles)
│   ├── Repository/         # Repositories (accès données)
│   ├── Service/            # Services métier
│   └── Security/           # Authentification et autorisation
├── templates/              # Templates Twig
├── tests/                  # Tests unitaires et fonctionnels
├── var/                    # Fichiers temporaires (cache, logs)
├── vendor/                 # Dépendances PHP
└── webpack.config.js       # Configuration Webpack
```

## Fonctionnalités clés

### Système de posts
- Création avec [`CreatePost.jsx`](assets/react/controllers/posts/CreatePost.jsx)
- Affichage avec [`PostItem.jsx`](assets/react/controllers/posts/post_tool/PostItem.jsx)
- Liste paginée avec [`ListPost.jsx`](assets/react/controllers/posts/ListPost.jsx)

### Interactions sociales
- Likes avec [`LikeBtn.jsx`](assets/react/controllers/posts/btn_post/LikeBtn.jsx)
- Commentaires avec [`CommentBtn.jsx`](assets/react/controllers/posts/btn_post/CommentBtn.jsx)
- Reposts avec [`RepostBtn.jsx`](assets/react/controllers/posts/btn_post/RepostBtn.jsx)
- Partage avec [`ShareBtn.jsx`](assets/react/controllers/posts/btn_post/ShareBtn.jsx)
- Sauvegarde avec [`SaveBtn.jsx`](assets/react/controllers/posts/btn_post/SaveBtn.jsx)

### Messagerie
- Interface principale avec [`ListUsers.jsx`](assets/react/controllers/messagerie/ListUsers.jsx)
- Conversations avec [`DiscussionPage.jsx`](assets/react/controllers/messagerie/DiscussionPage.jsx)
- Envoi de messages avec [`MessageForm.jsx`](assets/react/controllers/messagerie/MessageForm.jsx)

## Sécurité

- **Protection CSRF** sur tous les formulaires
- **Validation côté serveur** avec Symfony Validator
- **Sanitisation des données utilisateur** :
  - Échappement HTML automatique via Twig
  - Validation stricte des uploads de fichiers
  - Filtrage anti-XSS sur tout le contenu utilisateur
  - Nettoyage des URLs et liens externes
- **Upload sécurisé** des fichiers via Cloudinary
- **Authentification robuste** avec hashage bcrypt
- **Autorisation basée sur les rôles** (RBAC)

## Déploiement

Effectué avec **ScaleWay**

## Équipe

- **Lucas Oliveira** : [GitHub](https://github.com/Bichonn)
- **Nada Shaala** : [GitHub](https://github.com/ahmedokchi)
- **Marc Aschieri** : [GitHub](https://github.com/Zenkai92)
- **Tanguy Puechoultres** : [GitHub](https://github.com/Puechamp)
- **Siwar Ben Haj Youssef** : [GitHub](https://github.com/siwar66)

## Support et Documentation

Pour toute question ou problème :
- **Issues GitHub** : Signaler un bug ou demander une fonctionnalité
- **Documentation Symfony** : [symfony.com/doc](https://symfony.com/doc)
- **Documentation React** : [fr.react.dev](https://fr.react.dev/)
- **Guide Doctrine** : [doctrine-project.org](https://www.doctrine-project.org/)
- **Manuel Utilisateur** : [https://docs.google.com/document/d/1VUZ9b9T3YgjyzUrjEAdyaK590I46b0-Ow3eRyJCUu3o/edit?usp=sharing](https://docs.google.com/document/d/1VUZ9b9T3YgjyzUrjEAdyaK590I46b0-Ow3eRyJCUu3o/edit?usp=sharing)

