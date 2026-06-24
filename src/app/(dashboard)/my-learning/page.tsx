import type { Metadata } from "next";
import { LearningMetrics } from "@/components/learning/LearningMetrics";
import LearningTarget from "@/components/learning/LearningTarget";
import { MyLearning } from "@/components/learning/MyLearning";

export const metadata: Metadata = {
  title: "Dashboard | Learn with Rahmlad",
  description:
    "Learn with Rahmlad - Resources website powered by Rahmlad Solutions",
};

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <LearningMetrics />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <LearningTarget />
      </div>

      <div className="col-span-12">
        <MyLearning />
      </div>
    </div>
  );
}
