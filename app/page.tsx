import AllPosts from "@/components/AllPosts";
import { fetchBillets } from "@/components/api";
import { API_BASE_URL, type Billet } from "@/components/types";

export default async function Home() {
  let billets: Billet[] = [];
  let errorMessage: string | undefined;

  try {
    billets = await fetchBillets();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
  }

  return (
    <AllPosts
      apiUrl={`${API_BASE_URL}/billets`}
      billets={billets}
      errorMessage={errorMessage}
    />
  );
}
