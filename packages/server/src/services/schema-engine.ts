import type {
  FormDefinitionDTO,
  FormSchema,
  ListConfig,
  RuntimeFormSchema,
  ValidationRule,
  FieldCondition,
} from '../types/form.js';

function parseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function toDTO(record: {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: string;
  schema: string;
  listConfig: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}): FormDefinitionDTO {
  return {
    id: record.id,
    code: record.code,
    title: record.title,
    description: record.description ?? undefined,
    status: record.status,
    schema: parseJson<FormSchema>(record.schema, { sections: [], layout: defaultLayout() }),
    listConfig: parseJson<ListConfig>(record.listConfig, defaultListConfig()),
    version: record.version,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function defaultLayout(): FormSchema['layout'] {
  return { labelAlign: 'right', labelWidth: 120, size: 'middle', columns: 2 };
}

function defaultListConfig(): ListConfig {
  return { columns: [], pageSize: 20 };
}

export class SchemaEngine {
  /** 评估条件表达式 */
  evaluateConditions(conditions: FieldCondition[] | undefined, data: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every((cond) => this.evaluateSingle(cond, data));
  }

  private evaluateSingle(cond: FieldCondition, data: Record<string, unknown>): boolean {
    const val = data[cond.fieldKey];
    switch (cond.operator) {
      case 'eq': return val === cond.value;
      case 'neq': return val !== cond.value;
      case 'gt': return Number(val) > Number(cond.value);
      case 'lt': return Number(val) < Number(cond.value);
      case 'contains': return String(val ?? '').includes(String(cond.value ?? ''));
      case 'empty': return val === undefined || val === null || val === '';
      case 'notEmpty': return val !== undefined && val !== null && val !== '';
      default: return true;
    }
  }

  /** 校验提交数据 */
  validateSubmission(schema: FormSchema, data: Record<string, unknown>): string[] {
    const errors: string[] = [];

    for (const section of schema.sections) {
      if (!this.evaluateConditions(section.visibleWhen, data)) continue;

      for (const field of section.fields) {
        if (field.kind === 'divider') continue;
        if (!this.evaluateConditions(field.visibleWhen, data)) continue;

        const value = data[field.key];
        const isRequired = field.rules.some((r) => r.type === 'required') ||
          this.evaluateConditions(field.requiredWhen, data);

        if (isRequired && this.isEmpty(value)) {
          errors.push(`${field.label} 为必填项`);
          continue;
        }

        if (this.isEmpty(value)) continue;

        for (const rule of field.rules) {
          const err = this.checkRule(field.label, value, rule);
          if (err) errors.push(err);
        }
      }
    }

    return errors;
  }

  private isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === '' ||
      (Array.isArray(value) && value.length === 0);
  }

  private checkRule(label: string, value: unknown, rule: ValidationRule): string | null {
    const str = String(value);
    switch (rule.type) {
      case 'required':
        return this.isEmpty(value) ? (rule.message ?? `${label} 为必填项`) : null;
      case 'minLength':
        return str.length < rule.value ? (rule.message ?? `${label} 最少 ${rule.value} 个字符`) : null;
      case 'maxLength':
        return str.length > rule.value ? (rule.message ?? `${label} 最多 ${rule.value} 个字符`) : null;
      case 'min':
        return Number(value) < rule.value ? (rule.message ?? `${label} 不能小于 ${rule.value}`) : null;
      case 'max':
        return Number(value) > rule.value ? (rule.message ?? `${label} 不能大于 ${rule.value}`) : null;
      case 'pattern':
        return !new RegExp(rule.value).test(str) ? (rule.message ?? `${label} 格式不正确`) : null;
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str) ? (rule.message ?? `${label} 邮箱格式不正确`) : null;
      case 'phone':
        return !/^1[3-9]\d{9}$/.test(str) ? (rule.message ?? `${label} 手机号格式不正确`) : null;
      default:
        return null;
    }
  }

  /** 构建运行时 Schema（过滤不可见分组/字段） */
  buildRuntimeSchema(
    formId: string,
    code: string,
    title: string,
    schema: FormSchema,
    listConfig: ListConfig,
    data?: Record<string, unknown>,
  ): RuntimeFormSchema {
    const ctx = data ?? {};
    const filteredSections = schema.sections
      .filter((s) => this.evaluateConditions(s.visibleWhen, ctx))
      .map((s) => ({
        ...s,
        fields: s.fields.filter((f) =>
          f.kind === 'divider' || this.evaluateConditions(f.visibleWhen, ctx),
        ),
      }));

    return {
      formId,
      code,
      title,
      schema: { ...schema, sections: filteredSections },
      listConfig,
    };
  }
}

export const schemaEngine = new SchemaEngine();
export { toDTO, defaultLayout, defaultListConfig };
