export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://monblog.cherifhammani.fr/api";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Utilisateur = {
  id: number;
  // La base Laravel utilise souvent "name", l'ancien front utilisait "nom".
  // On accepte les deux pour rester compatible avec l'API.
  name?: string;
  nom?: string;
  email: string;
  role?: string;
  is_admin?: boolean;
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
  // true = l'id vient vraiment de l'API.
  // false = l'id a ete invente temporairement par le front.
  hasRealId?: boolean;
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
