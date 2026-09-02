export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'rate'
  | 'slider'
  | 'upload'
  | 'divider'
  | 'richtext';

export type ValidationRule =
  | { type: 'required'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'min'; value: number; message?: string }
  | { type: 'max'; value: number; message?: string }
  | { type: 'pattern'; value: string; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'phone'; message?: string }
  | { type: 'unique'; message?: string };

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FieldCondition {
  fieldKey: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'empty' | 'notEmpty';
  value?: string | number | boolean;
}

export interface FormField {
  id: string;
  key: string;
  kind: FieldKind;
  label: string;
  placeholder?: string;
  defaultValue?: unknown;
  span: 6 | 8 | 12 | 24;
  rules: ValidationRule[];
  props: Record<string, unknown>;
  options?: SelectOption[];
  visibleWhen?: FieldCondition[];
  requiredWhen?: FieldCondition[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible: boolean;
  defaultExpanded: boolean;
  visibleWhen?: FieldCondition[];
  fields: FormField[];
}

export interface FormLayout {
  labelAlign: 'left' | 'right' | 'top';
  labelWidth: number;
  size: 'small' | 'middle' | 'large';
  columns: 1 | 2 | 3 | 4;
}

export interface FormSchema {
  sections: FormSection[];
  layout: FormLayout;
}

export interface ListColumn {
  fieldKey: string;
  title: string;
  width?: number;
  sortable?: boolean;
  searchable?: boolean;
}

export interface ListConfig {
  columns: ListColumn[];
  pageSize: number;
  defaultSort?: { field: string; order: 'asc' | 'desc' };
}

export interface FormDefinition {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  schema: FormSchema;
  listConfig: ListConfig;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeFormSchema {
  formId: string;
  code: string;
  title: string;
  schema: FormSchema;
  listConfig: ListConfig;
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: string[];
}
