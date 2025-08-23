"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stepper } from "@/components/ui/stepper";
import { WalletConnection } from "@/components/auth/wallet-connection";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { validateField, validatePassword, validateConfirmPassword } from "@/lib/validation";
import { InsuranceService } from "@/services/insuranceService";

import { 
  Building2, 
  User, 
  MapPin, 
  FileText, 
  Settings, 
  Wallet,
  AlertCircle,
  CheckCircle,
  Upload,
  Calendar,
  DollarSign,
  Shield
} from "lucide-react";

interface FormData {
  // Company Information
  companyName: string;
  companyType: string;
  insuranceLicenseNumber: string;
  irdaiRegistrationNumber: string;
  establishedYear: string;
  companyWebsite: string;
  companyLogo: File | null;

  // Business Information
  annualPremiumCollection: string;
  numberOfActivePolicies: string;
  coverageAreas: string;
  specialization: string;
  claimSettlementRatio: string;

  // Contact Information
  primaryContactPerson: string;
  designation: string;
  department: string;
  officialEmailAddress: string;
  phoneNumber: string;
  claimsDepartmentEmail: string;
  claimsDepartmentPhone: string;

  // Address Details
  headOfficeAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  regionalOfficeAddresses: string;

  // Legal Documents
  insuranceLicense: File | null;
  irdaiRegistration: File | null;
  businessRegistration: File | null;
  taxRegistration: File | null;
  auditedFinancialStatements: File | null;

  // Technical Integration
  technicalContactPerson: string;
  technicalEmail: string;
  preferredIntegrationMethod: string;
  currentClaimsManagementSystem: string;
  monthlyVerificationVolume: string;

  // Verification Preferences
  autoApprovalThreshold: string;
  manualReviewThreshold: string;
  rejectionThreshold: string;
  notificationPreferences: string[];

  // Account Security
  password: string;
  confirmPassword: string;
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
  twoFactorAuth: string;

  // Terms & Agreements
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptBlockchain: boolean;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;

  // Wallet
  walletAddress: string;
}

const steps = ["Company Information", "Technical Setup", "Wallet Connection"];

const companyTypes = [
  "Life Insurance",
  "Health Insurance", 
  "General Insurance",
  "Reinsurance"
];

const designations = [
  "Claims Manager",
  "Medical Officer",
  "IT Head",
  "CEO",
  "CTO",
  "Operations Manager"
];

const departments = [
  "Claims",
  "Underwriting", 
  "IT",
  "Medical",
  "Operations",
  "Legal"
];

const integrationMethods = [
  "REST API",
  "Webhook",
  "Manual",
  "SFTP",
  "EDI"
];

const notificationPreferences = [
  "Email",
  "SMS", 
  "Dashboard",
  "Webhook",
  "API Callback"
];

