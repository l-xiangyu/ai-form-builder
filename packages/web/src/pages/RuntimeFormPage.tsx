import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin, Result } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { formApi } from '@/api/form-api';
import { DynamicForm } from '@/components/renderer/DynamicForm';
import type { RuntimeFormSchema } from '@/types/form';
import { Form } from 'antd';

export default function RuntimeFormPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [schema, setSchema] = useState<RuntimeFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    formApi.getRuntimeSchema(code).then((res) => {
      if (res.data.success && res.data.data) {
        setSchema(res.data.data);
      }
    }).finally(() => setLoading(false));
  }, [code]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!code) return;
    setSubmitting(true);
    try {
      const res = await formApi.submit(code, values);
      if (res.data.success) {
        setSubmitted(true);
        message.success('提交成功');
      } else {
        message.error(res.data.message ?? '提交失败');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; details?: string[] } } };
      const details = error.response?.data?.details;
      message.error(details?.join('; ') ?? error.response?.data?.message ?? '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  if (!schema) {
    return (
      <Result status="404" title="表单不存在" subTitle="请检查表单编码是否正确，或表单是否已发布" />
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto' }}>
        <Result
          status="success"
          title="提交成功"
          subTitle="您的表单已成功提交"
          extra={[
            <Button key="back" onClick={() => navigate('/')}>返回列表</Button>,
            <Button key="again" type="primary" onClick={() => { setSubmitted(false); form.resetFields(); }}>
              再次填写
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Card title={schema.title}>
        <DynamicForm
          schema={schema.schema}
          form={form}
          onFinish={handleSubmit}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" size="large" icon={<SendOutlined />}
            loading={submitting} onClick={() => form.submit()}>
            提交
          </Button>
        </div>
      </Card>
    </div>
  );
}
