const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CreateUserResponse {
  user_id: number;
  wallet_address: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export class UserService {
  private static apiUrl = API_BASE_URL;

  static registerUser(payload: any) {
    return fetch(`${this.apiUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}
