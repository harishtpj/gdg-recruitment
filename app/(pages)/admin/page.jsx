import React from "react";
import AdminContent from "@/components/AdminContent";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import FormDataModel from "@/lib/modals/form.modal";
import { serializeFirestoreData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin") {
    return <main>Unauthorized</main>;
  }

  const applicants = await FormDataModel.find();

  return (
    <main>
      <AdminContent applicants={serializeFirestoreData(applicants)} />
    </main>
  );
}
