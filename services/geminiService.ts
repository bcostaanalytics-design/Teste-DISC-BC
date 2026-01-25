
import { GoogleGenAI, Type } from "@google/genai";
import { DISCScore } from "../types";

export const analyzeDISCResults = async (scores: DISCScore): Promise<{ analysis: string; suggestion: string; profileSummary: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Aja como um especialista sênior em Psicologia Organizacional para o sistema "Picking de Potenciais DISC" de BRUNO COSTA.
    O foco desta análise é alta performance em ARMAZÉM, INVENTÁRIO e ESTOQUE.
    
    Analise os resultados do assessment DISC:
    Dominância (D): ${scores.D}
    Influência (I): ${scores.I}
    Estabilidade (S): ${scores.S}
    Conformidade (C): ${scores.C}

    Retorne EXATAMENTE 3 campos em JSON:
    1. "analysis": Relatório detalhado em Markdown com seções # PRINCIPAL CARACTERÍSTICA, # PONTOS FORTES, # PONTOS A MELHORAR e # ANÁLISE ESTRATÉGICA.
    2. "suggestion": Uma frase curta de abordagem técnica para o gestor.
    3. "profileSummary": Um parágrafo de 3 linhas resumindo o comportamento deste perfil na logística.

    Mantenha o tom profissional e focado em logística de alta performance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            profileSummary: { type: Type.STRING }
          },
          required: ["analysis", "suggestion", "profileSummary"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      analysis: "Análise técnica processada. Verifique os scores brutos.",
      suggestion: "Abordagem focada em processos e revisão técnica.",
      profileSummary: "Perfil logístico com foco operacional."
    };
  }
};
