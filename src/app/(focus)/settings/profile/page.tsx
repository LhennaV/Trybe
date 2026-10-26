import type { Metadata } from "next";
import EditProfileForm from "@/components/settings/EditProfileForm";

export const metadata: Metadata = {
  title: "Edit profile",
};

export default function EditProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 pt-2 pb-[max(24px,env(safe-area-inset-bottom))]">
      <EditProfileForm />
    </main>
  );
}
