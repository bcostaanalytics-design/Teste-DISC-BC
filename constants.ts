
import { QuestionGroup } from './types';

export const DISC_QUESTIONS: QuestionGroup[] = [
  { id: 1, options: [{ text: "Entusiasmado", type: "I" }, { text: "Ousado", type: "D" }, { text: "Diplomático", type: "C" }, { text: "Satisfeito", type: "S" }] },
  { id: 2, options: [{ text: "Cauteloso", type: "C" }, { text: "Determinado", type: "D" }, { text: "Convincente", type: "I" }, { text: "Amável", type: "S" }] },
  { id: 3, options: [{ text: "Amigável", type: "I" }, { text: "Preciso", type: "C" }, { text: "Franco", type: "D" }, { text: "Calmo", type: "S" }] },
  { id: 4, options: [{ text: "Falante", type: "I" }, { text: "Controlado", type: "C" }, { text: "Competitivo", type: "D" }, { text: "Considerado", type: "S" }] },
  { id: 5, options: [{ text: "Aventureiro", type: "D" }, { text: "Perspicaz", type: "C" }, { text: "Sociável", type: "I" }, { text: "Moderado", type: "S" }] },
  { id: 6, options: [{ text: "Gentil", type: "S" }, { text: "Persuasivo", type: "I" }, { text: "Humilde", type: "C" }, { text: "Decidido", type: "D" }] },
  { id: 7, options: [{ text: "Expressivo", type: "I" }, { text: "Consciencioso", type: "C" }, { text: "Dominante", type: "D" }, { text: "Responsivo", type: "S" }] },
  { id: 8, options: [{ text: "Poderoso", type: "D" }, { text: "Extrovertido", type: "I" }, { text: "Tolerante", type: "S" }, { text: "Perfeccionista", type: "C" }] },
  { id: 9, options: [{ text: "Disposto", type: "S" }, { text: "Otimista", type: "I" }, { text: "Meticuloso", type: "C" }, { text: "Direto", type: "D" }] },
  { id: 10, options: [{ text: "Corajoso", type: "D" }, { text: "Inspirador", type: "I" }, { text: "Submisso", type: "S" }, { text: "Sistemático", type: "C" }] },
  { id: 11, options: [{ text: "Reservado", type: "C" }, { text: "Vigoroso", type: "D" }, { text: "Estimulante", type: "I" }, { text: "Prestativo", type: "S" }] },
  { id: 12, options: [{ text: "Indulgente", type: "S" }, { text: "Estético", type: "C" }, { text: "Confiante", type: "D" }, { text: "Alegre", type: "I" }] },
  { id: 13, options: [{ text: "Agressivo", type: "D" }, { text: "Divertido", type: "I" }, { text: "Cooperativo", type: "S" }, { text: "Convencional", type: "C" }] },
  { id: 14, options: [{ text: "Argumentador", type: "D" }, { text: "Adaptável", type: "S" }, { text: "Descontraído", type: "I" }, { text: "Lógico", type: "C" }] },
  { id: 15, options: [{ text: "Discreto", type: "C" }, { text: "Paciente", type: "S" }, { text: "Auto-suficiente", type: "D" }, { text: "Radiante", type: "I" }] },
  { id: 16, options: [{ text: "Popular", type: "I" }, { text: "Fiel", type: "S" }, { text: "Perfeito", type: "C" }, { text: "Pioneiro", type: "D" }] },
  { id: 17, options: [{ text: "Seguro", type: "D" }, { text: "Dócil", type: "S" }, { text: "Influente", type: "I" }, { text: "Ordeiro", type: "C" }] },
  { id: 18, options: [{ text: "Analítico", type: "C" }, { text: "Sincero", type: "S" }, { text: "Vibrante", type: "I" }, { text: "Energético", type: "D" }] },
  { id: 19, options: [{ text: "Encantador", type: "I" }, { text: "Preciso", type: "C" }, { text: "Obstinado", type: "D" }, { text: "Harmonioso", type: "S" }] },
  { id: 20, options: [{ text: "Modesto", type: "S" }, { text: "Objetivo", type: "D" }, { text: "Comunicativo", type: "I" }, { text: "Exigente", type: "C" }] }
];

export const PROFILE_INFO = {
  D: { title: "Dominância", color: "#EF4444", description: "Foca em resultados, objetivos finais e autoconfiança.", traits: ["Direto", "Decisivo", "Forte", "Inquisitivo"] },
  I: { title: "Influência", color: "#F59E0B", description: "Foca em influenciar ou persuadir os outros, relacionamentos.", traits: ["Entusiasta", "Otimista", "Social", "Vivaz"] },
  S: { title: "Estabilidade", color: "#10B981", description: "Foca na cooperação, sinceridade e confiabilidade.", traits: ["Calmo", "Acomodado", "Paciente", "Leal"] },
  C: { title: "Conformidade", color: "#3B82F6", description: "Foca na qualidade, precisão, perícia e competência.", traits: ["Analítico", "Reservado", "Preciso", "Sistemático"] }
};
