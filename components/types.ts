export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://monblog.cherifhammani.fr/api";

export type Utilisateur = {
  id: number;
  nom: string;
  email: string;
  role: "admin" | "adherent";
};

export type Commentaire = {
  id: number;
  Date: string;
  Auteur?: string;
  Utilisateur?: Utilisateur;
  BilletId?: number;
  Contenu: string;
};

export type Billet = {
  id: number;
  Date: string;
  Titre: string;
  Contenu: string;
  Auteur?: string | Utilisateur;
  Commentaires?: Commentaire[];
};

export type AuthSession = {
  access_token: string;
  token_type: "Bearer" | string;
  user: Utilisateur;
};
