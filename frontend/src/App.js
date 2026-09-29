import React from 'react';
import "@/App.css";
import { Toaster } from '@/components/ui/sonner';
import { PcfProvider } from '@/store/PcfContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PcfWorkspace } from '@/components/pcf/PcfWorkspace';

function App() {
  return (
    <PcfProvider>
      <div className="flex min-h-screen bg-[#f4f6f8]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <PcfWorkspace />
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </PcfProvider>
  );
}

export default App;
