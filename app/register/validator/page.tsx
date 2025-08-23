import { ValidatorForm } from "@/components/auth/validator-form";

export default function ValidatorRegistrationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-6 py-10">
        <div className="mx-auto w-full max-w-4xl lg:max-w-5xl">
          <ValidatorForm />
        </div>
      </div>
    </div>
  );
}
