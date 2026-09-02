import axios from 'axios';
import type {
  ApiResponse,
  FormDefinition,
  FormSubmission,
  PaginatedResult,
  RuntimeFormSchema,
} from '@/types/form';

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const formApi = {
  list(params?: { status?: string; keyword?: string; page?: number; pageSize?: number }) {
    return client.get<ApiResponse<PaginatedResult<FormDefinition>>>('/forms', { params });
  },

  getById(id: string) {
    return client.get<ApiResponse<FormDefinition>>(`/forms/${id}`);
  },

  create(data: Partial<FormDefinition> & { code: string; title: string }) {
    return client.post<ApiResponse<FormDefinition>>('/forms', data);
  },

  update(id: string, data: Partial<FormDefinition>) {
    return client.put<ApiResponse<FormDefinition>>(`/forms/${id}`, data);
  },

  remove(id: string) {
    return client.delete<ApiResponse<void>>(`/forms/${id}`);
  },

  duplicate(id: string) {
    return client.post<ApiResponse<FormDefinition>>(`/forms/${id}/duplicate`);
  },

  publish(id: string) {
    return client.post<ApiResponse<FormDefinition>>(`/forms/${id}/publish`);
  },

  getRuntimeSchema(code: string) {
    return client.get<ApiResponse<RuntimeFormSchema>>(`/forms/runtime/${code}`);
  },

  getSubmissions(formId: string, params?: { page?: number; pageSize?: number }) {
    return client.get<ApiResponse<PaginatedResult<FormSubmission>>>(`/forms/${formId}/submissions`, { params });
  },

  submit(code: string, data: Record<string, unknown>) {
    return client.post<ApiResponse<FormSubmission>>(`/forms/runtime/${code}/submit`, data);
  },

  updateSubmission(id: string, data: Record<string, unknown>) {
    return client.put<ApiResponse<FormSubmission>>(`/forms/submissions/${id}`, data);
  },

  removeSubmission(id: string) {
    return client.delete<ApiResponse<void>>(`/forms/submissions/${id}`);
  },
};
