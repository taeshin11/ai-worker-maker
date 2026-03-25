import PRDBuilder from "@/components/onboard/PRDBuilder";

export const metadata = { title: "Company Vision — AI Worker Maker" };

export default function OnboardPage() {
  return (
    <div className="h-[calc(100vh-57px)]">
      <PRDBuilder />
    </div>
  );
}
