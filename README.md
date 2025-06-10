# Le Petit Messager 

*"La plume d'aujourd'hui écrit l'actualité de demain"*

Le Petit Messager est un réseau social au style ancien développé avec Symfony et React, offrant une expérience utilisateur riche et interactive pour partager, commenter et interagir avec du contenu multimédia.

##  Fonctionnalités

###  Gestion des utilisateurs
- **Inscription et connexion** sécurisées
- **Profils personnalisables** avec photo de profil et bannière
- **Comptes privés** pour protéger la confidentialité
- **Système de suivi** (suivre/être suivi)


### Publications
- **Création de posts** avec texte et/ou médias (images, vidéos)
- **Modification et suppression** de ses propres posts
- **Système de likes** avec compteur en temps réel
- **Commentaires** avec support multimédia
- **Republication (repost)** de publications
- **Partage** de publications

### Messagerie
- **Messages privés** entre utilisateurs
- **Support multimédia** dans les messages
- **Interface en temps réel**
- **Historique des conversations**

### Modération
- **Signalement** de posts et d'utilisateurs
- **Système de notifications**
- **Gestion administrative**

### Interface utilisateur
- **Mode sombre/clair** avec basculement dynamique
- **Design responsive** adapté à tous les écrans
- **Animations fluides** et interactions intuitives

## Technologies utilisées

 

### Frontend
- **React 18** - Interface utilisateur
- **Symfony UX React** - Intégration React/Symfony
- **Bootstrap 5** - Framework CSS
- **Webpack Encore** - Build des assets

### Infrastructure
- **PayPal API** - Système de paiement
- **CSRF Protection** - Sécurité

## Installation

### Prérequis
- PHP 8.1+
- Node.js 18+
- Composer

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/votre-repo/le-petit-messager.git
cd le-petit-messager/LePetitMessager
```

2. **Installer les dépendances PHP**
```bash
composer install
```

3. **Installer les dépendances JavaScript**
```bash
npm install
```

4. **Configuration de l'environnement**
```bash
cp .env .env.local
# Configurer les variables d'environnement (base de données, Cloudinary, etc.)
```

5. **Créer la base de données**
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

6. **Build des assets**
```bash
npm run build
```

7. **Démarrer le serveur**
```bash
symfony server:start
```

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Base de données
DATABASE_URL= Rentrez l'URL de votre base de données 

# Cloudinary (pour les médias)
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# PayPal (optionnel)
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Build en mode développement
npm run watch        # Build avec watch mode

# Production
npm run build        # Build optimisé pour la production

# Base de données
php bin/console doctrine:migrations:migrate  # Appliquer les migrations
php bin/console doctrine:fixtures:load       # Charger les données de test
```

##  Structure du projet

```
LePetitMessager/
├── assets/                 # Assets frontend
│   ├── react/             # Composants React
│   │   └── controllers/   # Contrôleurs React organisés par fonctionnalité
│   └── styles/            # Fichiers CSS
├── config/                # Configuration Symfony
├── migrations/            # Migrations de base de données
├── public/                # Fichiers publics
├── src/                   # Code source PHP
│   ├── Controller/        # Contrôleurs Symfony
│   ├── Entity/           # Entités Doctrine
│   └── Service/          # Services métier
├── templates/             # Templates Twig
└── tests/                # Tests
```

##  Fonctionnalités clés

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
- **Sanitisation** des données utilisateur
- **Upload sécurisé** des fichiers via Cloudinary


## Déploiement

### Production

1. **Variables d'environnement**
```bash
APP_ENV=prod
APP_DEBUG=false
```

2. **Optimisations**
```bash
composer install --no-dev --optimize-autoloader
npm run build
php bin/console cache:clear --env=prod
```

3. **Base de données**
```bash
php bin/console doctrine:migrations:migrate --env=prod
```


## Équipe

Lucas Oliveira : https://github.com/Bichonn
Nada Shaala : https://github.com/ahmedokchi
Marc Aschieri : https://github.com/Zenkai92
Tanguy Puechoultres : https://github.com/Puechamp
Siwar Ben Haj Youssef : https://github.com/siwar66


## Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Symfony : https://symfony.com/doc
- Consulter la documentation React : https://fr.react.dev/
