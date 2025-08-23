import { config } from "@/lib/config";

const API_BASE_URL = config.apiBaseUrl;

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

  /**
   * Login with wallet address and password. Returns server JSON (expected to include role).
   */
  static async login(payload: { wallet_address: string; password: string }): Promise<any> {
    const res = await fetch(`${this.apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  }
}
