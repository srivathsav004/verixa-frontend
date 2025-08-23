import { ValidatorDashboard } from "@/components/dashboard/validator-dashboard";

export default function ValidatorDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <ValidatorDashboard />
        </div>
      </div>
    </div>
  );
}
