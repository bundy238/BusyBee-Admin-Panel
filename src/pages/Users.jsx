import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';
import api from '../api/client';
import './Users.css';

const roleOptions = [
  'admin',
  'specialist',
  'customer',
  'user',
  'manager',
  'moderator'
].map(r => ({ label: r, value: r }));

export default function Users() 
{
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => 
  {
    setLoading(true);

    try
    {
      const res = await api.get('/api/User/all');
      const items = res?.data?.data || res?.data || [];
      setData(items);
    }
    catch (e) 
    {
      message.error('Не удалось загрузить пользователей');
    }
    finally 
    {
      setLoading(false);
    }
  };

  useEffect(() => 
  { 
    fetchData(); 
  }, []);

  const addUser = async (values) => 
  {
    try
    {
      await api.post('/api/User', values);
      message.success('Пользователь добавлен');

      setOpen(false);
      form.resetFields();
      fetchData();
    }
    catch (e) 
    {
      message.error('Ошибка добавления');
    }
  };

  const updateUser = async (row) => 
  {
    try
    {
      await api.put('/api/User', row);
      message.success('Сохранено');
      fetchData();
    }
    catch (e) 
    {
      message.error('Ошибка сохранения');
    }
  };

  const deleteUser = async (row) => 
  {
    Modal.confirm(
    {
      title: 'Удалить пользователя?',
      onOk: async () => 
      {
        try
        {
          await api.delete(`/api/User/delete/${row.id || row.userId || row.email}`);
          message.success('Удалено');
          fetchData();
        }
        catch (e) 
        {
          message.error('Ошибка удаления');
        }
      }
    });
  };

  const changeRole = async (row, newRole) => 
  {
    try
    {
      await api.post(`/api/User/change-role/${row.id}?newUserRole=${encodeURIComponent(newRole)}`);
      message.success('Роль изменена');
      fetchData();
    }
    catch (e) 
    {
      message.error('Ошибка изменения роли');
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id' 
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (t, r) => (
        <Input 
          defaultValue={t} 
          onBlur={e => updateUser({ ...r, email: e.target.value })} 
        />
      )
    },
    {
      title: 'Имя',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (t, r) => (
        <Input 
          defaultValue={t} 
          onBlur={e => updateUser({ ...r, fullName: e.target.value })} 
        />
      )
    },
    {
      title: 'Телефон',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (t, r) => (
        <Input 
          defaultValue={t} 
          onBlur={e => updateUser({ ...r, phoneNumber: e.target.value })} 
        />
      )
    },
    {
      title: 'Роль',
      key: 'role',
      render: (_, r) => (
        <Space>
          <Select
            className="role-select"
            options={roleOptions}
            placeholder="Роль"
            onChange={(v) => changeRole(r, v)}
          />
        </Space>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Button danger onClick={() => deleteUser(r)}>
            Удалить
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="users-page">
      <Space className="users-actions">
        <Button type="primary" onClick={() => setOpen(true)}>
          Добавить
        </Button>

        <Button onClick={fetchData}>
          Обновить
        </Button>
      </Space>

      <Table
        rowKey={(r) => r.id || r.email}
        dataSource={data}
        columns={columns}
        loading={loading}
      />

      <Modal
        title="Добавить пользователя"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={addUser}>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="userName" 
            label="Логин" 
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="fullName" 
            label="Полное имя"
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="phoneNumber" 
            label="Телефон"
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="password" 
            label="Пароль" 
            rules={[{ required: true, min: 3 }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
