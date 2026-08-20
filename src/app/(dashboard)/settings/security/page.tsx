import SecuritySettings from "@/components/settings/SecuritySettings";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Settings | Learn with Rahmlad",
  description: "Manage your account security settings.",
};

export default function SecuritySettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Security Settings" />
      <SecuritySettings />
    </div>
  );
}
