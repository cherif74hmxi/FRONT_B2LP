import {
  API_BASE_URL,
  type AuthSession,
  type Billet,
  type Commentaire,
  type Utilisateur,
} from "./types";

type ApiRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  body?: Record<string, unknown>;
  token?: string;
  headers?: HeadersInit;
};

type LoginApiResponse =
  | string
  | (Partial<AuthSession> & {
      token?: string;
      plainTextToken?: string;
    });

type RawBillet = Omit<Billet, "id" | "Commentaires"> & {
  id?: number | string;
  ID?: number | string;
  Id?: number | string;
  BIL_ID?: number | string;
  bil_id?: number | string;
  commentaires?: RawCommentaire[];
  Commentaires?: RawCommentaire[];
};

type RawCommentaire = Partial<Omit<Commentaire, "id">> & {
  commentaire?: RawCommentaire;
  Commentaire?: RawCommentaire;
  comment?: RawCommentaire;
  id?: number | string;
  ID?: number | string;
  Id?: number | string;
  Date?: string;
  date?: string;
  COM_DATE?: string;
  Contenu?: string;
  contenu?: string;
  COM_CONTENU?: string;
  COM_ID?: number | string;
  com_id?: number | string;
  COM_NUM?: number | string;
  com_num?: number | string;
  commentaire_id?: number | string;
  commentaireId?: number | string;
  CommentaireId?: number | string;
  id_commentaire?: number | string;
  ID_COMMENTAIRE?: number | string;
};

const MAX_BILLET_ID_TO_TEST = 120;

function isApiObject(payload: unknown): payload is Record<string, unknown> {
  return payload !== null && typeof payload === "object";
}

function toNumber(value: unknown): number | undefined {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
}

function readFirstNumber(
  source: Record<string, unknown>,
  names: string[],
): number | undefined {
  for (const name of names) {
    const numberValue = toNumber(source[name]);

    if (numberValue) {
      return numberValue;
    }
  }

  return undefined;
}

function normalizeBillet(billet: RawBillet, fallbackId: number): Billet {
  const id =
    billet.id ?? billet.ID ?? billet.Id ?? billet.BIL_ID ?? billet.bil_id;
  const numericId = Number(id ?? fallbackId);
  const commentaires = billet.Commentaires ?? billet.commentaires;

  return {
    ...billet,
    id: Number.isFinite(numericId) ? numericId : fallbackId,
    hasRealId: id !== undefined && id !== null,
    Commentaires: commentaires?.map(normalizeCommentaire),
  };
}

function normalizeCommentaire(commentaire: RawCommentaire): Commentaire {
  const source =
    commentaire.commentaire ?? commentaire.Commentaire ?? commentaire.comment ?? commentaire;

  // L'API Laravel peut renvoyer l'id avec plusieurs noms selon le Resource.
  // On garde cette petite liste ici pour que le reste du front utilise juste "id".
  const id = readFirstNumber(source as Record<string, unknown>, [
    "id",
    "ID",
    "Id",
    "COM_ID",
    "com_id",
    "COM_NUM",
    "com_num",
    "commentaire_id",
    "commentaireId",
    "CommentaireId",
    "id_commentaire",
    "ID_COMMENTAIRE",
  ]);

  return {
    ...source,
    id: id ?? 0,
    Date: source.Date ?? source.COM_DATE ?? source.date ?? "",
    Contenu:
      source.Contenu ?? source.COM_CONTENU ?? source.contenu ?? "",
  };
}

