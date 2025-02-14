export interface ExecuteCodeRequest {
  code: string;
  main: string;
}

export interface ExecuteCodeResponse {
  result: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
