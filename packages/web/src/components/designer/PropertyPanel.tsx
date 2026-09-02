import {
  Form, Input, InputNumber, Select, Switch, Button, Space,
  Divider, Typography, Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDesignerStore } from '@/stores/designer-store';
import { VALIDATION_PRESETS } from '@/registry/field-registry';
import type { ValidationRule, SelectOption } from '@/types/form';

const { Text } = Typography;

export function PropertyPanel() {
  const { form, activeSectionId, activeFieldId, updateField, updateSection, updateMeta, updateSchema } = useDesignerStore();

  if (!form) {
    return <div style={{ padding: 16 }}><Text type="secondary">请先加载表单</Text></div>;
  }

  const activeSection = form.schema.sections.find((s) => s.id === activeSectionId);
  const activeField = activeSection?.fields.find((f) => f.id === activeFieldId);

  if (activeField && activeSection) {
    return (
      <div style={{ padding: 12, height: '100%', overflow: 'auto' }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>字段属性</Text>
        <Form layout="vertical" size="small">
          <Form.Item label="字段标识">
            <Input
              value={activeField.key}
              onChange={(e) => updateField(activeSection.id, activeField.id, { key: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="显示名称">
            <Input
              value={activeField.label}
              onChange={(e) => updateField(activeSection.id, activeField.id, { label: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="占位提示">
            <Input
              value={activeField.placeholder}
              onChange={(e) => updateField(activeSection.id, activeField.id, { placeholder: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="栅格宽度">
            <Select
              value={activeField.span}
              onChange={(span) => updateField(activeSection.id, activeField.id, { span })}
              options={[
                { label: '整行 (24)', value: 24 },
                { label: '半行 (12)', value: 12 },
                { label: '1/3行 (8)', value: 8 },
                { label: '1/4行 (6)', value: 6 },
              ]}
            />
          </Form.Item>

          {activeField.options && (
            <Form.Item label="选项配置">
              {activeField.options.map((opt, idx) => (
                <Space key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                  <Input
                    size="small" placeholder="标签" value={opt.label}
                    onChange={(e) => {
                      const options = [...(activeField.options ?? [])];
                      options[idx] = { ...options[idx], label: e.target.value };
                      updateField(activeSection.id, activeField.id, { options });
                    }}
                  />
                  <Input
                    size="small" placeholder="值" value={String(opt.value)}
                    onChange={(e) => {
                      const options = [...(activeField.options ?? [])];
                      options[idx] = { ...options[idx], value: e.target.value };
                      updateField(activeSection.id, activeField.id, { options });
                    }}
                  />
                  <Button size="small" danger icon={<DeleteOutlined />}
                    onClick={() => {
                      const options = activeField.options!.filter((_, i) => i !== idx);
                      updateField(activeSection.id, activeField.id, { options });
                    }}
                  />
                </Space>
              ))}
              <Button size="small" type="dashed" icon={<PlusOutlined />}
                onClick={() => {
                  const options: SelectOption[] = [...(activeField.options ?? []), { label: '新选项', value: `opt_${Date.now()}` }];
                  updateField(activeSection.id, activeField.id, { options });
                }}
              >
                添加选项
              </Button>
            </Form.Item>
          )}

          <Divider style={{ margin: '12px 0' }} />
          <Text strong style={{ display: 'block', marginBottom: 8 }}>校验规则</Text>
          <Space wrap style={{ marginBottom: 8 }}>
            {VALIDATION_PRESETS.map((preset) => {
              const exists = activeField.rules.some((r) => r.type === preset.rule.type);
              return (
                <Tag
                  key={preset.label}
                  color={exists ? 'blue' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const rules: ValidationRule[] = exists
                      ? activeField.rules.filter((r) => r.type !== preset.rule.type)
                      : [...activeField.rules, preset.rule];
                    updateField(activeSection.id, activeField.id, { rules });
                  }}
                >
                  {preset.label}
                </Tag>
              );
            })}
          </Space>
        </Form>
      </div>
    );
  }

  if (activeSection) {
    return (
      <div style={{ padding: 12, height: '100%', overflow: 'auto' }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>分组属性</Text>
        <Form layout="vertical" size="small">
          <Form.Item label="分组标题">
            <Input
              value={activeSection.title}
              onChange={(e) => updateSection(activeSection.id, { title: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="分组描述">
            <Input.TextArea
              rows={2}
              value={activeSection.description}
              onChange={(e) => updateSection(activeSection.id, { description: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="可折叠">
            <Switch
              checked={activeSection.collapsible}
              onChange={(collapsible) => updateSection(activeSection.id, { collapsible })}
            />
          </Form.Item>
          <Form.Item label="默认展开">
            <Switch
              checked={activeSection.defaultExpanded}
              onChange={(defaultExpanded) => updateSection(activeSection.id, { defaultExpanded })}
            />
          </Form.Item>
        </Form>
      </div>
    );
  }

  return (
    <div style={{ padding: 12, height: '100%', overflow: 'auto' }}>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>表单属性</Text>
      <Form layout="vertical" size="small">
        <Form.Item label="表单标题">
          <Input value={form.title} onChange={(e) => updateMeta({ title: e.target.value })} />
        </Form.Item>
        <Form.Item label="表单编码">
          <Input value={form.code} disabled />
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea rows={2} value={form.description} onChange={(e) => updateMeta({ description: e.target.value })} />
        </Form.Item>
      </Form>

      <Divider />
      <Text strong style={{ display: 'block', marginBottom: 12 }}>布局设置</Text>
      <Form layout="vertical" size="small">
        <Form.Item label="标签对齐">
          <Select
            value={form.schema.layout.labelAlign}
            onChange={(labelAlign) => updateSchema({ ...form.schema, layout: { ...form.schema.layout, labelAlign } })}
            options={[
              { label: '右对齐', value: 'right' },
              { label: '左对齐', value: 'left' },
              { label: '顶部', value: 'top' },
            ]}
          />
        </Form.Item>
        <Form.Item label="标签宽度">
          <InputNumber
            value={form.schema.layout.labelWidth}
            min={60} max={300}
            onChange={(labelWidth) => updateSchema({
              ...form.schema,
              layout: { ...form.schema.layout, labelWidth: labelWidth ?? 120 },
            })}
          />
        </Form.Item>
        <Form.Item label="组件尺寸">
          <Select
            value={form.schema.layout.size}
            onChange={(size) => updateSchema({ ...form.schema, layout: { ...form.schema.layout, size } })}
            options={[
              { label: '小', value: 'small' },
              { label: '中', value: 'middle' },
              { label: '大', value: 'large' },
            ]}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
