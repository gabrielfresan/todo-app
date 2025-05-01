import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);

  // Definir o horário mínimo como o atual
  const now = new Date();

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");

      // Se estiver editando uma tarefa com data de vencimento, usá-la, caso contrário, null
      if (task.due_date) {
        const taskDueDate = new Date(task.due_date);
        setDueDate(taskDueDate);
      } else {
        setDueDate(null);
      }
    } else {
      // Resetar formulário ao criar uma nova tarefa
      setTitle("");
      setDescription("");
      setDueDate(null);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      due_date: dueDate ? dueDate.toISOString() : null,
    };

    onSubmit(taskData);
  };

  // Função simples para verificar se uma data é hoje
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Digite o título da tarefa (obrigatório)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            autoFocus
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Digite a descrição da tarefa (opcional)"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            rows="3"
          ></textarea>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Conclusão
        </label>
        <div className="relative">
          <DatePicker
            selected={dueDate}
            onChange={setDueDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Selecione uma data e hora"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            wrapperClassName="w-full"
            minDate={now}
            filterTime={(time) => {
              // Se não tiver data selecionada ou se não for hoje, aceitar qualquer horário
              if (!dueDate || !isToday(dueDate)) {
                return true;
              }

              // Se for hoje, verificar se o horário é futuro
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              const timeHour = time.getHours();
              const timeMinute = time.getMinutes();

              // Verificar se o horário é futuro (maior que o atual)
              if (timeHour > currentHour) {
                return true;
              } else if (
                timeHour === currentHour &&
                timeMinute >= currentMinute
              ) {
                return true;
              }

              return false;
            }}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
