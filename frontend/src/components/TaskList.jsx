import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaAngleDown, FaAngleRight } from "react-icons/fa";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import Modal from "./Modal";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

const TaskList = ({ id, onTasksUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTasks();
      setTasks(data);

      // Propagar dados de tarefas para o componente App
      if (onTasksUpdate) {
        onTasksUpdate(data);
      }

      setError(null);
    } catch (err) {
      setError("Erro ao carregar tarefas. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onTasksUpdate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);

      // Propagar tarefas atualizadas
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError("Erro ao criar tarefa.");
      console.error(err);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      // Preserve the existing completed status since we removed the checkbox
      const updatedTaskData = {
        ...taskData,
        completed: currentTask.completed, // Maintain the current completed state
      };
      const updatedTask = await updateTask(currentTask.id, updatedTaskData);
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );

      setTasks(updatedTasks);

      // Propagar tarefas atualizadas
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }

      setIsModalOpen(false);
      setCurrentTask(null);
    } catch (err) {
      setError("Erro ao atualizar tarefa.");
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await deleteTask(taskId);
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);

        // Propagar tarefas atualizadas
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
      } catch (err) {
        setError("Erro ao excluir tarefa.");
        console.error(err);
      }
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const updatedTask = await updateTask(taskId, { ...task, completed });
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );

      setTasks(updatedTasks);

      // Propagar tarefas atualizadas
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }
    } catch (err) {
      setError("Erro ao atualizar estado da tarefa.");
      console.error(err);
    }
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleNewTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleSort = (field) => {
    setSortBy(field);
    setShowSortOptions(false);
  };

  // Filtrar tarefas ativas e concluídas
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  // Ordenar tarefas ativas
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "due_date") {
      // Colocar tarefas sem data no final
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    } else {
      // created_at (padrão)
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Ordenar tarefas concluídas (sempre pela data de conclusão, mais recentes primeiro)
  const sortedCompletedTasks = [...completedTasks].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div id={id} className="container mx-auto max-w-3xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Tarefas</h1>

        <button
          onClick={handleNewTask}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          <FaPlus className="mr-1" /> Nova Tarefa
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Modal for both creating and editing tasks */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTask ? "Editar Tarefa" : "Nova Tarefa"}
      >
        <TaskForm
          task={currentTask}
          onSubmit={currentTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentTask(null);
          }}
        />
      </Modal>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-end mb-4 relative">
          <button
            className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            onClick={() => setShowSortOptions(!showSortOptions)}
          >
            Ordenar por:{" "}
            {sortBy === "created_at"
              ? "Data de criação"
              : sortBy === "title"
              ? "Título"
              : "Data de vencimento"}
          </button>

          {showSortOptions && (
            <div className="absolute right-0 mt-8 w-48 bg-white rounded-md shadow-lg z-10 border">
              <button
                onClick={() => handleSort("created_at")}
                className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                  sortBy === "created_at" ? "font-bold" : ""
                }`}
              >
                Data de criação
              </button>
              <button
                onClick={() => handleSort("title")}
                className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                  sortBy === "title" ? "font-bold" : ""
                }`}
              >
                Título
              </button>
              <button
                onClick={() => handleSort("due_date")}
                className={`block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                  sortBy === "due_date" ? "font-bold" : ""
                }`}
              >
                Data de vencimento
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada. Crie uma nova tarefa!
          </div>
        ) : (
          <div>
            {/* Tarefas ativas */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3 text-gray-800">
                Tarefas Pendentes
              </h2>
              {sortedActiveTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Você não tem tarefas pendentes. Bom trabalho!
                </div>
              ) : (
                sortedActiveTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                  />
                ))
              )}
            </div>

            {/* Tarefas concluídas - só mostra se houver tarefas concluídas */}
            {sortedCompletedTasks.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <button
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-3"
                >
                  {showCompletedTasks ? (
                    <FaAngleDown className="mr-2" />
                  ) : (
                    <FaAngleRight className="mr-2" />
                  )}
                  <h2 className="text-lg font-medium">
                    Tarefas Concluídas ({sortedCompletedTasks.length})
                  </h2>
                </button>

                {showCompletedTasks && (
                  <div className="mt-2">
                    {sortedCompletedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
