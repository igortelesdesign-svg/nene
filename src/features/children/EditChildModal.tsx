import React, { useState, useEffect } from 'react';
import { X, Check, Baby, Trash2, AlertTriangle } from 'lucide-react';
import { Child, ChildSex } from '../../types';
import { normalizeChildSex } from '../../utils/childUtils';

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onSave: (childId: string, updates: Partial<Child>) => Promise<void>;
  onDelete: (childId: string) => Promise<void>;
}

export const EditChildModal: React.FC<EditChildModalProps> = ({
  isOpen,
  onClose,
  child,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<ChildSex>('male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [pediatrician, setPediatrician] = useState('');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (child) {
      setName(child.name || '');
      setNickname(child.nickname || '');
      setBirthDate(child.birthDate || '');
      setSex(normalizeChildSex(child.sex || child.gender));
      setPhotoUrl(child.photoUrl || '');
      setBloodType(child.bloodType || '');
      setPediatrician(child.pediatrician || '');
      setAllergies(
        Array.isArray(child.allergies)
          ? child.allergies.join(', ')
          : child.allergies || ''
      );
      setNotes(child.notes || '');
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [child]);

  if (!isOpen || !child) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da criança.');
      return;
    }
    if (!birthDate) {
      setError('Por favor, informe a data de nascimento.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(child.id, {
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        birthDate,
        sex,
        photoUrl: photoUrl.trim() || undefined,
        bloodType: bloodType.trim() || undefined,
        pediatrician: pediatrician.trim() || undefined,
        allergies: allergies.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Não conseguimos salvar as alterações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onDelete(child.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Não foi possível remover a criança.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFF6EE] rounded-3xl border border-[#133A34]/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#133A34]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#133A34]/10 text-[#133A34] flex items-center justify-center">
              <Baby size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#133A34]">Editar Perfil da Criança</h2>
              <p className="text-[11px] text-[#89A589]">{child.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 text-[#133A34]/70 hover:text-[#133A34] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
            {error}
          </div>
        )}

        {showDeleteConfirm ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#133A34]">Tem certeza que deseja remover esta criança?</h3>
              <p className="text-xs text-[#89A589] mt-1.5 leading-relaxed">
                As informações de <strong>{child.name}</strong> serão desativadas da rotina da família com segurança.
              </p>
            </div>
            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#133A34]/10 text-[#133A34] font-semibold text-xs cursor-pointer hover:bg-[#133A34]/15"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs cursor-pointer hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Sim, remover</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1">
            <div>
              <label className="text-xs font-bold text-[#133A34] block mb-1">
                Nome da criança *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">
                  Gênero / Sexo
                </label>
                <select
                  id="edit-child-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as ChildSex)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                  <option value="not_informed">Prefiro não informar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">
                  Tipo Sanguíneo
                </label>
                <input
                  type="text"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  placeholder="Ex: O+, A+, B-"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">
                  Pediatra
                </label>
                <input
                  type="text"
                  value={pediatrician}
                  onChange={(e) => setPediatrician(e.target.value)}
                  placeholder="Ex: Dra. Camila Barros"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#133A34] block mb-1">
                Alergias ou Cuidados Especiais
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Nenhuma conhecida, sensibilidade a sabonetes..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#133A34] block mb-1">
                Observações de Rotina
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Dicas para adormecer, preferências..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-white focus:outline-none focus:border-[#133A34] resize-none"
              />
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#133A34] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#1a4e46] transition-all disabled:opacity-50"
              >
                <Check size={16} className="text-[#F08A6B]" />
                <span>Salvar Alterações</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Remover criança</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
