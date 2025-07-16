import { useEffect, useState } from "react";
import { FaBell, FaExclamationCircle } from "react-icons/fa";
import { checkForDueTasks } from "../utils/notificationUtils";

const Notifications = ({ tasks, onTaskClick }) => {
  const [dueTasks, setDueTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Verificar tarefas vencidas quando a prop tasks mudar
  useEffect(() => {
    const overdueTasks = checkForDueTasks(tasks);
    setDueTasks(overdueTasks);

    // Se temos novas tarefas vencidas, ativa o indicador de notificação
    if (overdueTasks.length > 0) {
      setHasNewNotifications(true);
    }
  }, [tasks]);

  // Configurar notificações do navegador (apenas uma vez)
  useEffect(() => {
    // IDs de tarefas que já foram notificadas
    let notifiedTaskIds = new Set();

    // Verificar tarefas vencidas e enviar notificações
    const checkAndNotify = () => {
      const currentDueTasks = checkForDueTasks(tasks);

      if (Notification.permission === "granted") {
        currentDueTasks.forEach((task) => {
          // Só notifica para tarefas que ainda não foram notificadas
          if (!notifiedTaskIds.has(task.id)) {
            try {
              const notification = new Notification("Tarefa Vencida", {
                body: `A tarefa "${task.title}" está vencida!`,
                icon: "/notification-icon.png",
              });

              // Adiciona o ID da tarefa ao conjunto de tarefas notificadas
              notifiedTaskIds.add(task.id);

              // Quando o usuário clica na notificação, abre o app e foca na tarefa
              notification.onclick = () => {
                window.focus();
                if (onTaskClick) {
                  onTaskClick(task);
                }
              };
            } catch (err) {
              console.log("Erro ao criar notificação:", err);
            }
          }
        });
      }
    };

    // Verificar a cada minuto
    const intervalId = setInterval(checkAndNotify, 60000);

    // Verificação inicial após 1 segundo
    setTimeout(checkAndNotify, 1000);

    return () => clearInterval(intervalId);
  }, []); // Run only once

  // Handle permission request on user interaction
  const handleRequestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          setHasNewNotifications(false);
          handleRequestPermission(); // Request permission on user click
        }}
        className="relative p-2 text-gray-700 hover:text-blue-600"
      >
        <FaBell size={20} />
        {hasNewNotifications && (
          <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border">
          <div className="p-3 border-b">
            <h3 className="font-medium">Notificações</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {dueTasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Não há tarefas vencidas no momento
              </div>
            ) : (
              dueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onTaskClick(task);
                    setShowNotifications(false);
                  }}
                >
                  <div className="flex items-start">
                    <FaExclamationCircle className="text-red-500 mt-1 mr-2" />
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-red-500">Vencida!</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
