import { useAuth } from '../contexts/AuthContext';
import todoLogo from '../assets/todo-logo.png';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img className="h-8 w-auto" src={todoLogo} alt="Todo App" />
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              Todo App
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Olá, {user?.name}
            </span>
            <button
              onClick={logout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}