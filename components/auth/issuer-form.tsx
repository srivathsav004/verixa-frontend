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
    // Here you would typically submit the form data to your backend
    console.log("Form data:", formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    // Redirect to success page or dashboard
    window.location.href = "/dashboard";
  };

  const renderBasicInformation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => updateFormData("organizationName", e.target.value)}
            placeholder="e.g., Apollo Diagnostics"
            className="bg-gray-800 border-gray-700"
          />
          {errors.organizationName && (
            <p className="text-red-400 text-sm">{errors.organizationName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Organization Type *</Label>
          <Select value={formData.organizationType} onValueChange={(value) => updateFormData("organizationType", value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {organizationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.organizationType && (
            <p className="text-red-400 text-sm">{errors.organizationType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => updateFormData("licenseNumber", e.target.value)}
            placeholder="e.g., MED123456"
            className="bg-gray-800 border-gray-700"
          />
          {errors.licenseNumber && (
            <p className="text-red-400 text-sm">{errors.licenseNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number *</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => updateFormData("registrationNumber", e.target.value)}
            placeholder="e.g., REG789012"
            className="bg-gray-800 border-gray-700"
          />
          {errors.registrationNumber && (
            <p className="text-red-400 text-sm">{errors.registrationNumber}</p>
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
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) => updateFormData("websiteUrl", e.target.value)}
            placeholder="https://example.com"
            className="bg-gray-800 border-gray-700"
          />
          {errors.websiteUrl && (
            <p className="text-red-400 text-sm">{errors.websiteUrl}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationLogo">Organization Logo</Label>
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
          <User className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactPersonName">Primary Contact Person Name *</Label>
            <Input
              id="contactPersonName"
              value={formData.contactPersonName}
              onChange={(e) => updateFormData("contactPersonName", e.target.value)}
              placeholder="e.g., Dr. John Smith"
              className="bg-gray-800 border-gray-700"
            />
            {errors.contactPersonName && (
              <p className="text-red-400 text-sm">{errors.contactPersonName}</p>
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
            <Label htmlFor="emailAddress">Email Address *</Label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) => updateFormData("emailAddress", e.target.value)}
              placeholder="contact@organization.com"
              className="bg-gray-800 border-gray-700"
            />
            {errors.emailAddress && (
              <p className="text-red-400 text-sm">{errors.emailAddress}</p>
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
            <Label htmlFor="alternativePhone">Alternative Phone Number</Label>
            <Input
              id="alternativePhone"
              value={formData.alternativePhone}
              onChange={(e) => updateFormData("alternativePhone", e.target.value)}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData("streetAddress", e.target.value)}
              placeholder="123 Medical Center Drive"
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
              placeholder="New York"
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
              placeholder="NY"
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
              placeholder="10001"
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
              placeholder="United States"
              className="bg-gray-800 border-gray-700"
            />
            {errors.country && (
              <p className="text-red-400 text-sm">{errors.country}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={formData.landmark}
              onChange={(e) => updateFormData("landmark", e.target.value)}
              placeholder="Near Central Park"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Verification Documents
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Medical License Certificate *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF/Image
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Business Registration Certificate *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF/Image
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Tax Registration Document *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF/Image
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Accreditation Certificates (Optional)</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF/Image
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">Account Security</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      className="space-y-6"
    >
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Report Templates
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Sample Report Templates *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF Templates
            </Button>
            <p className="text-sm text-gray-400">Upload sample reports in PDF format</p>
          </div>

          <div className="space-y-2">
            <Label>Report Types Offered *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reportTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
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
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Report Formatting
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="standardFont">Standard Font *</Label>
            <Select value={formData.standardFont} onValueChange={(value) => updateFormData("standardFont", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {fonts.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.standardFont && (
              <p className="text-red-400 text-sm">{errors.standardFont}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="standardFontSize">Standard Font Size *</Label>
            <Select value={formData.standardFontSize} onValueChange={(value) => updateFormData("standardFontSize", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {fontSizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.standardFontSize && (
              <p className="text-red-400 text-sm">{errors.standardFontSize}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoPosition">Logo Position on Reports *</Label>
            <Select value={formData.logoPosition} onValueChange={(value) => updateFormData("logoPosition", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select logo position" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {logoPositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.logoPosition && (
              <p className="text-red-400 text-sm">{errors.logoPosition}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="headerFormat">Header Format Description *</Label>
            <Textarea
              id="headerFormat"
              value={formData.headerFormat}
              onChange={(e) => updateFormData("headerFormat", e.target.value)}
              placeholder="Describe your report header format..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
            {errors.headerFormat && (
              <p className="text-red-400 text-sm">{errors.headerFormat}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="footerFormat">Footer Format Description *</Label>
            <Textarea
              id="footerFormat"
              value={formData.footerFormat}
              onChange={(e) => updateFormData("footerFormat", e.target.value)}
              placeholder="Describe your report footer format..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
            {errors.footerFormat && (
              <p className="text-red-400 text-sm">{errors.footerFormat}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Medical Value Ranges
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="normalRanges">Normal Ranges for Tests *</Label>
            <Textarea
              id="normalRanges"
              value={formData.normalRanges}
              onChange={(e) => updateFormData("normalRanges", e.target.value)}
              placeholder="Example: Glucose: 70-100 mg/dL, Blood Pressure: 120/80 mmHg, Hemoglobin: 12-16 g/dL"
              className="bg-gray-800 border-gray-700"
              rows={4}
            />
            {errors.normalRanges && (
              <p className="text-red-400 text-sm">{errors.normalRanges}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitsUsed">Units Used *</Label>
            <Input
              id="unitsUsed"
              value={formData.unitsUsed}
              onChange={(e) => updateFormData("unitsUsed", e.target.value)}
              placeholder="mg/dL, mmol/L, g/dL, etc."
              className="bg-gray-800 border-gray-700"
            />
            {errors.unitsUsed && (
              <p className="text-red-400 text-sm">{errors.unitsUsed}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceStandards">Reference Standards *</Label>
            <Input
              id="referenceStandards"
              value={formData.referenceStandards}
              onChange={(e) => updateFormData("referenceStandards", e.target.value)}
              placeholder="WHO/Local guidelines"
              className="bg-gray-800 border-gray-700"
            />
            {errors.referenceStandards && (
              <p className="text-red-400 text-sm">{errors.referenceStandards}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Medical Issuer Registration
          </CardTitle>
          <div className="mt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderBasicInformation()}
            {currentStep === 1 && renderTechnicalSetup()}
            {currentStep === 2 && (
              <WalletConnection
                onWalletConnected={handleWalletConnected}
                onBack={handleBack}
                onComplete={handleComplete}
              />
            )}
          </AnimatePresence>

          {currentStep < 2 && (
            <div className="flex justify-between pt-6">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === 1 ? "Connect Wallet" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
