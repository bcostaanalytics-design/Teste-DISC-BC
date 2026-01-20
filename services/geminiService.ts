
import { GoogleGenAI } from "@google/genai";
import { DISCScore } from "../types";

export const analyzeDISCResults = async (scores: DISCScore): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Aja como um especialista sênior em Psicologia Organizacional e Análise Comportamental focado no SETOR DE LOGÍSTICA DE ALTA PERFORMANCE.
    Analise os resultados de um assessment DISC detalhado de 30 QUESTÕES para a empresa "BC Logística":
    Dominância (D): ${scores.D}
    Influência (I): ${scores.I}
    Estabilidade (S): ${scores.S}
    Conformidade (C): ${scores.C}

    Com base na profundidade das 30 questões, forneça um relatório executivo em português:
    1. Nome do Perfil Logístico Estratégico.
    2. Análise de Profundidade: Como este perfil se comporta sob estresse logístico real (atrasos, quebra de frota, pico de demanda).
    3. Evidências de Conduta: Pontos fortes observados no checklist de 30 passos.
    4. Estilo de Gestão e Comunicação BC: Como ele lidera ou é liderado no ambiente operacional.
    5. Diretrizes para Alta Performance: Plano de ação para este perfil entregar o máximo de eficiência.
    6. Alocação Técnica: Qual o "posto de trabalho" ideal na BC Log (ex: Gestão de Pátio, Planejamento de Rotas, Diretoria, SAC).

    Mantenha um tom sério, analítico e orientado a resultados logísticos. Use Markdown para formatação e emoticons (🚛, 📋, 🏗️, 🚀).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análise indisponível. Por favor, verifique os scores abaixo.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Erro ao processar a análise detalhada. Os scores foram salvos no histórico.";
  }
};
