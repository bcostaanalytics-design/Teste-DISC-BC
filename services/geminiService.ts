
import { GoogleGenAI } from "@google/genai";
import { DISCScore } from "../types";

export const analyzeDISCResults = async (scores: DISCScore): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Aja como um especialista sênior em Psicologia Organizacional e Análise Comportamental focado no SETOR DE LOGÍSTICA.
    Analise os seguintes resultados de um teste DISC (escala de 0 a 10) para a empresa "BC Logística":
    Dominância (D): ${scores.D}
    Influência (I): ${scores.I}
    Estabilidade (S): ${scores.S}
    Conformidade (C): ${scores.C}

    Forneça um relatório profissional estruturado em português com foco operacional e de gestão:
    1. Nome do Perfil Logístico (ex: "O Operador Ágil", "O Estrategista de Frota").
    2. Pontos Fortes em Ambientes de Alta Pressão (armazéns, entregas, prazos críticos).
    3. Riscos Operacionais / Áreas de Desenvolvimento.
    4. Estilo de Comunicação com a Equipe BC.
    5. Diretrizes para Liderança: Como maximizar a entrega deste perfil.
    6. Adequação de Função: Em qual área da logística este perfil melhor se encaixa (Operacional, Planejamento, Gestão, Comercial).

    Mantenha um tom executivo, focado em resultados e eficiência. Use Markdown para formatação e emoticons relacionados a logística (🚛, 📦, 🏗️, 📈) onde fizer sentido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a análise logística no momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Erro ao processar a análise estratégica. Por favor, tente novamente mais tarde.";
  }
};
