
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { DISCScore, AssessmentResult } from '../types';
import { PROFILE_INFO, DISC_QUESTIONS } from '../constants';

interface ResultDashboardProps {
  scores: DISCScore;
  analysis: string;
  result: AssessmentResult;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ scores, analysis, result }) => {
  const chartData = [
    { subject: 'D - DOMINÂNCIA', A: scores.D, fullMark: 10 },
    { subject: 'I - INFLUÊNCIA', A: scores.I, fullMark: 10 },
    { subject: 'S - ESTABILIDADE', A: scores.S, fullMark: 10 },
    { subject: 'C - CONFORMIDADE', A: scores.C, fullMark: 10 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Visualizations */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-4 border-black">
          <h2 className="text-xl font-black text-black mb-8 flex items-center gap-3 uppercase italic">
            <div className="bg-orange-500 p-1.5 rounded">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            Matriz Bruno Costa de Performance
          </h2>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }} />
                <Radar
                  name="Perfil"
                  dataKey="A"
                  stroke="#EA580C"
                  fill="#EA580C"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {chartData.map((item, i) => (
              <div key={i} className="text-center p-4 rounded bg-slate-50 border-2 border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                  {item.subject.split(' ')[0]}
                </div>
                <div className="text-3xl font-black text-black">
                  {item.A}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Legend */}
        <div className="bg-black text-white p-8 rounded-2xl shadow-2xl border-t-4 border-orange-500">
          <h2 className="text-xl font-black mb-8 uppercase italic text-orange-500 tracking-tighter">Pilares DISC Bruno Costa</h2>
          <div className="space-y-6">
            {(Object.entries(PROFILE_INFO) as [string, typeof PROFILE_INFO['D']][]).map(([key, info]) => (
              <div key={key} className="flex gap-5 p-4 rounded bg-slate-900 border border-slate-800 hover:border-orange-500 transition-colors">
                <div className="w-14 h-14 rounded flex items-center justify-center shrink-0 text-2xl font-black text-black transform skew-x-[-6deg]" style={{ backgroundColor: info.color }}>
                  {key}
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase italic text-white tracking-tight">{info.title}</h3>
                  <p className="text-slate-400 text-sm leading-snug font-medium mt-1">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-black px-8 py-5 flex items-center gap-4 border-b-4 border-orange-500">
          <div className="bg-orange-500 p-2 rounded">
             <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Relatório de Alta Performance <span className="text-orange-500">BRUNO COSTA</span></h2>
        </div>
        <div className="p-10 prose prose-slate max-w-none prose-headings:text-black prose-strong:text-black">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-800 text-lg font-medium">
             {analysis.split('\n').map((line, idx) => {
               if (line.startsWith('#')) return (
                 <h3 key={idx} className="text-2xl font-black text-black uppercase italic mt-10 mb-6 border-b-4 border-orange-500 pb-2 tracking-tight flex items-center gap-2">
                   {line.replace(/#/g, '').trim()}
                 </h3>
               );
               if (line.startsWith('-') || line.startsWith('*')) return (
                 <li key={idx} className="ml-6 mb-3 list-none flex items-start gap-3">
                   <div className="bg-orange-500 w-4 h-4 rounded-sm flex-shrink-0 mt-1 transform rotate-45"></div>
                   <span className="text-slate-800 font-semibold">{line.substring(1).trim()}</span>
                 </li>
               );
               if (line.trim() === "") return <div key={idx} className="h-4"></div>;
               return <p key={idx} className="mb-6 leading-relaxed border-l-2 border-slate-100 pl-4">{line}</p>;
             })}
          </div>
        </div>
      </div>

      {/* Checklist Evidence Section */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-100 px-8 py-5 flex items-center gap-4 border-b-4 border-black">
           <div className="bg-black p-2 rounded">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
           </div>
           <h2 className="text-xl font-black text-black uppercase italic tracking-tighter">Evidência do Assessment (30 Etapas)</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Módulo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Mais (+)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Menos (-)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">DISC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DISC_QUESTIONS.map((q, idx) => {
                const mostKey = result.responses.most[idx];
                const leastKey = result.responses.least[idx];
                const mostText = q.options.find(o => o.type === mostKey)?.text;
                const leastText = q.options.find(o => o.type === leastKey)?.text;
                
                return (
                  <tr key={idx} className="hover:bg-orange-50/50">
                    <td className="px-6 py-3 font-bold text-slate-400 text-xs">#{q.id}</td>
                    <td className="px-6 py-3 font-black text-black uppercase italic text-sm">
                      <span className="text-orange-600 mr-2">+</span> {mostText}
                    </td>
                    <td className="px-6 py-3 font-black text-slate-400 uppercase italic text-sm">
                      <span className="text-slate-300 mr-2">-</span> {leastText}
                    </td>
                    <td className="px-6 py-3 text-center">
                       <div className="inline-flex gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${mostKey === 'D' ? 'bg-orange-800' : mostKey === 'I' ? 'bg-orange-600' : mostKey === 'S' ? 'bg-orange-400' : 'bg-slate-800'}`}>+{mostKey}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-500">-{leastKey}</span>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-black p-4 text-center">
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em]">Bruno Costa Logística - Auditoria Comportamental em Armazém, Inventário & Estoque</p>
        </div>
      </div>
    </div>
  );
};
