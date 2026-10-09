import React from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIMockInterviewPage() {
  const handleOpenDirect = () => {
    window.open('/ai-interview-platform.html', '_blank');
  };

  const handleRefresh = () => {
    const iframe = document.getElementById('ai-interview-frame');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0A0A] overflow-hidden select-none">
      {/* Top Session Status Ribbon */}
      <header className="h-12 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/candidate/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-neutral-700" />
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <span>TalentAI Recruiter Platform</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive 3D Avatar & Live Proctoring
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Reload Platform"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>
          <button
            type="button"
            onClick={handleOpenDirect}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-sky-400 hover:bg-sky-500/10 border border-sky-500/20 transition-colors"
            title="Open platform in dedicated full window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Standalone Tab</span>
          </button>
        </div>
      </header>

      {/* Embedded Full Platform Iframe with complete hardware permissions */}
      <div className="flex-1 w-full h-[calc(100vh-3rem)] relative bg-[#0f172a]">
        <iframe
          id="ai-interview-frame"
          src="/ai-interview-platform.html"
          title="TalentAI Recruiter Platform"
          className="w-full h-full border-none block"
          allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *"
        />
      </div>
    </div>
  );
}
