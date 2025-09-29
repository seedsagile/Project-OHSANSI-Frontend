import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el login');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-neutro-800 text-center">Oh! SanSi - Evaluador</h2>
      <p className="text-center text-neutro-600 mb-4">Acceso exclusivo para evaluadores</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-acento-100 border border-acento-500 text-acento-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-md font-medium text-neutro-600 mb-1">
            Correo institucional
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="usuario@uno.com"
            value={credentials.email}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${error ? 'border-acento-500' : 'border-neutro-300'}`}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-md font-medium text-neutro-600 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            value={credentials.password}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-principal-500 focus:border-principal-500 transition-colors ${error ? 'border-acento-500' : 'border-neutro-300'}`}
          />
        </div>
        <Button
          type="submit"
          loading={loading}
          className="w-full py-3 px-4 text-sm font-medium rounded-lg text-white bg-principal-600 hover:bg-principal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-principal-500"
        >
          Iniciar Sesión
        </Button>
      </form>
    </div>
  );
};