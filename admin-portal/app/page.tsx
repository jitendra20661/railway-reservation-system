"use client";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/auth";
import { useEffect } from "react";

export default function Home() {
  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);
}
