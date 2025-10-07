import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import api from '../api/client';
import './Categories.css';

export default function Categories() 
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
      const res = await api.get('/api/Category/all');
      const items = res?.data?.data || res?.data || [];
      setData(items);
    }
    catch (e) 
    {
      message.error('Не удалось загрузить категории');
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

  const add = async (values) => 
  {
    try
    {
      await api.post('/api/Category/add', values);
      message.success('Добавлено');

      setOpen(false);
      form.resetFields();
      fetchData();
    }
    catch (e) 
    {
      message.error('Ошибка добавления');
    }
  };

  const update = async (row) => 
  {
    try
    {
      await api.put(
        `/api/Category/update/${row.id}`, 
        { id: row.id, name: row.name }
      );

      message.success('Сохранено');
    }
    catch (e) 
    {
      message.error('Ошибка сохранения');
    }
  };

  const remove = async (row) => 
  {
    Modal.confirm(
    {
      title: 'Удалить категорию?',
      onOk: async () => 
      {
        try
        {
          await api.delete(`/api/Category/${row.id}`);
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

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id' 
    },
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
      title: 'Действия',
      render: (_, r) => (
        <Button danger onClick={() => remove(r)}>
          Удалить
        </Button>
      )
    }
  ];

  return (
    <div className="categories-page">
      <Space className="categories-actions">
        <Button type="primary" onClick={() => setOpen(true)}>
          Добавить
        </Button>

        <Button onClick={fetchData}>
          Обновить
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title="Новая категория"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={add}>
          <Form.Item 
            name="name" 
            label="Название" 
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
