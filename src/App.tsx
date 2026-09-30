import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CalendarTab } from './components/tabs/CalendarTab';
import { ClientsTab } from './components/tabs/ClientsTab';
import { SuppliersTab } from './components/tabs/SuppliersTab';
import { DocumentsTab } from './components/tabs/DocumentsTab';
import { CashRegisterTab } from './components/tabs/CashRegisterTab';
import { AccountingTab } from './components/tabs/AccountingTab';
import { ThemeModal } from './components/ThemeModal';
import { GarageSettingsModal } from './components/GarageSettingsModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';

const AppContent: React.FC = () => {
  const { activeTab, theme } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarTab />;
      case 'clients':
        return <ClientsTab />;
      case 'suppliers':
        return <SuppliersTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'cash':
        return <CashRegisterTab />;
      case 'accounting':
        return <AccountingTab />;
      default:
        return <CalendarTab />;
    }
  };

  const patternClass = theme.appBackgroundType ? `bg-pattern-${theme.appBackgroundType}` : '';

  return (
    <div
      className={`flex min-h-screen antialiased transition-colors ${patternClass}`}
      style={{
        backgroundColor: theme.appBackgroundColor || '#f8fafc',
        color: theme.textPrimaryColor || '#0f172a',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <ThemeModal />
      <GarageSettingsModal />
      <DocumentViewerModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
