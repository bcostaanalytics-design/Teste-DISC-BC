
import { GoogleGenAI } from "@google/genai";
import { DISCScore } from "../types";

export const analyzeDISCResults = async (scores: DISCScore): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Aja como um especialista sênior em Psicologia Organizacional para o sistema "Picking de Potenciais DISC" de BRUNO COSTA.
    O foco desta análise é alta performance em ARMAZÉM, INVENTÁRIO e ESTOQUE.
    O lema é: "Separando Perfis, Montando Equipes de Alta Performance".

    Analise os resultados do assessment DISC (30 QUESTÕES):
    Dominância (D): ${scores.D}
    Influência (I): ${scores.I}
    Estabilidade (S): ${scores.S}
    Conformidade (C): ${scores.C}

    Você deve estruturar o relatório obrigatoriamente nesta ordem e com estes títulos de seção:

    # PRINCIPAL CARACTERÍSTICA DO CANDIDATO
    (Forneça uma única frase impactante que defina o comportamento predominante deste perfil no ambiente logístico).

    # RESUMO DE PONTOS FORTES
    (Apresente de 3 a 5 pontos fortes em bullet points, focando em produtividade, organização e trabalho em equipe).

    # PONTOS A MELHORAR
    (Apresente de 2 a 4 áreas de desenvolvimento em bullet points, focando em evitar gargalos operacionais e erros de inventário).

    # ANÁLISE ESTRATÉGICA BC LOG
    1. Perfil de Picking: Dê um nome criativo ao perfil (ex: "O Auditor de Precisão").
    2. Atuação no Fluxo: Como a precisão e velocidade deste perfil afetam o controle de estoque.
    3. Diretrizes de Gestão: Como Bruno Costa deve gerenciar este colaborador para o máximo resultado.
    4. Alocação Técnica: Sugira a melhor área (Recebimento, Conferência, Picking ou Inventariante).

    Mantenha um tom profissional, analítico e focado em alta eficiência. Use Markdown e emoticons logísticos (🏗️, 📦, 📈, ✅).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análise de Potenciais indisponível. Consulte os scores brutos abaixo.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Erro no processamento da IA de Bruno Costa. Os dados técnicos foram preservados no histórico.";
  }
};
