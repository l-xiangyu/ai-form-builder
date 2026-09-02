import type { FieldKind, ValidationRule } from '@/types/form';
import {
  FontSizeOutlined, NumberOutlined, CalendarOutlined,
  SelectOutlined, CheckCircleOutlined, CheckSquareOutlined,
  SwitcherOutlined, StarOutlined, SlidersOutlined,
  UploadOutlined, MinusOutlined, EditOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface FieldMeta {
  kind: FieldKind;
  label: string;
  icon: ReactNode;
  category: 'basic' | 'advanced' | 'layout';
  defaultSpan: 6 | 8 | 12 | 24;
}

export const FIELD_REGISTRY: FieldMeta[] = [
  { kind: 'text', label: '单行文本', icon: <FontSizeOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'textarea', label: '多行文本', icon: <EditOutlined />, category: 'basic', defaultSpan: 24 },
  { kind: 'number', label: '数字', icon: <NumberOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'date', label: '日期', icon: <CalendarOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'datetime', label: '日期时间', icon: <CalendarOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'select', label: '下拉选择', icon: <SelectOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'radio', label: '单选', icon: <CheckCircleOutlined />, category: 'basic', defaultSpan: 12 },
  { kind: 'checkbox', label: '多选', icon: <CheckSquareOutlined />, category: 'basic', defaultSpan: 24 },
  { kind: 'switch', label: '开关', icon: <SwitcherOutlined />, category: 'advanced', defaultSpan: 12 },
  { kind: 'rate', label: '评分', icon: <StarOutlined />, category: 'advanced', defaultSpan: 12 },
  { kind: 'slider', label: '滑块', icon: <SlidersOutlined />, category: 'advanced', defaultSpan: 12 },
  { kind: 'upload', label: '文件上传', icon: <UploadOutlined />, category: 'advanced', defaultSpan: 24 },
  { kind: 'divider', label: '分割线', icon: <MinusOutlined />, category: 'layout', defaultSpan: 24 },
];

export const VALIDATION_PRESETS: { label: string; rule: ValidationRule }[] = [
  { label: '必填', rule: { type: 'required' } },
  { label: '邮箱', rule: { type: 'email' } },
  { label: '手机号', rule: { type: 'phone' } },
  { label: '最少6字符', rule: { type: 'minLength', value: 6 } },
  { label: '最多100字符', rule: { type: 'maxLength', value: 100 } },
  { label: '最小值0', rule: { type: 'min', value: 0 } },
];

export function getFieldMeta(kind: FieldKind): FieldMeta | undefined {
  return FIELD_REGISTRY.find((f) => f.kind === kind);
}

export function rulesToAntdRules(rules: ValidationRule[]) {
  return rules.map((rule) => {
    switch (rule.type) {
      case 'required':
        return { required: true, message: rule.message ?? '此项为必填' };
      case 'minLength':
        return { min: rule.value, message: rule.message ?? `最少 ${rule.value} 个字符` };
      case 'maxLength':
        return { max: rule.value, message: rule.message ?? `最多 ${rule.value} 个字符` };
      case 'min':
        return { type: 'number' as const, min: rule.value, message: rule.message ?? `不能小于 ${rule.value}` };
      case 'max':
        return { type: 'number' as const, max: rule.value, message: rule.message ?? `不能大于 ${rule.value}` };
      case 'pattern':
        return { pattern: new RegExp(rule.value), message: rule.message ?? '格式不正确' };
      case 'email':
        return { type: 'email' as const, message: rule.message ?? '邮箱格式不正确' };
      case 'phone':
        return { pattern: /^1[3-9]\d{9}$/, message: rule.message ?? '手机号格式不正确' };
      default:
        return {};
    }
  });
}
