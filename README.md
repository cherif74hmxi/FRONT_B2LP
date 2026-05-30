![Logo LyonPalme](logo_lp.png)

# Application front du blog Lyon Palme "B2LP"

Code de l'application front developpee avec Next.js et React.

Cette application permet aux adherents du club Lyon Palme de consulter les billets du blog, de lire les commentaires associes, et de commenter les billets apres connexion.

Elle communique avec le webservice Laravel `API_B2LP`.

Mise a jour Mai 2026.

## 1. Presentation

L'application B2LP est la partie visible du blog cote utilisateur.

Elle permet :

- aux visiteurs de consulter la liste des billets ;
- aux visiteurs de consulter le detail d'un billet et ses commentaires ;
- aux adherents connectes d'ajouter un commentaire ;
- a l'administrateur de creer, modifier et supprimer des billets ;
- a l'administrateur de supprimer des commentaires.

La gestion des donnees est faite par l'API Laravel.

## 2. Technologies utilisees

- Next.js
- React
- TypeScript
- Tailwind CSS
- API Laravel avec authentification Sanctum par Bearer Token

## 3. Installation du projet

Cloner le projet :

```bash
git clone <url-du-repo-front>
cd <nom-du-dossier>
```

Installer les dependances :

```bash
npm install
```

Creer un fichier `.env.local` si besoin :

```bash
NEXT_PUBLIC_API_BASE_URL=https://monblog.cherifhammani.fr/api
```

Si cette variable n'est pas definie, l'application utilise deja cette URL par defaut dans `components/types.ts`.

## 4. Lancement en local

Demarrer le serveur de developpement :

```bash
npm run dev
```

Puis ouvrir le site dans le navigateur :

```txt
http://localhost:3000
```

## 5. Commandes utiles

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## 6. Fonctionnement general

Le fichier `components/api.ts` centralise tous les appels vers l'API Laravel.

Les principales fonctions sont :

- `fetchBillets()` : recupere la liste des billets ;
- `fetchBillet(id)` : recupere le detail d'un billet avec ses commentaires ;
- `loginUser(email, password)` : connecte un utilisateur ;
- `registerUser(name, email, password)` : cree un compte utilisateur ;
- `createBillet()` : cree un billet ;
- `updateBillet()` : modifie un billet ;
- `deleteBillet()` : supprime un billet ;
- `createCommentaire()` : ajoute un commentaire ;
- `deleteCommentaire()` : supprime un commentaire.

## 7. Gestion des roles

Visiteur :

- peut voir les billets ;
- peut voir les commentaires ;
- ne peut pas commenter ;
- ne peut pas administrer les billets.

Adherent connecte :

- peut voir les billets ;
- peut voir les commentaires ;
- peut ajouter un commentaire.

Administrateur :

- peut voir les billets ;
- peut voir les commentaires ;
- peut ajouter un commentaire ;
- peut creer, modifier et supprimer des billets ;
- peut supprimer des commentaires.

Le vrai controle des droits est fait cote API Laravel.  
Le front gere surtout l'affichage des boutons selon l'utilisateur connecte.

## 8. Structure principale du projet

```txt
app/
  page.tsx                         Liste des billets
  login/page.tsx                   Page de connexion
  register/page.tsx                Page d'inscription
  billets/[id]/page.tsx            Page detail d'un billet
  admin/billets/new/page.tsx       Creation d'un billet
  admin/billets/[id]/edit/page.tsx Modification d'un billet

components/
  api.ts                           Appels vers l'API Laravel
  AuthProvider.tsx                 Gestion de la session utilisateur
  SiteHeader.tsx                   Menu du site
  AllPosts.tsx                     Affichage de la liste des billets
  BilletDetail.tsx                 Affichage d'un billet et ses commentaires
  BilletForm.tsx                   Formulaire de creation/modification
  CommentForm.tsx                  Formulaire de commentaire
  AdminPostActions.tsx             Actions admin sur un billet
  DeleteCommentButton.tsx          Suppression d'un commentaire
  types.ts                         Types TypeScript
```

## 9. API utilisee

L'application utilise le webservice Laravel suivant :

```txt
https://monblog.cherifhammani.fr/api
```

Routes principales utilisees :

```txt
GET    /api/billets
GET    /api/billets/{id}
POST   /api/login
POST   /api/register
GET    /api/user
POST   /api/user/logout
POST   /api/commentaires
DELETE /api/commentaires/{commentaire}
POST   /api/billets
PATCH  /api/billets/{billet}
DELETE /api/billets/{billet}
```

Les routes d'administration necessitent un Bearer Token.

## 10. Deploiement

Avant un deploiement, verifier que le projet compile correctement :

```bash
npm run build
```

Ensuite, recuperer la derniere version du projet sur le serveur :

```bash
git pull origin main
npm install
npm run build
```

Puis relancer l'application selon la configuration du VPS.

## 11. Lien avec le webservice

Le front depend du webservice Laravel `API_B2LP`.

Repo du webservice :

```txt
https://github.com/cherif74hmxi/API_B2LP
```
