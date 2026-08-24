import React, { useState } from 'react';
import { Logo } from '../../components/common/Logo';
import { AppIcon } from '../../components/common/AppIcon';
import { Check, ArrowRight, UserPlus, Sparkles, Baby } from 'lucide-react';
import { Child, User } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: Partial<User>, children: Child[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userName, setUserName] = useState('Ana');
  const [children, setChildren] = useState<Array<{ name: string; birthDate: string }>>([
    { name: 'Samyr', birthDate: '2026-03-12' },
    { name: 'Suayla', birthDate: '2026-03-12' },
  ]);

  const [tempChildName, setTempChildName] = useState('');
  const [tempChildBirth, setTempChildBirth] = useState('2026-03-12');
  const [isAddingAnother, setIsAddingAnother] = useState(false);

  if (!isOpen) return null;

  const handleAddChildToTempList = () => {
    if (!tempChildName.trim()) return;
    setChildren([...children, { name: tempChildName.trim(), birthDate: tempChildBirth }]);
    setTempChildName('');
    setIsAddingAnother(false);
  };

  const handleFinish = () => {
    const formattedChildren: Child[] = children.map((c, idx) => ({
      id: 'child-' + idx + '-' + Date.now(),
      familyId: 'family-01',
      name: c.name,
      birthDate: c.birthDate,
      avatarBgColor: idx % 2 === 0 ? '#89A589' : '#F08A6B',
      active: true,
      createdAt: new Date().toISOString(),
    }));

    onComplete(
      {
        name: userName.trim() || 'Ana',
      },
      formattedChildren
    );
  };

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 bg-[#133A34] text-[#FFF6EE] flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300"
    >
      {/* Top Brand Area */}
      <div className="flex items-center justify-between">
        <Logo variant="light" size="md" />
        <span className="text-xs font-semibold text-[#89A589]">Passo {step} de 3</span>
      </div>

      {/* Center Body */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex justify-center">
              <AppIcon size={80} className="shadow-2xl ring-4 ring-[#89A589]/20" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#FFF6EE]">
                Cuidar fica mais leve.
              </h1>
              <p className="text-sm text-[#89A589] max-w-xs mx-auto leading-relaxed">
                Organize a rotina, saúde e momentos importantes de quem mais importa.
              </p>
            </div>

            <div className="pt-4">
              <button
                id="onboarding-start-btn"
                onClick={() => setStep(2)}
                type="button"
                className="w-full py-3.5 rounded-2xl bg-[#F08A6B] hover:bg-[#e0795c] text-[#FFF6EE] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <span>Começar</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-extrabold text-[#FFF6EE] tracking-tight">
                Como podemos te chamar?
              </h2>
              <p className="text-xs text-[#89A589] mt-1">
                Seu nome será exibido nos registros e lembretes da família.
              </p>
            </div>

            <div>
              <input
                type="text"
                autoFocus
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Seu nome (ex: Ana, Lucas...)"
                className="w-full px-4 py-3.5 text-base font-bold rounded-2xl bg-[#FFF6EE]/10 border border-[#FFF6EE]/20 text-[#FFF6EE] placeholder:text-[#FFF6EE]/40 focus:outline-none focus:border-[#F08A6B]"
              />
            </div>

            <div className="pt-4">
              <button
                id="onboarding-step2-next-btn"
                onClick={() => setStep(3)}
                type="button"
                className="w-full py-3.5 rounded-2xl bg-[#F08A6B] hover:bg-[#e0795c] text-[#FFF6EE] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <span>Continuar</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div>
              <h2 className="text-2xl font-extrabold text-[#FFF6EE] tracking-tight">
                Quem faz parte do seu nenê?
              </h2>
              <p className="text-xs text-[#89A589] mt-1">
                Cadastre seus filhos. O NENÊ foi pensado para famílias com um ou mais filhos (incluindo gêmeos).
              </p>
            </div>

            {/* List of current added children */}
            <div className="space-y-2">
              {children.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FFF6EE]/10 border border-[#FFF6EE]/15 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#89A589] text-[#FFF6EE] flex items-center justify-center text-xs font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#FFF6EE]">{c.name}</div>
                      <div className="text-[10px] text-[#89A589]">Nascimento: {c.birthDate}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#F08A6B] font-bold">Cadastrado</span>
                </div>
              ))}
            </div>

            {isAddingAnother ? (
              <div className="p-4 rounded-2xl bg-[#FFF6EE]/10 border border-[#FFF6EE]/20 space-y-3">
                <input
                  type="text"
                  value={tempChildName}
                  onChange={(e) => setTempChildName(e.target.value)}
                  placeholder="Nome da criança"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FFF6EE]/10 border border-[#FFF6EE]/20 text-[#FFF6EE] placeholder:text-[#FFF6EE]/40"
                />
                <input
                  type="date"
                  value={tempChildBirth}
                  onChange={(e) => setTempChildBirth(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FFF6EE]/10 border border-[#FFF6EE]/20 text-[#FFF6EE]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingAnother(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border border-[#FFF6EE]/20 text-[#FFF6EE]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddChildToTempList}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#F08A6B] text-[#FFF6EE]"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingAnother(true)}
                type="button"
                className="w-full py-2.5 rounded-2xl border border-dashed border-[#89A589]/50 hover:border-[#89A589] text-xs font-bold text-[#89A589] hover:text-[#FFF6EE] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>+ Adicionar outro filho / gêmeo</span>
              </button>
            )}

            <div className="pt-2">
              <button
                id="onboarding-finish-btn"
                onClick={handleFinish}
                type="button"
                className="w-full py-3.5 rounded-2xl bg-[#F08A6B] hover:bg-[#e0795c] text-[#FFF6EE] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Check size={18} />
                <span>Entrar no NENÊ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-[#89A589]">
        NENÊ — Cuidar fica mais leve.
      </div>
    </div>
  );
};
