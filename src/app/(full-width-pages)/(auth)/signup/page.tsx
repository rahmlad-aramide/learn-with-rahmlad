import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | Learn with Rahmlad",
  description: "Signup Page for Learn with Rahmlad",
};

export default function SignUp() {
  return <SignUpForm />;
}
