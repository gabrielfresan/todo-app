// Verificar se uma tarefa está vencida
export const isTaskDue = (task) => {
  if (!task.due_date) return false;

  const now = new Date();
  const dueDate = new Date(task.due_date);

  // Verifica se a data de vencimento é agora ou no passado
  return dueDate <= now && !task.completed;
};

// Filtrar tarefas vencidas de uma lista
export const checkForDueTasks = (tasks) => {
  return tasks.filter((task) => isTaskDue(task));
};
