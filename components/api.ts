import {
  API_BASE_URL,
  type AuthSession,
  type Billet,
  type Commentaire,
} from "./types";

type ApiRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  body?: Record<string, unknown>;
  token?: string;
  headers?: HeadersInit;
};

type RegisterApiResponse = {
  access_token: string;
  token_type: "Bearer" | string;
};

function isApiObject(payload: unknown): payload is Record<string, unknown> {
  return payload !== null && typeof payload === "object";
}

function getApiErrorMessage(payload: unknown, status: number): string {
  // Laravel renvoie souvent { message: "..." } quand une route echoue.
  if (isApiObject(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return `Erreur API ${status}`;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  // DELETE renvoie souvent HTTP 204 : la requete a reussi, sans JSON derriere.
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : (await response.text()).trim();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, response.status));
  }

  // Certaines routes Laravel peuvent renvoyer success:false avec un status 200.
  if (isApiObject(payload) && payload.success === false) {
    throw new Error(getApiErrorMessage(payload, response.status));
  }

  // Ton API renvoie souvent { data: ... } : ici on recupere directement data.
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

  // API_BASE_URL contient deja "/api", donc path commence par "/billets", "/login", etc.
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
  return apiRequest<Billet[]>("/billets");
}

export function fetchBillet(
  id: string | number,
  token?: string,
): Promise<Billet> {
  // Route Laravel : GET /api/billets/{id}
  // Le token reste optionnel pour laisser les visiteurs lire les billets.
  return apiRequest<Billet>(`/billets/${encodeURIComponent(String(id))}`, {
    token,
  });
}

export function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  // Route Laravel : POST /api/login
  return apiRequest<AuthSession>("/login", {
    method: "POST",
    body: { email, password },
  });
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
): Promise<RegisterApiResponse> {
  // Route Laravel : POST /api/register
  // Le back cree l'utilisateur en adherent par defaut.
  return apiRequest<RegisterApiResponse>("/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function createBillet(
  token: string,
  billet: { date: string; titre: string; contenu: string },
): Promise<Billet> {
  // Route Laravel : POST /api/billets
  return apiRequest<Billet>("/billets", {
    method: "POST",
    token,
    body: {
      BIL_DATE: billet.date,
      BIL_TITRE: billet.titre,
      BIL_CONTENU: billet.contenu,
    },
  });
}

export function updateBillet(
  token: string,
  id: number,
  billet: { date: string; titre: string; contenu: string },
): Promise<Billet> {
  // Route Laravel : PATCH /api/billets/{billet}
  return apiRequest<Billet>(`/billets/${id}`, {
    method: "PATCH",
    token,
    body: {
      BIL_DATE: billet.date,
      BIL_TITRE: billet.titre,
      BIL_CONTENU: billet.contenu,
    },
  });
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
  return apiRequest<Commentaire>("/commentaires", {
    method: "POST",
    token,
    body: {
      COM_DATE: new Date().toISOString().slice(0, 10),
      COM_CONTENU: contenu,
      billet_id: billetId,
      user_id: userId,
    },
  });
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
