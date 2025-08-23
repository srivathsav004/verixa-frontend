import { config } from "@/lib/config";

const API_BASE_URL = config.apiBaseUrl;

export interface CreateUserData {
  wallet_address: string;
  role: string;
  password: string;
}

export interface UserResponse {
  user_id: number;
  wallet_address: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceBasicInfoData {
  user_id: number;
  company_name: string;
  company_type: string;
  insurance_license_number: string;
  registration_number: string;
  established_year?: number;
  website_url?: string;
}

export interface InsuranceBasicInfoResponse {
  insurance_id: number;
  user_id: number;
  message: string;
}

export interface InsuranceBusinessInfoData {
  insurance_id: number;
  annual_premium_collection?: number;
  active_policies?: number;
  coverage_areas?: string; // JSON or CSV
  specialization?: string;
  claim_settlement_ratio?: number;
}

export interface InsuranceBusinessInfoResponse {
  business_id: number;
  insurance_id: number;
  message: string;
}

export interface InsuranceContactTechData {
  insurance_id: number;
  primary_contact_name: string;
  designation?: string;
  department?: string;
  official_email?: string;
  phone_number?: string;
  claims_email?: string;
  claims_phone?: string;
  head_office_address?: string;
  city?: string;
  state?: string;
  country?: string;
  regional_offices?: string;
  technical_contact_name?: string;
  technical_email?: string;
  integration_method?: string;
  claims_system?: string;
  monthly_verification_volume?: number;
  auto_approval_threshold?: number;
  manual_review_threshold?: number;
  rejection_threshold?: number;
  notification_preferences?: string; // JSON or CSV
  payment_method?: string;
  monthly_budget?: number;
}

export interface InsuranceContactTechResponse {
  contact_id: number;
  insurance_id: number;
  message: string;
}

export interface InsuranceDocumentsData {
  insurance_id: number;
  company_logo?: File | null;
  insurance_license: File;
  registration_certificate: File;
  business_registration_doc: File;
  tax_registration_doc: File;
  audited_financials?: File | null;
}

export interface InsuranceDocumentsResponse {
  insurance_id: number;
  message: string;
}

export class InsuranceService {
  private static apiUrl = API_BASE_URL;

  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const res = await fetch(`${this.apiUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`User creation failed: ${e.detail}`);
    }
    return res.json();
  }

  static async createBasicInfo(data: InsuranceBasicInfoData): Promise<InsuranceBasicInfoResponse> {
    const res = await fetch(`${this.apiUrl}/api/insurance/basic-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`Insurance basic info failed: ${e.detail}`);
    }
    return res.json();
  }

  static async createBusinessInfo(data: InsuranceBusinessInfoData): Promise<InsuranceBusinessInfoResponse> {
    const res = await fetch(`${this.apiUrl}/api/insurance/business-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`Insurance business info failed: ${e.detail}`);
    }
    return res.json();
  }

  static async createContactTech(data: InsuranceContactTechData): Promise<InsuranceContactTechResponse> {
    const res = await fetch(`${this.apiUrl}/api/insurance/contact-tech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`Insurance contact/tech failed: ${e.detail}`);
    }
    return res.json();
  }

  static async createDocuments(data: InsuranceDocumentsData): Promise<InsuranceDocumentsResponse> {
    const fd = new FormData();
    fd.append("insurance_id", data.insurance_id.toString());
    if (data.company_logo) fd.append("company_logo", data.company_logo);
    fd.append("insurance_license_certificate", data.insurance_license);
    fd.append("registration_certificate", data.registration_certificate);
    fd.append("business_registration_doc", data.business_registration_doc);
    fd.append("tax_registration_doc", data.tax_registration_doc);
    if (data.audited_financials) fd.append("audited_financials", data.audited_financials);

    const res = await fetch(`${this.apiUrl}/api/insurance/documents`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(`Insurance documents failed: ${e.detail}`);
    }
    return res.json();
  }

  static async completeRegistration(
    data: {
      // wallet
      wallet_address: string;
      password: string;
      // basic info
      company_name: string;
      company_type: string;
      insurance_license_number: string;
      registration_number: string;
      established_year?: number;
      website_url?: string;
      company_logo?: File | null;
      // business info
      annual_premium_collection?: number;
      active_policies?: number;
      coverage_areas?: string;
      specialization?: string;
      claim_settlement_ratio?: number;
      // contact & tech
      primary_contact_name: string;
      designation?: string;
      department?: string;
      official_email?: string;
      phone_number?: string;
      claims_email?: string;
      claims_phone?: string;
      head_office_address?: string;
      city?: string;
      state?: string;
      country?: string;
      regional_offices?: string;
      technical_contact_name?: string;
      technical_email?: string;
      integration_method?: string;
      claims_system?: string;
      monthly_verification_volume?: number;
      auto_approval_threshold?: number;
      manual_review_threshold?: number;
      rejection_threshold?: number;
      notification_preferences?: string;
      payment_method?: string;
      monthly_budget?: number;
      // docs
      insurance_license: File;
      registration_certificate: File;
      business_registration_doc: File;
      tax_registration_doc: File;
      audited_financials?: File | null;
    },
    onProgress?: (step: string) => void
  ): Promise<{ user_id: number; insurance_id: number; message: string }> {
    // 1. Create user (role insurance)
    onProgress?.("Creating user account...");
    const user = await this.createUser({ wallet_address: data.wallet_address, role: "insurance", password: data.password });

    // 2. Basic info
    onProgress?.("Saving insurance basic information...");
    const basic = await this.createBasicInfo({
      user_id: user.user_id,
      company_name: data.company_name,
      company_type: data.company_type,
      insurance_license_number: data.insurance_license_number,
      registration_number: data.registration_number,
      established_year: data.established_year,
      website_url: data.website_url,
    });

    // 3. Business info
    onProgress?.("Saving business information...");
    await this.createBusinessInfo({
      insurance_id: basic.insurance_id,
      annual_premium_collection: data.annual_premium_collection,
      active_policies: data.active_policies,
      coverage_areas: data.coverage_areas,
      specialization: data.specialization,
      claim_settlement_ratio: data.claim_settlement_ratio,
    });

    // 4. Contact & Tech
    onProgress?.("Saving contact and technical details...");
    await this.createContactTech({
      insurance_id: basic.insurance_id,
      primary_contact_name: data.primary_contact_name,
      designation: data.designation,
      department: data.department,
      official_email: data.official_email,
      phone_number: data.phone_number,
      claims_email: data.claims_email,
      claims_phone: data.claims_phone,
      head_office_address: data.head_office_address,
      city: data.city,
      state: data.state,
      country: data.country,
      regional_offices: data.regional_offices,
      technical_contact_name: data.technical_contact_name,
      technical_email: data.technical_email,
      integration_method: data.integration_method,
      claims_system: data.claims_system,
      monthly_verification_volume: data.monthly_verification_volume,
      auto_approval_threshold: data.auto_approval_threshold,
      manual_review_threshold: data.manual_review_threshold,
      rejection_threshold: data.rejection_threshold,
      notification_preferences: data.notification_preferences,
      payment_method: data.payment_method,
      monthly_budget: data.monthly_budget,
    });

    // 5. Documents
    onProgress?.("Uploading documents...");
    await this.createDocuments({
      insurance_id: basic.insurance_id,
      company_logo: data.company_logo ?? undefined,
      insurance_license: data.insurance_license,
      registration_certificate: data.registration_certificate,
      business_registration_doc: data.business_registration_doc,
      tax_registration_doc: data.tax_registration_doc,
      audited_financials: data.audited_financials ?? undefined,
    });

    onProgress?.("Registration completed!");
    return { user_id: user.user_id, insurance_id: basic.insurance_id, message: "Insurance registration completed successfully" };
  }
}
