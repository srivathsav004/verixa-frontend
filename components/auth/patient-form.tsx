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
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Heart,
  Calendar,
  FileText,
  Wallet,
  AlertCircle,
  CheckCircle,
  Upload
} from "lucide-react";

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;

  // Contact Information
  emailAddress: string;
  phoneNumber: string;
  alternativePhone: string;

  // Address Details
  currentAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  permanentAddress: string;
  isPermanentSame: boolean;

  // Emergency Contact
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhoneNumber: string;
  emergencyEmailAddress: string;

  // Identity Verification
  governmentIdType: string;
  idNumber: string;
  idDocument: File | null;

  // Medical Information
  currentInsuranceProvider: string;
  policyNumber: string;
  coverageType: string;

  // Privacy Preferences
  privacyPreferences: string;

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

const steps = ["Personal Information", "Medical & Privacy", "Wallet Connection"];

const genders = [
  "Male",
  "Female", 
  "Other",
  "Prefer not to say"
];

const bloodGroups = [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];

const maritalStatuses = [
  "Single",
  "Married",
  "Divorced",
  "Widowed"
];

const governmentIdTypes = [
  "Passport",
  "Driver's License",
  "National ID",
  "Aadhaar",
  "SSN",
  "Other"
];

const emergencyRelationships = [
  "Parent",
  "Spouse",
  "Sibling",
  "Friend",
  "Guardian",
  "Other"
];

const privacyPreferences = [
  "Only me",
  "Me and my doctors",
  "Me, doctors, and insurance",
  "Public (anonymous data only)"
];

const securityQuestions = [
  "What was your first pet's name?",
  "In which city were you born?",
  "What was your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was your childhood nickname?"
];

