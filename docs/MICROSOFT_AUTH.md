# Connexion Microsoft 365

La connexion utilise Microsoft Entra ID et le fournisseur Microsoft de Better Auth.
Seul le tenant configuré est accepté. Microsoft ne peut pas créer d'utilisateur
Time Manager : l'utilisateur doit déjà exister avec la même adresse email.
L'association est automatique lors de sa première connexion Microsoft.

## Configuration Microsoft Entra

1. Dans le centre d'administration Entra, ouvrir **Inscriptions d'applications**
   et créer une application Time Manager.
2. Choisir **Comptes dans cet annuaire d'organisation uniquement** (un seul tenant).
3. Ajouter une plateforme **Web** et l'URI de redirection exacte :
   - Docker/Nginx : `http://localhost:8080/api/auth/callback/microsoft`.
   - Backend lancé directement : `http://localhost:3001/api/auth/callback/microsoft`.
   - Production : `https://votre-domaine/api/auth/callback/microsoft`.
4. Relever l' **ID d'application (client)** et l' **ID d'annuaire (tenant)**.
5. Dans **Certificats et secrets**, créer un secret client. Copier sa **valeur**,
   et non son ID. Prévoir son renouvellement avant expiration.
6. Dans **Configuration du jeton**, ajouter les revendications facultatives
   `email` aux jetons ID. Better Auth exige un email ; il n'est pas utilisé
   comme identifiant Microsoft stable. L'association exige que cet email
   corresponde à l'email du compte Time Manager.
7. Les scopes par défaut de Better Auth sont `openid`, `profile`, `email`,
   `User.Read` et `offline_access`. Accorder le consentement requis selon
   la politique du tenant. La récupération de photo est désactivée.

Documentation officielle : [Microsoft dans Better Auth](https://better-auth.com/docs/authentication/microsoft)
et [URI de redirection Microsoft](https://learn.microsoft.com/en-us/entra/identity-platform/reply-url).

## Variables du projet

Centraliser les variables dans le `.env` **à la racine** :

```dotenv
MICROSOFT_CLIENT_ID=ID_APPLICATION
MICROSOFT_CLIENT_SECRET=VALEUR_DU_SECRET
MICROSOFT_TENANT_ID=ID_ANNUAIRE
```

NestJS et la commande `user:create` chargent aussi `apps/backend/.env`, qui
est prioritaire sur le fichier racine. Éviter les doublons dans ce fichier :
Prisma et le seeder chargent uniquement le `.env` racine. Les variables du
processus restent prioritaires sur les fichiers.

Le tenant doit être un GUID précis. `common`, `organizations` et `consumers`
ne sont pas acceptés. Les trois variables peuvent être laissées vides pour
désactiver Microsoft ; une configuration partielle empêche le démarrage.
Ne pas committer les secrets ni les exposer dans des variables `NEXT_PUBLIC_*`.

Pour `pnpm dev` :

```dotenv
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

Next.js relaie `/api/auth/*` vers le backend sur le port 3001 en développement.
Avec Docker, Nginx assure ce relais ; utiliser `http://localhost:8080` pour les
deux variables (adapter le port à `HTTP_PORT`). Redémarrer le backend après
modification des variables. Docker Compose transmet aussi le tenant au backend.

### Erreur `INVALID_CALLBACK_URL`

Better Auth vérifie l'URL de retour envoyée par le frontend contre
`trustedOrigins`, alimenté ici par `FRONTEND_URL`. Cette variable doit correspondre
exactement à l'origine affichée dans le navigateur (protocole, hôte et port),
sans chemin ni slash final. Pour `pnpm dev`, ouvrir `http://localhost:3000`
et définir `FRONTEND_URL=http://localhost:3000` dans le `.env` à la racine.
Redémarrer le backend après la correction. L'URI de redirection Entra reste
`${BETTER_AUTH_URL}/api/auth/callback/microsoft`.

Référence : [validation des URL dans Better Auth](https://better-auth.com/docs/reference/security).

## Première association

1. Un administrateur crée au préalable l'utilisateur Time Manager avec son
   email professionnel, par exemple `michel@boite.fr`. Aucun mot de passe local
   ni accès au compte Microsoft de Michel n'est nécessaire.
2. Michel clique sur **Se connecter avec Microsoft 365** et s'authentifie
   lui-même chez Microsoft.
3. Si l'email fourni par Microsoft correspond à l'utilisateur existant,
   Better Auth associe le compte Microsoft et ouvre une session.
4. Sans utilisateur correspondant, l'accès est refusé ; aucun utilisateur
   n'est créé. Aux connexions suivantes, l'association existante est réutilisée.

Microsoft est déclaré comme fournisseur de confiance pour l'association
automatique, uniquement dans le tenant configuré. Le compte local créé par
l'administrateur peut avoir `emailVerified: false` : cette vérification locale
n'est pas exigée pour l'association. Les emails doivent être enregistrés en
minuscules lors du provisionnement, Better Auth normalisant l'email Microsoft
avant la recherche. Le rôle et les informations métier du compte local sont
conservés. Aucun nouvel utilisateur n'est créé par OAuth, même avec
`requestSignUp: true`. La connexion email/mot de passe reste disponible pour
les comptes disposant de ces identifiants.

Better Auth stocke l'association dans `account` avec `providerId=microsoft` et
l'identifiant Microsoft stable `oid` comme `accountId`. Les sessions sont
stockées dans `session` et le navigateur reçoit un cookie HttpOnly. Les données
réelles sont persistées dans PostgreSQL ; les tests utilisent une base en mémoire.
Le schéma Prisma existant suffit, aucune migration supplémentaire n'est nécessaire.

## Vérification avec un vrai tenant

Les tests locaux simulent uniquement la réponse externe de Microsoft et vérifient
le parcours Better Auth : refus d'un compte inconnu, association automatique
d'un utilisateur existant sans mot de passe local et reconnexion sans doublon.
La validation cryptographique des
jetons Microsoft reste assurée par Better Auth et n'est pas simulée comme un
test réel du tenant.

Après configuration Entra, vérifier dans le navigateur l'association, la
déconnexion et la reconnexion Microsoft. Vérifier également le refus d'un
utilisateur non autorisé et d'un compte d'une autre organisation.
