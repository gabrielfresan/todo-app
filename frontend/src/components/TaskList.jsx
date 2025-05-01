import { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaAngleDown,
  FaAngleRight,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaRecycle,
  FaTrashAlt,
} from "react-icons/fa";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import Modal from "./Modal";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteAllCompletedTasks,
} from "../services/api";
import { isToday, isTomorrow, parseISO } from "date-fns";

const TaskList = ({ id, onTasksUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'today', 'tomorrow', 'future', 'recurring'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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

  const handleDeleteAllCompletedTasks = async () => {
    try {
      const result = await deleteAllCompletedTasks();
      console.log(`Deleted ${result.deleted_count} completed tasks`);

      // Atualizar o estado removendo as tarefas concluídas
      const updatedTasks = tasks.filter((task) => !task.completed);
      setTasks(updatedTasks);

      // Propagar tarefas atualizadas
      if (onTasksUpdate) {
        onTasksUpdate(updatedTasks);
      }

      // Fechar o modal de confirmação
      setIsConfirmModalOpen(false);
    } catch (err) {
      setError("Erro ao excluir tarefas concluídas.");
      console.error(err);
      setIsConfirmModalOpen(false);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const updatedTask = await updateTask(taskId, { ...task, completed });

      // O servidor vai criar a próxima tarefa recorrente se necessário
      // Vamos recarregar todas as tarefas para obter a nova tarefa
      if (completed && task.is_recurring) {
        await loadTasks();
      } else {
        const updatedTasks = tasks.map((t) =>
          t.id === updatedTask.id ? updatedTask : t
        );

        setTasks(updatedTasks);

        // Propagar tarefas atualizadas
        if (onTasksUpdate) {
          onTasksUpdate(updatedTasks);
        }
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

  // Função para classificar tarefas por data e recorrência
  const filterTasksByDateAndRecurrence = (tasks) => {
    return tasks.filter((task) => {
      // Para o filtro "Recorrentes"
      if (activeFilter === "recurring") {
        return task.is_recurring;
      }

      if (!task.due_date) {
        // Tarefas sem data de vencimento são mostradas em "Todas" ou quando o filtro é "Tarefas sem data"
        return activeFilter === "all" || activeFilter === "no-date";
      }

      const dueDate = parseISO(task.due_date);

      if (activeFilter === "today") {
        return isToday(dueDate);
      } else if (activeFilter === "tomorrow") {
        return isTomorrow(dueDate);
      } else if (activeFilter === "future") {
        return (
          !isToday(dueDate) && !isTomorrow(dueDate) && dueDate > new Date()
        );
      } else if (activeFilter === "all") {
        return true;
      }

      return false;
    });
  };

  // Filtrar tarefas ativas e concluídas
  const activeTasks = tasks.filter((task) => !task.completed);
  const filteredActiveTasks = filterTasksByDateAndRecurrence(activeTasks);
  const completedTasks = tasks.filter((task) => task.completed);

  // Ordenar tarefas ativas
  const sortedActiveTasks = [...filteredActiveTasks].sort((a, b) => {
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

  // Contar tarefas por seção para mostrar badges
  const taskCounts = {
    all: activeTasks.length,
    today: activeTasks.filter(
      (task) => task.due_date && isToday(parseISO(task.due_date))
    ).length,
    tomorrow: activeTasks.filter(
      (task) => task.due_date && isTomorrow(parseISO(task.due_date))
    ).length,
    future: activeTasks.filter(
      (task) =>
        task.due_date &&
        !isToday(parseISO(task.due_date)) &&
        !isTomorrow(parseISO(task.due_date)) &&
        parseISO(task.due_date) > new Date()
    ).length,
    "no-date": activeTasks.filter((task) => !task.due_date).length,
    recurring: activeTasks.filter((task) => task.is_recurring).length,
  };

  return (
    <div id={id} className="container mx-auto max-w-5xl p-4">
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

      {/* Confirmation modal for deleting all completed tasks */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Excluir Todas as Tarefas Concluídas"
      >
        <div className="p-4">
          <p className="mb-4">
            Tem certeza que deseja excluir todas as tarefas concluídas? Esta
            ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleDeleteAllCompletedTasks}
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Filtros de data - Modificado para distribuir melhor o espaço e evitar scrollbar */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaCalendarAlt className="mr-1" />
            Todas
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("today")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaCalendarDay className="mr-1" />
            Hoje
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts.today}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("tomorrow")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "tomorrow"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaCalendarDay className="mr-1" />
            Amanhã
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts.tomorrow}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("future")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "future"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaCalendarWeek className="mr-1" />
            Futuras
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts.future}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("no-date")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "no-date"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaCalendarAlt className="mr-1" />
            Sem data
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts["no-date"]}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("recurring")}
            className={`flex items-center justify-center px-3 py-2 rounded-full text-sm ${
              activeFilter === "recurring"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <FaRecycle className="mr-1" />
            Recorrentes
            <span className="ml-1 bg-gray-200 text-gray-800 rounded-full px-2 text-xs">
              {taskCounts.recurring}
            </span>
          </button>
        </div>

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
                {activeFilter === "all"
                  ? "Tarefas Pendentes"
                  : activeFilter === "today"
                  ? "Tarefas de Hoje"
                  : activeFilter === "tomorrow"
                  ? "Tarefas de Amanhã"
                  : activeFilter === "future"
                  ? "Tarefas Futuras"
                  : activeFilter === "recurring"
                  ? "Tarefas Recorrentes"
                  : "Tarefas Sem Data"}
              </h2>
              {sortedActiveTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {activeFilter === "all"
                    ? "Você não tem tarefas pendentes. Bom trabalho!"
                    : `Nenhuma tarefa ${
                        activeFilter === "today"
                          ? "para hoje"
                          : activeFilter === "tomorrow"
                          ? "para amanhã"
                          : activeFilter === "future"
                          ? "futura"
                          : activeFilter === "recurring"
                          ? "recorrente"
                          : "sem data definida"
                      }!`}
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
            {sortedCompletedTasks.length > 0 && activeFilter === "all" && (
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
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

                  {/* New button to delete all completed tasks */}
                  {showCompletedTasks && sortedCompletedTasks.length > 0 && (
                    <button
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="flex items-center text-red-500 hover:text-red-700 text-sm"
                    >
                      <FaTrashAlt className="mr-1" />
                      Excluir todas concluídas
                    </button>
                  )}
                </div>

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
