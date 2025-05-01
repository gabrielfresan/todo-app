import {
  FaTrash,
  FaCheck,
  FaRegCircle,
  FaCalendarAlt,
  FaRecycle,
} from "react-icons/fa";
import TaskNotificationBadge from "./TaskNotificationBadge";
import { isPastDate, getRelativeDateDescription } from "../utils/dateUtils";

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
  // Função para obter a descrição da recorrência
  const getRecurrenceDescription = (type) => {
    switch (type) {
      case "daily":
        return "Diariamente";
      case "weekly":
        return "Semanalmente";
      case "monthly":
        return "Mensalmente";
      default:
        return "";
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-3 ${
        task.completed ? "bg-gray-50" : "bg-white"
      } cursor-pointer hover:bg-gray-50 transition-colors`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent div's onClick
              onToggleComplete(task.id, !task.completed);
            }}
            className="mt-1 text-lg"
          >
            {task.completed ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaRegCircle className="text-gray-400" />
            )}
          </button>

          <div>
            <div className="flex items-center">
              <h3
                className={`font-medium ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {task.title}
                {!task.completed && <TaskNotificationBadge task={task} />}
              </h3>

              {/* Ícone de recorrência */}
              {task.is_recurring && (
                <div
                  className="ml-2 text-green-500 flex items-center"
                  title={getRecurrenceDescription(task.recurrence_type)}
                >
                  <FaRecycle size={14} />
                  <span className="ml-1 text-xs">
                    {getRecurrenceDescription(task.recurrence_type)}
                  </span>
                </div>
              )}
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            )}

            {task.due_date ? (
              <div className="flex items-center mt-1">
                <FaCalendarAlt className="text-xs text-gray-500 mr-1" />
                <p
                  className={`text-xs ${
                    isPastDate(task.due_date) && !task.completed
                      ? "text-red-500 font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {getRelativeDateDescription(task.due_date)}
                </p>
              </div>
            ) : (
              <div className="flex items-center mt-1">
                <p className="text-xs text-gray-400 italic">
                  Sem data definida
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent div's onClick
              onDelete(task.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
