# Time Manager — Guide de démarrage

**Toutes les commandes ci-dessous se lancent à la racine du dépôt.**

## 1. Première installation

Prérequis : **Node.js 24.9+**, **pnpm 12.9.1**, Docker et Docker Compose v2.

Si vous utilisez nvm :

```bash
nvm install
```

Après avoir cloné le dépôt :

```bash
npm install --global pnpm@12.9.1 # si nécessaire
cp .env.example .env
pnpm install
pnpm prisma:generate
```

Un seul fichier `.env`, à la racine, suffit. Il contient la configuration PostgreSQL et `DATABASE_URL`. Il est ignoré par Git.

Si le port PostgreSQL **5432** est déjà occupé, modifiez **`POSTGRES_PORT` et le port dans `DATABASE_URL`** pour utiliser le même port disponible.

**Aucune migration n'est nécessaire actuellement : le schéma Prisma ne contient aucun modèle.** Lorsqu'il y aura des migrations, démarrez PostgreSQL avant de les appliquer.

## 2. Lancer le projet au quotidien

### Développement local avec pnpm

C'est le mode à utiliser pour travailler sur le code :

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --wait database
pnpm dev
```

La première commande démarre PostgreSQL et le rend accessible sur localhost. `pnpm dev` lance simultanément Next.js et NestJS via Turborepo, avec rechargement lors des modifications.

- Frontend : http://localhost:3000
- API de santé : http://localhost:3001/api/health

Arrêtez les applications avec **Ctrl+C**.

### Stack complète avec Docker Compose

Pour faire tourner frontend, backend, PostgreSQL et Nginx en conteneurs :

```bash
docker compose up --build -d --wait
```

Accès : **http://localhost:8080**, ou le port défini par `HTTP_PORT`.

Ce mode utilise les applications compilées. Relancez la commande après des changements de code pour reconstruire les images.

```bash
docker compose down
```

Cette commande arrête la stack et conserve les données PostgreSQL.

Pour revenir au développement local ou utiliser Prisma depuis votre machine, redémarrez la base avec la commande comprenant `docker-compose.dev.yml`.

## 3. Commandes importantes

| Commande                              | Utilité                                                      |
| ------------------------------------- | ------------------------------------------------------------ |
| `pnpm install`                        | Installer ou mettre à jour les dépendances                   |
| `pnpm dev`                            | Lancer frontend et backend en développement                  |
| `pnpm build`                          | Compiler les deux applications                               |
| `pnpm test`                           | Exécuter les tests disponibles, actuellement ceux du backend |
| `pnpm lint`                           | Vérifier le code des deux applications                       |
| `pnpm format:check`                   | Vérifier le formatage                                        |
| `pnpm prisma:generate`                | Régénérer Prisma Client                                      |
| `pnpm prisma:migrate`                 | Créer/appliquer les migrations de développement              |
| `pnpm prisma:studio`                  | Ouvrir l'interface de consultation des données               |
| `docker compose up --build -d --wait` | Construire et démarrer la stack complète                     |
| `docker compose down`                 | Arrêter la stack sans supprimer les données                  |

## 4. Prisma et base de données

Le schéma se trouve dans **`apps/backend/prisma/schema.prisma`**.

- **`pnpm prisma:generate`** : à lancer après un changement du schéma pour mettre à jour Prisma Client. PostgreSQL n'a pas besoin de tourner. Les scripts backend de développement, build et test le lancent aussi automatiquement.
- **`pnpm prisma:migrate`** : à lancer lorsque vous modifiez les modèles ou récupérez de nouvelles migrations. **PostgreSQL doit être démarré.**
- **`pnpm prisma:studio`** : utile pour consulter les données et vérifier vos changements. **PostgreSQL doit être démarré.**

Après une modification des modèles :

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

Ajoutez au commit le schéma modifié et les migrations créées dans **`apps/backend/prisma/migrations/`**.

## 5. Quand récupérer les changements des autres

Après :

```bash
git pull
```

Vérifiez les fichiers modifiés :

- **Un `package.json`, `pnpm-lock.yaml` ou `pnpm-workspace.yaml` a changé** → lancez `pnpm install`.
- **Le schéma Prisma a changé** → lancez `pnpm prisma:generate`. Si la structure de la base change, lancez d'abord `pnpm prisma:migrate`, avec PostgreSQL démarré.
- **De nouvelles migrations sont présentes** → lancez `pnpm prisma:migrate`, puis `pnpm prisma:generate`.
- **Seul le code applicatif a changé** → aucune installation supplémentaire n'est normalement nécessaire.

Ne recopiez pas `.env.example` sur votre `.env` à chaque pull. Si l'exemple évolue, reportez les nouvelles variables dans votre configuration locale.

## 6. Avant de push

```bash
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

Si le formatage échoue :

```bash
pnpm format
```

Vérifiez les modifications et corrigez les erreurs avant de pousser.

## 7. Workflow résumé

```bash
git pull
pnpm install          # si les dépendances ont changé

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --wait database

pnpm prisma:migrate   # si des migrations doivent être appliquées/créées
pnpm prisma:generate  # si le schéma ou les migrations ont changé
pnpm dev
```

Avant de pousser :

```bash
pnpm lint
pnpm test
pnpm build
pnpm format:check
git add <fichiers>
git commit -m "Description du changement"
git push
```
