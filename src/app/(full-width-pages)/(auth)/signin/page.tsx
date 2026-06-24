import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | Learn with Rahmlad",
  description: "Signin Page for Learn with Rahmlad",
};

export default function SignIn() {
  return <SignInForm />;
}
