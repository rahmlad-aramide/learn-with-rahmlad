import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Calender | Learn with Rahmlad",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Live Sessions & Mentorship" />
      <Calendar />
    </div>
  );
}
