import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { ApiError } from '../types/api.types';
import { supabase } from '@/utils/supabase';

interface ErrorResponse {
  message: string;
  [key: string]: any;
}

class BaseApi {
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create(API_CONFIG);

    // Add request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error))
    );
  }

  protected handleError(error: AxiosError<ErrorResponse>): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
    };
  }

  protected async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url);
    return response.data;
  }

  protected async post<T>(url: string, data: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data);
    return response.data;
  }
}

export default BaseApi;
