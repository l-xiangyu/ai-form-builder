import {
  Input, InputNumber, Select, Radio, Checkbox, Switch,
  Rate, Slider, DatePicker, Upload, Divider, Form, Row, Col,
} from 'antd';
import type { FormInstance } from 'antd';
import type { FormField, FormLayout, FormSchema, FormSection } from '@/types/form';
import { rulesToAntdRules } from '@/registry/field-registry';
import dayjs from 'dayjs';

interface FieldRendererProps {
  field: FormField;
  layout: FormLayout;
  disabled?: boolean;
}

function renderControl(field: FormField, disabled?: boolean) {
  const common = { placeholder: field.placeholder, disabled, ...field.props };

  switch (field.kind) {
    case 'text':
      return <Input {...common} />;
    case 'textarea':
      return <Input.TextArea {...common} />;
    case 'number':
      return <InputNumber style={{ width: '100%' }} {...common} />;
    case 'date':
      return <DatePicker style={{ width: '100%' }} {...common} />;
    case 'datetime':
      return <DatePicker showTime style={{ width: '100%' }} {...common} />;
    case 'select':
      return (
        <Select {...common} options={field.options?.map((o) => ({ label: o.label, value: o.value }))} />
      );
    case 'radio':
      return (
        <Radio.Group {...common}>
          {field.options?.map((o) => (
            <Radio key={String(o.value)} value={o.value}>{o.label}</Radio>
          ))}
        </Radio.Group>
      );
    case 'checkbox':
      return (
        <Checkbox.Group {...common} options={field.options?.map((o) => ({ label: o.label, value: o.value }))} />
      );
    case 'switch':
      return <Switch {...common} />;
    case 'rate':
      return <Rate {...common} />;
    case 'slider':
      return <Slider {...common} style={{ marginTop: 8 }} />;
    case 'upload':
      return <Upload {...common}><Input placeholder="点击上传文件" readOnly /></Upload>;
    case 'divider':
      return <Divider>{field.label !== '分割线' ? field.label : undefined}</Divider>;
    case 'richtext':
      return <Input.TextArea rows={6} {...common} />;
    default:
      return <Input {...common} />;
  }
}

export function FormFieldItem({ field, layout, disabled }: FieldRendererProps) {
  if (field.kind === 'divider') {
    return (
      <Col span={24}>
        {renderControl(field, disabled)}
      </Col>
    );
  }

  const rules = rulesToAntdRules(field.rules);

  return (
    <Col span={field.span}>
      <Form.Item
        name={field.key}
        label={field.label}
        rules={rules}
        labelCol={layout.labelAlign === 'top' ? { span: 24 } : undefined}
        wrapperCol={layout.labelAlign === 'top' ? { span: 24 } : undefined}
        valuePropName={field.kind === 'switch' ? 'checked' : 'value'}
        getValueProps={(value) => {
          if ((field.kind === 'date' || field.kind === 'datetime') && value) {
            return { value: dayjs(value as string) };
          }
          return { value };
        }}
        normalize={(value) => {
          if ((field.kind === 'date' || field.kind === 'datetime') && value) {
            return field.kind === 'date'
              ? dayjs(value).format('YYYY-MM-DD')
              : dayjs(value).format('YYYY-MM-DD HH:mm:ss');
          }
          return value;
        }}
      >
        {renderControl(field, disabled)}
      </Form.Item>
    </Col>
  );
}

interface SectionRendererProps {
  section: FormSection;
  layout: FormLayout;
  disabled?: boolean;
}

export function FormSectionRenderer({ section, layout, disabled }: SectionRendererProps) {
  return (
    <Row gutter={[16, 0]}>
      {section.fields.map((field) => (
        <FormFieldItem key={field.id} field={field} layout={layout} disabled={disabled} />
      ))}
    </Row>
  );
}

interface DynamicFormProps {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  disabled?: boolean;
  onFinish?: (values: Record<string, unknown>) => void;
  form?: FormInstance;
}

export function DynamicForm({ schema, initialValues, disabled, onFinish, form: externalForm }: DynamicFormProps) {
  const [internalForm] = Form.useForm();
  const form = externalForm ?? internalForm;
  const { layout, sections } = schema;

  return (
    <Form
      form={form}
      layout={layout.labelAlign === 'top' ? 'vertical' : 'horizontal'}
      labelAlign={layout.labelAlign === 'top' ? 'left' : layout.labelAlign}
      labelCol={layout.labelAlign !== 'top' ? { flex: `${layout.labelWidth}px` } : undefined}
      size={layout.size}
      initialValues={initialValues}
      onFinish={onFinish}
      disabled={disabled}
    >
      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: 24 }}>
          {section.title && (
            <div style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{section.title}</h3>
              {section.description && (
                <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{section.description}</p>
              )}
            </div>
          )}
          <FormSectionRenderer section={section} layout={layout} disabled={disabled} />
        </div>
      ))}
    </Form>
  );
}
