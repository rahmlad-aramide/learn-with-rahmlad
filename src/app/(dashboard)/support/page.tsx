import SupportForm from "@/components/support/SupportForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Learn with Rahmlad",
  description: "Get help from the Learn With Rahmlad team.",
};

export default function SupportPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support" />
      <SupportForm />
    </div>
  );
}
