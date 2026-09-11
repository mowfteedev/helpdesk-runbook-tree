<script lang="ts">
  import { HelpCircle, ChevronDown, ChevronUp, Terminal } from '@lucide/svelte';

  interface Props {
    sampleOutput: string;
    outputAnalysisGuide: string;
    title?: string;
  }

  let { sampleOutput, outputAnalysisGuide, title = 'Terminal Output Mẫu (Expected / Observed)' }: Props = $props();

  let isCollapsed = $state(false);
</script>

<div class="border border-slate-800 rounded-xl bg-slate-900/80 overflow-hidden shadow-lg space-y-0">
  <!-- macOS Terminal Style Window Header -->
  <div class="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80">
    <div class="flex items-center gap-2">
      <!-- Window Traffic Light Dots -->
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
      </div>
      <span class="text-xs font-mono text-slate-400 font-medium ml-2 flex items-center gap-1.5">
        <Terminal class="w-3.5 h-3.5 text-slate-500" />
        {title}
      </span>
    </div>

    <button
      type="button"
      class="text-slate-400 hover:text-slate-200 text-xs font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
      onclick={() => isCollapsed = !isCollapsed}
    >
      <span>{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
      {#if isCollapsed}
        <ChevronDown class="w-3.5 h-3.5" />
      {:else}
        <ChevronUp class="w-3.5 h-3.5" />
      {/if}
    </button>
  </div>

  {#if !isCollapsed}
    <!-- Monospace Terminal Screen -->
    <div class="p-4 bg-[#030611] text-xs font-mono text-emerald-400/90 overflow-x-auto border-b border-slate-800/80 leading-relaxed max-h-72 selection:bg-emerald-500 selection:text-slate-950">
      <pre class="whitespace-pre">{sampleOutput.trim()}</pre>
    </div>

    <!-- Output Analysis Guide for Technician -->
    <div class="p-4 bg-cyan-950/30 border-t border-cyan-900/40 flex items-start gap-3">
      <div class="p-1.5 rounded-md bg-cyan-900/50 text-cyan-300 shrink-0 mt-0.5">
        <HelpCircle class="w-4 h-4 text-cyan-300" />
      </div>
      <div class="space-y-1 text-xs">
        <h4 class="font-semibold text-cyan-300 font-mono uppercase tracking-wider">
          Hướng Dẫn Phân Tích Kết Quả (Analysis Guide)
        </h4>
        <p class="text-slate-300 leading-relaxed font-sans">
          {outputAnalysisGuide}
        </p>
      </div>
    </div>
  {/if}
</div>
