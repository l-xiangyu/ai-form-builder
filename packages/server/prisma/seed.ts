import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const demoSchema = {
    sections: [
      {
        id: nanoid(),
        title: '基本信息',
        description: '请填写基本联系信息',
        collapsible: false,
        defaultExpanded: true,
        fields: [
          {
            id: nanoid(),
            key: 'full_name',
            kind: 'text',
            label: '姓名',
            placeholder: '请输入姓名',
            span: 12,
            rules: [{ type: 'required', message: '姓名不能为空' }],
            props: { maxLength: 50 },
          },
          {
            id: nanoid(),
            key: 'email',
            kind: 'text',
            label: '邮箱',
            placeholder: '请输入邮箱地址',
            span: 12,
            rules: [
              { type: 'required', message: '邮箱不能为空' },
              { type: 'email', message: '邮箱格式不正确' },
            ],
            props: {},
          },
          {
            id: nanoid(),
            key: 'phone',
            kind: 'text',
            label: '手机号',
            placeholder: '请输入手机号',
            span: 12,
            rules: [{ type: 'phone', message: '手机号格式不正确' }],
            props: {},
          },
          {
            id: nanoid(),
            key: 'gender',
            kind: 'radio',
            label: '性别',
            span: 12,
            rules: [],
            props: {},
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
              { label: '其他', value: 'other' },
            ],
          },
        ],
      },
      {
        id: nanoid(),
        title: '详细信息',
        collapsible: true,
        defaultExpanded: true,
        fields: [
          {
            id: nanoid(),
            key: 'department',
            kind: 'select',
            label: '部门',
            span: 12,
            rules: [{ type: 'required', message: '请选择部门' }],
            props: { allowClear: true },
            options: [
              { label: '技术部', value: 'tech' },
              { label: '产品部', value: 'product' },
              { label: '设计部', value: 'design' },
              { label: '市场部', value: 'marketing' },
            ],
          },
          {
            id: nanoid(),
            key: 'join_date',
            kind: 'date',
            label: '入职日期',
            span: 12,
            rules: [],
            props: {},
          },
          {
            id: nanoid(),
            key: 'salary',
            kind: 'number',
            label: '期望薪资',
            span: 12,
            rules: [{ type: 'min', value: 0, message: '薪资不能为负数' }],
            props: { min: 0, step: 1000, addonAfter: '元' },
          },
          {
            id: nanoid(),
            key: 'skills',
            kind: 'checkbox',
            label: '技能',
            span: 24,
            rules: [],
            props: {},
            options: [
              { label: 'JavaScript', value: 'js' },
              { label: 'TypeScript', value: 'ts' },
              { label: 'React', value: 'react' },
              { label: 'Vue', value: 'vue' },
              { label: 'Node.js', value: 'node' },
            ],
          },
          {
            id: nanoid(),
            key: 'bio',
            kind: 'textarea',
            label: '个人简介',
            placeholder: '请简要介绍自己',
            span: 24,
            rules: [{ type: 'maxLength', value: 500, message: '简介不能超过500字' }],
            props: { rows: 4, showCount: true, maxLength: 500 },
          },
          {
            id: nanoid(),
            key: 'is_remote',
            kind: 'switch',
            label: '接受远程办公',
            span: 12,
            rules: [],
            props: { checkedChildren: '是', unCheckedChildren: '否' },
            defaultValue: false,
          },
          {
            id: nanoid(),
            key: 'satisfaction',
            kind: 'rate',
            label: '满意度',
            span: 12,
            rules: [],
            props: { allowHalf: true },
          },
        ],
      },
    ],
    layout: {
      labelAlign: 'right' as const,
      labelWidth: 120,
      size: 'middle' as const,
      columns: 2 as const,
    },
  };

  const listConfig = {
    columns: [
      { fieldKey: 'full_name', title: '姓名', searchable: true },
      { fieldKey: 'email', title: '邮箱', searchable: true },
      { fieldKey: 'phone', title: '手机号' },
      { fieldKey: 'department', title: '部门', searchable: true },
      { fieldKey: 'join_date', title: '入职日期', sortable: true },
    ],
    pageSize: 20,
  };

  await prisma.formDefinition.upsert({
    where: { code: 'employee_registration' },
    update: {},
    create: {
      code: 'employee_registration',
      title: '员工信息登记表',
      description: '用于收集新员工基本信息的表单',
      status: 'published',
      schema: JSON.stringify(demoSchema),
      listConfig: JSON.stringify(listConfig),
    },
  });

  console.log('✅ Seed data created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
