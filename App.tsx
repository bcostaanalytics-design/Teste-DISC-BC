
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, DISCScore, DISCKey, AssessmentResult, UserInfo } from './types';
import { DISC_QUESTIONS } from './constants';
import { Button } from './components/Button';
import { QuestionCard } from './components/QuestionCard';
import { ResultDashboard } from './components/ResultDashboard';
import { analyzeDISCResults } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
    const savedHistory = localStorage.getItem('disc_assessment_history_bruno_costa');
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
    localStorage.setItem('disc_assessment_history_bruno_costa', JSON.stringify(updatedHistory));
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      setState(AppState.HISTORY);
      return;
    }
    const pass = prompt("Acesso Restrito - Gestão Bruno Costa\nDigite a senha:");
    if (pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setState(AppState.HISTORY);
    } else if (pass !== null) {
      alert("Senha incorreta!");
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Data", "Nome", "E-mail", "D", "I", "S", "C", "Perfil Dominante", "Resumo do Perfil", "Sugestão de Abordagem"];
    
    const rows = history.map(h => {
      const scores = [
        { key: 'Dominância', val: h.scores.D },
        { key: 'Influência', val: h.scores.I },
        { key: 'Estabilidade', val: h.scores.S },
        { key: 'Conformidade', val: h.scores.C }
      ];
      const dominant = scores.reduce((prev, current) => (prev.val > current.val) ? prev : current).key;

      return [
        h.id,
        new Date(h.timestamp).toLocaleString('pt-BR'),
        h.userInfo.name,
        h.userInfo.email,
        h.scores.D,
        h.scores.I,
        h.scores.S,
        h.scores.C,
        dominant,
        `"${(h.profileSummary || "N/A").replace(/"/g, '""')}"`,
        `"${(h.suggestion || "N/A").replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Logistico_BC_DISC_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const adminStats = useMemo(() => {
    if (history.length === 0) return null;
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    history.forEach(h => {
      const s = h.scores;
      const maxVal = Math.max(s.D, s.I, s.S, s.C);
      if (s.D === maxVal) counts.D++;
      else if (s.I === maxVal) counts.I++;
      else if (s.S === maxVal) counts.S++;
      else counts.C++;
    });
    return [
      { name: 'Dominância', value: counts.D, color: '#C2410C' },
      { name: 'Influência', value: counts.I, color: '#F97316' },
      { name: 'Estabilidade', value: counts.S, color: '#FB923C' },
      { name: 'Conformidade', value: counts.C, color: '#7C2D12' },
    ];
  }, [history]);

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
        const shifted = val + 30; 
        const scaled = (shifted / 60) * 10;
        return Math.max(0, Math.min(10, parseFloat(scaled.toFixed(1))));
    };
    return { 
      D: normalize(counts.D), 
      I: normalize(counts.I), 
      S: normalize(counts.S), 
      C: normalize(counts.C) 
    };
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
      const data = await analyzeDISCResults(scores);
      const newResult: AssessmentResult = {
        id: Math.random().toString(36).substr(2, 9),
        userInfo,
        scores,
        responses: { most, least },
        timestamp: new Date().toISOString(),
        analysis: data.analysis,
        suggestion: data.suggestion,
        profileSummary: data.profileSummary
      };
      setResult(newResult);
      saveToHistory(newResult);
      setState(AppState.RESULT);
    } catch (err) {
      const fallbackResult: AssessmentResult = {
        id: Math.random().toString(36).substr(2, 9),
        userInfo,
        scores,
        responses: { most, least },
        timestamp: new Date().toISOString(),
        analysis: "Erro no processamento da IA.",
        suggestion: "Manter abordagem técnica padrão.",
        profileSummary: "Resumo indisponível."
      };
      setResult(fallbackResult);
      saveToHistory(fallbackResult);
      setState(AppState.RESULT);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setState(AppState.WELCOME);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100">
      <header className="bg-black text-white sticky top-0 z-50 print:hidden border-b-4 border-orange-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setState(AppState.WELCOME)}>
            <div className="bg-orange-500 w-10 h-10 rounded flex items-center justify-center transform skew-x-[-12deg]">
              <svg className="w-6 h-6 text-black transform skew-x-[12deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 12V9.5h2.5l1.97 2.5H18z"/></svg>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
              Picking de Potenciais <span className="text-orange-500 block sm:inline">DISC</span>
            </h1>
          </div>
          <div className="flex gap-2">
            {isAdmin && state === AppState.HISTORY ? (
              <Button variant="outline" size="sm" onClick={logoutAdmin} className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white uppercase font-black">SAIR DO PAINEL</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleAdminAccess} className="bg-transparent border-white text-white hover:bg-white hover:text-black uppercase font-black px-4">
                PAINEL GESTOR
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
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-black leading-tight uppercase italic">
                Picking de Potenciais <br/><span className="text-orange-500">DISC</span>
              </h2>
              <p className="text-2xl text-slate-800 font-bold italic tracking-tight border-l-4 border-orange-500 pl-4 py-2 bg-slate-100/50">
                "Separando Perfis, Montando Equipes de Alta Performance"
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-xl text-left space-y-4">
              <h3 className="text-lg font-black text-black uppercase italic border-b-2 border-orange-500 pb-2 inline-block">O que é este teste?</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Este assessment utiliza a consagrada metodologia <strong>DISC</strong> para mapear as tendências comportamentais de cada colaborador. Através da análise de quatro pilares fundamentais — <strong>Dominância, Influência, Estabilidade e Conformidade</strong> — conseguimos identificar o "picking" ideal de talentos para as operações.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <Button size="lg" className="px-16 py-6 text-xl bg-orange-600 hover:bg-orange-700 shadow-2xl transform hover:-translate-y-1 transition-all" onClick={handleStartInfo}>
                INICIAR ASSESSMENT (30 ETAPAS)
              </Button>
              <div className="flex justify-center gap-8 pt-4">
                  <div className="flex items-center gap-2 font-black uppercase text-xs text-black border-b-2 border-orange-500 pb-1 tracking-widest">ARMAZÉM</div>
                  <div className="flex items-center gap-2 font-black uppercase text-xs text-black border-b-2 border-orange-500 pb-1 tracking-widest">INVENTÁRIO</div>
                  <div className="flex items-center gap-2 font-black uppercase text-xs text-black border-b-2 border-orange-500 pb-1 tracking-widest">ESTOQUE</div>
              </div>
            </div>
          </div>
        )}

        {state === AppState.USER_INFO && (
          <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-orange-500">
            <h3 className="text-2xl font-black text-black mb-2 uppercase italic">Acesso Colaborador</h3>
            <p className="text-slate-500 mb-8 text-sm">Validando competências para a gestão de Bruno Costa.</p>
            <form onSubmit={handleStartTest} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nome Completo</label>
                <input required type="text" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} placeholder="Nome Completo" className="w-full px-4 py-3 border-2 border-slate-100 rounded focus:border-orange-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">E-mail Corporativo</label>
                <input required type="email" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} placeholder="seu.email@logistica.com" className="w-full px-4 py-3 border-2 border-slate-100 rounded focus:border-orange-500 outline-none transition-all font-medium" />
              </div>
              <Button type="submit" fullWidth size="lg" className="bg-black text-white hover:bg-orange-600 py-4 uppercase font-black">Sincronizar & Avançar</Button>
            </form>
          </div>
        )}

        {state === AppState.TEST && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-black uppercase tracking-tighter">Etapa {currentQuestionIndex + 1} de 30</span>
              </div>
              <span className="text-sm font-black text-orange-600 italic">{Math.round(((currentQuestionIndex + 1) / DISC_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-8 overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: `${((currentQuestionIndex + 1) / DISC_QUESTIONS.length) * 100}%` }}></div>
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
          <div className="max-w-2xl mx-auto text-center py-20 space-y-8 animate-pulse">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter">Analisando Perfil Logístico...</h3>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <div className="animate-in fade-in duration-1000 flex flex-col items-center">
             <div className="w-full mb-10 bg-white p-12 rounded-3xl border-t-8 border-green-500 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="bg-green-100 p-4 rounded-full">
                   <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                   <h2 className="text-4xl font-black text-black uppercase italic">Muito Obrigado, {result.userInfo.name.split(' ')[0]}!</h2>
                   <p className="text-slate-500 font-bold text-xl mt-2">Sua participação foi registrada com sucesso no sistema de Bruno Costa.</p>
                </div>
                <div className="w-full max-w-md bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                   <p className="text-slate-600 font-medium italic">"Seus dados agora fazem parte da nossa estratégia de alta performance. Clique no botão abaixo para concluir."</p>
                </div>
                <Button variant="primary" onClick={() => setState(AppState.WELCOME)} className="bg-black hover:bg-orange-600 px-20 py-6 text-xl shadow-2xl uppercase font-black transform hover:-translate-y-1 transition-all">
                   FINALIZAR E OK
                </Button>
             </div>
             
             <div className="w-full opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <ResultDashboard scores={result.scores} analysis={result.analysis || ""} result={result} />
             </div>
          </div>
        )}

        {state === AppState.HISTORY && isAdmin && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black p-10 rounded-3xl text-white border-b-8 border-orange-500 shadow-2xl">
              <div>
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter">Gestão de Talentos <span className="text-orange-500">Bruno Costa</span></h2>
                 <p className="text-orange-200 font-medium italic text-lg">Dashboards e Auditoria Comportamental.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="primary" onClick={exportToCSV} disabled={history.length === 0} className="bg-orange-500 hover:bg-orange-600 text-black uppercase font-black px-8 py-4 shadow-orange-500/20 shadow-xl">
                  EXPORTAR CSV COMPLETO
                </Button>
              </div>
            </div>

            {/* Dashboards Section */}
            {adminStats && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Distribuição de Perfis
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={adminStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {adminStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Volume por Categoria DISC
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adminStats}>
                        <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {adminStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-black text-white p-8 rounded-3xl border-l-8 border-orange-500">
                     <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Total Sincronizados</span>
                     <div className="text-5xl font-black italic mt-1">{history.length}</div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border-2 border-slate-100">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Perfil Predominante</span>
                     <div className="text-3xl font-black text-black italic mt-1">
                        {adminStats.reduce((prev, curr) => prev.value > curr.value ? prev : curr).name}
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex items-center justify-center">
                     <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => {if(confirm("Apagar histórico?")) { setHistory([]); localStorage.removeItem('disc_assessment_history_bruno_costa'); }}}>Limpar Banco</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b-4 border-orange-500 text-white">
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Colaborador</th>
                        <th className="px-8 py-6 text-center text-xs font-black text-orange-400 uppercase">D</th>
                        <th className="px-8 py-6 text-center text-xs font-black text-orange-400 uppercase">I</th>
                        <th className="px-8 py-6 text-center text-xs font-black text-orange-400 uppercase">S</th>
                        <th className="px-8 py-6 text-center text-xs font-black text-orange-400 uppercase">C</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-widest">Abordagem Sugerida</th>
                        <th className="px-8 py-6 text-center text-xs font-black uppercase tracking-widest">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-orange-50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="text-sm font-black text-black uppercase italic">{h.userInfo.name}</div>
                            <div className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleDateString('pt-BR')}</div>
                          </td>
                          <td className="px-8 py-6 text-center font-black text-orange-700">{h.scores.D}</td>
                          <td className="px-8 py-6 text-center font-black text-orange-700">{h.scores.I}</td>
                          <td className="px-8 py-6 text-center font-black text-orange-700">{h.scores.S}</td>
                          <td className="px-8 py-6 text-center font-black text-orange-700">{h.scores.C}</td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-600 max-w-xs italic">
                            "{h.suggestion}"
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button onClick={() => { setResult(h); setState(AppState.RESULT); }} className="bg-black text-white px-6 py-2.5 rounded text-[10px] font-black uppercase hover:bg-orange-500 transition-all">VER</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-black text-white border-t-8 border-orange-500 py-12 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
           <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Picking de Potenciais <span className="text-orange-500">DISC</span></h4>
           <p className="text-slate-400 text-xs uppercase font-bold tracking-[0.2em] italic">
             "Separando Perfis, Montando Equipes de Alta Performance"
           </p>
           <div className="w-16 h-1 bg-orange-500 mx-auto my-6"></div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
             Uma ferramenta produzida por <span className="text-white">Bruno Costa</span>
           </p>
           <p className="text-slate-700 text-[10px] font-bold mt-4">
             © {new Date().getFullYear()} Bruno Costa Logística. Auditoria Comportamental em Vercel/GitHub Environment.
           </p>
        </div>
      </footer>
    </div>
  );
}
