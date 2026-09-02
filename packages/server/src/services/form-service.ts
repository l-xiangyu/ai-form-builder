import { prisma } from '../lib/prisma.js';
import { schemaEngine, toDTO, defaultLayout, defaultListConfig } from './schema-engine.js';
import type { FormDefinitionDTO, FormSchema, ListConfig } from '../types/form.js';
import { nanoid } from 'nanoid';

function createDefaultSchema(title: string): FormSchema {
  return {
    sections: [
      {
        id: nanoid(),
        title: '基本信息',
        collapsible: false,
        defaultExpanded: true,
        fields: [
          {
            id: nanoid(),
            key: 'name',
            kind: 'text',
            label: '名称',
            placeholder: '请输入名称',
            span: 12,
            rules: [{ type: 'required', message: '名称不能为空' }],
            props: {},
          },
        ],
      },
    ],
    layout: defaultLayout(),
  };
}

function autoListConfig(schema: FormSchema): ListConfig {
  const columns = schema.sections
    .flatMap((s) => s.fields)
    .filter((f) => f.kind !== 'divider')
    .slice(0, 6)
    .map((f) => ({
      fieldKey: f.key,
      title: f.label,
      searchable: ['text', 'textarea', 'select'].includes(f.kind),
      sortable: ['number', 'date', 'datetime'].includes(f.kind),
    }));

  return { columns, pageSize: 20 };
}

export class FormService {
  async list(params: { status?: string; keyword?: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where: Record<string, unknown> = {};

    if (params.status) where.status = params.status;
    if (params.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { code: { contains: params.keyword } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.formDefinition.count({ where }),
      prisma.formDefinition.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: records.map(toDTO),
    };
  }

  async getById(id: string): Promise<FormDefinitionDTO | null> {
    const record = await prisma.formDefinition.findUnique({ where: { id } });
    return record ? toDTO(record) : null;
  }

  async getByCode(code: string): Promise<FormDefinitionDTO | null> {
    const record = await prisma.formDefinition.findUnique({ where: { code } });
    return record ? toDTO(record) : null;
  }

  async create(input: {
    code: string;
    title: string;
    description?: string;
    schema?: FormSchema;
    listConfig?: ListConfig;
  }): Promise<FormDefinitionDTO> {
    const schema = input.schema ?? createDefaultSchema(input.title);
    const listConfig = input.listConfig ?? autoListConfig(schema);

    const record = await prisma.formDefinition.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description,
        schema: JSON.stringify(schema),
        listConfig: JSON.stringify(listConfig),
      },
    });

    return toDTO(record);
  }

  async update(id: string, input: {
    title?: string;
    description?: string;
    status?: string;
    schema?: FormSchema;
    listConfig?: ListConfig;
  }): Promise<FormDefinitionDTO | null> {
    const existing = await prisma.formDefinition.findUnique({ where: { id } });
    if (!existing) return null;

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.schema !== undefined) {
      data.schema = JSON.stringify(input.schema);
      data.version = existing.version + 1;
    }
    if (input.listConfig !== undefined) {
      data.listConfig = JSON.stringify(input.listConfig);
    }

    const record = await prisma.formDefinition.update({ where: { id }, data });
    return toDTO(record);
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.formDefinition.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async duplicate(id: string): Promise<FormDefinitionDTO | null> {
    const source = await this.getById(id);
    if (!source) return null;

    const newCode = `${source.code}_copy_${Date.now().toString(36)}`;
    return this.create({
      code: newCode,
      title: `${source.title} (副本)`,
      description: source.description,
      schema: source.schema,
      listConfig: source.listConfig,
    });
  }

  async getRuntimeSchema(code: string, data?: Record<string, unknown>) {
    const form = await this.getByCode(code);
    if (!form) return null;
    if (form.status !== 'published' && form.status !== 'draft') return null;

    return schemaEngine.buildRuntimeSchema(
      form.id, form.code, form.title,
      form.schema, form.listConfig, data,
    );
  }
}

export const formService = new FormService();
