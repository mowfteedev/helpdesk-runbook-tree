<script lang="ts">
  import type { Runbook } from '../../types/runbook';
  import { Network, Terminal, Clock, FileText, User, Tag, Sparkles } from '@lucide/svelte';

  interface Props {
    runbook: Runbook;
    progressPercentage: number;
    stepCount: number;
    ticketId?: string;
    technicianName?: string;
    onUpdateTicketId?: (id: string) => void;
    onUpdateTechnicianName?: (name: string) => void;
    onOpenReportModal: () => void;
  }

  let {
    runbook,
    progressPercentage,
    stepCount,
    ticketId = '',
    technicianName = '',
    onUpdateTicketId,
    onUpdateTechnicianName,
    onOpenReportModal
  }: Props = $props();

  let isEditingMeta = $state(false);
  let localTicket = $state('');
  let localName = $state('');

  function startEditing() {
    localTicket = ticketId;
    localName = technicianName;
    isEditingMeta = true;
  }

  function saveMeta() {
    onUpdateTicketId?.(localTicket.trim());
    onUpdateTechnicianName?.(localName.trim());
    isEditingMeta = false;
  }
</script>

<header class="border border-slate-800 bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden space-y-4">
  <div class="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Top Bar: Category, Tags, Report Button -->
  <div class="flex flex-wrap items-center justify-between gap-3 relative z-10">
    <div class="flex items-center gap-2">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono font-medium">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>CHUYÊN ĐỀ MẠNG (NETWORK) • v{runbook.version}</span>
      </div>
      <span class="text-xs font-mono text-slate-500 hidden sm:inline">
        Ước tính: ~{runbook.estimatedMinutes} phút
      </span>
    </div>

    <!-- Export Report CTA Button -->
    <button
      type="button"
      onclick={onOpenReportModal}
      class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer min-h-[40px]"
    >
      <FileText class="w-3.5 h-3.5" />
      <span>Xuất Báo Cáo ITIL</span>
    </button>
  </div>

  <!-- Title & Description -->
  <div class="space-y-1 relative z-10">
    <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
      <Terminal class="w-7 h-7 text-cyan-400 shrink-0" />
      <span>{runbook.title}</span>
    </h1>
    <p class="text-slate-400 text-xs md:text-sm leading-relaxed max-w-3xl">
      {runbook.description}
    </p>
  </div>

  <!-- Ticket & Technician Metadata Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono relative z-10">
    {#if !isEditingMeta}
      <div class="flex flex-wrap items-center gap-4 text-slate-300">
        <div class="flex items-center gap-1.5">
          <Tag class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-slate-500">Ticket:</span>
          <span class="text-cyan-300 font-semibold">{ticketId || 'Chưa gán'}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <User class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-slate-500">Kỹ thuật viên:</span>
          <span class="text-slate-200 font-medium">{technicianName || 'L1 Helpdesk'}</span>
        </div>

        <button
          type="button"
          onclick={startEditing}
          class="text-cyan-400 hover:text-cyan-300 underline cursor-pointer text-[11px]"
        >
          Sửa thông tin
        </button>
      </div>
    {:else}
      <form onsubmit={(e) => { e.preventDefault(); saveMeta(); }} class="flex flex-wrap items-center gap-2">
        <input
          type="text"
          bind:value={localTicket}
          placeholder="Mã Ticket (vd: INC-9482)"
          class="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
        />
        <input
          type="text"
          bind:value={localName}
          placeholder="Tên kỹ thuật viên"
          class="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          class="px-2.5 py-1 rounded bg-cyan-600 text-white font-bold hover:bg-cyan-500 cursor-pointer text-xs"
        >
          Lưu
        </button>
        <button
          type="button"
          onclick={() => isEditingMeta = false}
          class="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer text-xs"
        >
          Hủy
        </button>
      </form>
    {/if}

    <!-- Progress Percentage Indicator -->
    <div class="flex items-center gap-2">
      <span class="text-slate-400">Tiến trình ước lượng:</span>
      <span class="text-cyan-300 font-bold">{progressPercentage}%</span>
    </div>
  </div>

  <!-- Real-time Progress Bar -->
  <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
    <div 
      class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
      style="width: {progressPercentage}%"
    ></div>
  </div>
</header>
