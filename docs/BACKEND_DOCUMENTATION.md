# Backend API Documentation

## Database Schema

Démarrer la commande `pnpm prisma:studio` pour visualiser et interagir avec la base de données via une interface web.

## Liste des routes

### 1. Authentification

- `POST /api/auth/login` : Authentifie un utilisateur et retourne un token JWT.
- `POST /api/auth/logout` : Déconnecte l'utilisateur en invalidant le token JWT.
- `POST /api/auth/refresh` : Rafraîchit le token JWT si l'utilisateur est authentifié.
- `GET /api/auth/me` : Récupère les informations de l'utilisateur actuellement authentifié.
- `POST /api/auth/forgot-password` : Envoie un email de réinitialisation de mot de passe à l'utilisateur.
- `POST /api/auth/reset-password` : Réinitialise le mot de passe de l'utilisateur à l'aide du token de réinitialisation.

### 2. Utilisateurs

- `GET /api/users` : Récupère la liste de tous les utilisateurs (avec pagination et filtres).
- `GET /api/users/:id` : Récupère les informations d'un utilisateur spécifique par son ID.
- `PUT /api/users/:id` : Met à jour les informations d'un utilisateur spécifique
- `DELETE /api/users/:id` : Supprime un utilisateur spécifique par son ID.
