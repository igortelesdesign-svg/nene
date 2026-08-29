import React, { useState } from 'react';
import { 
  UserPlus, 
  Baby, 
  Heart, 
  ShieldAlert, 
  ChevronRight,
  Stethoscope,
  X,
  Edit2,
  Sparkles,
  FileText
} from 'lucide-react';
import { Child, TimelineEvent } from '../../types';
import { calculateChildAge } from '../../utils/dateUtils';
import { formatChildSex } from '../../utils/childUtils';
import { AddChildModal } from './AddChildModal';
import { EditChildModal } from './EditChildModal';
import { useApp } from '../../context/AppContext';
import { ChildReportView } from '../reports/ChildReportView';

interface ChildrenViewProps {
  childrenList: Child[];
  events: TimelineEvent[];
  onAddChild: (child: any) => void;
  onSelectChildForDashboard: (childId: string) => void;
  familyId: string;
}

export const ChildrenView: React.FC<ChildrenViewProps> = ({
  childrenList,
  events,
  onAddChild,
  onSelectChildForDashboard,
  familyId,
}) => {
  const { updateChild, deleteChild } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChildDetail, setSelectedChildDetail] = useState<Child | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [reportChild, setReportChild] = useState<Child | null>(null);

  if (reportChild) {
    return (
      <ChildReportView
        child={reportChild}
        events={events}
        onBack={() => setReportChild(null)}
      />
    );
  }

  const handleSaveEdit = async (childId: string, updates: Partial<Child>) => {
    await updateChild(childId, updates);
  };

  const handleDeleteChild = async (childId: string) => {
    await deleteChild(childId);
  };

  return (
    <div id="children-view-container" className="space-y-5 px-5 pt-3 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#133A34] tracking-tight">
            Nenês da Família
          </h1>
          <p className="text-xs text-[#89A589]">
            {childrenList.length === 0
              ? 'Nenhuma criança cadastrada ainda'
              : childrenList.length === 1
              ? '1 criança cadastrada'
              : `${childrenList.length} crianças cadastradas`}
          </p>
        </div>
        <button
          id="add-child-header-btn"
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-[#133A34] text-[#FFF6EE] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#1a4e46] transition-all"
        >
          <UserPlus size={14} className="text-[#F08A6B]" />
          <span>+ Adicionar criança</span>
        </button>
      </div>

      {/* ESTADO VAZIO */}
      {childrenList.length === 0 ? (
        <div className="bg-[#FFF6EE] rounded-3xl border border-[#89A589]/20 p-8 text-center space-y-4 my-6 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#E8F2EC] text-[#133A34] flex items-center justify-center mx-auto">
            <Baby size={32} className="text-[#133A34]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#133A34]">Seu nenê começa aqui.</h2>
            <p className="text-xs text-[#89A589] mt-1 max-w-xs mx-auto">
              Cadastre a primeira criança para organizar a rotina e os cuidados.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#133A34] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs hover:bg-[#1a4e46] transition-all"
          >
            <UserPlus size={16} className="text-[#F08A6B]" />
            <span>Adicionar criança</span>
          </button>
        </div>
      ) : (
        /* Children List */
        <div className="space-y-4">
          {childrenList.map((child) => {
            const age = calculateChildAge(child.birthDate);
            const childEvents = events.filter((e) => e.childId === child.id);
            const feedingsCount = childEvents.filter((e) => e.category === 'feeding').length;
            const diaperCount = childEvents.filter((e) => e.category === 'diaper').length;

            return (
              <div
                key={child.id}
                id={`child-profile-card-${child.id}`}
                className="bg-[#FFF6EE] rounded-[24px] border border-[#133A34]/5 shadow-xs p-4 space-y-3.5 transition-all hover:border-[#133A34]/15"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: child.avatarBgColor || (child.sex === 'female' ? '#F08A6B' : '#89A589') }}
                    >
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#133A34] leading-tight">
                        {child.name}
                      </h2>
                      <span className="text-xs text-[#89A589] font-medium block">
                        {age.fullAge} • {formatChildSex(child.sex || child.gender)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingChild(child)}
                      type="button"
                      title="Editar informações da criança"
                      className="p-1.5 rounded-full bg-[#133A34]/5 hover:bg-[#133A34]/10 text-[#133A34] cursor-pointer transition-all"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={() => setSelectedChildDetail(child)}
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-[#133A34]/5 hover:bg-[#133A34]/10 text-xs font-bold text-[#133A34] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <span>Ver perfil</span>
                    </button>

                    <button
                      onClick={() => setReportChild(child)}
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-[#89A589]/15 hover:bg-[#89A589]/25 text-xs font-bold text-[#133A34] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <FileText size={13} />
                      <span>Relatório</span>
                    </button>

                    <button
                      onClick={() => onSelectChildForDashboard(child.id)}
                      type="button"
                      className="px-3 py-1.5 rounded-full bg-[#133A34] text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#1a4e46] transition-all"
                    >
                      <span>Rotina</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Health info pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {child.bloodType && (
                    <div className="bg-[#FFF6EE] border border-[#133A34]/10 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-[#89A589] block">Tipo Sanguíneo</span>
                      <span className="text-xs font-bold text-[#133A34]">{child.bloodType}</span>
                    </div>
                  )}
                  {child.pediatrician && (
                    <div className="bg-[#FFF6EE] border border-[#133A34]/10 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-[#89A589] block">Pediatra</span>
                      <span className="text-xs font-bold text-[#133A34] truncate block">
                        {child.pediatrician}
                      </span>
                    </div>
                  )}
                  <div className="bg-[#FFF6EE] border border-[#133A34]/10 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-[#89A589] block">Registros</span>
                    <span className="text-xs font-bold text-[#133A34]">
                      {feedingsCount} mamadas • {diaperCount} fraldas
                    </span>
                  </div>
                </div>

                {/* Allergies / Health alerts */}
                {child.allergies && (
                  <div className="bg-[#F08A6B]/10 border border-[#F08A6B]/25 rounded-xl p-2.5 flex items-center gap-2 text-xs text-[#133A34]">
                    <ShieldAlert size={15} className="text-[#F08A6B] shrink-0" />
                    <span className="text-[11px] leading-tight">
                      <strong>Atenção / Alergias:</strong> {Array.isArray(child.allergies) ? child.allergies.join(', ') : child.allergies}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {child.notes && (
                  <p className="text-[11px] text-[#89A589] bg-[#FFF6EE] p-2.5 rounded-xl border border-[#133A34]/10">
                    💡 {child.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Child Profile Details Modal */}
      {selectedChildDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFF6EE] rounded-3xl border border-[#133A34]/10 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#133A34]/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs"
                  style={{ backgroundColor: selectedChildDetail.avatarBgColor || '#89A589' }}
                >
                  {selectedChildDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#133A34]">{selectedChildDetail.name}</h3>
                  <p className="text-xs text-[#89A589]">{calculateChildAge(selectedChildDetail.birthDate).fullAge} • Nascido(a) em {selectedChildDetail.birthDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChildDetail(null)}
                className="p-1 rounded-full text-[#133A34]/70 hover:text-[#133A34] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#133A34]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#F2EFE6]/60 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#89A589] block">Sexo</span>
                  <p className="font-bold">{formatChildSex(selectedChildDetail.sex || selectedChildDetail.gender)}</p>
                </div>
                <div className="p-3 bg-[#F2EFE6]/60 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#89A589] block">Tipo Sanguíneo</span>
                  <p className="font-bold">{selectedChildDetail.bloodType || 'Não informado'}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F2EFE6]/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#89A589] block">Pediatra Responsável</span>
                <p className="font-bold">{selectedChildDetail.pediatrician || 'Não informado'}</p>
                {selectedChildDetail.pediatricianPhone && (
                  <p className="text-[#89A589]">{selectedChildDetail.pediatricianPhone}</p>
                )}
              </div>

              <div className="p-3 bg-[#F2EFE6]/60 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#89A589] block">Alergias e Observações de Saúde</span>
                <p>
                  {selectedChildDetail.allergies
                    ? (Array.isArray(selectedChildDetail.allergies) ? selectedChildDetail.allergies.join(', ') : selectedChildDetail.allergies)
                    : 'Nenhuma alergia conhecida'}
                </p>
              </div>

              {selectedChildDetail.notes && (
                <div className="p-3 bg-[#F2EFE6]/60 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#89A589] block">Rotina e Dicas</span>
                  <p>{selectedChildDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setEditingChild(selectedChildDetail);
                  setSelectedChildDetail(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#133A34]/10 text-[#133A34] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#133A34]/15"
              >
                <Edit2 size={13} />
                <span>Editar</span>
              </button>

              <button
                onClick={() => {
                  onSelectChildForDashboard(selectedChildDetail.id);
                  setSelectedChildDetail(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#133A34] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:bg-[#1a4e46]"
              >
                <span>Ver rotina no Dashboard</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        familyId={familyId}
        onAddChild={onAddChild}
      />

      {/* Edit Child Modal */}
      <EditChildModal
        isOpen={Boolean(editingChild)}
        onClose={() => setEditingChild(null)}
        child={editingChild}
        onSave={handleSaveEdit}
        onDelete={handleDeleteChild}
      />
    </div>
  );
};
