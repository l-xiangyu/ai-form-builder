import { z } from 'zod';

const validationRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('required'), message: z.string().optional() }),
  z.object({ type: z.literal('minLength'), value: z.number(), message: z.string().optional() }),
  z.object({ type: z.literal('maxLength'), value: z.number(), message: z.string().optional() }),
  z.object({ type: z.literal('min'), value: z.number(), message: z.string().optional() }),
  z.object({ type: z.literal('max'), value: z.number(), message: z.string().optional() }),
  z.object({ type: z.literal('pattern'), value: z.string(), message: z.string().optional() }),
  z.object({ type: z.literal('email'), message: z.string().optional() }),
  z.object({ type: z.literal('phone'), message: z.string().optional() }),
  z.object({ type: z.literal('unique'), message: z.string().optional() }),
]);

const fieldConditionSchema = z.object({
  fieldKey: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'lt', 'contains', 'empty', 'notEmpty']),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const formFieldSchema = z.object({
  id: z.string(),
  key: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, '字段标识只能包含字母、数字和下划线'),
  kind: z.enum([
    'text', 'textarea', 'number', 'date', 'datetime',
    'select', 'radio', 'checkbox', 'switch', 'rate',
    'slider', 'upload', 'divider', 'richtext',
  ]),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  defaultValue: z.unknown().optional(),
  span: z.union([z.literal(6), z.literal(8), z.literal(12), z.literal(24)]),
  rules: z.array(validationRuleSchema),
  props: z.record(z.unknown()),
  options: z.array(z.object({ label: z.string(), value: z.union([z.string(), z.number()]) })).optional(),
  visibleWhen: z.array(fieldConditionSchema).optional(),
  requiredWhen: z.array(fieldConditionSchema).optional(),
});

const formSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  collapsible: z.boolean(),
  defaultExpanded: z.boolean(),
  visibleWhen: z.array(fieldConditionSchema).optional(),
  fields: z.array(formFieldSchema),
});

export const formSchemaValidator = z.object({
  sections: z.array(formSectionSchema).min(1),
  layout: z.object({
    labelAlign: z.enum(['left', 'right', 'top']),
    labelWidth: z.number().min(60).max(300),
    size: z.enum(['small', 'middle', 'large']),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  }),
});

export const listConfigValidator = z.object({
  columns: z.array(z.object({
    fieldKey: z.string(),
    title: z.string(),
    width: z.number().optional(),
    sortable: z.boolean().optional(),
    searchable: z.boolean().optional(),
  })),
  pageSize: z.number().min(5).max(100),
  defaultSort: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']),
  }).optional(),
});

export const createFormValidator = z.object({
  code: z.string().regex(/^[a-z][a-z0-9_]*$/, '编码必须以小写字母开头，只能包含小写字母、数字和下划线'),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  schema: formSchemaValidator,
  listConfig: listConfigValidator.optional(),
});

export const updateFormValidator = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  schema: formSchemaValidator.optional(),
  listConfig: listConfigValidator.optional(),
});

export const submissionValidator = z.record(z.unknown());
