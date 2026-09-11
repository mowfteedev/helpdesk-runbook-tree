<script lang="ts">
  import type { RunbookNode } from '../../types/runbook';
  import Badge from '../ui/Badge.svelte';
  import CommandCard from './CommandCard.svelte';
  import TerminalOutput from './TerminalOutput.svelte';
  import BranchActions from './BranchActions.svelte';
  import { 
    CheckCircle2, 
    ShieldAlert, 
    FileText, 
    RotateCcw, 
    ArrowLeft, 
    Info, 
    CheckSquare, 
    PhoneCall 
  } from '@lucide/svelte';

  interface Props {
    node: RunbookNode;
    canBacktrack: boolean;
    stepCount: number;
    onSelectBranch: (index: number) => void;
    onBacktrack: () => void;
    onReset: () => void;
    onOpenReportModal: () => void;
  }

  let {
    node,
    canBacktrack,
    stepCount,
    onSelectBranch,
    onBacktrack,
    onReset,
    onOpenReportModal
  }: Props = $props();

  let showTechContext = $state(false);
</script>

<div class="space-y-6">
  <!-- CASE 1: RESOLVED TERMINAL NODE -->
  {#if node.kind === 'resolved'}
    <div class="border-2 border-emerald-500/80 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/90 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div class="absolute -right-20 -top-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-5">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
            <CheckCircle2 class="w-8 h-8 text-emerald-400" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold">
                INCIDENT RESOLVED
              </span>
              {#if node.osiLayer}
                <Badge type="osi" value={node.osiLayer} />
              {/if}
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">
              {node.title}
            </h2>
            <p class="text-slate-300 text-sm leading-relaxed">
              {node.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onOpenReportModal}
          class="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/60 transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <FileText class="w-4 h-4" />
          <span>Xuất Báo Cáo ITIL (PDF/MD)</span>
        </button>
      </div>

      <!-- Resolution Details Breakdown -->
      {#if node.resolutionDetails}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <!-- Root Cause Card -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/60 space-y-2">
            <div class="flex items-center gap-2 text-emerald-400 font-mono font-semibold uppercase">
              <Info class="w-4 h-4" />
              <span>Nguyên Nhân Gốc Rễ (Root Cause)</span>
            </div>
            <p class="text-slate-200 leading-relaxed text-sm">
              {node.resolutionDetails.rootCause}
            </p>
          </div>

          <!-- Remedy Action Card -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/60 space-y-2">
            <div class="flex items-center gap-2 text-cyan-400 font-mono font-semibold uppercase">
              <CheckSquare class="w-4 h-4" />
              <span>Biện Pháp Khắc Phục (Remedy Action)</span>
            </div>
            <p class="text-slate-200 leading-relaxed text-sm">
              {node.resolutionDetails.remedyAction}
            </p>
          </div>

          <!-- Verification Checklist -->
          {#if node.resolutionDetails.verificationChecklist?.length}
            <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 md:col-span-2">
              <div class="text-slate-400 font-mono font-semibold uppercase text-xs">
                Danh Sách Xác Nhận Nghiệm Thu (Verification Checklist)
              </div>
              <ul class="space-y-1.5 text-slate-300">
                {#each node.resolutionDetails.verificationChecklist as check}
                  <li class="flex items-start gap-2">
                    <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Bottom Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-emerald-900/40 text-xs font-mono">
        <button
          type="button"
          onclick={onBacktrack}
          disabled={!canBacktrack}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Quay lại bước trước ({stepCount})</span>
        </button>

        <button
          type="button"
          onclick={onReset}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Khởi động phiên mới</span>
        </button>
      </div>
    </div>

  <!-- CASE 2: ESCALATION TERMINAL NODE -->
  {:else if node.kind === 'escalation'}
    <div class="border-2 border-rose-600/80 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900/90 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div class="absolute -right-20 -top-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-800/40 pb-5">
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <ShieldAlert class="w-8 h-8 text-rose-400" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300 text-xs font-mono font-bold">
                ESCALATION REQUIRED
              </span>
              {#if node.escalationDetails?.priority}
                <Badge type="priority" value={node.escalationDetails.priority} />
              {/if}
              {#if node.osiLayer}
                <Badge type="osi" value={node.osiLayer} />
              {/if}
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">
              {node.title}
            </h2>
            <p class="text-slate-300 text-sm leading-relaxed">
              {node.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onOpenReportModal}
          class="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/60 transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <FileText class="w-4 h-4" />
          <span>Xuất Phiếu Bàn Giao ITIL</span>
        </button>
      </div>

      <!-- Escalation Details -->
      {#if node.escalationDetails}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <!-- Target Tier Card -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-rose-900/60 space-y-2">
            <div class="flex items-center gap-2 text-rose-400 font-mono font-semibold uppercase">
              <ShieldAlert class="w-4 h-4" />
              <span>Đội Ngũ Tiếp Nhận (Target Tier)</span>
            </div>
            <p class="text-white text-base font-bold">
              {node.escalationDetails.targetTier}
            </p>
            {#if node.escalationDetails.contactChannel}
              <p class="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                <PhoneCall class="w-3.5 h-3.5 text-cyan-400" />
                <span>Kênh liên lạc: <strong class="text-cyan-300 font-mono">{node.escalationDetails.contactChannel}</strong></span>
              </p>
            {/if}
          </div>

          <!-- Suggested Remediation Card -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-rose-900/60 space-y-2">
            <div class="flex items-center gap-2 text-amber-400 font-mono font-semibold uppercase">
              <Info class="w-4 h-4" />
              <span>Nhận Định Kỹ Thuật Ban Đầu</span>
            </div>
            <p class="text-slate-300 leading-relaxed text-xs">
              {node.escalationDetails.suggestedRemediation || 'Cần đội ngũ chuyên trách phân tích log sâu hơn.'}
            </p>
          </div>

          <!-- Handover Required Information -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 md:col-span-2">
            <div class="text-rose-300 font-mono font-semibold uppercase text-xs">
              Dữ Liệu Bắt Buộc Đính Kèm Khi Chuyển Tuyến
            </div>
            <ul class="space-y-1.5 text-slate-300">
              {#each node.escalationDetails.requiredInfo as req}
                <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"></span>
                  <span>{req}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}

      <!-- Bottom Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-rose-900/40 text-xs font-mono">
        <button
          type="button"
          onclick={onBacktrack}
          disabled={!canBacktrack}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Quay lại bước trước ({stepCount})</span>
        </button>

        <button
          type="button"
          onclick={onReset}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Khởi động phiên mới</span>
        </button>
      </div>
    </div>

  <!-- CASE 3: STANDARD DIAGNOSTIC OR ACTION STEP -->
  {:else}
    <div class="border border-slate-800 bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
      <!-- Step Header -->
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <Badge type="kind" value={node.kind} />
          {#if node.osiLayer}
            <Badge type="osi" value={node.osiLayer} />
          {/if}
          <span class="text-xs font-mono text-slate-500">Node ID: {node.id}</span>
        </div>

        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {node.title}
        </h2>

        <p class="text-slate-300 text-sm md:text-base leading-relaxed">
          {node.description}
        </p>

        <!-- Technical Context Toggle -->
        {#if node.technicalContext}
          <div class="pt-1">
            <button
              type="button"
              onclick={() => showTechContext = !showTechContext}
              class="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Info class="w-3.5 h-3.5" />
              <span>{showTechContext ? 'Ẩn bối cảnh kỹ thuật' : 'Xem bối cảnh kỹ thuật chuyên sâu (Lý do vì sao?)'}</span>
            </button>

            {#if showTechContext}
              <div class="mt-2.5 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-900/40 text-xs text-slate-300 leading-relaxed font-sans">
                {node.technicalContext}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Command Snippet Card (if present) -->
      {#if node.command}
        <CommandCard 
          command={node.command} 
          alternativeCommands={node.alternativeCommands} 
        />
      {/if}

      <!-- Terminal Output Mẫu (if present) -->
      {#if node.command?.sampleOutput}
        <TerminalOutput 
          sampleOutput={node.command.sampleOutput} 
          outputAnalysisGuide={node.command.outputAnalysisGuide} 
        />
      {/if}

      <!-- Decision Branching Grid -->
      <BranchActions 
        branches={node.branches} 
        {canBacktrack} 
        {stepCount} 
        {onSelectBranch} 
        {onBacktrack} 
        {onReset} 
      />
    </div>
  {/if}
</div>
