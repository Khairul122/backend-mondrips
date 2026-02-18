export interface CollaborationSlider {
  id: number;
  id_user: number;
  title: string;
  image_path: string;
  description: string | null;
  link_url: string | null;
  display_order: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCollaborationSliderDTO {
  id_user: number;
  title: string;
  image_path: string;
  description?: string | null;
  link_url?: string | null;
  display_order?: number;
  is_active?: number;
}

export interface UpdateCollaborationSliderDTO {
  title?: string;
  image_path?: string;
  description?: string | null;
  link_url?: string | null;
  display_order?: number;
  is_active?: number;
}

export interface CollaborationSliderResponse {
  id: number;
  id_user: number;
  title: string;
  image_path: string;
  description: string | null;
  link_url: string | null;
  display_order: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}
