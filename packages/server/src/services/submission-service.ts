import { prisma } from '../lib/prisma.js';
import { schemaEngine } from './schema-engine.js';
import { formService } from './form-service.js';
import type { FormSubmissionDTO } from '../types/form.js';

function toSubmissionDTO(record: {
  id: string;
  formId: string;
  data: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): FormSubmissionDTO {
  return {
    id: record.id,
    formId: record.formId,
    data: JSON.parse(record.data),
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class SubmissionService {
  async list(formId: string, params: { page?: number; pageSize?: number; keyword?: string }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const [total, records] = await Promise.all([
      prisma.formSubmission.count({ where: { formId } }),
      prisma.formSubmission.findMany({
        where: { formId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      items: records.map(toSubmissionDTO),
    };
  }

  async getById(id: string): Promise<FormSubmissionDTO | null> {
    const record = await prisma.formSubmission.findUnique({ where: { id } });
    return record ? toSubmissionDTO(record) : null;
  }

  async create(formCode: string, data: Record<string, unknown>, status = 'submitted') {
    const form = await formService.getByCode(formCode);
    if (!form) return { error: '表单不存在' };

    const errors = schemaEngine.validateSubmission(form.schema, data);
    if (errors.length > 0) return { error: '校验失败', details: errors };

    const record = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: JSON.stringify(data),
        status,
      },
    });

    return { data: toSubmissionDTO(record) };
  }

  async update(id: string, data: Record<string, unknown>) {
    const existing = await prisma.formSubmission.findUnique({
      where: { id },
      include: { form: true },
    });
    if (!existing) return { error: '记录不存在' };

    const formSchema = JSON.parse(existing.form.schema);
    const errors = schemaEngine.validateSubmission(formSchema, data);
    if (errors.length > 0) return { error: '校验失败', details: errors };

    const record = await prisma.formSubmission.update({
      where: { id },
      data: { data: JSON.stringify(data) },
    });

    return { data: toSubmissionDTO(record) };
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.formSubmission.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export const submissionService = new SubmissionService();
