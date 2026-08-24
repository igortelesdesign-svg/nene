import React from 'react';
import { Home, Users, Plus, Calendar, User } from 'lucide-react';

export type NavTab = 'hoje' | 'criancas' | 'agenda' | 'perfil';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickRegister: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickRegister,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF6EE] border-t border-[#133A34]/5 safe-bottom"
    >
      <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between relative">
        {/* Tab: Hoje */}
        <button
          id="nav-tab-hoje"
          onClick={() => onTabChange('hoje')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            activeTab === 'hoje'
              ? 'opacity-100 text-[#133A34]'
              : 'opacity-35 hover:opacity-70 text-[#133A34]'
          }`}
        >
          <Home
            size={20}
            strokeWidth={activeTab === 'hoje' ? 2.4 : 1.8}
            className="text-[#133A34]"
          />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Hoje</span>
        </button>

        {/* Tab: Crianças */}
        <button
          id="nav-tab-criancas"
          onClick={() => onTabChange('criancas')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            activeTab === 'criancas'
              ? 'opacity-100 text-[#133A34]'
              : 'opacity-35 hover:opacity-70 text-[#133A34]'
          }`}
        >
          <Users
            size={20}
            strokeWidth={activeTab === 'criancas' ? 2.4 : 1.8}
            className="text-[#133A34]"
          />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Crianças</span>
        </button>

        {/* Center Prominent Action Button: Registrar in Clean Minimalism */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            id="nav-register-care-fab"
            onClick={onOpenQuickRegister}
            type="button"
            className="w-13 h-13 bg-[#133A34] rounded-2xl shadow-xl flex items-center justify-center text-white active:scale-95 hover:bg-[#1a4e46] transition-all duration-200 cursor-pointer group"
            aria-label="Registrar cuidado"
          >
            <Plus
              size={22}
              strokeWidth={2.4}
              className="text-[#FFF6EE] group-hover:rotate-90 transition-transform duration-200"
            />
          </button>
        </div>

        {/* Tab: Agenda */}
        <button
          id="nav-tab-agenda"
          onClick={() => onTabChange('agenda')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            activeTab === 'agenda'
              ? 'opacity-100 text-[#133A34]'
              : 'opacity-35 hover:opacity-70 text-[#133A34]'
          }`}
        >
          <Calendar
            size={20}
            strokeWidth={activeTab === 'agenda' ? 2.4 : 1.8}
            className="text-[#133A34]"
          />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Agenda</span>
        </button>

        {/* Tab: Perfil */}
        <button
          id="nav-tab-perfil"
          onClick={() => onTabChange('perfil')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center h-full transition-all cursor-pointer ${
            activeTab === 'perfil'
              ? 'opacity-100 text-[#133A34]'
              : 'opacity-35 hover:opacity-70 text-[#133A34]'
          }`}
        >
          <User
            size={20}
            strokeWidth={activeTab === 'perfil' ? 2.4 : 1.8}
            className="text-[#133A34]"
          />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
