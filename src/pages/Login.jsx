import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import api from '../api/client';
import logo from '../assets/logo.svg';
import './Login.css';

export default function Login() 
{
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => 
  {
    try
    {
      setLoading(true);
      const res = await api.post('/api/Auth/login', values);
      const token = res?.data?.data;

      if (!token) 
      {
        throw new Error('Токен не получен');
      }

      localStorage.setItem('token', token);
      window.location.href = '/';
    }
    catch (e) 
    {
      console.error(e);
      message.error('Ошибка входа');
    }
    finally 
    {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Логотип" />
        </div>

        <h3 className="login-title">
          Administration login
        </h3>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true, message: 'Введите email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="password" 
            label="Пароль" 
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
