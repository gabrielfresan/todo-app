import { format, parseISO } from "date-fns";
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
