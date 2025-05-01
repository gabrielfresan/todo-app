import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isAfter,
  addDays,
} from "date-fns";
import { pt } from "date-fns/locale";

// Função auxiliar para formatar datas com timezone correto
export const formatTaskDate = (dateString) => {
  if (!dateString) return "";

  // Converter a string ISO para objeto Date
  const date = parseISO(dateString);

  // Formatar a data usando date-fns com locale pt-BR
  return format(date, "dd/MM/yyyy 'às' HH:mm", {
    locale: pt,
  });
};

// Função para verificar se uma data já passou
export const isPastDate = (dateString) => {
  if (!dateString) return false;

  const date = parseISO(dateString);
  const now = new Date();

  return date <= now;
};

// Exportando funções úteis do date-fns para filtros
export { isToday, isTomorrow };

// Função para verificar se uma data é futura (nem hoje nem amanhã)
export const isFutureDate = (dateString) => {
  if (!dateString) return false;

  const date = parseISO(dateString);
  const dayAfterTomorrow = addDays(new Date(), 2);

  // Retorna true se a data for posterior ao dia depois de amanhã
  return isAfter(date, dayAfterTomorrow);
};

// Função para obter a descrição da data de forma amigável
export const getRelativeDateDescription = (dateString) => {
  if (!dateString) return "Sem data";

  const date = parseISO(dateString);

  if (isToday(date)) {
    return "Hoje";
  } else if (isTomorrow(date)) {
    return "Amanhã";
  } else {
    return formatTaskDate(dateString);
  }
};
