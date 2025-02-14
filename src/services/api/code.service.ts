import BaseApi from './base.api';
import { API_ENDPOINTS } from '../config/api.config';
import { ExecuteCodeRequest, ExecuteCodeResponse } from '../types/api.types';

class CodeService extends BaseApi {
  async executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    try {
      return await this.post<ExecuteCodeResponse>(
        API_ENDPOINTS.EXECUTE_CODE,
        request
      );
    } catch (error) {
      return {
        result: '',
        error: error instanceof Error ? error.message : 'Execution failed'
      };
    }
  }
}

export default new CodeService();
