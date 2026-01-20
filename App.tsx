
import React, { useState, useEffect } from 'react';
import { AppState, DISCScore, DISCKey, AssessmentResult, UserInfo } from './types';
import { DISC_QUESTIONS } from './constants';
import { Button } from './components/Button';
import { QuestionCard } from './components/QuestionCard';
import { ResultDashboard } from './components/ResultDashboard';
import { analyzeDISCResults } from './services/geminiService';

const ADMIN_PASSWORD = "Log2026";

export default function App() {
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ most: DISCKey[]; least: DISCKey[] }>({ most: [], least: [] });
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('disc_assessment_history_bc');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newResult: AssessmentResult) => {
    const updatedHistory = [newResult, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('disc_assessment_history_bc', JSON.stringify(updatedHistory));
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      setState(AppState.HISTORY);
      return;
    }
    const pass = prompt("Acesso Restrito - Gestão BC Logística\nDigite a senha:");
    if (pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setState(AppState.HISTORY);
    } else if (pass !== null) {
      alert("Senha incorreta!");
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Data", "Nome", "E-mail", "D", "I", "S", "C"];
    const rows = history.map(h => [
      h.id,
      new Date(h.timestamp).toLocaleString('pt-BR'),
      h.userInfo.name,
      h.userInfo.email,
      h.scores.D,
      h.scores.I,
      h.scores.S,
      h.scores.C
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `BC_Logistica_Equipe_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartInfo = () => {
    setUserInfo({ name: '', email: '' });
    setState(AppState.USER_INFO);
  };
  
  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email) return;
    setResponses({ most: [], least: [] });
    setCurrentQuestionIndex(0);
    setState(AppState.TEST);
  };

  const calculateFinalScores = (mostArr: DISCKey[], leastArr: DISCKey[]): DISCScore => {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    mostArr.forEach(key => counts[key]++);
    leastArr.forEach(key => counts[key]--);
    const normalize = (val: number) => {
        const shifted = val + 20; 
        const scaled = (shifted / 40) * 10;
        return Math.max(0, Math.min(10, parseFloat(scaled.toFixed(1))));
    };
    return { D: normalize(counts.D), I: normalize(counts.I), S: normalize(counts.S), C: normalize(counts.C) };
  };

  const handleSelection = (most: DISCKey, least: DISCKey) => {
    const newMost = [...responses.most, most];
    const newLeast = [...responses.least, least];
    setResponses({ most: newMost, least: newLeast });
    if (currentQuestionIndex + 1 < DISC_QUESTIONS.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      processResult(newMost, newLeast);
    }
  };

  const processResult = async (most: DISCKey[], least: DISCKey[]) => {
    setState(AppState.CALCULATING);
    setIsAnalyzing(true);
    const scores = calculateFinalScores(most, least);
    try {
      const analysisText = await analyzeDISCResults(scores);
      const newResult: AssessmentResult = {
        id: Math.random().toString(36).substr(2, 9),
        userInfo,
        scores,
        timestamp: new Date().toISOString(),
        analysis: analysisText
      };
      setResult(newResult);
      saveToHistory(newResult);
      setState(AppState.RESULT);
    } catch (err) {
      const fallbackResult: AssessmentResult = {
        id: Math.random().toString(36).substr(2, 9),
        userInfo,
        scores,
        timestamp: new Date().toISOString(),
        analysis: "Resultado processado. Análise detalhada gerada no relatório."
      };
      setResult(fallbackResult);
      saveToHistory(fallbackResult);
      setState(AppState.RESULT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Tem certeza que deseja apagar o histórico de logística da equipe?")) {
      setHistory([]);
      localStorage.removeItem('disc_assessment_history_bc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-black text-white sticky top-0 z-50 print:hidden border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setState(AppState.WELCOME)}>
            <div className="bg-orange-500 w-10 h-10 rounded flex items-center justify-center transform skew-x-[-12deg]">
              <svg className="w-6 h-6 text-black transform skew-x-[12deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 12V9.5h2.5l1.97 2.5H18z"/></svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Teams Insights <span className="text-orange-500">BC</span></h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && state === AppState.HISTORY ? (
              <Button variant="outline" size="sm" onClick={logoutAdmin} className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">Sair do Modo Gestor</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleAdminAccess} className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                Painel Gestor
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {state === AppState.WELCOME && (
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block p-6 bg-orange-100 rounded-2xl mb-4 border-2 border-orange-200">
               <svg className="w-20 h-20 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </div>
            <h2 className="text-5xl font-black text-black leading-tight uppercase italic">
              Otimização de Performance <span className="text-orange-500">Logística</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Avaliação DISC especializada para equipes de alta performance. Identifique perfis operacionais e de liderança para máxima eficiência na cadeia de suprimentos.
            </p>
            <Button size="lg" className="px-16 py-5 text-xl bg-orange-600 hover:bg-orange-700 shadow-xl transform hover:-translate-y-1" onClick={handleStartInfo}>
              INICIAR ASSESSMENT BC
            </Button>
            <div className="pt-10 flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2 font-bold uppercase text-xs text-black">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.34.14-.57.14-.23 0-.41-.05-.57-.14l-7.9-4.44c-.31-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.34-.14.57-.14.23 0 .41.05.57.14l7.9 4.44c.31.17.53.5.53.88v9z"/></svg>
                    ARMAZÉM
                </div>
                <div className="flex items-center gap-2 font-bold uppercase text-xs text-black">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>
                    FROTAS
                </div>
                <div className="flex items-center gap-2 font-bold uppercase text-xs text-black">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>
                    GLOBAL
                </div>
            </div>
          </div>
        )}

        {state === AppState.USER_INFO && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-orange-500">
            <h3 className="text-2xl font-black text-black mb-2 uppercase italic">Acesso de Colaborador</h3>
            <p className="text-slate-500 mb-8 text-sm">Insira seus dados corporativos para iniciar a avaliação BC.</p>
            <form onSubmit={handleStartTest} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nome Completo</label>
                <input required type="text" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} placeholder="Ex: Rodrigo BC Silva" className="w-full px-4 py-3 border-2 border-slate-100 rounded focus:border-orange-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">E-mail Corporativo</label>
                <input required type="email" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} placeholder="rodrigo@bclogistica.com" className="w-full px-4 py-3 border-2 border-slate-100 rounded focus:border-orange-500 outline-none transition-all font-medium" />
              </div>
              <Button type="submit" fullWidth size="lg" className="bg-black text-white hover:bg-orange-600 py-4 uppercase font-black">Validar & Avançar</Button>
            </form>
          </div>
        )}

        {state === AppState.TEST && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-black uppercase tracking-tighter">Colaborador: {userInfo.name}</span>
              </div>
              <span className="text-sm font-black text-orange-600 italic">{Math.round(((currentQuestionIndex + 1) / DISC_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-8 overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / DISC_QUESTIONS.length) * 100}%` }}></div>
            </div>
            <QuestionCard 
              group={DISC_QUESTIONS[currentQuestionIndex]}
              currentStep={currentQuestionIndex}
              totalSteps={DISC_QUESTIONS.length}
              onSelection={handleSelection}
            />
          </div>
        )}

        {state === AppState.CALCULATING && (
          <div className="max-w-2xl mx-auto text-center py-20 space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic">Mapeando Perfil Logístico...</h3>
            <p className="text-slate-500 text-lg font-medium">Analisando habilidades operacionais e estilo de comunicação BC.</p>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="animate-in fade-in duration-1000">
             <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-2xl border-l-8 border-orange-500 shadow-xl print:shadow-none print:border-none">
                <div>
                   <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Resultado de Performance</span>
                   <h2 className="text-4xl font-black text-black tracking-tight uppercase italic">{result.userInfo.name}</h2>
                   <p className="text-slate-500 font-bold">{result.userInfo.email} • {new Date(result.timestamp).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-3 print:hidden">
                   <Button variant="primary" onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 gap-2 shadow-lg px-8 py-3 uppercase font-black">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      BAIXAR PDF
                   </Button>
                   <Button variant="outline" onClick={() => setState(AppState.WELCOME)} className="border-black text-black uppercase font-black px-6">NOVO TESTE</Button>
                </div>
             </div>
             <ResultDashboard scores={result.scores} analysis={result.analysis || ""} />
          </div>
        )}

        {state === AppState.HISTORY && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black p-8 rounded-2xl text-white border-b-8 border-orange-500 shadow-2xl">
              <div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">Dashboard de Gestão <span className="text-orange-500">BC Logística</span></h2>
                 <p className="text-orange-200 font-medium">Monitoramento de capital humano e perfis comportamentais.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={clearHistory} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white uppercase font-bold">Limpar Banco</Button>
                <Button variant="primary" size="sm" onClick={exportToCSV} disabled={history.length === 0} className="bg-orange-500 hover:bg-orange-600 text-black uppercase font-black px-6">
                  EXPORTAR EXCEL
                </Button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-24 text-center rounded-2xl border-4 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xl italic">Sem registros de frota/equipe no momento.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b-4 border-orange-500 text-white">
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Data</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">Nome</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">E-mail</th>
                        <th className="px-6 py-5 text-center text-xs font-black text-red-400 uppercase">D</th>
                        <th className="px-6 py-5 text-center text-xs font-black text-orange-400 uppercase">I</th>
                        <th className="px-6 py-5 text-center text-xs font-black text-emerald-400 uppercase">S</th>
                        <th className="px-6 py-5 text-center text-xs font-black text-blue-400 uppercase">C</th>
                        <th className="px-6 py-5 text-center text-xs font-black uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(h.timestamp).toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 text-sm font-black text-black uppercase italic">{h.userInfo.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{h.userInfo.email}</td>
                          <td className="px-6 py-4 text-center font-black text-red-600">{h.scores.D}</td>
                          <td className="px-6 py-4 text-center font-black text-orange-600">{h.scores.I}</td>
                          <td className="px-6 py-4 text-center font-black text-emerald-600">{h.scores.S}</td>
                          <td className="px-6 py-4 text-center font-black text-blue-600">{h.scores.C}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => { setResult(h); setState(AppState.RESULT); }}
                              className="bg-black text-white px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-orange-500 transition-all"
                            >
                              RELATÓRIO
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-black text-white border-t-8 border-orange-500 py-10 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
           <h4 className="text-xl font-black italic uppercase italic tracking-tighter">Teams Insights <span className="text-orange-500">BC</span></h4>
           <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
             Tecnologia de Gestão Comportamental Aplicada à Cadeia de Suprimentos
           </p>
           <p className="text-slate-600 text-[10px]">
             © {new Date().getFullYear()} BC Logística Ltda. Todos os direitos reservados.
           </p>
        </div>
      </footer>
    </div>
  );

  function logoutAdmin() {
    setIsAdmin(false);
    setState(AppState.WELCOME);
  }
}
