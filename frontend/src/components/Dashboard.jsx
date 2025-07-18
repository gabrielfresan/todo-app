import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// Temporariamente simplificado para debug
export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.name || 'Usuário'}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Simplificado
          </h2>
          <p className="text-gray-600">
            Sistema funcionando! Em breve voltaremos com as tarefas completas.
          </p>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informações do Usuário
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Verificado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.email_verified ? '✅ Sim' : '❌ Não'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
// Componente completo original (comentado temporariamente)
import TaskList from "./TaskList";
import Notifications from "./Notifications";
import Header from "./Header";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const handleTasksUpdate = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Suas Tarefas
          </h2>
          <p className="text-gray-600">
            Gerencie suas tarefas de forma organizada
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-4">
                <TaskList 
                  onTasksUpdate={handleTasksUpdate}
                />
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Notifications tasks={tasks} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}