import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message, Select } from "antd";
import api from "../api/client";

export default function Works() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]); // для пошуку
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchCats = async () => {
    try {
      const res = await api.get("/api/Category/all");
      const list = res?.data?.data || res?.data || [];
      setCats(list.map((c) => ({ label: c.name, value: Number(c.id) })));
    } catch {
      message.error("Не вдалося завантажити категорії");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/Work/all");
      const list = res?.data?.data || res?.data || [];
      setData(list);
      setFiltered(list); // копія для пошуку
    } catch {
      message.error("Не вдалося завантажити роботи");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
    fetchData();
  }, []);

  const handleSearch = (value) => {
    const query = value.toLowerCase();
    const result = data.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
    );
    setFiltered(result);
  };

  const addWork = async (values) => {
    try {
      const payload = {
        id: 0,
        name: values.name?.trim(),
        description: values.description?.trim() || "",
        workCategory: { id: Number(values.categoryId) },
      };

      await api.post("/api/Work", payload, {
        params: { categoryId: Number(values.categoryId) },
        headers: { "Content-Type": "application/json" },
      });

      message.success("Роботу додано");
      form.resetFields();
      setOpen(false);
      fetchData();
    } catch (e) {
      const msg =
        e?.response?.data?.status?.message ||
        e?.response?.data?.message ||
        (e?.response?.status === 401 || e?.response?.status === 403
          ? "Немає прав (потрібна роль Адмін)"
          : "Помилка при додаванні роботи");
      message.error(msg);
      console.error("POST /api/Work error:", e?.response?.data || e);
    }
  };

  const updateWork = async (row) => {
    try {
      const payload = {
        id: row.id,
        name: row.name?.trim(),
        description: row.description?.trim() || "",
        workCategory: row.workCategory
          ? { id: Number(row.workCategory.id) }
          : { id: row.categoryId || 0 },
      };

      await api.put(`/api/Work/update/${row.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      message.success("Роботу оновлено");
      fetchData();
    } catch (e) {
      const msg =
        e?.response?.data?.status?.message ||
        (e?.response?.status === 401 || e?.response?.status === 403
          ? "Немає прав (потрібна роль Адмін)"
          : "Помилка при оновленні роботи");
      message.error(msg);
      console.error("PUT /api/Work error:", e?.response?.data || e);
    }
  };

  const deleteWork = (row) => {
    Modal.confirm({
      title: "Видалити роботу?",
      onOk: async () => {
        try {
          await api.delete(`/api/Work/delete/${row.id}`);
          message.success("Роботу видалено");
          fetchData();
        } catch (e) {
          const msg =
            e?.response?.data?.status?.message ||
            (e?.response?.status === 401 || e?.response?.status === 403
              ? "Немає прав (потрібна роль Адмін)"
              : "Не вдалося видалити");
          message.error(msg);
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 90 },
    {
      title: "Назва",
      dataIndex: "name",
      key: "name",
      render: (t, r) => (
        <Input
          defaultValue={t}
          onBlur={(e) => updateWork({ ...r, name: e.target.value })}
        />
      ),
    },
    {
      title: "Опис",
      dataIndex: "description",
      key: "description",
      render: (t, r) => (
        <Input
          defaultValue={t}
          onBlur={(e) => updateWork({ ...r, description: e.target.value })}
        />
      ),
    },
    {
      title: "Дії",
      key: "actions",
      render: (_, row) => (
        <Space>
          <Button danger onClick={() => deleteWork(row)}>
            Видалити
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Додати роботу
        </Button>
        <Button onClick={fetchData}>Оновити</Button>
        <Input.Search
          placeholder="Пошук роботи..."
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />
      </Space>

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Додати роботу"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={addWork}>
          <Form.Item
            name="name"
            label="Назва"
            rules={[{ required: true, message: "Вкажіть назву" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Опис">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Категорія"
            rules={[{ required: true, message: "Оберіть категорію" }]}
          >
            <Select options={cats} placeholder="Оберіть категорію" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
