import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import App from './App'
import Login from './pages/Login'
import Users from './pages/Users'
import Categories from './pages/Categories'
import Works from './pages/Works'
import ProtectedRoute from './components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>}>
          <Route index element={<Navigate to="/users" />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="works" element={<Works />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
