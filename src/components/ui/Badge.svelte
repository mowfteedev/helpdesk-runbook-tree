<script lang="ts">
  import type { OSILayer, NodeKind, IncidentPriority } from '../../types/runbook';

  interface Props {
    type?: 'osi' | 'kind' | 'priority' | 'custom';
    value: string;
    label?: string;
    class?: string;
  }

  let { type = 'custom', value, label, class: className = '' }: Props = $props();

  function getBadgeClasses(): string {
    if (type === 'osi') {
      switch (value as OSILayer) {
        case 'L1':
          return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
        case 'L2':
          return 'bg-teal-950/80 text-teal-300 border-teal-700/60';
        case 'L3':
          return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
        case 'L4':
          return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
        case 'L7':
          return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
        default:
          return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    }

    if (type === 'kind') {
      switch (value as NodeKind) {
        case 'diagnostic_step':
          return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
        case 'action_required':
          return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
        case 'resolved':
          return 'bg-emerald-950/90 text-emerald-300 border-emerald-600/80';
        case 'escalation':
          return 'bg-rose-950/90 text-rose-300 border-rose-600/80';
        default:
          return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    }

    if (type === 'priority') {
      if (value.startsWith('P1')) return 'bg-rose-950/90 text-rose-200 border-rose-600 font-bold';
      if (value.startsWith('P2')) return 'bg-amber-950/90 text-amber-200 border-amber-600 font-semibold';
      if (value.startsWith('P3')) return 'bg-yellow-950/90 text-yellow-200 border-yellow-700';
      return 'bg-slate-800 text-slate-300 border-slate-700';
    }

    return 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  }

  function getDisplayText(): string {
    if (label) return label;
    if (type === 'kind') {
      switch (value as NodeKind) {
        case 'diagnostic_step': return '🔍 Kiểm Tra CLI';
        case 'action_required': return '⚡ Thao Tác Trực Tiếp';
        case 'resolved': return '✅ Đã Khắc Phục Xong';
        case 'escalation': return '🚨 Chuyển Tuyến Cấp Cao';
      }
    }
    return value;
  }
</script>

<span 
  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors {getBadgeClasses()} {className}"
>
  {getDisplayText()}
</span>
