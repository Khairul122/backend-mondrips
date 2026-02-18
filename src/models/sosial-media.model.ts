export interface SosialMedia {
  id: number;
  id_user: number;
  nama_platform: string;
  username_path: string;
  icon_class: string | null;
  link_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSosialMediaDTO {
  id_user: number;
  nama_platform: string;
  username_path: string;
  icon_class?: string | null;
  link_url: string;
}

export interface UpdateSosialMediaDTO {
  nama_platform?: string;
  username_path?: string;
  icon_class?: string | null;
  link_url?: string;
}

export interface SosialMediaResponse {
  id: number;
  id_user: number;
  nama_platform: string;
  username_path: string;
  icon_class: string | null;
  link_url: string;
  created_at: Date;
  updated_at: Date;
}
