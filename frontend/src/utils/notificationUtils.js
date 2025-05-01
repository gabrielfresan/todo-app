import { parseISO } from "date-fns";

export const isTaskDue = (task) => {
  if (!task.due_date) return false;

  const now = new Date();
  const dueDate = parseISO(task.due_date);

  // Verificar se a data de vencimento é agora ou no passado
  return dueDate <= now && !task.completed;
};

export const checkForDueTasks = (tasks) => {
  return tasks.filter((task) => isTaskDue(task));
};
