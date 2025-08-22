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
import { validateField, validatePassword, validateConfirmPassword } from "@/lib/validation";
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
    setIsSubmitting(true);
    console.log("Form data:", formData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    window.location.href = "/dashboard";
  };

  const renderCompanyInformation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => updateFormData("companyName", e.target.value)}
            placeholder="e.g., ABC Insurance Co."
            className="bg-gray-800 border-gray-700"
          />
          {errors.companyName && (
            <p className="text-red-400 text-sm">{errors.companyName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyType">Company Type *</Label>
          <Select value={formData.companyType} onValueChange={(value) => updateFormData("companyType", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select company type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {companyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyType && (
            <p className="text-red-400 text-sm">{errors.companyType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceLicenseNumber">Insurance License Number *</Label>
          <Input
            id="insuranceLicenseNumber"
            value={formData.insuranceLicenseNumber}
            onChange={(e) => updateFormData("insuranceLicenseNumber", e.target.value)}
            placeholder="e.g., INS123456"
            className="bg-gray-800 border-gray-700"
          />
          {errors.insuranceLicenseNumber && (
            <p className="text-red-400 text-sm">{errors.insuranceLicenseNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="irdaiRegistrationNumber">IRDAI Registration Number *</Label>
          <Input
            id="irdaiRegistrationNumber"
            value={formData.irdaiRegistrationNumber}
            onChange={(e) => updateFormData("irdaiRegistrationNumber", e.target.value)}
            placeholder="e.g., IRDAI123456"
            className="bg-gray-800 border-gray-700"
          />
          {errors.irdaiRegistrationNumber && (
            <p className="text-red-400 text-sm">{errors.irdaiRegistrationNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear">Established Year *</Label>
          <Input
            id="establishedYear"
            value={formData.establishedYear}
            onChange={(e) => updateFormData("establishedYear", e.target.value)}
            placeholder="e.g., 2010"
            className="bg-gray-800 border-gray-700"
          />
          {errors.establishedYear && (
            <p className="text-red-400 text-sm">{errors.establishedYear}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite">Company Website *</Label>
          <Input
            id="companyWebsite"
            value={formData.companyWebsite}
            onChange={(e) => updateFormData("companyWebsite", e.target.value)}
            placeholder="https://example.com"
            className="bg-gray-800 border-gray-700"
          />
          {errors.companyWebsite && (
            <p className="text-red-400 text-sm">{errors.companyWebsite}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyLogo">Company Logo</Label>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
          </Button>
          <span className="text-sm text-gray-400">PNG, JPG up to 5MB</span>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="annualPremiumCollection">Annual Premium Collection</Label>
            <Input
              id="annualPremiumCollection"
              value={formData.annualPremiumCollection}
              onChange={(e) => updateFormData("annualPremiumCollection", e.target.value)}
              placeholder="e.g., $1,000,000"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfActivePolicies">Number of Active Policies</Label>
            <Input
              id="numberOfActivePolicies"
              value={formData.numberOfActivePolicies}
              onChange={(e) => updateFormData("numberOfActivePolicies", e.target.value)}
              placeholder="e.g., 10,000"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageAreas">Coverage Areas</Label>
            <Input
              id="coverageAreas"
              value={formData.coverageAreas}
              onChange={(e) => updateFormData("coverageAreas", e.target.value)}
              placeholder="e.g., Maharashtra, Karnataka, Tamil Nadu"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => updateFormData("specialization", e.target.value)}
              placeholder="e.g., Individual, Corporate, Both"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimSettlementRatio">Claim Settlement Ratio (%)</Label>
            <Input
              id="claimSettlementRatio"
              value={formData.claimSettlementRatio}
              onChange={(e) => updateFormData("claimSettlementRatio", e.target.value)}
              placeholder="e.g., 95.5"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="primaryContactPerson">Primary Contact Person *</Label>
            <Input
              id="primaryContactPerson"
              value={formData.primaryContactPerson}
              onChange={(e) => updateFormData("primaryContactPerson", e.target.value)}
              placeholder="e.g., John Smith"
              className="bg-gray-800 border-gray-700"
            />
            {errors.primaryContactPerson && (
              <p className="text-red-400 text-sm">{errors.primaryContactPerson}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Select value={formData.designation} onValueChange={(value) => updateFormData("designation", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {designations.map(designation => (
                  <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designation && (
              <p className="text-red-400 text-sm">{errors.designation}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-400 text-sm">{errors.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="officialEmailAddress">Official Email Address *</Label>
            <Input
              id="officialEmailAddress"
              type="email"
              value={formData.officialEmailAddress}
              onChange={(e) => updateFormData("officialEmailAddress", e.target.value)}
              placeholder="contact@company.com"
              className="bg-gray-800 border-gray-700"
            />
            {errors.officialEmailAddress && (
              <p className="text-red-400 text-sm">{errors.officialEmailAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData("phoneNumber", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800 border-gray-700"
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimsDepartmentEmail">Claims Department Email</Label>
            <Input
              id="claimsDepartmentEmail"
              type="email"
              value={formData.claimsDepartmentEmail}
              onChange={(e) => updateFormData("claimsDepartmentEmail", e.target.value)}
              placeholder="claims@company.com"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimsDepartmentPhone">Claims Department Phone</Label>
            <Input
              id="claimsDepartmentPhone"
              value={formData.claimsDepartmentPhone}
              onChange={(e) => updateFormData("claimsDepartmentPhone", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Address Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="headOfficeAddress">Head Office Address *</Label>
            <Input
              id="headOfficeAddress"
              value={formData.headOfficeAddress}
              onChange={(e) => updateFormData("headOfficeAddress", e.target.value)}
              placeholder="123 Insurance Plaza"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData("streetAddress", e.target.value)}
              placeholder="123 Insurance Plaza, Floor 5"
              className="bg-gray-800 border-gray-700"
            />
            {errors.streetAddress && (
              <p className="text-red-400 text-sm">{errors.streetAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              placeholder="Mumbai"
              className="bg-gray-800 border-gray-700"
            />
            {errors.city && (
              <p className="text-red-400 text-sm">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData("state", e.target.value)}
              placeholder="Maharashtra"
              className="bg-gray-800 border-gray-700"
            />
            {errors.state && (
              <p className="text-red-400 text-sm">{errors.state}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateFormData("postalCode", e.target.value)}
              placeholder="400001"
              className="bg-gray-800 border-gray-700"
            />
            {errors.postalCode && (
              <p className="text-red-400 text-sm">{errors.postalCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => updateFormData("country", e.target.value)}
              placeholder="India"
              className="bg-gray-800 border-gray-700"
            />
            {errors.country && (
              <p className="text-red-400 text-sm">{errors.country}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="regionalOfficeAddresses">Regional Office Addresses</Label>
            <Textarea
              id="regionalOfficeAddresses"
              value={formData.regionalOfficeAddresses}
              onChange={(e) => updateFormData("regionalOfficeAddresses", e.target.value)}
              placeholder="List your regional office addresses..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Legal Documents
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Insurance License Certificate *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>

          <div className="space-y-2">
            <Label>IRDAI Registration Certificate *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Business Registration Document *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Tax Registration Certificate *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Audited Financial Statements *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">Account Security</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="********"
              className="bg-gray-800 border-gray-700"
            />
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData("confirmPassword", e.target.value)}
              placeholder="********"
              className="bg-gray-800 border-gray-700"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">Terms & Agreements</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateFormData("acceptTerms", checked)}
            />
            <Label htmlFor="acceptTerms">I accept the Terms of Service *</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptPrivacy"
              checked={formData.acceptPrivacy}
              onCheckedChange={(checked) => updateFormData("acceptPrivacy", checked)}
            />
            <Label htmlFor="acceptPrivacy">I accept the Privacy Policy *</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptBlockchain"
              checked={formData.acceptBlockchain}
              onCheckedChange={(checked) => updateFormData("acceptBlockchain", checked)}
            />
            <Label htmlFor="acceptBlockchain">I accept the Blockchain Terms *</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingConsent"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => updateFormData("marketingConsent", checked)}
            />
            <Label htmlFor="marketingConsent">I consent to receive marketing communications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dataProcessingConsent"
              checked={formData.dataProcessingConsent}
              onCheckedChange={(checked) => updateFormData("dataProcessingConsent", checked)}
            />
            <Label htmlFor="dataProcessingConsent">I consent to data processing (GDPR compliance) *</Label>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTechnicalSetup = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
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
            <Label htmlFor="technicalContactPerson">Technical Contact Person *</Label>
            <Input
              id="technicalContactPerson"
              value={formData.technicalContactPerson}
              onChange={(e) => updateFormData("technicalContactPerson", e.target.value)}
              placeholder="e.g., Tech Lead"
              className="bg-gray-800 border-gray-700"
            />
            {errors.technicalContactPerson && (
              <p className="text-red-400 text-sm">{errors.technicalContactPerson}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalEmail">Technical Email *</Label>
            <Input
              id="technicalEmail"
              type="email"
              value={formData.technicalEmail}
              onChange={(e) => updateFormData("technicalEmail", e.target.value)}
              placeholder="tech@company.com"
              className="bg-gray-800 border-gray-700"
            />
            {errors.technicalEmail && (
              <p className="text-red-400 text-sm">{errors.technicalEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredIntegrationMethod">Preferred Integration Method *</Label>
            <Select value={formData.preferredIntegrationMethod} onValueChange={(value) => updateFormData("preferredIntegrationMethod", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select integration method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {integrationMethods.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredIntegrationMethod && (
              <p className="text-red-400 text-sm">{errors.preferredIntegrationMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentClaimsManagementSystem">Current Claims Management System</Label>
            <Input
              id="currentClaimsManagementSystem"
              value={formData.currentClaimsManagementSystem}
              onChange={(e) => updateFormData("currentClaimsManagementSystem", e.target.value)}
              placeholder="e.g., Custom System v2.1"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyVerificationVolume">Monthly Verification Volume</Label>
            <Input
              id="monthlyVerificationVolume"
              value={formData.monthlyVerificationVolume}
              onChange={(e) => updateFormData("monthlyVerificationVolume", e.target.value)}
              placeholder="e.g., 1000"
              className="bg-gray-800 border-gray-700"
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
            <Label htmlFor="autoApprovalThreshold">Auto-approval Threshold *</Label>
            <Input
              id="autoApprovalThreshold"
              value={formData.autoApprovalThreshold}
              onChange={(e) => updateFormData("autoApprovalThreshold", e.target.value)}
              placeholder="e.g., 90"
              className="bg-gray-800 border-gray-700"
            />
            {errors.autoApprovalThreshold && (
              <p className="text-red-400 text-sm">{errors.autoApprovalThreshold}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manualReviewThreshold">Manual Review Threshold *</Label>
            <Input
              id="manualReviewThreshold"
              value={formData.manualReviewThreshold}
              onChange={(e) => updateFormData("manualReviewThreshold", e.target.value)}
              placeholder="e.g., 70-89"
              className="bg-gray-800 border-gray-700"
            />
            {errors.manualReviewThreshold && (
              <p className="text-red-400 text-sm">{errors.manualReviewThreshold}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejectionThreshold">Rejection Threshold *</Label>
            <Input
              id="rejectionThreshold"
              value={formData.rejectionThreshold}
              onChange={(e) => updateFormData("rejectionThreshold", e.target.value)}
              placeholder="e.g., 0-69"
              className="bg-gray-800 border-gray-700"
            />
            {errors.rejectionThreshold && (
              <p className="text-red-400 text-sm">{errors.rejectionThreshold}</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label>Notification Preferences</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {notificationPreferences.map(preference => (
              <div key={preference} className="flex items-center space-x-2">
                <Checkbox
                  id={preference}
                  checked={formData.notificationPreferences.includes(preference)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("notificationPreferences", [...formData.notificationPreferences, preference]);
                    } else {
                      updateFormData("notificationPreferences", formData.notificationPreferences.filter(p => p !== preference));
                    }
                  }}
                />
                <Label htmlFor={preference} className="text-sm">{preference}</Label>
              </div>
            ))}
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
      <div className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 shadow-xl rounded-2xl w-full p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 0 && renderCompanyInformation()}
          {currentStep === 1 && renderTechnicalSetup()}
          {currentStep === 2 && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WalletConnection
                onWalletConnected={handleWalletConnected}
                onBack={handleBack}
                onComplete={handleComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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