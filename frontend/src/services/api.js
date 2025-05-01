import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const getTasks = async () => {
  const response = await api.get("/tasks");
  return response.data;
};

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
  return true;
};

export const deleteAllCompletedTasks = async () => {
  const response = await api.delete("/tasks/completed");
  return response.data;
};

// Função auxiliar para formatação de string de recorrência
export const getRecurrenceDescription = (recurrenceType) => {
  switch (recurrenceType) {
    case "daily":
      return "Diariamente";
    case "weekly":
      return "Semanalmente";
    case "monthly":
      return "Mensalmente";
    default:
      return "Não recorrente";
  }
};
