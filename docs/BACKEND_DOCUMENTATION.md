# Backend API Documentation

## Database Schema

Démarrer la commande `pnpm prisma:studio` pour visualiser et interagir avec la base de données via une interface web.

## Liste des routes

### 1. Authentification (Better Auth)

Le handler natif Better Auth est exposé sous `/api/auth`. Les anciennes routes
personnalisées `/login`, `/logout`, `/refresh` et `/me` ne sont pas exposées.

| Route native                   | Utilisation                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `POST /api/auth/sign-in/email` | JSON `{ "email": "…", "password": "…" }`, connexion et cookie de session                              |
| `GET /api/auth/get-session`    | Retourne `{ session, user }`, ou `null` sans session valide ; renouvelle la session selon Better Auth |
| `POST /api/auth/sign-out`      | Révoque la session et efface les cookies                                                              |
| `GET /api/auth/ok`             | Vérifie la disponibilité du handler                                                                   |

L'inscription email/mot de passe publique est désactivée. Le provider Microsoft
est configuré avec `MICROSOFT_CLIENT_ID` et `MICROSOFT_CLIENT_SECRET` ; le client
frontend peut utiliser `authClient.signIn.social({ provider: 'microsoft' })`.
Déclarer l'URL publique `/api/auth/callback/microsoft` comme URI de redirection
dans l'application Microsoft. L'envoi d'emails n'est pas configuré.
Le compte initial doit être créé avec le seeder existant.
Les autres routes métier listées ci-dessous restent des routes prévues.

Par défaut, la session dure sept jours, avec renouvellement après un jour d'activité. Le
cookie est HttpOnly, SameSite=Lax et Secure lorsque `BETTER_AUTH_URL` utilise HTTPS.
Seule l'origine `FRONTEND_URL` est autorisée avec credentials. Better Auth assure
le contrôle d'origine et la limitation des tentatives de connexion.

Better Auth expose le prénom sous `user.name` (stocké dans `firstname` en base),
et les champs supplémentaires `lastname`, `phone`, `teamId`, `isAdmin`.
`teamId` et `isAdmin` ne sont pas modifiables via ses entrées utilisateur.
Les réponses natives incluent les données de session prévues par Better Auth ;
leur forme n'est pas celle de l'ancien contrat personnalisé.

Le guard NestJS exporté par `AuthModule` vérifie désormais le cookie de session,
comme le client frontend. Il peut protéger les futures routes métier avec
`@UseGuards(AuthGuard)`. `/api/health` reste public.
L'authentification repose uniquement sur la session cookie. Les routes protégées
refusent immédiatement une session révoquée. Le plugin JWT a été retiré ; les
endpoints `/api/auth/token` et `/api/auth/jwks` ne sont plus exposés.

#### Configuration

En local, NestJS charge uniquement le `.env` racine, qui centralise les variables
du projet. `apps/backend/.env` n'est pas chargé. Les variables du processus
restent prioritaires.

Les durées sont définies dans `auth.ts` : session de sept jours, renouvellement
après un jour. Les variables Better Auth sont lues et
validées dans `apps/backend/src/lib/auth.ts`.

- `DATABASE_URL` : connexion PostgreSQL pour Prisma.
- `BETTER_AUTH_SECRET` : secret aléatoire d'au moins 32 caractères (`openssl rand -hex 32`). Conserver ce secret pour que les cookies existants restent valides.
- `BETTER_AUTH_URL` : URL publique du backend (par exemple `http://localhost:8080` derrière Nginx, ou `http://localhost:3001` en accès direct).
- `FRONTEND_URL` : origine exacte du frontend, sans chemin ni slash final.

Docker Compose transmet ces variables au backend. Appliquer la migration additive
avec `pnpm --filter backend exec prisma migrate deploy`, puis utiliser le seeder
avec `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD`. Aucun reset n'est nécessaire.
La migration `remove_auth_jwks` supprime uniquement la table de clés du plugin JWT.
La migration de création est conservée dans l'historique pour les bases existantes ;
les comptes et sessions ne sont pas supprimés.

#### Exemples avec conservation des cookies

```bash
curl -c cookies.txt http://localhost:8080/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:8080' \
  -d '{"email":"admin@example.com","password":"mot-de-passe-du-seeder"}'

curl -b cookies.txt -c cookies.txt http://localhost:8080/api/auth/get-session

curl -b cookies.txt -c cookies.txt -X POST \
  -H 'Origin: http://localhost:8080' \
  http://localhost:8080/api/auth/sign-out
```

#### Client React frontend

Dans `apps/frontend`, installer `better-auth` et créer un client avec
`createAuthClient` de `better-auth/react`. En accès via Nginx sur la même origine,
le chemin par défaut `/api/auth` suffit. En accès direct sur un autre port,
configurer `baseURL` avec l'URL publique du backend (variable frontend
`NEXT_PUBLIC_…`). Les appels utilisent les cookies avec credentials.

```tsx
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();
// authClient.signIn.email({ email, password })
// authClient.useSession()
// authClient.signOut()
```

Swagger (`/api/docs`, `/api/docs-json`, `/api/docs-yaml`) documente uniquement
les contrôleurs NestJS. Les routes natives Better Auth ne sont pas incluses ;
elles restent disponibles sous `/api/auth` avec les contrats décrits ci-dessus.

### 2. Utilisateurs

- `GET /api/users` : Récupère la liste de tous les utilisateurs (avec pagination et filtres).
- `GET /api/users/:id` : Récupère les informations d'un utilisateur spécifique par son ID.
- `PUT /api/users/:id` : Met à jour les informations d'un utilisateur spécifique
- `DELETE /api/users/:id` : Supprime un utilisateur spécifique par son ID.
