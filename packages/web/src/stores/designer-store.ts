import { create } from 'zustand';
import type { FormDefinition, FormField, FormSchema, FormSection, ListConfig } from '@/types/form';
import { formApi } from '@/api/form-api';
import { nanoid } from '@/utils/id';

interface DesignerState {
  form: FormDefinition | null;
  activeSectionId: string | null;
  activeFieldId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  previewMode: boolean;

  loadForm: (id: string) => Promise<void>;
  resetDesigner: () => void;
  setPreviewMode: (mode: boolean) => void;

  updateMeta: (meta: Partial<Pick<FormDefinition, 'title' | 'description' | 'code'>>) => void;
  updateSchema: (schema: FormSchema) => void;
  updateListConfig: (config: ListConfig) => void;

  addSection: (title?: string) => void;
  updateSection: (sectionId: string, patch: Partial<FormSection>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  addField: (sectionId: string, kind: FormField['kind']) => void;
  updateField: (sectionId: string, fieldId: string, patch: Partial<FormField>) => void;
  removeField: (sectionId: string, fieldId: string) => void;
  moveField: (fromSectionId: string, toSectionId: string, fieldId: string, toIndex: number) => void;
  reorderFields: (sectionId: string, fromIndex: number, toIndex: number) => void;

  setActiveSection: (id: string | null) => void;
  setActiveField: (sectionId: string | null, fieldId: string | null) => void;

  save: () => Promise<boolean>;
  publish: () => Promise<boolean>;
}

const defaultLayout = (): FormSchema['layout'] => ({
  labelAlign: 'right',
  labelWidth: 120,
  size: 'middle',
  columns: 2,
});

function createDefaultField(kind: FormField['kind']): FormField {
  const labelMap: Record<string, string> = {
    text: '单行文本', textarea: '多行文本', number: '数字',
    date: '日期', datetime: '日期时间', select: '下拉选择',
    radio: '单选', checkbox: '多选', switch: '开关',
    rate: '评分', slider: '滑块', upload: '文件上传',
    divider: '分割线', richtext: '富文本',
  };

  return {
    id: nanoid(),
    key: `field_${nanoid(6)}`,
    kind,
    label: labelMap[kind] ?? '字段',
    span: kind === 'divider' || kind === 'textarea' ? 24 : 12,
    rules: [],
    props: kind === 'textarea' ? { rows: 3 } : {},
    options: ['select', 'radio', 'checkbox'].includes(kind)
      ? [{ label: '选项1', value: 'option1' }, { label: '选项2', value: 'option2' }]
      : undefined,
  };
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  form: null,
  activeSectionId: null,
  activeFieldId: null,
  isDirty: false,
  isSaving: false,
  previewMode: false,

  loadForm: async (id) => {
    const res = await formApi.getById(id);
    if (res.data.success && res.data.data) {
      const form = res.data.data;
      set({
        form,
        activeSectionId: form.schema.sections[0]?.id ?? null,
        activeFieldId: null,
        isDirty: false,
      });
    }
  },

  resetDesigner: () => set({
    form: null, activeSectionId: null, activeFieldId: null,
    isDirty: false, previewMode: false,
  }),

  setPreviewMode: (mode) => set({ previewMode: mode }),

  updateMeta: (meta) => {
    const { form } = get();
    if (!form) return;
    set({ form: { ...form, ...meta }, isDirty: true });
  },

  updateSchema: (schema) => {
    const { form } = get();
    if (!form) return;
    set({ form: { ...form, schema }, isDirty: true });
  },

  updateListConfig: (listConfig) => {
    const { form } = get();
    if (!form) return;
    set({ form: { ...form, listConfig }, isDirty: true });
  },

  addSection: (title = '新分组') => {
    const { form } = get();
    if (!form) return;
    const section: FormSection = {
      id: nanoid(),
      title,
      collapsible: true,
      defaultExpanded: true,
      fields: [],
    };
    const schema = { ...form.schema, sections: [...form.schema.sections, section] };
    set({ form: { ...form, schema }, activeSectionId: section.id, isDirty: true });
  },

  updateSection: (sectionId, patch) => {
    const { form } = get();
    if (!form) return;
    const sections = form.schema.sections.map((s) =>
      s.id === sectionId ? { ...s, ...patch } : s,
    );
    set({ form: { ...form, schema: { ...form.schema, sections } }, isDirty: true });
  },

  removeSection: (sectionId) => {
    const { form, activeSectionId } = get();
    if (!form || form.schema.sections.length <= 1) return;
    const sections = form.schema.sections.filter((s) => s.id !== sectionId);
    set({
      form: { ...form, schema: { ...form.schema, sections } },
      activeSectionId: activeSectionId === sectionId ? sections[0]?.id ?? null : activeSectionId,
      activeFieldId: null,
      isDirty: true,
    });
  },

  reorderSections: (fromIndex, toIndex) => {
    const { form } = get();
    if (!form) return;
    const sections = [...form.schema.sections];
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);
    set({ form: { ...form, schema: { ...form.schema, sections } }, isDirty: true });
  },

