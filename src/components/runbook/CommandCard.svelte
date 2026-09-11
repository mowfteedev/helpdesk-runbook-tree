<script lang="ts">
  import type { CommandSnippet } from '../../types/runbook';
  import { Copy, Check, Terminal, ShieldAlert, Laptop } from '@lucide/svelte';

  interface Props {
    command: CommandSnippet;
    alternativeCommands?: CommandSnippet[];
  }

  let { command, alternativeCommands = [] }: Props = $props();

  // Danh sách toàn bộ các lệnh khả dụng theo OS
  let allCommands = $derived([command, ...alternativeCommands]);

  // Index lệnh đang được chọn hiển thị
  let selectedIndex = $state(0);

  // Lệnh hiện tại
  let currentCommand = $derived(allCommands[selectedIndex] || command);

  // Trạng thái sao chép
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentCommand.cli);
      copied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Không thể sao chép lệnh:', err);
    }
  }

  function getOsLabel(os: string): string {
    switch (os) {
      case 'windows': return 'Windows CMD / PowerShell';
      case 'linux': return 'Linux Bash';
      case 'macos': return 'macOS Terminal';
      case 'all': return 'Đa Nền Tảng (Cross-OS)';
      default: return os.toUpperCase();
    }
  }
</script>

<div class="border border-slate-800 rounded-xl bg-slate-900/90 overflow-hidden shadow-lg space-y-0">
  <!-- Header: OS Switcher & Info -->
  <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-xs font-mono">
    <div class="flex items-center gap-2">
      <Terminal class="w-4 h-4 text-cyan-400" />
      <span class="font-semibold text-slate-200">LỆNH CHẨN ĐOÁN CLI</span>
      {#if currentCommand.requiresElevation}
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 font-bold">
          <ShieldAlert class="w-3 h-3 text-rose-400" />
          Yêu cầu Run as Administrator / sudo
        </span>
      {/if}
    </div>

    <!-- OS Switcher Tabs if multiple commands available -->
    {#if allCommands.length > 1}
      <div class="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
        {#each allCommands as cmd, i}
          <button
            type="button"
            class="px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer {selectedIndex === i ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}"
            onclick={() => selectedIndex = i}
          >
            {cmd.os.toUpperCase()}
          </button>
        {/each}
      </div>
    {:else}
      <span class="text-slate-500 text-xs font-mono flex items-center gap-1">
        <Laptop class="w-3.5 h-3.5" />
        {getOsLabel(currentCommand.os)}
      </span>
    {/if}
  </div>

  <!-- Command Box -->
  <div class="p-4 space-y-3">
    <p class="text-xs text-slate-400 font-sans leading-relaxed">
      {currentCommand.description}
    </p>

    <!-- Interactive CLI snippet box with Copy button -->
    <div class="relative group rounded-lg bg-[#040711] border border-slate-800/90 p-3.5 font-mono text-sm text-cyan-300 flex items-center justify-between gap-3 overflow-x-auto selection:bg-cyan-500 selection:text-slate-950">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-cyan-600 select-none font-bold">$</span>
        <code class="text-slate-100 font-medium whitespace-pre break-all">{currentCommand.cli}</code>
      </div>

      <button
        type="button"
        onclick={handleCopy}
        class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-all duration-150 cursor-pointer min-h-[36px] {copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'}"
        title="Sao chép câu lệnh vào bộ nhớ tạm"
      >
        {#if copied}
          <Check class="w-4 h-4 text-white animate-pulse" />
          <span class="font-bold">Đã chép!</span>
        {:else}
          <Copy class="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span>Sao chép</span>
        {/if}
      </button>
    </div>
  </div>
</div>