function isSameBillet(left: Billet, right: Billet): boolean {
  return (
    left.Date === right.Date &&
    left.Titre === right.Titre &&
    left.Contenu === right.Contenu
  );
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  // DELETE renvoie souvent HTTP 204 : la requete a reussi, mais il n'y a pas de JSON.
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  // Laravel peut renvoyer du JSON, mais aussi un token en texte simple.
  // On gere les deux pour eviter "Reponse API inattendue" apres un login reussi.
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : (await response.text()).trim();

  if (!response.ok) {
    // Laravel renvoie souvent { message: "..." } quand il y a une erreur.
    // Si ce message existe, on l'affiche directement a l'utilisateur.
    let message = `Erreur API ${response.status}`;

    if (isApiObject(payload) && typeof payload.message === "string") {
      message = payload.message;
    } else if (typeof payload === "string" && payload) {
      message = payload;
    }

    throw new Error(message);
  }

  if (payload === null || payload === "") {
    throw new Error("Reponse API inattendue");
  }

  // Compatible avec deux formes de reponse :
  // - soit l'API renvoie { data: ... }
  // - soit l'API renvoie directement le billet / le tableau de billets
  if (isApiObject(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...requestOptions } = options;

  // API_BASE_URL contient deja "/api", donc path commence seulement par "/billets",
  // "/login", "/commentaires", etc.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseApiResponse<T>(response);
}

export function fetchBillets(): Promise<Billet[]> {
  // Route Laravel : GET /api/billets
  return apiRequest<RawBillet[]>("/billets").then((billets) =>
    billets.map((billet, index) => normalizeBillet(billet, index + 1)),
  );
}

export function fetchBillet(
  id: string | number,
  token?: string,
): Promise<Billet> {
  // Route Laravel : GET /api/billets/{id}
  // Le token est optionnel : les visiteurs doivent pouvoir lire le billet.
  const fallbackId = Number(id);

  return apiRequest<RawBillet>(
    `/billets/${encodeURIComponent(String(id))}`,
    { token },
  ).then((billet) =>
    normalizeBillet(billet, Number.isFinite(fallbackId) ? fallbackId : 0),
  );
}

export async function findBilletId(
  billetFromList: Billet,
  token?: string,
): Promise<number> {
  if (billetFromList.hasRealId) {
    return billetFromList.id;
  }

  for (let candidateId = 1; candidateId <= MAX_BILLET_ID_TO_TEST; candidateId += 1) {
    try {
      // Lecture publique attendue : cette recherche doit aussi marcher sans token.
      const candidateBillet = await fetchBillet(candidateId, token);

      if (isSameBillet(billetFromList, candidateBillet)) {
        return candidateId;
      }
    } catch {
      // Certains ids peuvent ne pas exister. On continue simplement a chercher.
    }
  }

  throw new Error(
    token
      ? "Impossible de retrouver le vrai id du billet. L'API doit renvoyer l'id dans la liste."
      : "Impossible d'ouvrir ce billet en visiteur : l'API bloque le detail ou ne renvoie pas les ids.",
  );
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  // Route Laravel : POST /api/login
  const authResponse = await apiRequest<LoginApiResponse>("/login", {
    method: "POST",
    body: { email, password },
  });

  // Selon le controller, la route peut renvoyer directement le token,
  // ou un objet plus complet avec access_token + user.
  const rawToken =
    typeof authResponse === "string"
      ? authResponse
      : authResponse.access_token ??
        authResponse.token ??
        authResponse.plainTextToken;
  const token = rawToken?.trim();

  if (!token) {
    throw new Error("Token absent de la reponse API");
  }

  // Si le login ne renvoie pas l'utilisateur, on le recupere avec GET /api/user.
  const user =
    typeof authResponse === "object" && authResponse.user
      ? authResponse.user
      : await apiRequest<Utilisateur>("/user", { token });

  return {
    access_token: token,
    token_type:
      typeof authResponse === "object" && authResponse.token_type
        ? authResponse.token_type
        : "Bearer",
    user,
  };
}

export function logoutUser(token: string): Promise<null> {
  // Route Laravel : POST /api/user/logout
  return apiRequest<null>("/user/logout", {
    method: "POST",
    token,
  });
}

export function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<Utilisateur> {
  // Route Laravel : POST /api/register
  // La table Laravel "users" utilise le champ "name".
  return apiRequest<Utilisateur>("/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function createBillet(
  token: string,
  billet: { date: string; titre: string; contenu: string },
): Promise<Billet> {
  // Route Laravel : POST /api/billets
  // Les noms BIL_* suivent les champs attendus par l'API Laravel.
  return apiRequest<RawBillet>("/billets", {
    method: "POST",
    token,
    body: {
      BIL_DATE: billet.date,
      BIL_TITRE: billet.titre,
      BIL_CONTENU: billet.contenu,
    },
  }).then((savedBillet) => normalizeBillet(savedBillet, 0));
}

export function updateBillet(
  token: string,
  id: number,
  billet: { date: string; titre: string; contenu: string },
): Promise<Billet> {
  // Route Laravel : PATCH /api/billets/{billet}
  return apiRequest<RawBillet>(`/billets/${id}`, {
    method: "PATCH",
    token,
    body: {
      BIL_DATE: billet.date,
      BIL_TITRE: billet.titre,
      BIL_CONTENU: billet.contenu,
    },
  }).then((savedBillet) => normalizeBillet(savedBillet, id));
}

export function deleteBillet(token: string, id: number): Promise<null> {
  // Route Laravel : DELETE /api/billets/{billet}
  return apiRequest<null>(`/billets/${id}`, {
    method: "DELETE",
    token,
  });
}

export function createCommentaire(
  token: string,
  billetId: number,
  userId: number,
  contenu: string,
): Promise<Commentaire> {
  // Route Laravel : POST /api/commentaires
  // Comme la route n'est pas /api/billets/{id}/commentaires, on met l'id du
  // billet dans le body pour rattacher le commentaire au bon billet.
  return apiRequest<RawCommentaire>("/commentaires", {
    method: "POST",
    token,
    body: {
      COM_DATE: new Date().toISOString().slice(0, 10),
      COM_CONTENU: contenu,
      // Ces deux champs indiquent les relations avec le billet et l'utilisateur.
      billet_id: billetId,
      user_id: userId,
    },
  }).then(normalizeCommentaire);
}

export function deleteCommentaire(token: string, id: number): Promise<null> {
  // Route Laravel : DELETE /api/commentaires/{commentaire}
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error(
      "Impossible de supprimer ce commentaire : l'API ne renvoie pas son id.",
    );
  }

  return apiRequest<null>(`/commentaires/${id}`, {
    method: "DELETE",
    token,
  });
}
