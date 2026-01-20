
import React from 'react';
import { QuestionGroup, DISCKey } from '../types';

interface QuestionCardProps {
  group: QuestionGroup;
  currentStep: number;
  totalSteps: number;
  onSelection: (most: DISCKey, least: DISCKey) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  group,
  currentStep,
  totalSteps,
  onSelection
}) => {
  const [mostSelected, setMostSelected] = React.useState<DISCKey | null>(null);
  const [leastSelected, setLeastSelected] = React.useState<DISCKey | null>(null);

  const handleComplete = () => {
    if (mostSelected && leastSelected) {
      onSelection(mostSelected, leastSelected);
      setMostSelected(null);
      setLeastSelected(null);
    }
  };

  const isComplete = mostSelected !== null && leastSelected !== null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden">
      <div className="bg-black px-6 py-5 flex justify-between items-center border-b-4 border-orange-500">
        <h3 className="text-white font-black italic uppercase tracking-tighter">Módulo {currentStep + 1} / {totalSteps}</h3>
        <div className="bg-orange-500 px-3 py-1 rounded text-[10px] text-black font-black uppercase tracking-wider">
          Seleção Crítica
        </div>
      </div>

      <div className="p-8">
        <p className="text-slate-500 mb-8 font-medium border-l-4 border-orange-200 pl-4">
          Para uma análise precisa da equipe BC, escolha o termo que <b className="text-black uppercase">mais</b> e o que <b className="text-black uppercase">menos</b> descreve sua conduta profissional.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center font-black text-black text-[10px] uppercase tracking-widest px-4 border-b pb-2 border-slate-100">
            <div className="col-span-6">Característica</div>
            <div className="col-span-3 text-center">Mais (+)</div>
            <div className="col-span-3 text-center">Menos (-)</div>
          </div>

          {group.options.map((opt, idx) => (
            <div 
              key={idx} 
              className={`grid grid-cols-12 gap-4 items-center p-4 rounded transition-all duration-200 border-2 ${
                (mostSelected === opt.type || leastSelected === opt.type) 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-slate-50 border-transparent'
              }`}
            >
              <div className="col-span-6 font-bold text-black uppercase tracking-tight">{opt.text}</div>
              
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => {
                    if (leastSelected === opt.type) setLeastSelected(null);
                    setMostSelected(opt.type);
                  }}
                  className={`w-12 h-12 rounded flex items-center justify-center transition-all ${
                    mostSelected === opt.type 
                    ? 'bg-orange-500 text-black scale-110 shadow-lg' 
                    : 'bg-white text-slate-300 hover:bg-orange-100 border-2 border-slate-200'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              </div>

              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => {
                    if (mostSelected === opt.type) setMostSelected(null);
                    setLeastSelected(opt.type);
                  }}
                  className={`w-12 h-12 rounded flex items-center justify-center transition-all ${
                    leastSelected === opt.type 
                    ? 'bg-black text-white scale-110 shadow-lg' 
                    : 'bg-white text-slate-300 hover:bg-slate-200 border-2 border-slate-200'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            disabled={!isComplete}
            onClick={handleComplete}
            className={`px-12 py-4 rounded font-black uppercase transition-all flex items-center gap-3 transform ${
              isComplete 
              ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl cursor-pointer hover:-translate-y-1' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Próxima Etapa
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
