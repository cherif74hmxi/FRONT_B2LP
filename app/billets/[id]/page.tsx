import BilletDetail from "@/components/BilletDetail";

type BilletPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BilletPage({ params }: BilletPageProps) {
  const { id } = await params;

  return <BilletDetail id={id} />;
}
