import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Registrar service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Registro do ServiceWorker bem-sucedido com escopo: ",
          registration.scope
        );

        // Solicitar permissão de notificação
        if ("Notification" in window) {
          Notification.requestPermission();
        }

        // Configurar sincronização em segundo plano
        if ("SyncManager" in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // Registrar uma sincronização periódica se o navegador suportar
            if ("periodicSync" in registration) {
              const status = navigator.permissions.query({
                name: "periodic-background-sync",
              });

              if (status.state === "granted") {
                registration.periodicSync.register("check-due-tasks", {
                  minInterval: 15 * 60 * 1000, // 15 minutos
                });
              }
            } else {
              // Caso contrário, use a sincronização regular que será acionada quando estiver online
              registration.sync.register("check-due-tasks");
            }
          });
        }
      })
      .catch((error) => {
        console.error("Falha no registro do ServiceWorker: ", error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
