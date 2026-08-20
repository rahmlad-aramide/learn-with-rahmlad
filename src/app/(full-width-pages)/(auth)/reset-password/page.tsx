import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Learn with Rahmlad",
  description: "Reset your Learn With Rahmlad account password.",
};

export default function ResetPasswordPage() {
  return <ForgotPasswordForm />;
}
