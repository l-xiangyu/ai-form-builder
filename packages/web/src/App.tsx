import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import FormListPage from '@/pages/FormListPage';
import DesignerPage from '@/pages/DesignerPage';
import RuntimeFormPage from '@/pages/RuntimeFormPage';
import SubmissionListPage from '@/pages/SubmissionListPage';

const { Header, Content } = Layout;

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', padding: '0 24px',
        background: '#001529', color: '#fff',
      }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          AI Form Builder
        </div>
        <span style={{ marginLeft: 12, fontSize: 13, opacity: 0.65 }}>
          低代码表单配置平台
        </span>
      </Header>
      <Content>{children}</Content>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/designer/:id" element={<DesignerPage />} />
          <Route path="/runtime/:code" element={<RuntimeFormPage />} />
          <Route path="/" element={<AppLayout><FormListPage /></AppLayout>} />
          <Route path="/submissions/:formId" element={<AppLayout><SubmissionListPage /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
