<script lang="ts">
  import type { DiagnosticSession, Runbook } from '../../types/runbook';
  import { generateIncidentReport, formatReportAsMarkdown } from '../../engine/report-generator';
  import { 
    X, 
    Copy, 
    Check, 
    Printer, 
    Download, 
    FileText, 
    CheckCircle2, 
    ShieldAlert 
  } from '@lucide/svelte';

  interface Props {
    show: boolean;
    session: DiagnosticSession;
    runbook: Runbook;
    onClose: () => void;
  }

  let { show, session, runbook, onClose }: Props = $props();

  let activeTab = $state<'visual' | 'markdown'>('visual');
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  // Sinh báo cáo động dựa trên session và runbook
  let report = $derived(generateIncidentReport(session, runbook));
  let markdownText = $derived(formatReportAsMarkdown(report));

  async function handleCopyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdownText);
      copied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (e) {
      console.error('Không thể sao chép Markdown:', e);
    }
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && show) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal Dialog Window -->
    <div 
      class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-title" class="text-lg font-bold text-white tracking-tight">
              Biên Bản Sự Cố Chuẩn ITIL (Incident Report)
            </h3>
            <p class="text-xs text-slate-400 font-mono">
              Mã: <span class="text-cyan-300">{report.reportId}</span> • {report.technician}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Đóng (Escape)"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher & Quick Actions Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-950/30">
        <!-- Tabs -->
        <div class="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onclick={() => activeTab = 'visual'}
            class="px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer {activeTab === 'visual' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}"
          >
            Bản xem trực quan (Visual)
          </button>
          <button
            type="button"
            onclick={() => activeTab = 'markdown'}
            class="px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer {activeTab === 'markdown' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}"
          >
            Markdown (Jira / ServiceNow)
          </button>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={handleCopyMarkdown}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[36px] {copied ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}"
            title="Sao chép Markdown vào bộ nhớ tạm"
          >
            {#if copied}
              <Check class="w-4 h-4 text-white" />
              <span>Đã sao chép!</span>
            {:else}
              <Copy class="w-4 h-4" />
              <span>Chép Markdown</span>
            {/if}
          </button>

          <button
            type="button"
            onclick={handleDownloadMarkdown}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer min-h-[36px]"
            title="Tải file .md về máy"
          >
            <Download class="w-4 h-4" />
            <span>Tải .md</span>
          </button>

          <button
            type="button"
            onclick={handlePrint}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer min-h-[36px]"
            title="In hoặc xuất file PDF"
          >
            <Printer class="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        {#if activeTab === 'visual'}
          <!-- Metadata Summary Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span class="text-slate-500 block mb-1">Trạng thái</span>
              <span class="font-bold text-sm {report.outcome === 'Resolved' ? 'text-emerald-400' : 'text-rose-400'}">
                {report.outcome.toUpperCase()}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span class="text-slate-500 block mb-1">Mức ưu tiên</span>
              <span class="font-bold text-sm text-amber-300">
                {report.priority}
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span class="text-slate-500 block mb-1">Thời gian xử lý</span>
              <span class="font-bold text-sm text-cyan-300">
                {report.durationMinutes} phút
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span class="text-slate-500 block mb-1">Tầng OSI</span>
              <span class="font-bold text-sm text-purple-300">
                {report.osiScope}
              </span>
            </div>
          </div>

          <!-- Summary Box -->
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm leading-relaxed text-slate-200">
            <h4 class="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1 font-semibold">
              Tóm Tắt Sự Cố & Kết Luận
            </h4>
            <p>{report.summary}</p>
          </div>

          <!-- Resolution Info (if resolved) -->
          {#if report.outcome === 'Resolved' && report.resolutionInfo}
            <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-3 text-xs">
              <h4 class="font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 class="w-4 h-4" />
                <span>Nghiệm Thu Khắc Phục</span>
              </h4>
              <p class="text-slate-300">
                <strong>Nguyên nhân gốc rễ:</strong> {report.resolutionInfo.rootCause}
              </p>
              <p class="text-slate-300">
                <strong>Biện pháp xử lý:</strong> {report.resolutionInfo.remedyAction}
              </p>
            </div>
          {/if}

          <!-- Escalation Info (if escalated) -->
          {#if report.outcome === 'Escalated' && report.escalationInfo}
            <div class="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 space-y-3 text-xs">
              <h4 class="font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert class="w-4 h-4" />
                <span>Thông Tin Chuyển Tuyến (Bàn Giao)</span>
              </h4>
              <p class="text-slate-300">
                <strong>Đội ngũ tiếp nhận:</strong> <span class="text-white font-bold">{report.escalationInfo.targetTier}</span>
              </p>
              {#if report.escalationInfo.contactChannel}
                <p class="text-slate-300">
                  <strong>Kênh liên lạc:</strong> {report.escalationInfo.contactChannel}
                </p>
              {/if}
            </div>
          {/if}

          <!-- Audit Trail Table -->
          <div class="space-y-2">
            <h4 class="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Nhật Ký Các Bước Đã Thực Hiện ({report.auditSteps.length} bước)
            </h4>
            <div class="overflow-x-auto rounded-xl border border-slate-800">
              <table class="w-full text-left text-xs font-sans">
                <thead class="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th class="p-3">#</th>
                    <th class="p-3">Tầng OSI</th>
                    <th class="p-3">Bước Kiểm Tra</th>
                    <th class="p-3">Kết Quả Đã Chọn</th>
                    <th class="p-3">Thời Điểm</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-mono text-xs text-slate-300">
                  {#each report.auditSteps as step}
                    <tr class="hover:bg-slate-800/30">
                      <td class="p-3 text-cyan-400 font-bold">{step.stepIndex}</td>
                      <td class="p-3 text-purple-300">{step.osiLayer || 'N/A'}</td>
                      <td class="p-3 text-white font-sans">{step.nodeTitle}</td>
                      <td class="p-3 text-emerald-400 font-sans font-medium">{step.chosenBranchLabel}</td>
                      <td class="p-3 text-slate-500 text-[11px]">{new Date(step.timestamp).toLocaleTimeString('vi-VN')}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {:else}
          <!-- Markdown View -->
          <div class="rounded-xl bg-[#040711] border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto selection:bg-cyan-500 selection:text-slate-950">
            <pre class="whitespace-pre-wrap">{markdownText}</pre>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60 text-xs font-mono">
        <span class="text-slate-500">
          Tương thích 100% Jira, ServiceNow, GLPI, Markdown & PDF.
        </span>
        <button
          type="button"
          onclick={onClose}
          class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer min-h-[36px]"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
{/if}
