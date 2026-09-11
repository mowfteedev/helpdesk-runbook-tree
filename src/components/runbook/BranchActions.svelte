<script lang="ts">
  import type { DecisionBranch, BranchVariant } from '../../types/runbook';
  import { ArrowLeft, RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Info } from '@lucide/svelte';

  interface Props {
    branches: DecisionBranch[];
    canBacktrack: boolean;
    stepCount: number;
    onSelectBranch: (index: number) => void;
    onBacktrack: () => void;
    onReset: () => void;
  }

  let { 
    branches = [], 
    canBacktrack, 
    stepCount, 
    onSelectBranch, 
    onBacktrack, 
    onReset 
  }: Props = $props();

  let showResetConfirm = $state(false);

  function getButtonStyles(variant?: BranchVariant): { container: string; iconClass: string } {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-500/60 text-white shadow-emerald-950/40',
          iconClass: 'text-emerald-100',
        };
      case 'danger':
        return {
          container: 'bg-rose-600/90 hover:bg-rose-500 border-rose-500/60 text-white shadow-rose-950/40',
          iconClass: 'text-rose-100',
        };
      case 'warning':
        return {
          container: 'bg-amber-600/90 hover:bg-amber-500 border-amber-500/60 text-white shadow-amber-950/40',
          iconClass: 'text-amber-100',
        };
      case 'info':
        return {
          container: 'bg-cyan-600/90 hover:bg-cyan-500 border-cyan-500/60 text-white shadow-cyan-950/40',
          iconClass: 'text-cyan-100',
        };
      case 'neutral':
      default:
        return {
          container: 'bg-slate-800 hover:bg-slate-700 border-slate-700/80 text-slate-100 shadow-slate-950/40',
          iconClass: 'text-slate-300',
        };
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
      <span>👉 KẾT QUẢ QUAN SÁT ĐƯỢC (CHỌN HƯỚNG TIẾP THEO):</span>
    </h3>
    <span class="text-xs font-mono text-slate-500">
      {branches.length} lựa chọn rẽ nhánh
    </span>
  </div>

  <!-- Interactive Decision Branch Buttons Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each branches as branch, index}
      {@const style = getButtonStyles(branch.badgeVariant)}
      <button
        type="button"
        onclick={() => onSelectBranch(index)}
        class="group relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-150 shadow-md cursor-pointer active:scale-[0.98] min-h-[56px] {style.container}"
      >
        <div class="flex items-start justify-between gap-3 w-full">
          <span class="font-semibold text-sm leading-snug">
            {branch.label}
          </span>
          <ArrowRight class="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 {style.iconClass}" />
        </div>

        {#if branch.description}
          <p class="text-xs opacity-85 mt-2 leading-relaxed font-sans">
            {branch.description}
          </p>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Navigation & Utility Controls (Backtrack & Reset) -->
  <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
    <!-- Backtrack (Undo) Button -->
    <button
      type="button"
      onclick={onBacktrack}
      disabled={!canBacktrack}
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] {canBacktrack ? 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200' : 'border-slate-800 bg-slate-950/40 text-slate-600'}"
      title="Quay lại bước chẩn đoán trước đó"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Quay lại bước trước ({stepCount})</span>
    </button>

    <!-- Reset Session Button with Inline Confirmation -->
    {#if !showResetConfirm}
      <button
        type="button"
        onclick={() => showResetConfirm = true}
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors cursor-pointer min-h-[44px]"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Bắt đầu lại</span>
      </button>
    {:else}
      <div class="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
        <span class="text-rose-400 text-xs">Xác nhận reset?</span>
        <button
          type="button"
          onclick={() => { showResetConfirm = false; onReset(); }}
          class="px-2 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-500 cursor-pointer"
        >
          Có
        </button>
        <button
          type="button"
          onclick={() => showResetConfirm = false}
          class="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
        >
          Hủy
        </button>
      </div>
    {/if}
  </div>
</div>
