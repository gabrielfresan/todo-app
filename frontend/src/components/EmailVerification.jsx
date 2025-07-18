import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyEmail, resendVerification } from '../services/auth';
import todoLogo from '../assets/todo-logo.png';

export default function EmailVerification() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email;
  
  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos');
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyEmail(email, code);
      setSuccess('Email verificado com sucesso! Redirecionando...');
      
      // Login automático após verificação
      login(response.user, response.access_token);
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (err) {
      console.error('Erro na verificação:', err);
      setError(err.response?.data?.error || 'Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await resendVerification(email);
      setSuccess('Novo código enviado para seu email!');
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      console.error('Erro ao reenviar:', err);
      setError(err.response?.data?.error || 'Erro ao reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setCode(value);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            className="h-20 w-auto"
            src={todoLogo}
            alt="Todo App"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verifique seu email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enviamos um código de 6 dígitos para
          <br />
          <span className="font-medium text-blue-600">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de verificação
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  placeholder="000000"
                  required
                  value={code}
                  onChange={handleCodeChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Digite o código de 6 dígitos enviado para seu email
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o código?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Reenviando...' : 
                   countdown > 0 ? `Reenviar em ${countdown}s` : 
                   'Reenviar código'}
                </button>
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                ← Voltar ao registro
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}