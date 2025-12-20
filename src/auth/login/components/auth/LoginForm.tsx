import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Debe ser un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setApiError('');
    setLoading(true);
    try {
      const { user, token } = await authService.login(data);
      
      setUser(user);
      setToken(token);

      if (user?.id_usuario) {
        localStorage.setItem('id_responsable', user.id_usuario.toString());
        console.log('ID responsable guardado:', user.id_usuario);
      } else {
        console.warn('No se recibió id_usuario del backend');
      }

      navigate('/dashboard', { replace: true });

    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401 || err.response?.status === 404) {
          setApiError('Correo o contraseña incorrectos.');
        } else if (err.response?.data?.message) {
          setApiError(err.response.data.message);
        } else {
          setApiError('Error de conexión. Inténtalo más tarde.');
        }
      } else {
        setApiError('Ocurrió un error inesperado.');
      }
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutro-100 p-4 font-display">
      <div className="w-full max-w-md p-8 bg-blanco rounded-xl shadow-lg space-y-6 border border-neutro-200">
        <div className="flex justify-center mb-4">
          <img
            src="/img/Logo oficial.jpg"
            alt="Logo Oh! SanSi"
            className="h-28 w-28 rounded-full object-cover border-2 border-principal-500 shadow-md"
          />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutro-800">Oh! SanSi - Acceso</h2>
          <p className="mt-2 text-neutro-600">Ingresa tus credenciales para continuar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {apiError && (
            <div className="bg-acento-100 border border-acento-400 text-acento-700 px-4 py-3 rounded flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          <div className="relative">
            <label htmlFor="email" className="sr-only">Correo institucional</label>
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutro-400 pointer-events-none" aria-hidden="true"/>
            <input
              id="email"
              type="email"
              placeholder="usuario@institucion.com"
              autoComplete="email"
              {...register('email')}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-150 ease-in-out ${
                errors.email || apiError
                  ? 'border-acento-500 focus:ring-acento-400'
                  : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-400'
              }`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-acento-600 flex items-center gap-1"><AlertCircle size={14} />{errors.email.message}</p>}
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutro-400 pointer-events-none" aria-hidden="true"/>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              autoComplete="current-password"
              {...register('password')}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-150 ease-in-out ${
                errors.password || apiError
                  ? 'border-acento-500 focus:ring-acento-400'
                  : 'border-neutro-300 focus:border-principal-500 focus:ring-principal-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutro-400 hover:text-neutro-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="mt-1.5 text-xs text-acento-600 flex items-center gap-1"><AlertCircle size={14} />{errors.password.message}</p>}
          </div>

          <Button type="submit" loading={loading} className="w-full !py-3 text-base" variant="primary">
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
};