  addField: (sectionId, kind) => {
    const { form } = get();
    if (!form) return;
    const field = createDefaultField(kind);
    const sections = form.schema.sections.map((s) =>
      s.id === sectionId ? { ...s, fields: [...s.fields, field] } : s,
    );
    set({
      form: { ...form, schema: { ...form.schema, sections } },
      activeSectionId: sectionId,
      activeFieldId: field.id,
      isDirty: true,
    });
  },

  updateField: (sectionId, fieldId, patch) => {
    const { form } = get();
    if (!form) return;
    const sections = form.schema.sections.map((s) =>
      s.id === sectionId
        ? { ...s, fields: s.fields.map((f) => f.id === fieldId ? { ...f, ...patch } : f) }
        : s,
    );
    set({ form: { ...form, schema: { ...form.schema, sections } }, isDirty: true });
  },

  removeField: (sectionId, fieldId) => {
    const { form, activeFieldId } = get();
    if (!form) return;
    const sections = form.schema.sections.map((s) =>
      s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s,
    );
    set({
      form: { ...form, schema: { ...form.schema, sections } },
      activeFieldId: activeFieldId === fieldId ? null : activeFieldId,
      isDirty: true,
    });
  },

  moveField: (fromSectionId, toSectionId, fieldId, toIndex) => {
    const { form } = get();
    if (!form) return;
    let movedField: FormField | undefined;
    const sections = form.schema.sections.map((s) => {
      if (s.id === fromSectionId) {
        movedField = s.fields.find((f) => f.id === fieldId);
        return { ...s, fields: s.fields.filter((f) => f.id !== fieldId) };
      }
      return s;
    });
    if (!movedField) return;
    const finalSections = sections.map((s) => {
      if (s.id === toSectionId) {
        const fields = [...s.fields];
        fields.splice(toIndex, 0, movedField!);
        return { ...s, fields };
      }
      return s;
    });
    set({ form: { ...form, schema: { ...form.schema, sections: finalSections } }, isDirty: true });
  },

  reorderFields: (sectionId, fromIndex, toIndex) => {
    const { form } = get();
    if (!form) return;
    const sections = form.schema.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const fields = [...s.fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      return { ...s, fields };
    });
    set({ form: { ...form, schema: { ...form.schema, sections } }, isDirty: true });
  },

  setActiveSection: (id) => set({ activeSectionId: id, activeFieldId: null }),
  setActiveField: (sectionId, fieldId) => set({ activeSectionId: sectionId, activeFieldId: fieldId }),

  save: async () => {
    const { form } = get();
    if (!form) return false;
    set({ isSaving: true });
    try {
      const res = await formApi.update(form.id, {
        title: form.title,
        description: form.description,
        schema: form.schema,
        listConfig: form.listConfig,
      });
      if (res.data.success && res.data.data) {
        set({ form: res.data.data, isDirty: false, isSaving: false });
        return true;
      }
      set({ isSaving: false });
      return false;
    } catch {
      set({ isSaving: false });
      return false;
    }
  },

  publish: async () => {
    const saved = await get().save();
    if (!saved) return false;
    const { form } = get();
    if (!form) return false;
    const res = await formApi.publish(form.id);
    if (res.data.success && res.data.data) {
      set({ form: res.data.data });
      return true;
    }
    return false;
  },
}));

export { defaultLayout, createDefaultField };
