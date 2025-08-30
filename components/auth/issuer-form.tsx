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
import { validateField, validatePassword, validateConfirmPassword } from "@/lib/validation";
import { IssuerService, type IssuerDocumentsFiles } from "@/services/issuerService";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
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
  Calendar
} from "lucide-react";

interface FormData {
  // Basic Information
  organizationName: string;
  organizationType: string;
  licenseNumber: string;
  registrationNumber: string;
  establishedYear: string;
  websiteUrl: string;
  organizationLogo: File | null;

  // Contact Information
  contactPersonName: string;
  designation: string;
  emailAddress: string;
  phoneNumber: string;
  alternativePhone: string;

  // Address Details
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark: string;

  // Verification Documents
  medicalLicense: File | null;
  businessRegistration: File | null;
  taxRegistration: File | null;
  accreditationCertificates: File | null;

  // Technical Setup
  reportTemplates: File | null;
  reportTypes: string[];
  standardFont: string;
  standardFontSize: string;
  logoPosition: string;
  headerFormat: string;
  footerFormat: string;
  normalRanges: string;
  unitsUsed: string;
  referenceStandards: string;

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

const steps = ["Basic Information", "Technical Setup", "Wallet Connection"];

const organizationTypes = [
  "Hospital",
  "Diagnostic Lab", 
  "Clinic",
  "Pathology Lab"
];

const designations = [
  "Lab Director",
  "Medical Officer", 
  "Administrator",
  "Medical Superintendent",
  "CEO"
];

const reportTypes = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "ECG",
  "EEG",
  "Biopsy",
  "Urine Test",
  "Stool Test",
  "Other"
];

const fonts = ["Arial", "Times New Roman", "Calibri", "Helvetica", "Georgia"];
const fontSizes = ["10", "11", "12", "14", "16"];
const logoPositions = ["Top Left", "Top Center", "Top Right", "Bottom Left", "Bottom Center", "Bottom Right"];

