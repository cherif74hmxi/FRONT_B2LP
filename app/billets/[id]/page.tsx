"use client"

import BilletDetail from "@/components/BilletDetail";
import { useAuth } from "../../../components/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";


type BilletPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function BilletPage({ params }: BilletPageProps) {

  const {isAuthenticated}=useAuth();
  const redirect=useRouter();

  useEffect(() => {

    if(isAuthenticated === false){

      redirect.push('/');
    }

  },[])
  const { id } = use(params);

  return <BilletDetail id={id} />;
}
