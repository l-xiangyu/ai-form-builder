import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Space, message, Popconfirm, Typography, Tag } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { formApi } from '@/api/form-api';
import type { FormDefinition, FormSubmission } from '@/types/form';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function SubmissionListPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!formId) return;
    formApi.getById(formId).then((res) => {
      if (res.data.success && res.data.data) setForm(res.data.data);
    });
  }, [formId]);

  const fetchSubmissions = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const res = await formApi.getSubmissions(formId, { page, pageSize: 10 });
      if (res.data.success && res.data.data) {
        setSubmissions(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, [formId, page]);

  const handleDelete = async (id: string) => {
    await formApi.removeSubmission(id);
    message.success('删除成功');
    fetchSubmissions();
  };

  if (!form) return null;

  const columns = [
    ...form.listConfig.columns.map((col) => ({
      title: col.title,
      key: col.fieldKey,
      render: (_: unknown, record: FormSubmission) => {
        const val = record.data[col.fieldKey];
        if (Array.isArray(val)) return val.join(', ');
        return val != null ? String(val) : '-';
      },
    })),
    {
      title: '提交时间',
      key: 'createdAt',
      width: 180,
      render: (_: unknown, record: FormSubmission) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: FormSubmission) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} />
        <Title level={3} style={{ margin: 0 }}>{form.title} - 提交数据</Title>
        <Tag>{total} 条记录</Tag>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={submissions}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  );
}
