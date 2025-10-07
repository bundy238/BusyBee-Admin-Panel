import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';
import api from '../api/client';
import './Works.css';

export default function Works() {
  const [data, setData] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCats = async () => {
    try {
      const res = await api.get('/api/Category/all');
      setCats((res?.data?.data || res?.data || []).map(c => ({
        label: c.name, value: c.id
      })));
    } catch {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/Work/all');
      setData(res?.data?.data || res?.data || []);
    } catch {
      message.error('Не удалось загрузить работы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
    fetchData();
  }, []);

  const add = async (values) => {
    try {
      const { categoryId, name, description } = values;
      await api.post(`/api/Work?categoryId=${categoryId}`, { name, description });
      message.success('Добавлено');
      setOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      message.error('Ошибка добавления');
    }
  };

  const update = async (row) => {
    try {
      await api.put(`/api/Work/update/${row.id}`, {
        id: row.id,
        name: row.name,
        description: row.description,
        workCategory: row.workCategory,
      });
      message.success('Сохранено');
    } catch {
      message.error('Ошибка сохранения');
    }
  };

  const remove = (row) => {
    Modal.confirm({
      title: 'Удалить работу?',
      onOk: async () => {
        try {
          await api.delete(`/api/Work/delete/${row.id}`);
          message.success('Удалено');
          fetchData();
        } catch {
          message.error('Ошибка удаления');
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    {
      title: 'Название',
      dataIndex: 'name',
      render: (t, r) => (
        <Input
          defaultValue={t}
          onBlur={e => update({ ...r, name: e.target.value })}
        />
      )
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (t, r) => (
        <Input
          defaultValue={t}
          onBlur={e => update({ ...r, description: e.target.value })}
        />
      )
    },
    {
      title: 'Категория',
      dataIndex: ['workCategory', 'name'],
      render: (t, r) => (
        <Select
          className="works-select"
          defaultValue={r.workCategory?.id}
          options={cats}
          onChange={(v) =>
            update({
              ...r,
              workCategory: {
                id: v,
                name: cats.find(c => c.value === v)?.label,
              },
            })
          }
        />
      )
    },
    {
      title: 'Действия',
      render: (_, r) => (
        <Button danger onClick={() => remove(r)}>
          Удалить
        </Button>
      )
    }
  ];

  return (
    <div className="works-page">
      <Space className="works-toolbar">
        <Button type="primary" onClick={() => setOpen(true)}>Добавить</Button>
        <Button onClick={fetchData}>Обновить</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title="Новая работа"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={add}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="Категория" rules={[{ required: true }]}>
            <Select options={cats} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
