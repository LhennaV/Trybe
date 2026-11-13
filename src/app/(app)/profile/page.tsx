import type { Metadata } from "next";
import MyProfile from "@/components/profile/MyProfile";

export const metadata: Metadata = {
  title: "Profile",
};

export default function MyProfilePage() {
  return <MyProfile />;
}
