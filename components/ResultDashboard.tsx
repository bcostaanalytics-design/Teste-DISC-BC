
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
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-black">
          <h2 className="text-2xl font-black text-black mb-8 flex items-center gap-3 uppercase italic">
            Mapa Comportamental
          </h2>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }} />
                <Radar name="Perfil" dataKey="A" stroke="#EA580C" fill="#EA580C" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-4">
            {chartData.map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.subject.split(' ')[0]}</div>
                <div className="text-2xl font-black text-black">{item.A}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white p-8 rounded-3xl shadow-2xl border-t-8 border-orange-500">
          <h2 className="text-2xl font-black mb-8 uppercase italic text-orange-500">Pilares DISC</h2>
          <div className="space-y-6">
            {(Object.entries(PROFILE_INFO) as [string, typeof PROFILE_INFO['D']][]).map(([key, info]) => (
              <div key={key} className="flex gap-5 p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl font-black text-black transform skew-x-[-6deg]" style={{ backgroundColor: info.color }}>
                  {key}
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase italic text-white">{info.title}</h3>
                  <p className="text-slate-400 text-sm leading-snug font-medium mt-1">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-black px-10 py-6 flex items-center gap-4 border-b-8 border-orange-500">
          <h2 className="text-2xl font-black text-white uppercase italic">Análise de Potencial</h2>
        </div>
        <div className="p-12 prose prose-slate max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-800 text-xl font-medium">
             {analysis.split('\n').map((line, idx) => {
               if (line.startsWith('#')) return (
                 <h3 key={idx} className="text-3xl font-black text-black uppercase italic mt-12 mb-8 border-b-4 border-orange-500 pb-2">
                   {line.replace(/#/g, '').trim()}
                 </h3>
               );
               if (line.startsWith('-') || line.startsWith('*')) return (
                 <li key={idx} className="ml-8 mb-4 list-none flex items-start gap-4">
                   <div className="bg-orange-500 w-5 h-5 rounded-md flex-shrink-0 mt-1 transform rotate-45"></div>
                   <span className="text-slate-800 font-bold text-lg">{line.substring(1).trim()}</span>
                 </li>
               );
               if (line.trim() === "") return <div key={idx} className="h-4"></div>;
               return <p key={idx} className="mb-8 leading-relaxed border-l-4 border-slate-100 pl-6">{line}</p>;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};
