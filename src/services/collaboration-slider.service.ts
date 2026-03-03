import { CollaborationSliderRepository } from '../repositories/collaboration-slider.repository';
import { CollaborationSliderResponse, CreateCollaborationSliderDTO } from '../models/collaboration-slider.model';
import { D1Database } from '@cloudflare/workers-types';

export interface CreateCollaborationSliderInput {
  title: string;
  image_path: string;
  description?: string | null;
  link_url?: string | null;
  display_order?: number;
  is_active?: number;
}

export interface UpdateCollaborationSliderInput {
  title?: string;
  image_path?: string;
  description?: string | null;
  link_url?: string | null;
  display_order?: number;
  is_active?: number;
}

export class CollaborationSliderService {
  private collaborationSliderRepository: CollaborationSliderRepository;
  private bucket: R2Bucket;

  constructor(db: D1Database, bucket: R2Bucket) {
    this.collaborationSliderRepository = new CollaborationSliderRepository(db);
    this.bucket = bucket;
  }

  async create(userId: number, input: CreateCollaborationSliderInput): Promise<CollaborationSliderResponse> {
    const data: CreateCollaborationSliderDTO = {
      id_user: userId,
      title: input.title,
      image_path: input.image_path,
      description: input.description !== undefined ? input.description : null,
      link_url: input.link_url !== undefined ? input.link_url : null,
      display_order: input.display_order !== undefined ? input.display_order : 0,
      is_active: input.is_active !== undefined ? input.is_active : 1,
    };

    const id = await this.collaborationSliderRepository.create(data);

    const slider = await this.collaborationSliderRepository.findById(id);
    if (!slider) {
      throw new Error('Failed to create collaboration slider');
    }

    return this.toCollaborationSliderResponse(slider);
  }

  async findAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSliderResponse[]> {
    const sliderList = await this.collaborationSliderRepository.findAll(orderBy);
    return sliderList.map((item) => this.toCollaborationSliderResponse(item));
  }

  async findActiveAll(orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSliderResponse[]> {
    const sliderList = await this.collaborationSliderRepository.findActiveAll(orderBy);
    return sliderList.map((item) => this.toCollaborationSliderResponse(item));
  }

  async findAllByUserId(userId: number, orderBy: 'ASC' | 'DESC' = 'ASC'): Promise<CollaborationSliderResponse[]> {
    const sliderList = await this.collaborationSliderRepository.findByUserId(userId, orderBy);
    return sliderList.map((item) => this.toCollaborationSliderResponse(item));
  }

  async findById(id: number, userId: number): Promise<CollaborationSliderResponse> {
    const exists = await this.collaborationSliderRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Collaboration slider not found');
    }

    const slider = await this.collaborationSliderRepository.findById(id);
    if (!slider) {
      throw new Error('Collaboration slider not found');
    }

    return this.toCollaborationSliderResponse(slider);
  }

  async update(
    id: number,
    userId: number,
    input: UpdateCollaborationSliderInput
  ): Promise<CollaborationSliderResponse> {
    const exists = await this.collaborationSliderRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Collaboration slider not found');
    }

    await this.collaborationSliderRepository.update(id, input);

    const slider = await this.collaborationSliderRepository.findById(id);
    if (!slider) {
      throw new Error('Collaboration slider not found');
    }

    return this.toCollaborationSliderResponse(slider);
  }

  async delete(id: number, userId: number): Promise<void> {
    const exists = await this.collaborationSliderRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Collaboration slider not found');
    }

    await this.collaborationSliderRepository.delete(id);
  }

  private toCollaborationSliderResponse(slider: CollaborationSliderResponse): CollaborationSliderResponse {
    return {
      id: slider.id,
      id_user: slider.id_user,
      title: slider.title,
      image_path: slider.image_path,
      description: slider.description,
      link_url: slider.link_url,
      display_order: slider.display_order,
      is_active: slider.is_active,
      created_at: slider.created_at,
      updated_at: slider.updated_at,
    };
  }
}
