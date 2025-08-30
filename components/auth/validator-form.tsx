"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";
import { WalletConnection } from "@/components/auth/wallet-connection";
import { FileUpload } from "@/components/ui/file-upload";
import { ValidatorService, type ValidatorDocumentsFiles } from "@/services/validatorService";
import { AlertCircle, User, FileText, Mail } from "lucide-react";

interface FormData {
  // Step 1: Professional Information (schema-aligned)
  full_name: string;
  professional_title: string;
  license_number: string;
  years_of_experience: string;
  specialization: string;
  current_institution: string;
  professional_email: string;
  preferred_validation_types: string;
  expected_validations_per_day: string;
  availability_hours: string;

  // Step 2: Documents
  professional_license_certificate: File | null;
  institution_id_letter: File | null;
  educational_qualification_certificate: File | null;

  // Step 3: Wallet + Security
  walletAddress: string;
  password: string;
  confirmPassword: string;
}

const steps = [
  "Professional Information",
  "Documents",
  "Wallet Connection",
];

export function ValidatorForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    professional_title: "",
    license_number: "",
    years_of_experience: "",
    specialization: "",
    current_institution: "",
    professional_email: "",
    preferred_validation_types: "",
    expected_validations_per_day: "",
    availability_hours: "",
    professional_license_certificate: null,
    institution_id_letter: null,
    educational_qualification_certificate: null,
    walletAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof FormData, v: any) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: undefined as any }));
  };

  const validateStep = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!formData.full_name) e.full_name = "Full name is required";
      if (!formData.professional_title) e.professional_title = "Professional title is required";
      if (!formData.license_number) e.license_number = "License number is required";
      if (!formData.years_of_experience) e.years_of_experience = "Years of experience is required";
      if (!formData.specialization) e.specialization = "Specialization is required";
      if (!formData.current_institution) e.current_institution = "Current institution is required";
      if (!formData.professional_email) e.professional_email = "Professional email is required";
    }
    if (step === 1) {
      if (!formData.professional_license_certificate) e.professional_license_certificate = "Professional license certificate is required";
      if (!formData.institution_id_letter) e.institution_id_letter = "Institution ID letter is required";
      if (!formData.educational_qualification_certificate) e.educational_qualification_certificate = "Educational qualification certificate is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validateStep(currentStep) && setCurrentStep((s) => s + 1);
  const back = () => setCurrentStep((s) => s - 1);
  const onWalletConnected = (addr: string) => update("walletAddress", addr);

  const complete = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Step 3: Create user, then save basic info and documents, then link wallet
      setProgress("Creating user...");
      const user = await ValidatorService.createUser({
        wallet_address: formData.walletAddress,
        role: "validator",
        password: formData.password,
      });

      setProgress("Saving professional information...");
      const basicInfoRes = await ValidatorService.createBasicInfo({
        user_id: user.user_id,
        full_name: formData.full_name,
        professional_title: formData.professional_title,
        license_number: formData.license_number,
        years_of_experience: parseInt(formData.years_of_experience || "0", 10),
        specialization: formData.specialization,
        current_institution: formData.current_institution,
        professional_email: formData.professional_email,
        preferred_validation_types: formData.preferred_validation_types || undefined,
        expected_validations_per_day: formData.expected_validations_per_day ? parseInt(formData.expected_validations_per_day, 10) : undefined,
        availability_hours: formData.availability_hours || undefined,
      });

      setProgress("Uploading documents...");
      const files: ValidatorDocumentsFiles = {
        professional_license_certificate: formData.professional_license_certificate!,
        institution_id_letter: formData.institution_id_letter!,
        educational_qualification_certificate: formData.educational_qualification_certificate!,
      };
      await ValidatorService.uploadDocuments(basicInfoRes.validator_id, files);

      setProgress("Done! Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err: any) {
      setSubmitError(err?.message || "Registration failed");
      setIsSubmitting(false);
    }
  };

  const renderProfessional = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
        <User className="h-5 w-5 text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-100">Professional Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-gray-200">Full Name *</Label>
          <Input id="full_name" value={formData.full_name} onChange={(e) => update("full_name", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.full_name && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.full_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="professional_title" className="text-gray-200">Professional Title *</Label>
          <Input id="professional_title" value={formData.professional_title} onChange={(e) => update("professional_title", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.professional_title && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.professional_title}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="license_number" className="text-gray-200">License Number *</Label>
          <Input id="license_number" value={formData.license_number} onChange={(e) => update("license_number", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.license_number && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.license_number}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="years_of_experience" className="text-gray-200">Years of Experience *</Label>
          <Input id="years_of_experience" type="number" value={formData.years_of_experience} onChange={(e) => update("years_of_experience", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.years_of_experience && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.years_of_experience}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization" className="text-gray-200">Specialization *</Label>
          <Input id="specialization" value={formData.specialization} onChange={(e) => update("specialization", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.specialization && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.specialization}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_institution" className="text-gray-200">Current Institution *</Label>
          <Input id="current_institution" value={formData.current_institution} onChange={(e) => update("current_institution", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.current_institution && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.current_institution}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="professional_email" className="text-gray-200">Professional Email *</Label>
          <Input id="professional_email" type="email" value={formData.professional_email} onChange={(e) => update("professional_email", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.professional_email && <p className="text-red-400 text-sm flex items-center gap-1"><Mail className="h-3 w-3" />{errors.professional_email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferred_validation_types" className="text-gray-200">Preferred Validation Types</Label>
          <Input id="preferred_validation_types" placeholder="e.g., Radiology, Pathology" value={formData.preferred_validation_types} onChange={(e) => update("preferred_validation_types", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_validations_per_day" className="text-gray-200">Expected Validations/Day</Label>
          <Input id="expected_validations_per_day" type="number" value={formData.expected_validations_per_day} onChange={(e) => update("expected_validations_per_day", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability_hours" className="text-gray-200">Availability Hours</Label>
          <Input id="availability_hours" placeholder="e.g., 9 AM - 6 PM" value={formData.availability_hours} onChange={(e) => update("availability_hours", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-200">Password *</Label>
          <Input id="password" type="password" value={formData.password} onChange={(e) => update("password", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.password && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password *</Label>
          <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400" />
          {errors.confirmPassword && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
        <FileText className="h-5 w-5 text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-100">Verification Documents</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileUpload
          id="professional_license_certificate"
          label="Professional License Certificate"
          required={true}
          accept=".pdf,.jpg,.jpeg,.png"
          value={formData.professional_license_certificate}
          onChange={(file) => update("professional_license_certificate", file)}
          maxSize={1}
          description="PDF, JPG, PNG up to 1MB"
        />
        <FileUpload
          id="institution_id_letter"
          label="Institution ID Letter"
          required={true}
          accept=".pdf,.jpg,.jpeg,.png"
          value={formData.institution_id_letter}
          onChange={(file) => update("institution_id_letter", file)}
          maxSize={1}
          description="PDF, JPG, PNG up to 1MB"
        />
        <FileUpload
          id="educational_qualification_certificate"
          label="Educational Qualification Certificate"
          required={true}
          accept=".pdf,.jpg,.jpeg,.png"
          value={formData.educational_qualification_certificate}
          onChange={(file) => update("educational_qualification_certificate", file)}
          maxSize={1}
          description="PDF, JPG, PNG up to 1MB"
        />
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="space-y-6">
      <WalletConnection onWalletConnected={onWalletConnected} onBack={back} onComplete={complete} />
      {formData.walletAddress && (
        <p className="text-sm text-green-400">Connected: {formData.walletAddress}</p>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Validator Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Stepper steps={steps} currentStep={currentStep} />
            {currentStep === 0 && renderProfessional()}
            {currentStep === 1 && renderDocuments()}
            {currentStep === 2 && renderWallet()}

            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            {isSubmitting && <p className="text-blue-400 text-sm">{progress}</p>}

            {currentStep !== 2 && (
              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={back} disabled={currentStep === 0 || isSubmitting}>
                  Back
                </Button>
                <Button onClick={next} disabled={isSubmitting}>Next</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
