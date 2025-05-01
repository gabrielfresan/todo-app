/* eslint-env serviceworker */
/* global clients */

const CACHE_NAME = "todo-app-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/0.chunk.js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.ico",
];

// Instalar service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      return cache.addAll(urlsToCache);
    })
  );
});

// Escutar eventos de sincronização em segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "check-due-tasks") {
    event.waitUntil(checkDueTasks());
  }
});

// Escutar notificações push do servidor
self.addEventListener("push", (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: "/notification-icon.png",
    badge: "/notification-badge.png",
    data: {
      taskId: data.taskId,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Lidar com cliques em notificações
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Isso vai abrir o app e focar na tarefa específica
  if (event.notification.data && event.notification.data.taskId) {
    const taskId = event.notification.data.taskId;

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
        })
        .then((clientList) => {
          // Se um cliente window já estiver aberto, foca nele
          for (const client of clientList) {
            if (client.url.includes("/") && "focus" in client) {
              client.focus();
              client.postMessage({
                type: "NOTIFICATION_CLICK",
                taskId: taskId,
              });
              return;
            }
          }

          // Se nenhum cliente window estiver aberto, abre um
          if (clients.openWindow) {
            return clients.openWindow(`/?task=${taskId}`);
          }
        })
    );
  }
});

// Função para verificar tarefas vencidas em segundo plano
async function checkDueTasks() {
  try {
    const response = await fetch("/api/tasks");
    const tasks = await response.json();

    const now = new Date();
    const dueTasks = tasks.filter((task) => {
      if (!task.due_date || task.completed) return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= now;
    });

    // Enviar notificações para tarefas vencidas
    return Promise.all(
      dueTasks.map((task) => {
        return self.registration.showNotification("Tarefa Vencida", {
          body: `A tarefa "${task.title}" está vencida!`,
          icon: "/notification-icon.png",
          badge: "/notification-badge.png",
          data: {
            taskId: task.id,
          },
        });
      })
    );
  } catch (error) {
    console.error("Erro ao verificar tarefas vencidas:", error);
    return Promise.resolve();
  }
}

// Estratégia de cache primeiro, depois rede para eventos fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - retorna resposta
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});