import { Card, Typography, Space } from 'antd';
import { FIELD_REGISTRY } from '@/registry/field-registry';
import { useDesignerStore } from '@/stores/designer-store';
import type { FieldKind } from '@/types/form';

const { Text } = Typography;

const categories = [
  { key: 'basic', label: '基础字段' },
  { key: 'advanced', label: '高级字段' },
  { key: 'layout', label: '布局组件' },
] as const;

export function FieldPalette() {
  const { activeSectionId, addField, form } = useDesignerStore();

  const handleAdd = (kind: FieldKind) => {
    const sectionId = activeSectionId ?? form?.schema.sections[0]?.id;
    if (!sectionId) return;
    addField(sectionId, kind);
  };

  return (
    <div style={{ padding: 12, height: '100%', overflow: 'auto' }}>
      <Text strong style={{ display: 'block', marginBottom: 12 }}>字段组件</Text>

      {categories.map((cat) => {
        const fields = FIELD_REGISTRY.filter((f) => f.category === cat.key);
        if (fields.length === 0) return null;

        return (
          <div key={cat.key} style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {cat.label}
            </Text>
            <Space wrap size={[8, 8]}>
              {fields.map((field) => (
                <Card
                  key={field.kind}
                  size="small"
                  hoverable
                  style={{ width: 100, textAlign: 'center', cursor: 'pointer' }}
                  styles={{ body: { padding: '8px 4px' } }}
                  onClick={() => handleAdd(field.kind)}
                >
                  <div style={{ fontSize: 18, color: '#1677ff', marginBottom: 4 }}>{field.icon}</div>
                  <Text style={{ fontSize: 11 }}>{field.label}</Text>
                </Card>
              ))}
            </Space>
          </div>
        );
      })}
    </div>
  );
}