export function PatientForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    emailAddress: "",
    phoneNumber: "",
    alternativePhone: "",
    currentAddress: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    permanentAddress: "",
    isPermanentSame: true,
    emergencyContactName: "",
    emergencyRelationship: "",
    emergencyPhoneNumber: "",
    emergencyEmailAddress: "",
    governmentIdType: "",
    idNumber: "",
    idDocument: null,
    currentInsuranceProvider: "",
    policyNumber: "",
    coverageType: "",
    privacyPreferences: "",
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
      // Personal Information validation
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.emailAddress) newErrors.emailAddress = "Email is required";
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.emergencyContactName) newErrors.emergencyContactName = "Emergency contact name is required";
      if (!formData.emergencyRelationship) newErrors.emergencyRelationship = "Emergency relationship is required";
      if (!formData.emergencyPhoneNumber) newErrors.emergencyPhoneNumber = "Emergency phone number is required";
      if (!formData.governmentIdType) newErrors.governmentIdType = "Government ID type is required";
      if (!formData.idNumber) newErrors.idNumber = "ID number is required";
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

      // Validate phone numbers
      if (formData.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number with country code";
      }

      if (formData.emergencyPhoneNumber && !/^\+?[1-9]\d{1,14}$/.test(formData.emergencyPhoneNumber)) {
        newErrors.emergencyPhoneNumber = "Please enter a valid emergency phone number with country code";
      }

      // Validate date of birth (must be at least 13 years old)
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
          newErrors.dateOfBirth = "You must be at least 13 years old to register";
        }
      }
    }

    if (step === 1) {
      // Medical & Privacy validation
      if (!formData.privacyPreferences) newErrors.privacyPreferences = "Privacy preferences are required";
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

  const renderPersonalInformation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Basic Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="John"
              className="bg-gray-800 border-gray-700"
            />
            {errors.firstName && (
              <p className="text-red-400 text-sm">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Doe"
              className="bg-gray-800 border-gray-700"
            />
            {errors.lastName && (
              <p className="text-red-400 text-sm">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
            {errors.dateOfBirth && (
              <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {genders.map(gender => (
                  <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-400 text-sm">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData("maritalStatus", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {maritalStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address *</Label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) => updateFormData("emailAddress", e.target.value)}
              placeholder="john.doe@example.com"
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

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Address Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="currentAddress">Current Address *</Label>
            <Input
              id="currentAddress"
              value={formData.currentAddress}
              onChange={(e) => updateFormData("currentAddress", e.target.value)}
              placeholder="123 Main Street"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => updateFormData("streetAddress", e.target.value)}
              placeholder="123 Main Street, Apt 4B"
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

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPermanentSame"
                checked={formData.isPermanentSame}
                onCheckedChange={(checked) => updateFormData("isPermanentSame", checked)}
              />
              <Label htmlFor="isPermanentSame">Permanent address is same as current address</Label>
            </div>
          </div>

          {!formData.isPermanentSame && (
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => updateFormData("permanentAddress", e.target.value)}
                placeholder="Enter your permanent address if different from current address"
                className="bg-gray-800 border-gray-700"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
              placeholder="Jane Doe"
              className="bg-gray-800 border-gray-700"
            />
            {errors.emergencyContactName && (
              <p className="text-red-400 text-sm">{errors.emergencyContactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyRelationship">Relationship *</Label>
            <Select value={formData.emergencyRelationship} onValueChange={(value) => updateFormData("emergencyRelationship", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {emergencyRelationships.map(relationship => (
                  <SelectItem key={relationship} value={relationship}>{relationship}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emergencyRelationship && (
              <p className="text-red-400 text-sm">{errors.emergencyRelationship}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhoneNumber">Emergency Phone Number *</Label>
            <Input
              id="emergencyPhoneNumber"
              value={formData.emergencyPhoneNumber}
              onChange={(e) => updateFormData("emergencyPhoneNumber", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800 border-gray-700"
            />
            {errors.emergencyPhoneNumber && (
              <p className="text-red-400 text-sm">{errors.emergencyPhoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyEmailAddress">Emergency Email Address</Label>
            <Input
              id="emergencyEmailAddress"
              type="email"
              value={formData.emergencyEmailAddress}
              onChange={(e) => updateFormData("emergencyEmailAddress", e.target.value)}
              placeholder="emergency@example.com"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Identity Verification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="governmentIdType">Government ID Type *</Label>
            <Select value={formData.governmentIdType} onValueChange={(value) => updateFormData("governmentIdType", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {governmentIdTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.governmentIdType && (
              <p className="text-red-400 text-sm">{errors.governmentIdType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number *</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => updateFormData("idNumber", e.target.value)}
              placeholder="Enter your ID number"
              className="bg-gray-800 border-gray-700"
            />
            {errors.idNumber && (
              <p className="text-red-400 text-sm">{errors.idNumber}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>ID Document Upload *</Label>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Upload ID Document (PDF/Image)
            </Button>
            <p className="text-sm text-gray-400">Upload a clear copy of your government-issued ID</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 pb-6">
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

  const renderMedicalAndPrivacy = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Medical Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currentInsuranceProvider">Current Insurance Provider</Label>
            <Input
              id="currentInsuranceProvider"
              value={formData.currentInsuranceProvider}
              onChange={(e) => updateFormData("currentInsuranceProvider", e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              value={formData.policyNumber}
              onChange={(e) => updateFormData("policyNumber", e.target.value)}
              placeholder="Enter your policy number"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageType">Coverage Type</Label>
            <Input
              id="coverageType"
              value={formData.coverageType}
              onChange={(e) => updateFormData("coverageType", e.target.value)}
              placeholder="e.g., Individual, Family, Group"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Privacy Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privacyPreferences">Who can access your reports? *</Label>
            <Select value={formData.privacyPreferences} onValueChange={(value) => updateFormData("privacyPreferences", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select privacy preference" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {privacyPreferences.map(preference => (
                  <SelectItem key={preference} value={preference}>{preference}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.privacyPreferences && (
              <p className="text-red-400 text-sm">{errors.privacyPreferences}</p>
            )}
          </div>

          <Alert className="border-blue-500 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              Your privacy preferences can be changed at any time in your account settings.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Patient Registration
          </CardTitle>
          <div className="mt-6">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderPersonalInformation()}
            {currentStep === 1 && renderMedicalAndPrivacy()}
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
