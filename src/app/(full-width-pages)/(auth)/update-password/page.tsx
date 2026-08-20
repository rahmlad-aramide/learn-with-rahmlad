import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set New Password | Learn with Rahmlad",
  description: "Choose a new password for your Learn With Rahmlad account.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
