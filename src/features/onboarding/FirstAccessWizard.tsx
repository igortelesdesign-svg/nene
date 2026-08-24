import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/common/Logo';
import { Plus, Users, Baby, ArrowRight, Check } from 'lucide-react';
import { ChildSex } from '../../types';
import { CHILD_SEX_OPTIONS } from '../../utils/childUtils';

interface FirstAccessWizardProps {
  onComplete: () => void;
}

export const FirstAccessWizard: React.FC<FirstAccessWizardProps> = ({ onComplete }) => {
  const { user, family, createFamily, addChild, refreshData } = useApp();

  const [step, setStep] = useState<'family' | 'child_form' | 'more_children'>('family');
  const [familyName, setFamilyName] = useState(
    family?.name || (user?.fullName ? `Família de ${user.fullName.split(' ')[0]}` : '')
  );

  // Form State da Criança
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('2026-03-12');
  const [sex, setSex] = useState<ChildSex>('male');
  const [allergies, setAllergies] = useState('');
  const [pediatrician, setPediatrician] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [notes, setNotes] = useState('');

  const [addedChildrenCount, setAddedChildrenCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrConfirmFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = familyName.trim();
    if (!cleanName) {
      setError('Por favor, informe o nome da sua família.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await createFamily(cleanName);
      if (res.error || !res.family) {
        console.error('[Onboarding Error] Falha ao criar família:', res.error);
        setError(res.error || 'Não foi possível salvar o nome da família no Supabase. Tente novamente.');
        return;
      }
      // Somente avançar se a família e o vínculo foram criados com sucesso
      setStep('child_form');
    } catch (err: any) {
      console.error('[Onboarding Exception] Falha ao criar família:', err);
      setError(err?.message || 'Erro inesperado ao salvar a família.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setError('Por favor, informe o nome da criança.');
      return;
    }
    if (!birthDate) {
      setError('Por favor, informe a data de nascimento.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await addChild({
        name: childName.trim(),
        birthDate,
        sex,
        bloodType: bloodType.trim() || undefined,
        allergies: allergies.trim() || undefined,
        pediatrician: pediatrician.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.error || !res.child) {
        console.error('[Onboarding Error] Falha ao cadastrar criança:', res.error);
        setError(res.error || 'Não foi possível salvar a criança.');
      } else {
        setAddedChildrenCount((prev) => prev + 1);
        // Limpa campos para a próxima
        setChildName('');
        setSex('female');
        setAllergies('');
        setPediatrician('');
        setBloodType('');
        setNotes('');
        setStep('more_children');
      }
    } catch (err: any) {
      console.error('[Onboarding Exception] Falha ao salvar criança:', err);
      setError(err?.message || 'Não foi possível salvar a criança.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    await refreshData();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#133A34]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F2EFE6] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#89A589]/20 my-auto">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* PASSO 1: NOME DA FAMÍLIA */}
        {step === 'family' && (
          <form onSubmit={handleCreateOrConfirmFamily} className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#133A34]/10 text-[#133A34] flex items-center justify-center mx-auto mb-3">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#133A34]">Como se chama a sua família?</h3>
              <p className="text-sm text-[#89A589] mt-1">
                Isso ajudará você e outros responsáveis a organizarem os cuidados em conjunto.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#133A34] mb-2 uppercase tracking-wider">
                Nome da Família
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Ex: Família Silva ou Família da Ana"
                className="w-full px-4 py-3 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] text-base focus:outline-none focus:ring-2 focus:ring-[#133A34]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#133A34] hover:bg-[#133A34]/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Continuar para cadastro das crianças</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* PASSO 2: QUEM FAZ PARTE DO SEU NENÊ? */}
        {step === 'child_form' && (
          <form onSubmit={handleSaveChild} className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F08A6B]/15 text-[#F08A6B] flex items-center justify-center mx-auto mb-3">
                <Baby size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#133A34]">Quem faz parte do seu nenê?</h3>
              <p className="text-sm text-[#89A589] mt-1">
                Cadastre a primeira criança para começarmos a organizar a rotina.
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                  Nome da Criança *
                </label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Ex: Samyr"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] text-sm focus:outline-none focus:ring-2 focus:ring-[#133A34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] text-sm focus:outline-none focus:ring-2 focus:ring-[#133A34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                    Sexo
                  </label>
                  <select
                    id="wizard-child-sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value as ChildSex)}
                    className="w-full px-3 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] text-sm focus:outline-none focus:ring-2 focus:ring-[#133A34]"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                    <option value="not_informed">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                  Pediatra (Opcional)
                </label>
                <input
                  type="text"
                  value={pediatrician}
                  onChange={(e) => setPediatrician(e.target.value)}
                  placeholder="Ex: Dra. Camila Barros"
                  className="w-full px-3.5 py-2 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] text-sm focus:outline-none focus:ring-2 focus:ring-[#133A34]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#133A34] hover:bg-[#133A34]/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Salvar criança</span>
                  <Check size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* PASSO 3: TEM MAIS CRIANÇAS? */}
        {step === 'more_children' && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F2EC] text-[#133A34] flex items-center justify-center mx-auto">
              <Check size={28} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#133A34]">
                {addedChildrenCount === 1 ? 'Criança cadastrada com sucesso!' : `${addedChildrenCount} crianças cadastradas!`}
              </h3>
              <p className="text-sm text-[#89A589] mt-2">
                Tem mais crianças na sua família? (Gêmeos, irmãos ou outros filhos)
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('child_form');
                  setChildName('');
                }}
                className="w-full py-3.5 px-4 bg-[#FFF6EE] hover:bg-[#FFF1E8] border border-[#89A589]/30 text-[#133A34] font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus size={18} className="text-[#F08A6B]" />
                <span>Adicionar outra criança</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3.5 px-4 bg-[#133A34] hover:bg-[#133A34]/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <span>Continuar para o NENÊ</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
