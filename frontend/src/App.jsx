import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskList from "./components/TaskList";
import Notifications from "./components/Notifications";
import { getTasks } from "./services/api";
import todoLogo from "./assets/todo-logo.png";

function App() {
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

  // Removido o parâmetro task que não era utilizado
  const handleTaskClick = () => {
    // Esta função será chamada quando um usuário clicar em uma notificação
    document.getElementById("task-list-container")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-gray-200 text-gray-600 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={todoLogo}
                alt="Todo App Logo"
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-xl font-bold">Todo App</h1>
            </div>

            {!isLoading && (
              <Notifications tasks={tasks} onTaskClick={handleTaskClick} />
            )}
          </div>
        </header>

        <main className="container mx-auto py-6 px-4 flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <TaskList id="task-list-container" onTasksUpdate={setTasks} />
              }
            />
          </Routes>
        </main>

        <footer className="bg-gray-200 p-4 text-center text-gray-600 text-sm mt-auto">
          <div className="container mx-auto">
            &copy; {new Date().getFullYear()} Todo App | Inspirado no Todoist &
            TickTick
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
