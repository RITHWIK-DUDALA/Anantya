import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import VerifyPage from './pages/VerifyPage';
import RegistrationFormPage from './pages/RegistrationFormPage';
import MemoriesPage from './pages/MemoriesPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/games/:id" element={<GamePage />} />
      <Route path="/form" element={<RegistrationFormPage />} />
      <Route path="/memories" element={<MemoriesPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/admin/payments" element={<AdminPaymentsPage />} />
      <Route path="/status" element={<StatusPage />} />
    </Routes>
  );
}
