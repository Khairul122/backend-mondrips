import { SosialMediaRepository } from '../repositories/sosial-media.repository';
import { SosialMediaResponse, CreateSosialMediaDTO } from '../models/sosial-media.model';
import Database from '../config/database';

export interface CreateSosialMediaInput {
  nama_platform: string;
  username_path: string;
  icon_class?: string | null;
  link_url: string;
}

export interface UpdateSosialMediaInput {
  nama_platform?: string;
  username_path?: string;
  icon_class?: string | null;
  link_url?: string;
}

export class SosialMediaService {
  private sosialMediaRepository: SosialMediaRepository;

  constructor(db: Database) {
    this.sosialMediaRepository = new SosialMediaRepository(db);
  }

  async create(userId: number, input: CreateSosialMediaInput): Promise<SosialMediaResponse> {
    const data: CreateSosialMediaDTO = {
      id_user: userId,
      nama_platform: input.nama_platform,
      username_path: input.username_path,
      icon_class: input.icon_class || null,
      link_url: input.link_url,
    };

    const id = await this.sosialMediaRepository.create(data);

    const sosialMedia = await this.sosialMediaRepository.findById(id);
    if (!sosialMedia) {
      throw new Error('Failed to create social media');
    }

    return this.toSosialMediaResponse(sosialMedia);
  }

  async findAllByUserId(userId: number): Promise<SosialMediaResponse[]> {
    const sosialMediaList = await this.sosialMediaRepository.findByUserId(userId);
    return sosialMediaList.map((item) => this.toSosialMediaResponse(item));
  }

  async findById(id: number, userId: number): Promise<SosialMediaResponse> {
    const exists = await this.sosialMediaRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Social media not found');
    }

    const sosialMedia = await this.sosialMediaRepository.findById(id);
    if (!sosialMedia) {
      throw new Error('Social media not found');
    }

    return this.toSosialMediaResponse(sosialMedia);
  }

  async update(id: number, userId: number, input: UpdateSosialMediaInput): Promise<SosialMediaResponse> {
    const exists = await this.sosialMediaRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Social media not found');
    }

    await this.sosialMediaRepository.update(id, input);

    const sosialMedia = await this.sosialMediaRepository.findById(id);
    if (!sosialMedia) {
      throw new Error('Social media not found');
    }

    return this.toSosialMediaResponse(sosialMedia);
  }

  async delete(id: number, userId: number): Promise<void> {
    const exists = await this.sosialMediaRepository.existsForUser(id, userId);
    if (!exists) {
      throw new Error('Social media not found');
    }

    await this.sosialMediaRepository.delete(id);
  }

  private toSosialMediaResponse(sosialMedia: SosialMediaResponse): SosialMediaResponse {
    return {
      id: sosialMedia.id,
      id_user: sosialMedia.id_user,
      nama_platform: sosialMedia.nama_platform,
      username_path: sosialMedia.username_path,
      icon_class: sosialMedia.icon_class,
      link_url: sosialMedia.link_url,
      created_at: sosialMedia.created_at,
      updated_at: sosialMedia.updated_at,
    };
  }
}
