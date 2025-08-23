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

export interface ValidatorBasicInfoData {
  user_id: number;
  full_name: string;
  professional_title: string;
  license_number: string;
  years_of_experience: number;
  specialization: string;
  current_institution: string;
  professional_email: string;
  preferred_validation_types?: string;
  expected_validations_per_day?: number;
  availability_hours?: string;
}

export interface ValidatorWalletData {
  user_id: number;
  wallet_address: string;
  network?: string;
}

export interface ValidatorDocumentsFiles {
  professional_license_certificate: File;
  institution_id_letter: File;
  educational_qualification_certificate: File;
}

export class ValidatorService {
  private static apiUrl = API_BASE_URL;

  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const response = await fetch(`${this.apiUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const e = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`User creation failed: ${e.detail}`);
    }
    return await response.json();
  }

  static async createBasicInfo(data: ValidatorBasicInfoData): Promise<{ validator_id: number; message: string }> {
    const response = await fetch(`${this.apiUrl}/api/validator/basic-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const e = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Basic info failed: ${e.detail}`);
    }
    return await response.json();
  }

  static async uploadDocuments(validator_id: number, files: ValidatorDocumentsFiles): Promise<{ doc_id: number; validator_id: number; message: string }>{
    const formData = new FormData();
    formData.append('validator_id', String(validator_id));
    formData.append('professional_license_certificate', files.professional_license_certificate);
    formData.append('institution_id_letter', files.institution_id_letter);
    formData.append('educational_qualification_certificate', files.educational_qualification_certificate);

    const response = await fetch(`${this.apiUrl}/api/validator/documents`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const e = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Documents upload failed: ${e.detail}`);
    }
    return await response.json();
  }
}
