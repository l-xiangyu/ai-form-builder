import { Router } from 'express';
import { formService } from '../services/form-service.js';
import { submissionService } from '../services/submission-service.js';
import { createFormValidator, updateFormValidator, submissionValidator } from '../lib/validators.js';

export const formRouter = Router();

// 表单定义 CRUD
formRouter.get('/', async (req, res) => {
  const result = await formService.list({
    status: req.query.status as string,
    keyword: req.query.keyword as string,
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });
  res.json({ success: true, data: result });
});

formRouter.get('/:id', async (req, res) => {
  const form = await formService.getById(req.params.id);
  if (!form) return res.status(404).json({ success: false, message: '表单不存在' });
  res.json({ success: true, data: form });
});

formRouter.post('/', async (req, res) => {
  const parsed = createFormValidator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: '参数校验失败', errors: parsed.error.flatten() });
  }

  const existing = await formService.getByCode(parsed.data.code);
  if (existing) {
    return res.status(409).json({ success: false, message: '表单编码已存在' });
  }

  const form = await formService.create(parsed.data);
  res.status(201).json({ success: true, data: form });
});

formRouter.put('/:id', async (req, res) => {
  const parsed = updateFormValidator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: '参数校验失败', errors: parsed.error.flatten() });
  }

  const form = await formService.update(req.params.id, parsed.data);
  if (!form) return res.status(404).json({ success: false, message: '表单不存在' });
  res.json({ success: true, data: form });
});

formRouter.delete('/:id', async (req, res) => {
  const ok = await formService.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: '表单不存在' });
  res.json({ success: true });
});

formRouter.post('/:id/duplicate', async (req, res) => {
  const form = await formService.duplicate(req.params.id);
  if (!form) return res.status(404).json({ success: false, message: '表单不存在' });
  res.status(201).json({ success: true, data: form });
});

formRouter.post('/:id/publish', async (req, res) => {
  const form = await formService.update(req.params.id, { status: 'published' });
  if (!form) return res.status(404).json({ success: false, message: '表单不存在' });
  res.json({ success: true, data: form });
});

// 运行时 API
formRouter.get('/runtime/:code', async (req, res) => {
  const schema = await formService.getRuntimeSchema(req.params.code);
  if (!schema) return res.status(404).json({ success: false, message: '表单不存在或未发布' });
  res.json({ success: true, data: schema });
});

// 提交数据
formRouter.get('/:formId/submissions', async (req, res) => {
  const result = await submissionService.list(req.params.formId, {
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });
  res.json({ success: true, data: result });
});

formRouter.get('/submissions/:id', async (req, res) => {
  const submission = await submissionService.getById(req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: '记录不存在' });
  res.json({ success: true, data: submission });
});

formRouter.post('/runtime/:code/submit', async (req, res) => {
  const parsed = submissionValidator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: '参数校验失败' });
  }

  const result = await submissionService.create(req.params.code, parsed.data);
  if ('error' in result) {
    return res.status(400).json({ success: false, message: result.error, details: result.details });
  }
  res.status(201).json({ success: true, data: result.data });
});

formRouter.put('/submissions/:id', async (req, res) => {
  const parsed = submissionValidator.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: '参数校验失败' });
  }

  const result = await submissionService.update(req.params.id, parsed.data);
  if ('error' in result) {
    return res.status(400).json({ success: false, message: result.error, details: result.details });
  }
  res.json({ success: true, data: result.data });
});

formRouter.delete('/submissions/:id', async (req, res) => {
  const ok = await submissionService.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: '记录不存在' });
  res.json({ success: true });
});
