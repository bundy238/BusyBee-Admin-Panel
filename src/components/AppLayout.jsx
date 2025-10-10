import { Layout, Menu, Button } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AppLayout.css";

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const selected = location.pathname;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Layout className="app-layout">
      <Sider breakpoint="lg">
        <div className="logo">BusyBee Admin Panel</div>

        <Menu theme="dark" mode="inline" selectedKeys={[selected]}>
          <Menu.Item key="/users">
            <div className="text-panel">
              <Link to="/users">Користувачі</Link>
            </div>
          </Menu.Item>
          <Menu.Item key="/categories">
            <div className="text-panel">
              <Link to="/categories">Категорії</Link>
            </div>
          </Menu.Item>
          <Menu.Item key="/works">
            <div className="text-panel">
              <Link to="/works">Роботи</Link>
            </div>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="app-header">
          <Button className="outButton" onClick={logout}>Вийти</Button>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
