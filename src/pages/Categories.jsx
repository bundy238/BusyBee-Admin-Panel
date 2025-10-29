import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import api from '../api/client';
import './Categories.css';

export default function Categories() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]); // данные после фильтрации
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/Category/all');
      const items = res?.data?.data || res?.data || [];
      setData(items);
      setFiltered(items); // копируем для поиска
    } catch (e) {
      message.error('Не вдалося завантажити категорії');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (value) => {
    const query = value.toLowerCase();
    const result = data.filter((item) => item.name.toLowerCase().includes(query));
    setFiltered(result);
  };

  const add = async (values) => {
    try {
      await api.post('/api/Category/add', values);
      message.success('Категорію додано');
      setOpen(false);
      form.resetFields();
      fetchData();
    } catch (e) {
      message.error('Помилка при додаванні');
    }
  };

  const update = async (row) => {
    try {
      await api.put(`/api/Category/update/${row.id}`, {
        id: row.id,
        name: row.name,
      });
      message.success('Збережено');
    } catch (e) {
      message.error('Помилка при збереженні');
    }
  };

  const remove = async (row) => {
    Modal.confirm({
      title: 'Видалити категорію?',
      onOk: async () => {
        try {
          await api.delete(`/api/Category/${row.id}`);
          message.success('Категорію видалено');
          fetchData();
        } catch (e) {
          message.error('Помилка при видаленні');
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: 'Назва',
      dataIndex: 'name',
      render: (t, r) => (
        <Input defaultValue={t} onBlur={(e) => update({ ...r, name: e.target.value })} />
      ),
    },
    {
      title: 'Дії',
      render: (_, r) => (
        <Button danger onClick={() => remove(r)}>
          Видалити
        </Button>
      ),
    },
  ];

  return (
    <div className="categories-page">
      <Space className="categories-actions" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Додати
        </Button>
        <Button onClick={fetchData}>Оновити</Button>
        <Input.Search
          placeholder="Пошук категорії..."
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
      </Space>

      <Table rowKey="id" columns={columns} dataSource={filtered} loading={loading} />

      <Modal
        title="Нова категорія"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={add}>
          <Form.Item name="name" label="Назва" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
