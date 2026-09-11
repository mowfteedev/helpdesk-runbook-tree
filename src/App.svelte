<script lang="ts">
  import { onMount } from 'svelte';
  import { defaultRunbook, runbookRegistry } from './data';
  import { TraversalEngine, sessionStore } from './engine';
  import type { DiagnosticSession, RunbookNode } from './types/runbook';

  // UI Components
  import RunbookSessionHeader from './components/runbook/RunbookSessionHeader.svelte';
  import AuditStepper from './components/runbook/AuditStepper.svelte';
  import TerminalNodeView from './components/runbook/TerminalNodeView.svelte';
  import IncidentReportModal from './components/report/IncidentReportModal.svelte';

  import { 
    Terminal, 
    Network, 
    CheckCircle2, 
    HardDrive, 
    Cpu, 
    ShieldCheck, 
    RotateCcw,
    FileText 
  } from '@lucide/svelte';

  // Khởi tạo Engine điều hướng (Khôi phục session cũ từ LocalStorage nếu có)
  let engine = $state<TraversalEngine>(createInitialEngine());
  let updateTrigger = $state(0);
  let showReportModal = $state(false);

  function createInitialEngine(): TraversalEngine {
    // Thử khôi phục từ localStorage
    const resumed = sessionStore.resumeActiveSession(runbookRegistry);
    if (resumed) {
      return resumed;
    }
    // Hoặc tạo mới từ defaultRunbook
    return sessionStore.startSession(defaultRunbook);
  }

  // Reactive derived values theo Svelte 5 runes
  let currentNode = $derived.by<RunbookNode>(() => {
    // updateTrigger dùng để thông báo Svelte re-evaluate khi engine state thay đổi
    updateTrigger;
    return engine.getCurrentNode();
  });

  let history = $derived.by(() => {
    updateTrigger;
    return engine.getHistory();
  });

  let canBacktrack = $derived.by(() => {
    updateTrigger;
    return engine.canBacktrack;
  });

  let stepCount = $derived.by(() => {
    updateTrigger;
    return engine.stepCount;
  });

  let progressPercentage = $derived.by(() => {
    updateTrigger;
    return engine.getProgressPercentage();
  });

  let sessionData = $derived.by<DiagnosticSession>(() => {
    updateTrigger;
    return engine.toDiagnosticSession();
  });

  // Tương tác điều hướng
  function handleSelectBranch(index: number) {
    engine.selectBranch(index);
    sessionStore.persistActiveSession();
    updateTrigger += 1;
    // Tự động cuộn mượt về đầu màn hình khi chuyển bước
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBacktrack() {
    engine.backtrack();
    sessionStore.persistActiveSession();
    updateTrigger += 1;
  }

  function handleJumpToStep(stepIndex: number) {
    engine.jumpToStep(stepIndex);
    sessionStore.persistActiveSession();
    updateTrigger += 1;
  }

  function handleReset() {
    engine.reset();
    sessionStore.persistActiveSession();
    updateTrigger += 1;
  }

  function handleUpdateTicketId(id: string) {
    const session = engine.toDiagnosticSession();
    session.ticketId = id;
    engine = TraversalEngine.fromDiagnosticSession(engine.getRunbook(), session);
    sessionStore.persistActiveSession();
    updateTrigger += 1;
  }

  function handleUpdateTechnicianName(name: string) {
    const session = engine.toDiagnosticSession();
    session.technicianName = name;
    engine = TraversalEngine.fromDiagnosticSession(engine.getRunbook(), session);
    sessionStore.persistActiveSession();
    updateTrigger += 1;
  }
</script>

<main class="min-h-screen bg-[#090d16] text-slate-100 px-4 py-6 md:py-10 selection:bg-cyan-500 selection:text-slate-950 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Top Interactive Session Header -->
    <RunbookSessionHeader
      runbook={engine.getRunbook()}
      {progressPercentage}
      {stepCount}
      ticketId={sessionData.ticketId}
      technicianName={sessionData.technicianName}
      onUpdateTicketId={handleUpdateTicketId}
      onUpdateTechnicianName={handleUpdateTechnicianName}
      onOpenReportModal={() => showReportModal = true}
    />

    <!-- Visual Audit Stepper & Breadcrumb Trail -->
    <AuditStepper
      {history}
      currentNodeTitle={currentNode.title}
      onJumpToStep={handleJumpToStep}
    />

    <!-- Main Diagnostic Node View (Dynamic Step / Resolved / Escalation) -->
    <TerminalNodeView
      node={currentNode}
      {canBacktrack}
      {stepCount}
      onSelectBranch={handleSelectBranch}
      onBacktrack={handleBacktrack}
      onReset={handleReset}
      onOpenReportModal={() => showReportModal = true}
    />

    <!-- System Status & Local-First Footer -->
    <footer class="border-t border-slate-800/80 pt-6 pb-8 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 text-emerald-400">
          <HardDrive class="w-4 h-4" />
          <span>Local-First Storage: Active</span>
        </div>
        <span>•</span>
        <div class="flex items-center gap-1.5 text-cyan-400">
          <ShieldCheck class="w-4 h-4" />
          <span>Zero-Server / Zero-Ops</span>
        </div>
      </div>

      <div class="flex items-center gap-3 text-slate-400">
        <span>Helpdesk Runbook Tree v0.2.0</span>
        <span>•</span>
        <span>mowftee-guild</span>
      </div>
    </footer>
  </div>
</main>

<!-- ITIL Incident Report Modal Dialog -->
<IncidentReportModal
  show={showReportModal}
  session={sessionData}
  runbook={engine.getRunbook()}
  onClose={() => showReportModal = false}
/>
