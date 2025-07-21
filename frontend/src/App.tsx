import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';

// ✅ Компонент Layout с Sidebar и Header
function MainLayout() {
  return (
    <div className="flex">
      {/* Тут можно Sidebar + Header */}
      <div className="flex-1 p-4">
        <Outlet /> {/* Показывает вложенные страницы */}
      </div>
    </div>
  );
}

// ✅ Защищённый маршрут
function ProtectedRoute() {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Страница логина */}
      <Route path="/login" element={<Login />} />

      {/* Защищённые маршруты */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Редирект на / если неизвестный маршрут */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