export function IssuerForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    organizationType: "",
    licenseNumber: "",
    registrationNumber: "",
    establishedYear: "",
    websiteUrl: "",
    organizationLogo: null,
    contactPersonName: "",
    designation: "",
    emailAddress: "",
    phoneNumber: "",
    alternativePhone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    landmark: "",
    medicalLicense: null,
    businessRegistration: null,
    taxRegistration: null,
    accreditationCertificates: null,
    reportTemplates: null,
    reportTypes: [],
    standardFont: "",
    standardFontSize: "",
    logoPosition: "",
    headerFormat: "",
    footerFormat: "",
    normalRanges: "",
    unitsUsed: "",
    referenceStandards: "",
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
  const [progressMessage, setProgressMessage] = useState("");
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 0) {
      // Basic Information validation
      if (!formData.organizationName) newErrors.organizationName = "Organization name is required";
      if (!formData.organizationType) newErrors.organizationType = "Organization type is required";
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required";
      if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required";
      if (!formData.establishedYear) newErrors.establishedYear = "Established year is required";
      if (!formData.contactPersonName) newErrors.contactPersonName = "Contact person name is required";
      if (!formData.designation) newErrors.designation = "Designation is required";
      if (!formData.emailAddress) newErrors.emailAddress = "Email is required";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";

      // Validate email format
      if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        newErrors.emailAddress = "Please enter a valid email address";
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
      if (formData.websiteUrl && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.websiteUrl)) {
        newErrors.websiteUrl = "Please enter a valid website URL";
      }
    }

    if (step === 1) {
      // Technical Setup validation
      if (!formData.standardFont) newErrors.standardFont = "Standard font is required";
      if (!formData.standardFontSize) newErrors.standardFontSize = "Standard font size is required";
      if (!formData.logoPosition) newErrors.logoPosition = "Logo position is required";
      if (!formData.headerFormat) newErrors.headerFormat = "Header format description is required";
      if (!formData.footerFormat) newErrors.footerFormat = "Footer format description is required";
      if (!formData.normalRanges) newErrors.normalRanges = "Normal ranges for tests are required";
      if (!formData.unitsUsed) newErrors.unitsUsed = "Units used are required";
      if (!formData.referenceStandards) newErrors.referenceStandards = "Reference standards are required";
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
    setRegistrationError(null);
    setProgressMessage("Starting registration...");
    
    try {
      // Ensure required files are present before proceeding
      if (!formData.medicalLicense || !formData.businessRegistration || !formData.taxRegistration) {
        setRegistrationError('Please upload all required documents (Medical License, Business Registration, Tax Registration).');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the registration data
      const registrationData = {
        wallet_address: formData.walletAddress,
        password: formData.password,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        license_number: formData.licenseNumber,
        registration_number: formData.registrationNumber,
        established_year: parseInt(formData.establishedYear),
        website_url: formData.websiteUrl,
        contact_person_name: formData.contactPersonName,
        designation: formData.designation,
        phone_number: formData.phoneNumber,
        alt_phone_number: formData.alternativePhone,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        landmark: formData.landmark,
        // stringify arrays/files for backend string fields
        report_templates: JSON.stringify(
          [formData.reportTemplates?.name].filter(Boolean)
        ),
        report_types: JSON.stringify(formData.reportTypes || []),
        standard_font: formData.standardFont,
        standard_font_size: parseInt(formData.standardFontSize) || 12,
        logo_position: formData.logoPosition,
        header_format: formData.headerFormat,
        footer_format: formData.footerFormat,
        normal_ranges: formData.normalRanges,
        units_used: formData.unitsUsed,
        reference_standards: formData.referenceStandards
      };
      
      // Prepare the files with correct field names matching the service
      const files: IssuerDocumentsFiles = {
        // include optional only if present; required are asserted non-null above
        ...(formData.organizationLogo ? { logo_file: formData.organizationLogo } : {}),
        medical_license_certificate: formData.medicalLicense,
        business_registration_certificate: formData.businessRegistration,
        tax_registration_document: formData.taxRegistration,
        ...(formData.accreditationCertificates ? { accreditation_certificates: formData.accreditationCertificates } : {}),
      };
      
      // Call the complete registration service
      const result = await IssuerService.completeRegistration(
        registrationData,
        files,
        (message: string) => setProgressMessage(message)
      );
      
      console.log('Registration successful:', result);
      setProgressMessage("Registration completed successfully!");
      
      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setRegistrationError(
        error.message || 'Registration failed. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const renderBasicInformation = () => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Organization Details Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Building2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Organization Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="organizationName" className="text-gray-200">Organization Name *</Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => updateFormData("organizationName", e.target.value)}
              placeholder="e.g., Apollo Diagnostics"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.organizationName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.organizationName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationType" className="text-gray-200">Organization Type *</Label>
            <Select value={formData.organizationType} onValueChange={(value) => updateFormData("organizationType", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {organizationTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-gray-100 hover:bg-gray-700">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizationType && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.organizationType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber" className="text-gray-200">License Number *</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => updateFormData("licenseNumber", e.target.value)}
              placeholder="e.g., MED123456"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.licenseNumber && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.licenseNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber" className="text-gray-200">Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => updateFormData("registrationNumber", e.target.value)}
              placeholder="e.g., REG789012"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.registrationNumber && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.registrationNumber}
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
              type="number"
              min="1900"
              max={new Date().getFullYear()}
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
            <Label htmlFor="websiteUrl" className="text-gray-200">Website URL</Label>
            <Input
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => updateFormData("websiteUrl", e.target.value)}
              placeholder="https://example.com"
              type="url"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.websiteUrl && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.websiteUrl}
              </p>
            )}
          </div>
        </div>

        <FileUpload
          id="organizationLogo"
          label="Organization Logo"
          accept="image/*"
          value={formData.organizationLogo}
          onChange={(file) => updateFormData("organizationLogo", file)}
          maxSize={1}
          description="PNG, JPG up to 1MB"
        />

      </div>

      {/* Contact Information Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Verification Documents</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FileUpload
            id="medicalLicense"
            label="Medical License Certificate"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            value={formData.medicalLicense}
            onChange={(file) => updateFormData("medicalLicense", file)}
            maxSize={1}
            description="PDF, JPG, PNG up to 1MB"
          />
          <FileUpload
            id="businessRegistration"
            label="Business Registration Certificate"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            value={formData.businessRegistration}
            onChange={(file) => updateFormData("businessRegistration", file)}
            maxSize={1}
            description="PDF, JPG, PNG up to 1MB"
          />
          <FileUpload
            id="taxRegistration"
            label="Tax Registration Document"
            required={true}
            accept=".pdf,.jpg,.jpeg,.png"
            value={formData.taxRegistration}
            onChange={(file) => updateFormData("taxRegistration", file)}
            maxSize={1}
            description="PDF, JPG, PNG up to 1MB"
          />
          <FileUpload
            id="accreditationCertificates"
            label="Accreditation Certificates"
            required={false}
            accept=".pdf,.jpg,.jpeg,.png"
            value={formData.accreditationCertificates}
            onChange={(file) => updateFormData("accreditationCertificates", file)}
            maxSize={1}
            description="PDF, JPG, PNG up to 1MB"
          />
        </div>

      </div>

      {/* Account Security Section */}
      <div className="space-y-8">
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

      {/* Terms & Agreements Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <CheckCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Terms & Agreements</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { id: "acceptTerms", label: "I accept the Terms of Service", required: true },
            { id: "acceptPrivacy", label: "I accept the Privacy Policy", required: true },
            { id: "acceptBlockchain", label: "I accept the Blockchain Terms", required: true },
            { id: "marketingConsent", label: "I consent to receive marketing communications", required: false },
            { id: "dataProcessingConsent", label: "I consent to data processing (GDPR compliance)", required: true }
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
      {/* Report Templates Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Report Templates</h3>
        </div>
        
        <div className="space-y-8">
          <FileUpload
            id="reportTemplates"
            label="Upload Sample Report Templates"
            required={true}
            accept=".pdf"
            multiple={true}
            value={formData.reportTemplates}
            onChange={(file) => updateFormData("reportTemplates", file)}
            description="PDF format recommended"
          />

          <div className="space-y-3">
            <Label className="text-gray-200">Report Types Offered *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {reportTypes.map(type => (
                <div key={type} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                  <Checkbox
                    id={type}
                    checked={formData.reportTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("reportTypes", [...formData.reportTypes, type]);
                      } else {
                        updateFormData("reportTypes", formData.reportTypes.filter(t => t !== type));
                      }
                    }}
                    className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor={type} className="text-sm text-gray-200 cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Formatting Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Settings className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Report Formatting</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="standardFont" className="text-gray-200">Standard Font *</Label>
            <Select value={formData.standardFont} onValueChange={(value) => updateFormData("standardFont", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {fonts.map(font => (
                  <SelectItem key={font} value={font} className="text-gray-100 hover:bg-gray-700">{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.standardFont && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.standardFont}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="standardFontSize" className="text-gray-200">Standard Font Size *</Label>
            <Select value={formData.standardFontSize} onValueChange={(value) => updateFormData("standardFontSize", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {fontSizes.map(size => (
                  <SelectItem key={size} value={size} className="text-gray-100 hover:bg-gray-700">{size}pt</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.standardFontSize && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.standardFontSize}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoPosition" className="text-gray-200">Logo Position *</Label>
            <Select value={formData.logoPosition} onValueChange={(value) => updateFormData("logoPosition", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {logoPositions.map(position => (
                  <SelectItem key={position} value={position} className="text-gray-100 hover:bg-gray-700">{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.logoPosition && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.logoPosition}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="headerFormat" className="text-gray-200">Header Format Description *</Label>
            <Textarea
              id="headerFormat"
              value={formData.headerFormat}
              onChange={(e) => updateFormData("headerFormat", e.target.value)}
              placeholder="Describe your report header format, including logo placement, organization name, contact details..."
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400 resize-none"
              rows={4}
            />
            {errors.headerFormat && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.headerFormat}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerFormat" className="text-gray-200">Footer Format Description *</Label>
            <Textarea
              id="footerFormat"
              value={formData.footerFormat}
              onChange={(e) => updateFormData("footerFormat", e.target.value)}
              placeholder="Describe your report footer format, including disclaimers, contact information, signatures..."
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400 resize-none"
              rows={4}
            />
            {errors.footerFormat && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.footerFormat}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Value Ranges Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Settings className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Medical Value Ranges</h3>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="normalRanges" className="text-gray-200">Normal Ranges for Tests *</Label>
            <Textarea
              id="normalRanges"
              value={formData.normalRanges}
              onChange={(e) => updateFormData("normalRanges", e.target.value)}
              placeholder="Example:&#10;• Glucose: 70-100 mg/dL&#10;• Blood Pressure: 120/80 mmHg&#10;• Hemoglobin: 12-16 g/dL&#10;• White Blood Cells: 4,000-11,000/μL"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400 resize-none"
              rows={6}
            />
            {errors.normalRanges && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.normalRanges}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="unitsUsed" className="text-gray-200">Units Used *</Label>
              <Input
                id="unitsUsed"
                value={formData.unitsUsed}
                onChange={(e) => updateFormData("unitsUsed", e.target.value)}
                placeholder="e.g., mg/dL, mmol/L, g/dL, IU/L"
                className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
              />
              {errors.unitsUsed && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.unitsUsed}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceStandards" className="text-gray-200">Reference Standards *</Label>
              <Input
                id="referenceStandards"
                value={formData.referenceStandards}
                onChange={(e) => updateFormData("referenceStandards", e.target.value)}
                placeholder="e.g., WHO Guidelines, Local Medical Board Standards"
                className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
              />
              {errors.referenceStandards && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.referenceStandards}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative">
    {/* Loading Overlay */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">
      
      {/* Header */}
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Medical Issuer Registration
        </h1>
        <p className="text-gray-400 text-base">
          Join our blockchain-based medical certification platform
        </p>
      </div>

      {/* Stepper */}
      <div className="w-full">
        <Stepper steps={steps} currentStep={currentStep} className="justify-start" />
      </div>

      {/* Step Content */}
      <LoadingOverlay isLoading={isSubmitting} message={progressMessage} fullPage>
        <Card className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 shadow-xl rounded-2xl w-full">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === 0 && renderBasicInformation()}
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
                  
                  {/* Registration Error Display */}
                  {registrationError && (
                    <Alert className="mt-4 border-red-600 bg-red-900/20">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {registrationError}
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
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