import { config } from "@/lib/config";

const API_BASE_URL = config.apiBaseUrl;

// User creation interfaces
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

// Patient basic info
export interface PatientBasicInfoData {
  user_id: number;
  first_name: string;
  last_name: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  blood_group?: string;
  marital_status?: string;
  email: string;
  phone_number: string;
  alt_phone_number?: string;
}

export interface PatientBasicInfoResponse {
  patient_id: number;
  user_id: number;
  message: string;
}

// Patient identity & insurance (with file upload)
export interface PatientIdentityInsuranceData {
  patient_id: number;
  gov_id_type: string;
  gov_id_number: string;
  gov_id_document: File; // file to upload
  insurance_provider?: string;
  policy_number?: string;
  coverage_type?: string;
  privacy_preferences?: string; // JSON/text
}

export interface PatientIdentityInsuranceResponse {
  pii_id: number;
  patient_id: number;
  message: string;
}

export class PatientService {
  private static apiUrl = API_BASE_URL;

  // Step 1: Create user
  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const response = await fetch(`${this.apiUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`User creation failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Step 2: Create patient basic info
  static async createBasicInfo(data: PatientBasicInfoData): Promise<PatientBasicInfoResponse> {
    const response = await fetch(`${this.apiUrl}/api/patient/basic-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Patient basic info creation failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Step 3: Create identity & insurance (multipart for file upload)
  static async createIdentityInsurance(data: PatientIdentityInsuranceData): Promise<PatientIdentityInsuranceResponse> {
    const formData = new FormData();
    formData.append('patient_id', data.patient_id.toString());
    formData.append('gov_id_type', data.gov_id_type);
    formData.append('gov_id_number', data.gov_id_number);
    formData.append('gov_id_document', data.gov_id_document);
    if (data.insurance_provider) formData.append('insurance_provider', data.insurance_provider);
    if (data.policy_number) formData.append('policy_number', data.policy_number);
    if (data.coverage_type) formData.append('coverage_type', data.coverage_type);
    if (data.privacy_preferences) formData.append('privacy_preferences', data.privacy_preferences);

    const response = await fetch(`${this.apiUrl}/api/patient/identity-insurance`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Identity/insurance creation failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Complete registration flow for patient
  static async completeRegistration(
    data: {
      wallet_address: string;
      password: string;
      // basic info
      first_name: string;
      last_name: string;
      dob: string; // YYYY-MM-DD
      gender: string;
      blood_group?: string;
      marital_status?: string;
      email: string;
      phone_number: string;
      alt_phone_number?: string;
      // identity/insurance
      gov_id_type: string;
      gov_id_number: string;
      gov_id_document: File;
      insurance_provider?: string;
      policy_number?: string;
      coverage_type?: string;
      privacy_preferences?: string;
    },
    onProgress?: (step: string) => void
  ): Promise<{ user_id: number; patient_id: number; message: string }> {
    try {
      // Step 1: Create user
      onProgress?.('Creating user account...');
      const userResponse = await this.createUser({
        wallet_address: data.wallet_address,
        role: 'patient',
        password: data.password,
      });

      // Step 2: Create patient basic info
      onProgress?.('Saving patient basic information...');
      const basicInfoResponse = await this.createBasicInfo({
        user_id: userResponse.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob,
        gender: data.gender,
        blood_group: data.blood_group,
        marital_status: data.marital_status,
        email: data.email,
        phone_number: data.phone_number,
        alt_phone_number: data.alt_phone_number,
      });

      // Step 3: Create identity & insurance
      onProgress?.('Saving identity and insurance details...');
      await this.createIdentityInsurance({
        patient_id: basicInfoResponse.patient_id,
        gov_id_type: data.gov_id_type,
        gov_id_number: data.gov_id_number,
        gov_id_document: data.gov_id_document,
        insurance_provider: data.insurance_provider,
        policy_number: data.policy_number,
        coverage_type: data.coverage_type,
        privacy_preferences: data.privacy_preferences,
      });

      onProgress?.('Registration completed!');

      return {
        user_id: userResponse.user_id,
        patient_id: basicInfoResponse.patient_id,
        message: 'Patient registration completed successfully',
      };
    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }
}
