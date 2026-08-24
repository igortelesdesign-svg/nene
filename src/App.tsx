/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Logo } from './components/common/Logo';
import { ChildSelector } from './components/common/ChildSelector';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { QuickRegisterModal } from './components/common/QuickRegisterModal';
import { InstallBanner } from './components/common/InstallBanner';
import { DashboardView } from './features/dashboard/DashboardView';
import { ChildrenView } from './features/children/ChildrenView';
import { AgendaView } from './features/agenda/AgendaView';
import { ProfileView } from './features/profile/ProfileView';
import { AuthView } from './features/auth/AuthView';
import { FirstAccessWizard } from './features/onboarding/FirstAccessWizard';
import { AppProvider, useApp } from './context/AppContext';
import { TimelineEvent, MedicationSchedule, FamilyMember, Child } from './types';
import { registerServiceWorker } from './pwa';

import { medicationService } from './services/medicationService';

function MainApp() {
  const {
    user,
    family,
    childrenList,
    selectedChildId,
    setSelectedChildId,
    loading,
    addChild,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('hoje');
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    try {
      const raw = localStorage.getItem('nene_sprint2_events');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [medicationSchedules, setMedicationSchedules] = useState<MedicationSchedule[]>(() => {
    try {
      const raw = localStorage.getItem('nene_sprint2_med_schedules');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('nene_sprint2_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('nene_sprint2_med_schedules', JSON.stringify(medicationSchedules));
  }, [medicationSchedules]);

  const handleAddEvent = (newEvent: TimelineEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleUpdateEventStatus = async (
    eventId: string,
    status: 'administered' | 'postponed' | 'skipped',
    actualTime?: string,
    notes?: string
  ) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && e.category === 'medication') {
          return {
            ...e,
            status,
            actualTime:
              status === 'administered'
                ? (actualTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
                : e.actualTime,
            notes: notes !== undefined ? notes : e.notes,
          };
        }
        return e;
      })
    );

    try {
      await medicationService.updateLogStatus(eventId, status, actualTime, notes);
    } catch (err) {
      console.error('[Error updating medication log in service]:', err);
    }
  };

  const handleAddAppointmentQuestion = (appointmentId: string, question: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === appointmentId && e.category === 'appointment') {
          const currentQuestions = (e as any).questionsToAsk || [];
          return {
            ...e,
            questionsToAsk: [...currentQuestions, question],
          };
        }
        return e;
      })
    );
  };

  const handleAddChildDirectly = async (newChildData: any) => {
    await addChild(newChildData);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2EFE6] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <div className="w-6 h-6 border-2 border-[#133A34] border-t-transparent rounded-full animate-spin mt-4" />
          <p className="text-xs text-[#89A589] font-medium mt-1">Carregando seus cuidados...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Auth Flow (Login / Sign Up)
  if (!user) {
    return <AuthView />;
  }

  // Authenticated user with no family link in family_members (First Access Wizard)
  const isFirstAccess = !family;

  return (
    <div className="min-h-screen bg-[#F2EFE6] text-[#133A34] flex flex-col font-sans selection:bg-[#F08A6B]/20">
      {/* Top Application Bar */}
      <header
        id="app-top-header"
        className="sticky top-0 z-30 bg-[#F2EFE6]/90 backdrop-blur-md border-b border-[#133A34]/8 safe-top"
      >
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Official Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Top Multi-Child Selector [ Todos | Samyr | Suayla | ... ] */}
          <div className="flex-1 max-w-xs flex justify-end">
            <ChildSelector
              childrenList={childrenList}
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
            />
          </div>
        </div>
      </header>

      {/* PWA Install Banner */}
      <div className="max-w-xl mx-auto w-full">
        <InstallBanner />
      </div>

      {/* Main View Area */}
      <main className="flex-1 max-w-xl mx-auto w-full">
        {activeTab === 'hoje' && (
          <DashboardView
            userName={user.name.split(' ')[0]}
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            events={events}
            onOpenRegister={() => setIsQuickRegisterOpen(true)}
            onSelectChild={(childId) => {
              setSelectedChildId(childId);
              setActiveTab('criancas');
            }}
            onUpdateEventStatus={handleUpdateEventStatus}
          />
        )}

        {activeTab === 'criancas' && (
          <ChildrenView
            childrenList={childrenList}
            events={events}
            onAddChild={handleAddChildDirectly}
            onSelectChildForDashboard={(childId) => {
              setSelectedChildId(childId);
              setActiveTab('hoje');
            }}
            familyId={family?.id || 'family-default'}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaView
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            events={events}
            medicationSchedules={medicationSchedules}
            onAddQuestion={handleAddAppointmentQuestion}
          />
        )}

        {activeTab === 'perfil' && (
          <ProfileView
            currentUser={user}
            currentFamily={
              family || {
                id: 'family-default',
                name: 'Minha Família',
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                members: [],
              }
            }
            onAddFamilyMember={() => {}}
          />
        )}
      </main>

      {/* Floating Action Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickRegister={() => setIsQuickRegisterOpen(true)}
      />

      {/* Quick Register Bottom Sheet */}
      <QuickRegisterModal
        isOpen={isQuickRegisterOpen}
        onClose={() => setIsQuickRegisterOpen(false)}
        childrenList={childrenList}
        preselectedChildId={selectedChildId}
        onAddEvent={handleAddEvent}
        currentUserName={user.name}
      />

      {/* Onboarding Wizard when first creating account with 0 children */}
      {isFirstAccess && (
        <FirstAccessWizard
          onComplete={() => {
            localStorage.setItem('nene_first_access_skipped', 'true');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
