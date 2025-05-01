import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRecycle, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { isTaskDue } from "../utils/notificationUtils";

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("daily");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTaskOverdue, setIsTaskOverdue] = useState(false);
  const datePickerRef = useRef(null);

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

        // Verificar imediatamente se a tarefa está vencida
        const taskCopy = { ...task };
        setIsTaskOverdue(isTaskDue(taskCopy));
      } else {
        setDueDate(null);
        setIsTaskOverdue(false);
      }

      // Configurar campos de recorrência se existirem
      setIsRecurring(task.is_recurring || false);
      setRecurrenceType(task.recurrence_type || "daily");
    } else {
      // Resetar formulário ao criar uma nova tarefa
      setTitle("");
      setDescription("");
      setDueDate(null);
      setIsRecurring(false);
      setRecurrenceType("daily");
      setIsTaskOverdue(false);
    }
  }, [task]);

  // Fechar o DatePicker quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        !event.target.closest(".react-datepicker")
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      due_date: dueDate ? dueDate.toISOString() : null,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
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

  // Função para formatar a data para exibição
  const formatDate = (date) => {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Abrir o DatePicker em um modal
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Removendo o alerta do formulário principal já que agora está no modal */}
      {/* As seções abaixo permaneceram inalteradas */}

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

      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Conclusão
        </label>
        <div
          className="relative border rounded-md p-2 flex items-center cursor-pointer hover:bg-gray-50"
          onClick={openDatePicker}
        >
          <FaClock className="text-gray-400 mr-2" />
          <span className={`${!dueDate ? "text-gray-400" : "text-gray-700"}`}>
            {dueDate ? formatDate(dueDate) : "Selecione uma data e hora"}
          </span>
        </div>

        {/* Modal DatePicker */}
        {showDatePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              ref={datePickerRef}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Selecionar Data e Hora</h3>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>

              {isTaskOverdue && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    <p className="font-medium">
                      Atenção! Esta tarefa está vencida.
                    </p>
                  </div>
                  <p className="mt-1 text-sm">
                    Considere atualizar a data de conclusão ou marcar como
                    concluída.
                  </p>
                </div>
              )}

              <div className="flex justify-center mb-2">
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => {
                    // Se for hoje e não tiver horário definido, definir para 23:59
                    if (
                      date &&
                      isToday(date) &&
                      date.getHours() === 0 &&
                      date.getMinutes() === 0
                    ) {
                      // Criar nova data com horário 23:59
                      const updatedDate = new Date(date);
                      updatedDate.setHours(23);
                      updatedDate.setMinutes(59);
                      setDueDate(updatedDate);
                    } else {
                      setDueDate(date);
                    }

                    // Verificar se a data selecionada está no passado
                    const now = new Date();

                    // Se for uma data atualizada com 23:59, não deve aparecer como vencida
                    const dateToCheck =
                      date &&
                      isToday(date) &&
                      date.getHours() === 0 &&
                      date.getMinutes() === 0
                        ? new Date(now.setHours(23, 59, 0))
                        : date;

                    if (dateToCheck < now) {
                      setIsTaskOverdue(true);
                    } else {
                      setIsTaskOverdue(false);
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Selecione uma data e hora"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  wrapperClassName="w-full"
                  minDate={
                    task?.due_date && task.due_date < now
                      ? new Date(task.due_date)
                      : now
                  }
                  inline
                  // Mostrar horários passados em cinza (desabilitados)
                  timeClassName={(time) => {
                    // Se for hoje, verificar se o horário já passou
                    if (dueDate && isToday(dueDate)) {
                      const currentHour = now.getHours();
                      const currentMinute = now.getMinutes();
                      const timeHour = time.getHours();
                      const timeMinute = time.getMinutes();

                      // Se o horário já passou, adicionar a classe para mostrar em cinza
                      if (
                        timeHour < currentHour ||
                        (timeHour === currentHour && timeMinute < currentMinute)
                      ) {
                        return "text-gray-300 cursor-not-allowed line-through";
                      }
                    }
                    return "text-gray-900"; // Horário válido
                  }}
                  // Desabilitar horários que já passaram
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

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDueDate(null);
                    setIsTaskOverdue(false);
                    setShowDatePicker(false);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Recorrência */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is-recurring"
            className="ml-2 block text-sm font-medium text-gray-700 flex items-center"
          >
            Tarefa Recorrente <FaRecycle className="ml-1 text-green-500" />
          </label>
        </div>

        {isRecurring && dueDate && (
          <div className="mt-3 pl-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repetir:
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="daily"
                  checked={recurrenceType === "daily"}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Diariamente</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="weekly"
                  checked={recurrenceType === "weekly"}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Semanalmente</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="monthly"
                  checked={recurrenceType === "monthly"}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Mensalmente</span>
              </label>
            </div>

            <p className="mt-2 text-xs text-gray-500 italic">
              {recurrenceType === "daily" &&
                "A tarefa será recriada todo dia quando concluída."}
              {recurrenceType === "weekly" &&
                "A tarefa será recriada no mesmo dia da semana quando concluída."}
              {recurrenceType === "monthly" &&
                "A tarefa será recriada no mesmo dia do mês quando concluída."}
            </p>
          </div>
        )}

        {isRecurring && !dueDate && (
          <p className="mt-2 text-xs text-red-500">
            Por favor, defina uma data de conclusão para habilitar a
            recorrência.
          </p>
        )}
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
