import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { FaEdit, FaTrash, FaCheck, FaRegCircle } from "react-icons/fa";

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div
      className={`border rounded-lg p-4 mb-3 ${
        task.completed ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <button
            onClick={() => onToggleComplete(task.id, !task.completed)}
            className="mt-1 text-lg"
          >
            {task.completed ? (
              <FaCheck className="text-green-500" />
            ) : (
              <FaRegCircle className="text-gray-400" />
            )}
          </button>

          <div>
            <h3
              className={`font-medium ${
                task.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            )}

            {task.due_date && (
              <p className="mt-1 text-xs text-gray-500">
                Prazo:{" "}
                {format(new Date(task.due_date), "dd/MM/yyyy 'às' HH:mm", {
                  locale: pt,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(task.id)}
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
