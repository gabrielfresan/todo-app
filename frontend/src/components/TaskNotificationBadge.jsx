import { useState, useEffect } from "react";
import { isTaskDue } from "../utils/notificationUtils";

const TaskNotificationBadge = ({ task }) => {
  const [isDue, setIsDue] = useState(false);

  useEffect(() => {
    // Verificar se a tarefa está vencida quando montada e quando a tarefa mudar
    setIsDue(isTaskDue(task));

    // Configurar um intervalo para verificar a cada minuto se a tarefa vence
    const intervalId = setInterval(() => {
      setIsDue(isTaskDue(task));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [task]);

  if (!isDue) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
      Vencida!
    </span>
  );
};

export default TaskNotificationBadge;
