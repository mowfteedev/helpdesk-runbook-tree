<script lang="ts">
  import type { SessionStepRecord } from '../../types/runbook';
  import Badge from '../ui/Badge.svelte';
  import { ChevronRight, History } from '@lucide/svelte';

  interface Props {
    history: readonly SessionStepRecord[];
    currentNodeTitle: string;
    onJumpToStep?: (stepIndex: number) => void;
  }

  let { history = [], currentNodeTitle, onJumpToStep }: Props = $props();

  let isExpanded = $state(false);
</script>

<div class="border border-slate-800/80 rounded-xl bg-slate-900/60 p-4 space-y-3 font-mono text-xs">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2 text-slate-300">
      <History class="w-4 h-4 text-cyan-400" />
      <span class="font-bold">LỊCH SỬ CHẨN ĐOÁN (AUDIT TRAIL)</span>
      <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
        {history.length} bước đã ghi nhận
      </span>
    </div>

    {#if history.length > 0}
      <button
        type="button"
        onclick={() => isExpanded = !isExpanded}
        class="text-cyan-400 hover:text-cyan-300 text-xs font-sans transition-colors cursor-pointer"
      >
        {isExpanded ? 'Thu gọn lịch sử' : 'Xem chi tiết các bước'}
      </button>
    {/if}
  </div>

  {#if history.length === 0}
    <p class="text-slate-500 text-xs font-sans italic">
      Đang ở bước xuất phát ban đầu. Hãy chạy lệnh kiểm tra và chọn hướng tiếp theo.
    </p>
  {:else}
    <!-- Compact Stepper Flow (Horizontal Breadcrumbs) -->
    <div class="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-slate-400">
      {#each history as step, i}
        <button
          type="button"
          onclick={() => onJumpToStep?.(step.stepIndex)}
          class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-cyan-500/80 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Bấm để quay lại bước này"
        >
          <span class="text-cyan-400 font-bold">#{step.stepIndex}</span>
          {#if step.osiLayer}
            <span class="text-[10px] text-slate-400">[{step.osiLayer}]</span>
          {/if}
          <span class="max-w-[120px] truncate text-slate-300">{step.nodeTitle}</span>
        </button>
        <ChevronRight class="w-3 h-3 shrink-0 text-slate-600" />
      {/each}

      <div class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-semibold">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="max-w-[160px] truncate">Hiện tại: {currentNodeTitle}</span>
      </div>
    </div>

    <!-- Detailed List View (When expanded) -->
    {#if isExpanded}
      <div class="space-y-2 pt-2 border-t border-slate-800/80 mt-2">
        {#each history as step}
          <div class="flex items-start justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-cyan-400 font-bold">Bước #{step.stepIndex}</span>
                {#if step.osiLayer}
                  <Badge type="osi" value={step.osiLayer} />
                {/if}
                <span class="text-white font-medium">{step.nodeTitle}</span>
              </div>
              <div class="text-slate-400 font-sans flex items-center gap-1.5">
                <span>Kết quả đã chọn:</span>
                <span class="text-emerald-400 font-medium">"{step.chosenBranchLabel}"</span>
              </div>
            </div>

            <div class="text-[11px] text-slate-500 shrink-0">
              {new Date(step.timestamp).toLocaleTimeString('vi-VN')}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
