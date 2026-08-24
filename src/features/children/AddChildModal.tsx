import React, { useState } from 'react';
import { X, Check, Baby } from 'lucide-react';
import { Child, ChildSex } from '../../types';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onAddChild: (child: any) => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  familyId,
  onAddChild,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('2026-03-12');
  const [sex, setSex] = useState<ChildSex>('male');
  const [bloodType, setBloodType] = useState('A+');
  const [pediatrician, setPediatrician] = useState('Dra. Camila Nogueira');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = ['#89A589', '#F08A6B', '#F6C56B', '#133A34'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newChild = {
      familyId,
      name: name.trim(),
      birthDate,
      sex,
      gender: sex,
      bloodType: bloodType || undefined,
      pediatrician: pediatrician.trim() || undefined,
      allergies: allergies.trim() ? [allergies.trim()] : undefined,
      notes: notes.trim() || undefined,
      avatarBgColor: randomColor,
      active: true,
    };

    onAddChild(newChild);
    onClose();
  };

  return (
    <div
      id="add-child-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="add-child-modal"
        className="w-full max-w-md bg-[#FFF6EE] rounded-3xl border border-[#133A34]/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-5 py-4 border-b border-[#133A34]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#89A589]/20 text-[#133A34] flex items-center justify-center">
              <Baby size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#133A34]">Adicionar Criança</h2>
              <p className="text-[11px] text-[#89A589]">Cadastrar novo nenê na família</p>
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
              placeholder="Ex: Samyr, Suayla, Gael..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#133A34] block mb-1">
                Sexo
              </label>
              <select
                id="add-child-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as ChildSex)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
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
                Tipo sanguíneo
              </label>
              <input
                type="text"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="Ex: A+, O+, B-"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
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
                placeholder="Ex: Dra. Camila Nogueira"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#133A34] block mb-1">
              Alergias ou restrições conhecidas
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ex: Nenhuma conhecida ou proteína do leite"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#133A34] block mb-1">
              Observações importantes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Gosta de banho morno antes de dormir..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              id="submit-new-child-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#133A34] text-[#FFF6EE] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#1a4e46] transition-all"
            >
              <Check size={16} className="text-[#F08A6B]" />
              <span>Cadastrar Criança</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
