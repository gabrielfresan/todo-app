import { useState } from "react";
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
  );
}