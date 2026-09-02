import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Tag, message, Modal } from 'antd';
import {
  SaveOutlined, RocketOutlined, EyeOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useDesignerStore } from '@/stores/designer-store';
import { FieldPalette } from '@/components/designer/FieldPalette';
import { DesignerCanvas } from '@/components/designer/DesignerCanvas';
import { PropertyPanel } from '@/components/designer/PropertyPanel';
import { DynamicForm } from '@/components/renderer/DynamicForm';

const { Header, Sider, Content } = Layout;

export default function DesignerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    form, isDirty, isSaving, previewMode,
    loadForm, resetDesigner, setPreviewMode, save, publish,
  } = useDesignerStore();

  useEffect(() => {
    if (id) loadForm(id);
    return () => resetDesigner();
  }, [id, loadForm, resetDesigner]);

  const handleSave = async () => {
    const ok = await save();
    if (ok) message.success('保存成功');
    else message.error('保存失败');
  };

  const handlePublish = async () => {
    Modal.confirm({
      title: '确认发布',
      content: '发布后表单将可以被用户填写，确定发布吗？',
      onOk: async () => {
        const ok = await publish();
        if (ok) message.success('发布成功');
        else message.error('发布失败，请先保存');
      },
    });
  };

  if (!form) return null;

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'green', text: '已发布' },
    archived: { color: 'orange', text: '已归档' },
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 16px', height: 48,
      }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} />
          <span style={{ fontWeight: 600 }}>{form.title}</span>
          <Tag color={statusMap[form.status]?.color}>{statusMap[form.status]?.text}</Tag>
          {isDirty && <Tag color="orange">未保存</Tag>}
        </Space>
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? '编辑' : '预览'}
          </Button>
          <Button icon={<SaveOutlined />} loading={isSaving} onClick={handleSave}>
            保存
          </Button>
          <Button type="primary" icon={<RocketOutlined />} onClick={handlePublish}>
            发布
          </Button>
        </Space>
      </Header>

      {previewMode ? (
        <Content style={{ padding: 24, overflow: 'auto', background: '#f5f5f5' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8 }}>
            <DynamicForm schema={form.schema} />
          </div>
        </Content>
      ) : (
        <Layout>
          <Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
            <FieldPalette />
          </Sider>
          <Content style={{ overflow: 'auto' }}>
            <DesignerCanvas />
          </Content>
          <Sider width={280} theme="light" style={{ borderLeft: '1px solid #f0f0f0' }}>
            <PropertyPanel />
          </Sider>
        </Layout>
      )}
    </Layout>
  );
}
