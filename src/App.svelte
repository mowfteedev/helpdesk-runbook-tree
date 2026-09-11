<script lang="ts">
  import { 
    Terminal, 
    Network, 
    GitBranch, 
    FileText, 
    CheckCircle2, 
    ShieldAlert, 
    Cpu, 
    Server 
  } from '@lucide/svelte';

  const title = 'Helpdesk Runbook Tree';
  const tagline = 'Interactive L1-L3 Troubleshooting Tree & Incident Report Generator';
  
  const modules = [
    { 
      name: 'Data Contract & Schema', 
      desc: '100% strict TypeScript types for Runbook, Nodes, Commands & Escalation.', 
      status: 'Ready for Task 2',
      icon: GitBranch,
      color: 'text-emerald-400' 
    },
    { 
      name: 'Network L1-L3 Diagnostics', 
      desc: 'Real-world guided workflows from Physical cable to Gateway, WAN & DNS.', 
      status: 'Task 3',
      icon: Network,
      color: 'text-cyan-400' 
    },
    { 
      name: 'Traversal & DAG Validator', 
      desc: 'Cycle-free graph navigation, audit trail tracking & backtrack support.', 
      status: 'Task 4 & 5',
      icon: Terminal,
      color: 'text-amber-400' 
    },
    { 
      name: 'Incident Report Generator', 
      desc: 'Standardized ITIL-ready incident report export (Markdown & PDF).', 
      status: 'Task 8',
      icon: FileText,
      color: 'text-violet-400' 
    }
  ];
</script>

<main class="min-h-screen bg-[#090d16] text-slate-100 px-4 py-8 md:py-12 selection:bg-cyan-500 selection:text-slate-950">
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <header class="border border-slate-800 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            v0.1.0 • Svelte 5 + Tailwind CSS v4
          </div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Terminal class="w-8 h-8 text-cyan-400" />
            {title}
          </h1>
          <p class="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
            {tagline}
          </p>
        </div>

        <div class="flex items-center gap-3 self-start md:self-center">
          <div class="px-3 py-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
            <span>Core Scaffold Operational</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Architecture & Modules Matrix -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Cpu class="w-5 h-5 text-slate-400" />
          Kiến Trúc Module Tác Chiến (Guild Architecture)
        </h2>
        <span class="text-xs font-mono text-slate-500">Offline-First Monolith</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each modules as mod}
          <div class="border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/90 rounded-xl p-5 transition-colors group">
            <div class="flex items-start justify-between mb-3">
              <div class="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:border-slate-600 transition-colors">
                <mod.icon class="w-5 h-5 {mod.color}" />
              </div>
              <span class="text-xs font-mono px-2.5 py-1 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                {mod.status}
              </span>
            </div>
            <h3 class="text-base font-semibold text-white mb-1.5">{mod.name}</h3>
            <p class="text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Project Memory Status Card -->
    <section class="border border-slate-800 bg-slate-900/40 rounded-xl p-6 font-mono text-xs text-slate-300 space-y-3">
      <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <Server class="w-4 h-4 text-cyan-400" />
          <span class="font-bold text-slate-200">PROJECT MEMORY KEEPER</span>
        </div>
        <span class="text-emerald-400 font-semibold">Phase 1: Task 1 COMPLETED</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div class="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <div class="text-slate-500 mb-1">Stack</div>
          <div class="text-slate-200 font-medium">Svelte 5 + Vite 8 + TS</div>
        </div>
        <div class="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <div class="text-slate-500 mb-1">Styling</div>
          <div class="text-slate-200 font-medium">Tailwind CSS v4</div>
        </div>
        <div class="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <div class="text-slate-500 mb-1">Next Task</div>
          <div class="text-cyan-400 font-medium">Task 2: Data Schema (@database)</div>
        </div>
      </div>
    </section>
  </div>
</main>