export function InsuranceForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    companyType: "",
    insuranceLicenseNumber: "",
    irdaiRegistrationNumber: "",
    establishedYear: "",
    companyWebsite: "",
    companyLogo: null,
    annualPremiumCollection: "",
    numberOfActivePolicies: "",
    coverageAreas: "",
    specialization: "",
    claimSettlementRatio: "",
    primaryContactPerson: "",
    designation: "",
    department: "",
    officialEmailAddress: "",
    phoneNumber: "",
    claimsDepartmentEmail: "",
    claimsDepartmentPhone: "",
    headOfficeAddress: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    regionalOfficeAddresses: "",
    insuranceLicense: null,
    irdaiRegistration: null,
    businessRegistration: null,
    taxRegistration: null,
    auditedFinancialStatements: null,
    technicalContactPerson: "",
    technicalEmail: "",
    preferredIntegrationMethod: "",
    currentClaimsManagementSystem: "",
    monthlyVerificationVolume: "",
    autoApprovalThreshold: "",
    manualReviewThreshold: "",
    rejectionThreshold: "",
    notificationPreferences: [],
    password: "",
    confirmPassword: "",
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
    twoFactorAuth: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptBlockchain: false,
    marketingConsent: false,
    dataProcessingConsent: false,
    walletAddress: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 0) {
      if (!formData.companyName) newErrors.companyName = "Company name is required";
      if (!formData.companyType) newErrors.companyType = "Company type is required";
      if (!formData.insuranceLicenseNumber) newErrors.insuranceLicenseNumber = "Insurance license number is required";
      if (!formData.irdaiRegistrationNumber) newErrors.irdaiRegistrationNumber = "IRDAI registration number is required";
      if (!formData.establishedYear) newErrors.establishedYear = "Established year is required";
      if (!formData.primaryContactPerson) newErrors.primaryContactPerson = "Primary contact person is required";
      if (!formData.designation) newErrors.designation = "Designation is required";
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.officialEmailAddress) newErrors.officialEmailAddress = "Official email is required";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";

      // Validate email format
      if (formData.officialEmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmailAddress)) {
        newErrors.officialEmailAddress = "Please enter a valid email address";
      }

      // Validate password strength
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      // Validate password confirmation
      const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

      // Validate phone number
      if (formData.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number with country code";
      }

      // Validate website URL if provided
      if (formData.companyWebsite && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.companyWebsite)) {
        newErrors.companyWebsite = "Please enter a valid website URL";
      }
    }

    if (step === 1) {
      if (!formData.technicalContactPerson) newErrors.technicalContactPerson = "Technical contact person is required";
      if (!formData.technicalEmail) newErrors.technicalEmail = "Technical email is required";
      if (!formData.preferredIntegrationMethod) newErrors.preferredIntegrationMethod = "Preferred integration method is required";
      if (!formData.autoApprovalThreshold) newErrors.autoApprovalThreshold = "Auto-approval threshold is required";
      if (!formData.manualReviewThreshold) newErrors.manualReviewThreshold = "Manual review threshold is required";
      if (!formData.rejectionThreshold) newErrors.rejectionThreshold = "Rejection threshold is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleWalletConnected = (address: string) => {
    updateFormData("walletAddress", address);
  };

  const handleComplete = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // Basic required docs validation
      if (!formData.insuranceLicense || !formData.irdaiRegistration || !formData.businessRegistration || !formData.taxRegistration) {
        throw new Error("Please upload all required legal documents.");
      }

      await InsuranceService.completeRegistration(
        {
          // wallet
          wallet_address: formData.walletAddress,
          // basic info
          company_name: formData.companyName,
          company_type: formData.companyType,
          insurance_license_number: formData.insuranceLicenseNumber,
          registration_number: formData.irdaiRegistrationNumber,
          established_year: formData.establishedYear ? Number(formData.establishedYear) : undefined,
          website_url: formData.companyWebsite || undefined,
          company_logo: formData.companyLogo,
          // business info
          annual_premium_collection: formData.annualPremiumCollection ? parseFloat(formData.annualPremiumCollection) : undefined,
          active_policies: formData.numberOfActivePolicies ? parseInt(formData.numberOfActivePolicies) : undefined,
          coverage_areas: formData.coverageAreas || undefined,
          specialization: formData.specialization || undefined,
          claim_settlement_ratio: formData.claimSettlementRatio ? parseFloat(formData.claimSettlementRatio) : undefined,
          // contact & tech
          primary_contact_name: formData.primaryContactPerson,
          designation: formData.designation || undefined,
          department: formData.department || undefined,
          official_email: formData.officialEmailAddress || undefined,
          phone_number: formData.phoneNumber || undefined,
          claims_email: formData.claimsDepartmentEmail || undefined,
          claims_phone: formData.claimsDepartmentPhone || undefined,
          head_office_address: formData.headOfficeAddress || formData.streetAddress || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country || undefined,
          regional_offices: formData.regionalOfficeAddresses || undefined,
          technical_contact_name: formData.technicalContactPerson || undefined,
          technical_email: formData.technicalEmail || undefined,
          integration_method: formData.preferredIntegrationMethod || undefined,
          claims_system: formData.currentClaimsManagementSystem || undefined,
          monthly_verification_volume: formData.monthlyVerificationVolume ? parseInt(formData.monthlyVerificationVolume) : undefined,
          auto_approval_threshold: formData.autoApprovalThreshold ? parseFloat(formData.autoApprovalThreshold) : undefined,
          manual_review_threshold: formData.manualReviewThreshold ? parseFloat(formData.manualReviewThreshold) : undefined,
          rejection_threshold: formData.rejectionThreshold ? parseFloat(formData.rejectionThreshold) : undefined,
          notification_preferences: formData.notificationPreferences?.length ? formData.notificationPreferences.join(",") : undefined,
          payment_method: undefined,
          monthly_budget: undefined,
          // docs
          insurance_license: formData.insuranceLicense,
          registration_certificate: formData.irdaiRegistration,
          business_registration_doc: formData.businessRegistration,
          tax_registration_doc: formData.taxRegistration,
          audited_financials: formData.auditedFinancialStatements ?? undefined,
        },
        (msg) => setProgressMessage(msg)
      );

      window.location.href = "/login";
    } catch (e: any) {
      setSubmitError(e?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCompanyInformation = () => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-gray-200">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData("companyName", e.target.value)}
            placeholder="e.g., ABC Insurance Co."
            className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
          />
          {errors.companyName && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.companyName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyType" className="text-gray-200">Company Type *</Label>
          <Select value={formData.companyType} onValueChange={(value) => updateFormData("companyType", value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
              <SelectValue placeholder="Select company type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {companyTypes.map(type => (
                <SelectItem key={type} value={type} className="text-gray-100 hover:bg-gray-700">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyType && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.companyType}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceLicenseNumber" className="text-gray-200">Insurance License Number *</Label>
          <Input
            id="insuranceLicenseNumber"
            value={formData.insuranceLicenseNumber}
            onChange={(e) => updateFormData("insuranceLicenseNumber", e.target.value)}
            placeholder="e.g., INS123456"
            className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
          />
          {errors.insuranceLicenseNumber && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.insuranceLicenseNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="irdaiRegistrationNumber" className="text-gray-200">IRDAI Registration Number *</Label>
          <Input
            id="irdaiRegistrationNumber"
            value={formData.irdaiRegistrationNumber}
            onChange={(e) => updateFormData("irdaiRegistrationNumber", e.target.value)}
            placeholder="e.g., IRDAI123456"
            className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
          />
          {errors.irdaiRegistrationNumber && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.irdaiRegistrationNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear" className="text-gray-200">Established Year *</Label>
          <Input
            id="establishedYear"
            value={formData.establishedYear}
            onChange={(e) => updateFormData("establishedYear", e.target.value)}
            placeholder="e.g., 2010"
            className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
          />
          {errors.establishedYear && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.establishedYear}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite" className="text-gray-200">Company Website *</Label>
          <Input
            id="companyWebsite"
            value={formData.companyWebsite}
            onChange={(e) => updateFormData("companyWebsite", e.target.value)}
            placeholder="https://example.com"
            className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
          />
          {errors.companyWebsite && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.companyWebsite}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <FileUpload
          id="companyLogo"
          label="Company Logo"
          accept="image/*"
          maxSize={5}
          value={formData.companyLogo}
          onChange={(file) => updateFormData("companyLogo", file)}
          description="PNG, JPG up to 5MB"
        />
      </div>

      <div className="border-t border-gray-700 pt-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <DollarSign className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Business Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="annualPremiumCollection" className="text-gray-200">Annual Premium Collection</Label>
            <Input
              id="annualPremiumCollection"
              value={formData.annualPremiumCollection}
              onChange={(e) => updateFormData("annualPremiumCollection", e.target.value)}
              placeholder="e.g., $1,000,000"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfActivePolicies" className="text-gray-200">Number of Active Policies</Label>
            <Input
              id="numberOfActivePolicies"
              value={formData.numberOfActivePolicies}
              onChange={(e) => updateFormData("numberOfActivePolicies", e.target.value)}
              placeholder="e.g., 10,000"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageAreas" className="text-gray-200">Coverage Areas</Label>
            <Input
              id="coverageAreas"
              value={formData.coverageAreas}
              onChange={(e) => updateFormData("coverageAreas", e.target.value)}
              placeholder="e.g., Maharashtra, Karnataka, Tamil Nadu"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-gray-200">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => updateFormData("specialization", e.target.value)}
              placeholder="e.g., Individual, Corporate, Both"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimSettlementRatio" className="text-gray-200">Claim Settlement Ratio (%)</Label>
            <Input
              id="claimSettlementRatio"
              value={formData.claimSettlementRatio}
              onChange={(e) => updateFormData("claimSettlementRatio", e.target.value)}
              placeholder="e.g., 95.5"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-700 pt-6 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <User className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="primaryContactPerson" className="text-gray-200">Primary Contact Person *</Label>
            <Input
              id="primaryContactPerson"
              value={formData.primaryContactPerson}
              onChange={(e) => updateFormData("primaryContactPerson", e.target.value)}
              placeholder="e.g., John Smith"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.primaryContactPerson && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.primaryContactPerson}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-gray-200">Designation *</Label>
            <Select value={formData.designation} onValueChange={(value) => updateFormData("designation", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {designations.map(designation => (
                  <SelectItem key={designation} value={designation} className="text-gray-100 hover:bg-gray-700">{designation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designation && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.designation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-gray-200">Department *</Label>
            <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept} className="text-gray-100 hover:bg-gray-700">{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.department}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="officialEmailAddress" className="text-gray-200">Official Email Address *</Label>
            <Input
              id="officialEmailAddress"
              type="email"
              value={formData.officialEmailAddress}
              onChange={(e) => updateFormData("officialEmailAddress", e.target.value)}
              placeholder="contact@company.com"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.officialEmailAddress && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.officialEmailAddress}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-200">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData("phoneNumber", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phoneNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legal Documents */}
      <div className="border-t border-gray-700 pt-6 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Legal Documents</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <FileUpload
              id="insuranceLicense"
              label="Insurance License"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              required={true}
              value={formData.insuranceLicense}
              onChange={(file) => updateFormData("insuranceLicense", file)}
              description="PDF, DOC, or image files up to 10MB"
            />
          </div>

          <div className="space-y-3">
            <FileUpload
              id="irdaiRegistration"
              label="IRDAI Registration"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              required={true}
              value={formData.irdaiRegistration}
              onChange={(file) => updateFormData("irdaiRegistration", file)}
              description="PDF, DOC, or image files up to 10MB"
            />
          </div>

          <div className="space-y-3">
            <FileUpload
              id="businessRegistration"
              label="Business Registration"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              required={true}
              value={formData.businessRegistration}
              onChange={(file) => updateFormData("businessRegistration", file)}
              description="PDF, DOC, or image files up to 10MB"
            />
          </div>

          <div className="space-y-3">
            <FileUpload
              id="taxRegistration"
              label="Tax Registration"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10}
              required={true}
              value={formData.taxRegistration}
              onChange={(file) => updateFormData("taxRegistration", file)}
              description="PDF, DOC, or image files up to 10MB"
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <FileUpload
              id="auditedFinancialStatements"
              label="Audited Financial Statements (Optional)"
              accept=".pdf,.doc,.docx"
              maxSize={15}
              value={formData.auditedFinancialStatements}
              onChange={(file) => updateFormData("auditedFinancialStatements", file)}
              description="PDF or DOC files up to 15MB"
            />
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="border-t border-gray-700 pt-6 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <MapPin className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Address Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="streetAddress" className="text-gray-200">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData("streetAddress", e.target.value)}
              placeholder="123 Business Street"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.streetAddress && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.streetAddress}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-200">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              placeholder="Mumbai"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.city && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.city}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-200">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData("state", e.target.value)}
              placeholder="Maharashtra"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.state && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.state}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-200">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData("postalCode", e.target.value)}
              placeholder="400001"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.postalCode && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.postalCode}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-200">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => updateFormData("country", e.target.value)}
              placeholder="India"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.country && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.country}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="border-t border-gray-700 pt-6 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Settings className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Account Security</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="Enter secure password"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.password && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-200">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Terms & Agreements */}
      <div className="border-t border-gray-700 pt-6 space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <CheckCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Terms & Agreements</h3>
        </div>

        {[ 
          { id: "acceptTerms", label: "I accept the Terms of Service", required: true },
          { id: "acceptPrivacy", label: "I accept the Privacy Policy", required: true },
          { id: "acceptBlockchain", label: "I accept the Blockchain Terms", required: true },
          { id: "marketingConsent", label: "I consent to receive marketing communications", required: false },
          { id: "dataProcessingConsent", label: "I consent to data processing (GDPR compliance)", required: true },
        ].map(({ id, label, required }) => (
          <div key={id} className="flex items-start space-x-3">
            <Checkbox
              id={id}
              checked={formData[id as keyof FormData] as boolean}
              onCheckedChange={(checked) => updateFormData(id as keyof FormData, checked)}
              className="mt-1 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor={id} className="text-gray-200 text-sm leading-relaxed cursor-pointer">
              {label} {required && <span className="text-red-400">*</span>}
            </Label>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderTechnicalSetup = () => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Technical Integration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="technicalContactPerson" className="text-gray-200">Technical Contact Person *</Label>
            <Input
              id="technicalContactPerson"
              value={formData.technicalContactPerson}
              onChange={(e) => updateFormData("technicalContactPerson", e.target.value)}
              placeholder="e.g., Tech Lead"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.technicalContactPerson && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.technicalContactPerson}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalEmail" className="text-gray-200">Technical Email *</Label>
            <Input
              id="technicalEmail"
              type="email"
              value={formData.technicalEmail}
              onChange={(e) => updateFormData("technicalEmail", e.target.value)}
              placeholder="tech@company.com"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.technicalEmail && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.technicalEmail}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredIntegrationMethod" className="text-gray-200">Preferred Integration Method *</Label>
            <Select value={formData.preferredIntegrationMethod} onValueChange={(value) => updateFormData("preferredIntegrationMethod", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select integration method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {integrationMethods.map(method => (
                  <SelectItem key={method} value={method} className="text-gray-100 hover:bg-gray-700">{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredIntegrationMethod && (
              <p className="text-red-400 text-sm">{errors.preferredIntegrationMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentClaimsManagementSystem" className="text-gray-200">Current Claims Management System</Label>
            <Input
              id="currentClaimsManagementSystem"
              value={formData.currentClaimsManagementSystem}
              onChange={(e) => updateFormData("currentClaimsManagementSystem", e.target.value)}
              placeholder="e.g., In-house / Third-party"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyVerificationVolume" className="text-gray-200">Monthly Verification Volume</Label>
            <Input
              id="monthlyVerificationVolume"
              value={formData.monthlyVerificationVolume}
              onChange={(e) => updateFormData("monthlyVerificationVolume", e.target.value)}
              placeholder="e.g., 5000"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Verification Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="autoApprovalThreshold" className="text-gray-200">Auto-approval Threshold (%) *</Label>
            <Input
              id="autoApprovalThreshold"
              value={formData.autoApprovalThreshold}
              onChange={(e) => updateFormData("autoApprovalThreshold", e.target.value)}
              placeholder="e.g., 80"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manualReviewThreshold" className="text-gray-200">Manual Review Threshold (%) *</Label>
            <Input
              id="manualReviewThreshold"
              value={formData.manualReviewThreshold}
              onChange={(e) => updateFormData("manualReviewThreshold", e.target.value)}
              placeholder="e.g., 50"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejectionThreshold" className="text-gray-200">Rejection Threshold (%) *</Label>
            <Input
              id="rejectionThreshold"
              value={formData.rejectionThreshold}
              onChange={(e) => updateFormData("rejectionThreshold", e.target.value)}
              placeholder="e.g., 30"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notificationPreferences" className="text-gray-200">Notification Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {notificationPreferences.map(pref => (
                <div key={pref} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                  <Checkbox
                    id={pref}
                    checked={formData.notificationPreferences.includes(pref)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("notificationPreferences", [...formData.notificationPreferences, pref]);
                      } else {
                        updateFormData("notificationPreferences", formData.notificationPreferences.filter(p => p !== pref));
                      }
                    }}
                    className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor={pref} className="text-sm text-gray-200 cursor-pointer">{pref}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">

      {/* Header */}
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Insurance Company Registration
        </h1>
        <p className="text-gray-400 text-base">
          Register your company on our blockchain-based insurance platform
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full">
        <Stepper steps={steps} currentStep={currentStep} className="justify-start" />
      </div>

      {/* Step Content */}
      <LoadingOverlay isLoading={isSubmitting} message={progressMessage}>
        <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 shadow-xl rounded-2xl w-full p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 0 && renderCompanyInformation()}
            {currentStep === 1 && renderTechnicalSetup()}
            {currentStep === 2 && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <WalletConnection
                  onWalletConnected={handleWalletConnected}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
                {submitError && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">{submitError}</AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LoadingOverlay>

      {/* Navigation */}
      {currentStep < 2 && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-800">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            className="w-full sm:w-auto px-6 py-3 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {currentStep === 1 ? "Connect Wallet" : "Next Step"}
          </Button>
        </div>
      )}
    </div>
  </div>
);

}