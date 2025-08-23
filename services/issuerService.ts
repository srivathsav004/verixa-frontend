const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// User creation interfaces
export interface CreateUserData {
  wallet_address: string;
  role: string;
}

export interface UserResponse {
  user_id: number;
  wallet_address: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Basic info interfaces
export interface IssuerBasicInfoData {
  user_id: number;
  organization_name: string;
  organization_type: string;
  license_number: string;
  registration_number: string;
  established_year?: number;
  website_url?: string;
  logo_url?: string;
  contact_person_name: string;
  designation: string;
  phone_number: string;
  alt_phone_number?: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark?: string;
}

export interface IssuerBasicInfoResponse {
  issuer_id: number;
  user_id: number;
  message: string;
}

// Documents interfaces
export interface IssuerDocumentsFiles {
  logo_file?: File;
  medical_license_certificate: File;
  business_registration_certificate: File;
  tax_registration_document: File;
  accreditation_certificates?: File;
}

export interface IssuerDocumentsResponse {
  issuer_id: number;
  message: string;
}

// Report formats interfaces
export interface IssuerReportFormatsData {
  issuer_id: number;
  report_templates: string;
  report_types?: string;
  standard_font?: string;
  standard_font_size?: number;
  logo_position?: string;
  header_format?: string;
  footer_format?: string;
  normal_ranges?: string;
  units_used?: string;
  reference_standards?: string;
}

export interface IssuerReportFormatsResponse {
  issuer_id: number;
  message: string;
}

// Combined registration data
export interface IssuerRegistrationData {
  // User data
  wallet_address: string;
  
  // Basic info
  organization_name: string;
  organization_type: string;
  license_number: string;
  registration_number: string;
  established_year?: number;
  website_url?: string;
  
  // Contact info
  contact_person_name: string;
  designation: string;
  phone_number: string;
  alt_phone_number?: string;
  
  // Address
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  landmark?: string;
  
  // Report formats
  report_templates: string;
  report_types?: string;
  standard_font?: string;
  standard_font_size?: number;
  logo_position?: string;
  header_format?: string;
  footer_format?: string;
  normal_ranges?: string;
  units_used?: string;
  reference_standards?: string;
}

export class IssuerService {
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

  // Step 2: Create basic info
  static async createBasicInfo(data: IssuerBasicInfoData): Promise<IssuerBasicInfoResponse> {
    const response = await fetch(`${this.apiUrl}/api/issuer/basic-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Basic info creation failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Step 3: Upload documents
  static async uploadDocuments(issuer_id: number, files: IssuerDocumentsFiles): Promise<IssuerDocumentsResponse> {
    const formData = new FormData();
    formData.append('issuer_id', issuer_id.toString());
    
    if (files.logo_file) {
      formData.append('logo_file', files.logo_file);
    }
    formData.append('medical_license_certificate', files.medical_license_certificate);
    formData.append('business_registration_certificate', files.business_registration_certificate);
    formData.append('tax_registration_document', files.tax_registration_document);
    if (files.accreditation_certificates) {
      formData.append('accreditation_certificates', files.accreditation_certificates);
    }

    const response = await fetch(`${this.apiUrl}/api/issuer/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Document upload failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Step 4: Create report formats
  static async createReportFormats(data: IssuerReportFormatsData): Promise<IssuerReportFormatsResponse> {
    const response = await fetch(`${this.apiUrl}/api/issuer/report-formats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`Report formats creation failed: ${errorData.detail}`);
    }

    return await response.json();
  }

  // Complete registration flow
  static async completeRegistration(
    data: IssuerRegistrationData, 
    files: IssuerDocumentsFiles,
    onProgress?: (step: string) => void
  ): Promise<{ user_id: number; issuer_id: number; message: string }> {
    try {
      // Step 1: Create user
      onProgress?.('Creating user account...');
      const userResponse = await this.createUser({
        wallet_address: data.wallet_address,
        role: 'issuer'
      });
      
      // Step 2: Create basic info
      onProgress?.('Creating basic information...');
      const basicInfoResponse = await this.createBasicInfo({
        user_id: userResponse.user_id,
        organization_name: data.organization_name,
        organization_type: data.organization_type,
        license_number: data.license_number,
        registration_number: data.registration_number,
        established_year: data.established_year,
        website_url: data.website_url,
        contact_person_name: data.contact_person_name,
        designation: data.designation,
        phone_number: data.phone_number,
        alt_phone_number: data.alt_phone_number,
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        landmark: data.landmark
      });
      
      // Step 3: Upload documents
      onProgress?.('Uploading documents...');
      await this.uploadDocuments(basicInfoResponse.issuer_id, files);
      
      // Step 4: Create report formats
      onProgress?.('Setting up report formats...');
      await this.createReportFormats({
        issuer_id: basicInfoResponse.issuer_id,
        report_templates: data.report_templates,
        report_types: data.report_types,
        standard_font: data.standard_font,
        standard_font_size: data.standard_font_size,
        logo_position: data.logo_position,
        header_format: data.header_format,
        footer_format: data.footer_format,
        normal_ranges: data.normal_ranges,
        units_used: data.units_used,
        reference_standards: data.reference_standards
      });
      
      onProgress?.('Registration completed!');
      
      return {
        user_id: userResponse.user_id,
        issuer_id: basicInfoResponse.issuer_id,
        message: 'Issuer registration completed successfully'
      };
      
    } catch (error) {
      console.error('Issuer registration error:', error);
      throw error;
    }
  }
}
