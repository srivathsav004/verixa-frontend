import { InsuranceForm } from "@/components/auth/insurance-form";

export default function InsuranceRegistrationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-6 py-10">
        <div className="mx-auto w-full max-w-4xl lg:max-w-5xl">
          <InsuranceForm />
        </div>
      </div>
    </div>
  );
}
