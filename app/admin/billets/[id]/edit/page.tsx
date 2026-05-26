import EditBilletClient from "@/components/EditBilletClient";

type EditBilletPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBilletPage({ params }: EditBilletPageProps) {
  const { id } = await params;

  return <EditBilletClient id={id} />;
}
