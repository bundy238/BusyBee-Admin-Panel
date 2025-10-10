import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message, Select } from "antd";
import api from "../api/client";
import "./Users.css";

const roleOptions = [
  { label: "Замовник", value: "customer" },
  { label: "Виконавець", value: "specialist" },
  { label: "Адмін", value: "admin" }
];

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/User/all");
      const items = res?.data?.data || res?.data || [];
      setData(items);
    } catch {
      message.error("Не вдалося завантажити користувачів");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addUser = async (values) => {
    try {
      await api.post("/api/Auth/signup", values);
      message.success("Користувача додано");
      setOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      message.error("Помилка при додаванні (перевірте дані)");
    }
  };

  const updateUser = async (row) => {
    try {
      const payload = {
        id: row.id,
        userName: row.userName,
        email: row.email,
        fullName: row.fullName,
        phoneNumber: row.phoneNumber,
        userRoles: row.userRoles || []   
      };

      await api.put(`/api/User/update/${row.id}`, payload);
      message.success("Збережено");
      fetchData();
    } catch {
      message.error("Помилка при збереженні");
    }
  };

  const deleteUser = async (row) => {
    Modal.confirm({
      title: "Видалити користувача?",
      onOk: async () => {
        try {
          await api.delete(`/api/User/delete/${row.id}`);
          message.success("Користувача видалено");
          fetchData();
        } catch {
          message.error("Помилка при видаленні");
        }
      }
    });
  };

  const changeRole = async (row, newRole) => {
    try {
      await api.post(`/api/User/change-role/${row.id}?newUserRole=${encodeURIComponent(newRole)}`);
      message.success("Роль змінено");
      fetchData();
    } catch {
      message.error("Помилка при зміні ролі");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { 
      title: "Логін",
      dataIndex: "userName",
      key: "userName",
      render: (t, r) => (
        <Input defaultValue={t} onBlur={(e) => updateUser({ ...r, userName: e.target.value })} />
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (t, r) => (
        <Input defaultValue={t} onBlur={(e) => updateUser({ ...r, email: e.target.value })} />
      )
    },
    {
      title: "Повне ім’я",
      dataIndex: "fullName",
      key: "fullName",
      render: (t, r) => (
        <Input defaultValue={t} onBlur={(e) => updateUser({ ...r, fullName: e.target.value })} />
      )
    },
    {
      title: "Телефон",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (t, r) => (
        <Input defaultValue={t} onBlur={(e) => updateUser({ ...r, phoneNumber: e.target.value })} />
      )
    },
    {
      title: "Роль",
      key: "role",
      render: (_, r) => (
        <Select
          className="role-select"
          options={roleOptions}
          value={r.userRoles?.[0]?.toLowerCase()}
          onChange={(v) => changeRole(r, v)}
        />
      )
    },
    {
      title: "Дії",
      key: "actions",
      render: (_, r) => (
        <Button danger onClick={() => deleteUser(r)}>Видалити</Button>
      )
    }
  ];

  return (
    <div className="users-page">
      <Space className="users-actions">
        <Button type="primary" onClick={() => setOpen(true)}>Додати</Button>
        <Button onClick={fetchData}>Оновити</Button>
      </Space>

      <Table
        rowKey={(r) => r.id || r.email}
        dataSource={data}
        columns={columns}
        loading={loading}
      />

      <Modal
        title="Додати користувача"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={addUser}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="userName" label="Логін" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="fullName" label="Повне ім’я" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phoneNumber" label="Телефон"><Input /></Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 3 }]}><Input.Password /></Form.Item>
          <Form.Item name="userRole" label="Роль" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
