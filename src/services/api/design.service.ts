import BaseApi from './base.api';
import { API_ENDPOINTS } from '../config/api.config';

type Pattern={
    id: string;
    name: string;
    description: string;
    category: string;
}

type Principle={
    id: string;
    name: string;
    description: string;
    category: string;
    abr: string;
}

class DesignService extends BaseApi {
  async getPatterns(): Promise<Pattern[]> {
    try {
      return await this.get<Pattern[]>(
        API_ENDPOINTS.ALL_PATTERNS
      );
    } catch (error) {
      return [];
    }
  }
  async getPrinciples(): Promise<Principle[]> {
    try {
      return await this.get<Principle[]>(
        API_ENDPOINTS.ALL_PRINCIPLES,
      );
    } catch (error) {
      return []
    }
  }
}

export default new DesignService();
