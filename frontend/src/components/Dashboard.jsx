import { useState, useEffect } from "react";
import TaskList from "./TaskList";
import Notifications from "./Notifications";
import Header from "./Header";
import { getTasks } from "../services/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Erro ao carregar tarefas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();

    // Configurar um intervalo para verificar periodicamente atualizações de tarefas
    const intervalId = setInterval(loadTasks, 60000); // Verificar a cada minuto

    return () => clearInterval(intervalId);
  }, []);

  const handleTaskUpdate = () => {
    // Recarregar tarefas quando uma for atualizada
    getTasks().then(setTasks).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Suas Tarefas
          </h2>
          <p className="text-gray-600">
            Gerencie suas tarefas de forma organizada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TaskList 
              tasks={tasks} 
              onTaskUpdate={handleTaskUpdate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <Notifications tasks={tasks} />
          </div>
        </div>
      </div>
    </div>
  );
}