import { Card, Button, Space, Typography, Empty, Tag } from 'antd';
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField, FormSection } from '@/types/form';
import { getFieldMeta } from '@/registry/field-registry';
import { useDesignerStore } from '@/stores/designer-store';

const { Text } = Typography;

interface SortableFieldProps {
  field: FormField;
  sectionId: string;
  isActive: boolean;
}

function SortableField({ field, sectionId, isActive }: SortableFieldProps) {
  const { setActiveField, removeField } = useDesignerStore();
  const meta = getFieldMeta(field.kind);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '8px 12px',
        marginBottom: 4,
        border: isActive ? '2px solid #1677ff' : '1px solid #e8e8e8',
        borderRadius: 6,
        background: isActive ? '#e6f4ff' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
      onClick={() => setActiveField(sectionId, field.id)}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab', color: '#bbb' }}>
        <HolderOutlined />
      </span>
      <span style={{ color: '#1677ff' }}>{meta?.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ fontSize: 13 }}>{field.label}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>{field.key} · {meta?.label}</Text>
      </div>
      {field.rules.some((r) => r.type === 'required') && <Tag color="red" style={{ fontSize: 10 }}>必填</Tag>}
      <Text type="secondary" style={{ fontSize: 11 }}>{field.span}/24</Text>
      <Button
        type="text" size="small" danger icon={<DeleteOutlined />}
        onClick={(e) => { e.stopPropagation(); removeField(sectionId, field.id); }}
      />
    </div>
  );
}

interface CanvasSectionProps {
  section: FormSection;
  isActive: boolean;
}

function CanvasSection({ section, isActive }: CanvasSectionProps) {
  const { activeFieldId, setActiveSection, removeSection, reorderFields } = useDesignerStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.fields.findIndex((f) => f.id === active.id);
    const newIndex = section.fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderFields(section.id, oldIndex, newIndex);
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <span>{section.title}</span>
          {section.collapsible && <Tag>可折叠</Tag>}
        </Space>
      }
      extra={
        <Button type="text" size="small" danger icon={<DeleteOutlined />}
          onClick={() => removeSection(section.id)} />
      }
      style={{
        marginBottom: 12,
        border: isActive ? '2px solid #1677ff' : undefined,
      }}
      onClick={() => setActiveSection(section.id)}
    >
      {section.description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
          {section.description}
        </Text>
      )}

      {section.fields.length === 0 ? (
        <Empty description="从左侧拖拽或点击添加字段" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={section.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {section.fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                sectionId={section.id}
                isActive={activeFieldId === field.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}

export function DesignerCanvas() {
  const { form, activeSectionId, addSection } = useDesignerStore();

  if (!form) return null;

  return (
    <div style={{ padding: 16, background: '#f5f5f5', minHeight: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{form.title}</Typography.Title>
          {form.description && <Text type="secondary">{form.description}</Text>}
        </div>

        {form.schema.sections.map((section) => (
          <CanvasSection
            key={section.id}
            section={section}
            isActive={activeSectionId === section.id}
          />
        ))}

        <Button type="dashed" block onClick={() => addSection()}>
          + 添加分组
        </Button>
      </div>
    </div>
  );
}
