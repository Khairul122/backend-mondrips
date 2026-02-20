export interface User {
  id_user: number;
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: string;
  is_active: number;
  remember_token: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  password?: string;
  full_name?: string;
  role?: string;
  is_active?: number;
  remember_token?: string | null;
  last_login?: string;
}

export interface UserResponse {
  id_user: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}
