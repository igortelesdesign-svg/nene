import React, { useState } from 'react';
import { 
  Users, 
  Bell, 
  Smartphone, 
  Lock, 
  UserPlus, 
  LogOut,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, Family, FamilyMember } from '../../types';
import { AppIcon } from '../../components/common/AppIcon';
import { promptPWAInstall } from '../../pwa';
import { useApp } from '../../context/AppContext';

interface ProfileViewProps {
  currentUser: User;
  currentFamily: Family;
  onAddFamilyMember: (member: FamilyMember) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentFamily,
  onAddFamilyMember,
}) => {
  const { signOut, isConfiguredSupabase, familyMembers } = useApp();
  const [notificationPrivacy, setNotificationPrivacy] = useState<'detailed' | 'private'>('detailed');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelation, setInviteRelation] = useState('Pai');
  const [inviteRole, setInviteRole] = useState<'admin' | 'responsible' | 'caregiver' | 'viewer'>('responsible');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;

    const newMember: FamilyMember = {
      id: 'mem-' + Date.now(),
      familyId: currentFamily.id,
      userId: 'user-' + Date.now(),
      name: inviteName.trim(),
      email: inviteEmail.trim() || 'convidado@exemplo.com.br',
      role: inviteRole,
      relation: inviteRelation,
      createdAt: new Date().toISOString(),
    };

    onAddFamilyMember(newMember);
    setInviteName('');
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayMembers = familyMembers.length > 0 ? familyMembers : currentFamily.members || [];

  return (
    <div id="profile-view-container" className="space-y-5 px-5 pt-3 pb-24 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="nene-card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[#133A34] text-[#FFF6EE] flex items-center justify-center text-xl font-extrabold shadow-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-extrabold text-[#133A34] truncate">
                {currentUser.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#89A589]/20 text-[#133A34] text-[10px] font-bold">
                {currentUser.role === 'admin' ? 'Administrador(a)' : 'Cuidador'}
              </span>
            </div>
            <p className="text-xs text-[#89A589] truncate mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-[#133A34]/70 font-medium">
              {currentFamily.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sair da conta"
          type="button"
          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shrink-0"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>

      {/* Rede de Apoio & Cuidadores */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
            <Users size={14} className="text-[#89A589]" />
            <span>Rede de Apoio & Cuidadores ({displayMembers.length})</span>
          </h2>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="text-[11px] font-bold text-[#133A34] hover:text-[#F08A6B] flex items-center gap-1 cursor-pointer"
          >
            <UserPlus size={12} />
            <span>Convidar</span>
          </button>
        </div>

        <div className="nene-card p-4 divide-y divide-[#133A34]/8">
          {displayMembers.map((member) => (
            <div key={member.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#89A589]/20 text-[#133A34] flex items-center justify-center text-xs font-bold">
                  {member.name ? member.name.charAt(0) : 'M'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#133A34]">{member.name || 'Membro da Família'}</div>
                  <div className="text-[10px] text-[#89A589]">{member.relation || 'Responsável'}</div>
                </div>
              </div>

              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF6EE] border border-[#133A34]/10 text-[#133A34]">
                {member.role === 'admin' && 'Acesso total'}
                {member.role === 'responsible' && 'Responsável'}
                {member.role === 'caregiver' && 'Cuidador'}
                {member.role === 'viewer' && 'Leitura'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Backend & Banco de Dados */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
          <Database size={14} className="text-[#89A589]" />
          <span>Estrutura de Dados & Backend</span>
        </h2>

        <div className="nene-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#133A34]">Provedor de Banco de Dados</span>
            <span className="font-bold text-[#133A34]">Supabase (PostgreSQL + RLS)</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#133A34]/8">
            <span className="text-[#89A589]">Status de Conexão</span>
            {isConfiguredSupabase ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                <span>Supabase Conectado</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                <AlertCircle size={13} />
                <span>Modo Local / Pronto p/ Supabase</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Preferências de Notificação e Privacidade */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
          <Bell size={14} className="text-[#89A589]" />
          <span>Privacidade das Notificações</span>
        </h2>

        <div className="nene-card p-4 space-y-3">
          <p className="text-xs text-[#133A34]/80">
            Defina como os lembretes de cuidados aparecerão na tela de bloqueio:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNotificationPrivacy('detailed')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                notificationPrivacy === 'detailed'
                  ? 'bg-[#133A34] text-[#FFF6EE] border-[#133A34]'
                  : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15'
              }`}
            >
              <div className="text-xs font-bold">Modo Detalhado</div>
              <div
                className={`text-[10px] mt-1 ${
                  notificationPrivacy === 'detailed' ? 'text-[#FFF6EE]/80' : 'text-[#89A589]'
                }`}
              >
                "Cuidado de Samyr às 20h"
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNotificationPrivacy('private')}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                notificationPrivacy === 'private'
                  ? 'bg-[#133A34] text-[#FFF6EE] border-[#133A34]'
                  : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15'
              }`}
            >
              <div className="text-xs font-bold">Modo Privado</div>
              <div
                className={`text-[10px] mt-1 ${
                  notificationPrivacy === 'private' ? 'text-[#FFF6EE]/80' : 'text-[#89A589]'
                }`}
              >
                "Cuidado programado às 20h"
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* PWA & Sistema */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
          <Smartphone size={14} className="text-[#89A589]" />
          <span>Aplicativo & PWA</span>
        </h2>

        <div className="nene-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppIcon size={36} className="rounded-xl" />
              <div>
                <div className="text-xs font-bold text-[#133A34]">NENÊ PWA</div>
                <div className="text-[10px] text-[#89A589]">Sprint 2 — Arquitetura de Família e Multifilhos</div>
              </div>
            </div>

            <button
              onClick={() => promptPWAInstall()}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-[#133A34] text-[#FFF6EE] text-xs font-bold cursor-pointer hover:bg-[#1a4e46]"
            >
              Instalar App
            </button>
          </div>
        </div>
      </section>

      {/* Informações de Segurança */}
      <section className="space-y-2">
        <div className="nene-card p-4 bg-[#89A589]/10 border-[#89A589]/20 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#133A34]">
            <Lock size={14} className="text-[#133A34]" />
            <span>Segurança por Família (Row Level Security)</span>
          </div>
          <p className="text-[11px] text-[#133A34]/80 leading-relaxed">
            Seus dados são isolados estritamente pelo ID da família no Supabase. Usuários não autorizados ou de outras famílias não têm acesso aos dados das suas crianças.
          </p>
        </div>
      </section>

      {/* Invite Caregiver Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFF6EE] rounded-3xl p-5 border border-[#133A34]/10 shadow-2xl">
            <h3 className="text-sm font-bold text-[#133A34] mb-1">
              Convidar Cuidador(a)
            </h3>
            <p className="text-xs text-[#89A589] mb-4">
              Adicione parceiro(a), avós ou babá para compartilhar os cuidados
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Ex: Lucas, Vovó Maria..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">Vínculo</label>
                <input
                  type="text"
                  value={inviteRelation}
                  onChange={(e) => setInviteRelation(e.target.value)}
                  placeholder="Ex: Pai, Avó, Babá, Tia..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">Permissão</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                >
                  <option value="responsible">Responsável (Visualizar e registrar)</option>
                  <option value="caregiver">Cuidador (Registrar rotinas)</option>
                  <option value="viewer">Somente leitura</option>
                  <option value="admin">Administrador completo</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#133A34]/20 text-xs font-bold text-[#133A34]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#133A34] text-[#FFF6EE] text-xs font-bold"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
