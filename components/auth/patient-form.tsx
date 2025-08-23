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
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { FileUpload } from "@/components/ui/file-upload";
import { PatientService } from "@/services/patientService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  const [progressMessage, setProgressMessage] = useState("");
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [dobOpen, setDobOpen] = useState(false);

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
    setRegistrationError(null);
    setProgressMessage("Starting registration...");

    try {
      // Basic validations before API calls
      if (!formData.walletAddress) {
        setRegistrationError("Please connect your wallet before completing registration.");
        setIsSubmitting(false);
        return;
      }
      if (!formData.idDocument) {
        setRegistrationError("Please upload your government ID document.");
        setIsSubmitting(false);
        return;
      }

      // Prepare payloads mapped to backend fields
      const payload = {
        wallet_address: formData.walletAddress,
        first_name: formData.firstName,
        last_name: formData.lastName,
        dob: formData.dateOfBirth, // already in YYYY-MM-DD
        gender: formData.gender,
        blood_group: formData.bloodGroup || undefined,
        marital_status: formData.maritalStatus || undefined,
        email: formData.emailAddress,
        phone_number: formData.phoneNumber,
        alt_phone_number: formData.alternativePhone || undefined,
        gov_id_type: formData.governmentIdType,
        gov_id_number: formData.idNumber,
        gov_id_document: formData.idDocument as File,
        insurance_provider: formData.currentInsuranceProvider || undefined,
        policy_number: formData.policyNumber || undefined,
        coverage_type: formData.coverageType || undefined,
        privacy_preferences: formData.privacyPreferences || undefined,
      };

      const result = await PatientService.completeRegistration(
        payload,
        (msg: string) => setProgressMessage(msg)
      );

      console.log("Patient registration successful:", result);
      setProgressMessage("Registration completed successfully!");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error: any) {
      console.error("Patient registration failed:", error);
      setRegistrationError(error?.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const renderPersonalInformation = () => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Basic Details Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <User className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Basic Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-200">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="John"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.firstName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-200">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Doe"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.lastName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.lastName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-gray-200">Date of Birth *</Label>
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className={`
                    relative w-full h-10 rounded-md pl-3 pr-10
                    flex items-center text-left font-normal cursor-pointer
                    bg-gray-800/50 border 
                    ${errors.dateOfBirth ? "border-red-500 focus-visible:border-red-500" : "border-gray-600 focus-visible:border-blue-400"}
                    ${formData.dateOfBirth ? "text-gray-100" : "text-gray-400"}
                    hover:bg-gray-800/60 hover:border-gray-500
                    focus-visible:outline-none 
                    data-[state=open]:border-blue-400 data-[state=open]:bg-gray-800/60
                    transition-colors
                  `}
                >
                  <span className="truncate">
                    {formData.dateOfBirth
                      ? new Date(formData.dateOfBirth).toLocaleDateString()
                      : "Select date"}
                  </span>
                  <Calendar className="h-4 w-4 text-gray-400 absolute right-3" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 rounded-md shadow-lg" align="start">
                <CalendarComponent
                  className="text-gray-100"
                  classNames={{
                    caption_label: "flex items-center gap-2 text-gray-200 font-medium",
                    weekdays: "grid grid-cols-7 w-full",
                    weekday: "text-gray-300 font-medium text-[0.8rem] text-center",
                    button_previous: "text-gray-100 hover:text-white",
                    button_next: "text-gray-100 hover:text-white",

                    // 👇 NEW: month/year dropdown styling
                    dropdowns: "flex items-center gap-2 justify-center",
                    dropdown_root: "relative border border-gray-600 rounded-md bg-gray-800 text-gray-100 hover:border-gray-500 focus:ring-2 focus:ring-blue-400 transition",
                    dropdown: "absolute inset-0 opacity-0 cursor-pointer", // underlying <select>
                    //caption_label: "flex items-center gap-2 text-gray-200 font-medium", // when dropdown is rendered, label turns into container
                  }}
                  mode="single"
                  captionLayout="dropdown"   // ✅ month & year dropdown
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                  onSelect={(d) => {
                    updateFormData(
                      "dateOfBirth",
                      d
                        ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    );
                    if (d) {
                      setDobOpen(false);
                    }
                  }}
                  disabled={{ after: new Date() }}
                  initialFocus
                />


              </PopoverContent>
            </Popover>
            {errors.dateOfBirth && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-200">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {genders.map(gender => (
                  <SelectItem key={gender} value={gender} className="text-gray-100 hover:bg-gray-700">{gender}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gender}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="text-gray-200">Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group} className="text-gray-100 hover:bg-gray-700">{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus" className="text-gray-200">Marital Status</Label>
            <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData("maritalStatus", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {maritalStatuses.map(status => (
                  <SelectItem key={status} value={status} className="text-gray-100 hover:bg-gray-700">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Mail className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Contact Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="emailAddress" className="text-gray-200">Email Address *</Label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) => updateFormData("emailAddress", e.target.value)}
              placeholder="john.doe@example.com"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.emailAddress && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emailAddress}
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

          <div className="space-y-2">
            <Label htmlFor="alternativePhone" className="text-gray-200">Alternative Phone Number</Label>
            <Input
              id="alternativePhone"
              type="tel"
              value={formData.alternativePhone}
              onChange={(e) => updateFormData("alternativePhone", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Address Details Section */}
      <div className="space-y-8">
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
              placeholder="123 Main Street, Apt 4B"
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
              placeholder="New York"
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
            <Label htmlFor="state" className="text-gray-200">State/Province *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData("state", e.target.value)}
              placeholder="NY"
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
              placeholder="10001"
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
              placeholder="United States"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.country && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.country}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isPermanentSame"
                checked={formData.isPermanentSame}
                onCheckedChange={(checked) => updateFormData("isPermanentSame", checked)}
                className="mt-1 border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="isPermanentSame" className="text-gray-200 text-sm leading-relaxed cursor-pointer">
                Permanent address is same as current address
              </Label>
            </div>
          </div>

          {!formData.isPermanentSame && (
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="permanentAddress" className="text-gray-200">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => updateFormData("permanentAddress", e.target.value)}
                placeholder="Enter your permanent address if different from current address"
                className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Phone className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Emergency Contact</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName" className="text-gray-200">Emergency Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
              placeholder="Jane Doe"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.emergencyContactName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergencyContactName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyRelationship" className="text-gray-200">Relationship *</Label>
            <Select value={formData.emergencyRelationship} onValueChange={(value) => updateFormData("emergencyRelationship", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {emergencyRelationships.map(relationship => (
                  <SelectItem key={relationship} value={relationship} className="text-gray-100 hover:bg-gray-700">{relationship}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emergencyRelationship && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergencyRelationship}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhoneNumber" className="text-gray-200">Emergency Phone Number *</Label>
            <Input
              id="emergencyPhoneNumber"
              type="tel"
              value={formData.emergencyPhoneNumber}
              onChange={(e) => updateFormData("emergencyPhoneNumber", e.target.value)}
              placeholder="+1234567890"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.emergencyPhoneNumber && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.emergencyPhoneNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyEmailAddress" className="text-gray-200">Emergency Email Address</Label>
            <Input
              id="emergencyEmailAddress"
              type="email"
              value={formData.emergencyEmailAddress}
              onChange={(e) => updateFormData("emergencyEmailAddress", e.target.value)}
              placeholder="emergency@example.com"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Identity Verification Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Identity Verification</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="governmentIdType" className="text-gray-200">Government ID Type *</Label>
            <Select value={formData.governmentIdType} onValueChange={(value) => updateFormData("governmentIdType", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {governmentIdTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-gray-100 hover:bg-gray-700">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.governmentIdType && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.governmentIdType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-gray-200">ID Number *</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => updateFormData("idNumber", e.target.value)}
              placeholder="Enter your ID number"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
            {errors.idNumber && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.idNumber}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <FileUpload
              id="idDocument"
              label="ID Document Upload"
              required={true}
              accept=".pdf,.jpg,.jpeg,.png"
              value={formData.idDocument}
              onChange={(file) => updateFormData("idDocument", file)}
              description="PDF, JPG, PNG up to 5MB"
            />
            {errors.idDocument && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.idDocument as any}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Shield className="h-5 w-5 text-blue-400" />
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

  const renderMedicalAndPrivacy = () => (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Medical Information Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Heart className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Medical Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="currentInsuranceProvider" className="text-gray-200">Current Insurance Provider</Label>
            <Input
              id="currentInsuranceProvider"
              value={formData.currentInsuranceProvider}
              onChange={(e) => updateFormData("currentInsuranceProvider", e.target.value)}
              placeholder="e.g., Blue Cross Blue Shield"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber" className="text-gray-200">Policy Number</Label>
            <Input
              id="policyNumber"
              value={formData.policyNumber}
              onChange={(e) => updateFormData("policyNumber", e.target.value)}
              placeholder="Enter your policy number"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverageType" className="text-gray-200">Coverage Type</Label>
            <Input
              id="coverageType"
              value={formData.coverageType}
              onChange={(e) => updateFormData("coverageType", e.target.value)}
              placeholder="e.g., Individual, Family, Group"
              className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Privacy Preferences Section */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-100">Privacy Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privacyPreferences" className="text-gray-200">Who can access your reports? *</Label>
            <Select value={formData.privacyPreferences} onValueChange={(value) => updateFormData("privacyPreferences", value)}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-blue-400 text-gray-100">
                <SelectValue placeholder="Select privacy preference" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {privacyPreferences.map(preference => (
                  <SelectItem key={preference} value={preference} className="text-gray-100 hover:bg-gray-700">{preference}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.privacyPreferences && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.privacyPreferences}
              </p>
            )}
          </div>

          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              Your privacy preferences can be changed at any time in your account settings. Your medical data is always encrypted and secured on the blockchain.
            </AlertDescription>
          </Alert>
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
            Patient Registration
          </h1>
          <p className="text-gray-400 text-base">
            Register securely on our blockchain-based medical platform
          </p>
        </div>

        {/* Stepper */}
        <div className="w-full">
          <Stepper steps={steps} currentStep={currentStep} className="justify-start" />
        </div>

        {/* Step Content */}
        <LoadingOverlay isLoading={isSubmitting} message={progressMessage}>
          <Card className="bg-gray-900/40 backdrop-blur-lg border border-gray-800 shadow-xl rounded-2xl w-full">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {currentStep === 0 && renderPersonalInformation()}
                {currentStep === 1 && renderMedicalAndPrivacy()}
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
                    {registrationError && (
                      <p className="mt-4 text-sm text-red-400">{registrationError}</p>
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