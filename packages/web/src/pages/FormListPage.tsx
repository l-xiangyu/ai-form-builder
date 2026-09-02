import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Space, Tag, Input, Modal, Form, message, Popconfirm, Typography,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  FormOutlined, EyeOutlined,
} from '@ant-design/icons';
import { formApi } from '@/api/form-api';
import type { FormDefinition } from '@/types/form';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function FormListPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await formApi.list({ keyword, page, pageSize: 10 });
      if (res.data.success && res.data.data) {
        setForms(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, [keyword, page]);

  const handleCreate = async () => {
    const values = await createForm.validateFields();
    const res = await formApi.create(values);
    if (res.data.success && res.data.data) {
      message.success('创建成功');
      setCreateOpen(false);
      createForm.resetFields();
      navigate(`/designer/${res.data.data.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    await formApi.remove(id);
    message.success('删除成功');
    fetchForms();
  };

  const handleDuplicate = async (id: string) => {
    const res = await formApi.duplicate(id);
    if (res.data.success) {
      message.success('复制成功');
      fetchForms();
    }
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'green', text: '已发布' },
    archived: { color: 'orange', text: '已归档' },
  };

  const columns = [
    {
      title: '表单名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: FormDefinition) => (
        <Space>
          <FormOutlined style={{ color: '#1677ff' }} />
          <a onClick={() => navigate(`/designer/${record.id}`)}>{text}</a>
        </Space>
      ),
    },
    { title: '编码', dataIndex: 'code', key: 'code', width: 180 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (v: number) => `v${v}`,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_: unknown, record: FormDefinition) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}
            onClick={() => navigate(`/designer/${record.id}`)}>
            设计
          </Button>
          {record.status === 'published' && (
            <Button type="link" size="small" icon={<EyeOutlined />}
              onClick={() => navigate(`/runtime/${record.code}`)}>
              填写
            </Button>
          )}
          <Button type="link" size="small" icon={<CopyOutlined />}
            onClick={() => handleDuplicate(record.id)}>
            复制
          </Button>
          <Popconfirm title="确定删除此表单？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>表单管理</Title>
        <Space>
          <Input.Search
            placeholder="搜索表单名称或编码"
            allowClear
            onSearch={setKeyword}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            新建表单
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={forms}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      <Modal
        title="新建表单"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="title" label="表单名称"
            rules={[{ required: true, message: '请输入表单名称' }]}
          >
            <Input placeholder="例如：员工信息登记表" />
          </Form.Item>
          <Form.Item
            name="code" label="表单编码"
            rules={[
              { required: true, message: '请输入表单编码' },
              { pattern: /^[a-z][a-z0-9_]*$/, message: '小写字母开头，仅含字母数字下划线' },
            ]}
          >
            <Input placeholder="例如：employee_registration" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="表单用途说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
