import { FaTrash, FaCheck, FaRegCircle } from "react-icons/fa";
import TaskNotificationBadge from "./TaskNotificationBadge";
import { formatTaskDate, isPastDate } from "../utils/dateUtils";

const TaskItem = ({ task, onEdit, onDelete, onToggleComplete }) => {
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
            <h3
              className={`font-medium ${
                task.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
              {!task.completed && <TaskNotificationBadge task={task} />}
            </h3>

            {task.description && (
              <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            )}

            {task.due_date && (
              <p
                className={`mt-1 text-xs ${
                  isPastDate(task.due_date) && !task.completed
                    ? "text-red-500 font-bold"
                    : "text-gray-500"
                }`}
              >
                Prazo: {formatTaskDate(task.due_date)}
              </p>
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