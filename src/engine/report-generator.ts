/**
 * ==============================================================================
 * 🌲 HELPDESK RUNBOOK TREE - INCIDENT REPORT GENERATOR
 * ==============================================================================
 * Layer: Core Engine (@backend / mowftee-guild)
 * Purpose: Generates standardized ITIL-ready incident reports (Markdown & JSON)
 *          from diagnostic session audit trails.
 * ==============================================================================
 */

import type { 
  DiagnosticSession, 
  Runbook, 
  IncidentReportPayload, 
  IncidentPriority,
  OSILayer
} from '../types/runbook';

/**
 * Tạo một đối tượng IncidentReportPayload hoàn chỉnh từ phiên chẩn đoán.
 */
export function generateIncidentReport(
  session: DiagnosticSession,
  runbook: Runbook
): IncidentReportPayload {
  const currentNode = runbook.nodes[session.currentNodeId];

  const startedTime = new Date(session.startedAt).getTime();
  const completedTime = session.completedAt ? new Date(session.completedAt).getTime() : Date.now();
  const durationMinutes = Math.max(1, Math.round((completedTime - startedTime) / (1000 * 60)));

  const isResolved = session.status === 'resolved' || (currentNode && currentNode.kind === 'resolved');
  const outcome: 'Resolved' | 'Escalated' = isResolved ? 'Resolved' : 'Escalated';

  // Thu thập các tầng OSI đã trải qua
  const osiLayers = new Set<OSILayer>();
  for (const step of session.stepHistory) {
    if (step.osiLayer) osiLayers.add(step.osiLayer);
  }
  if (currentNode?.osiLayer) osiLayers.add(currentNode.osiLayer);
  const osiScope = Array.from(osiLayers).join(', ') || 'N/A';

  // Xác định mức độ ưu tiên
  let priority: IncidentPriority = 'P3 - Medium';
  if (currentNode?.escalationDetails?.priority) {
    priority = currentNode.escalationDetails.priority;
  }

  // Tóm tắt sự cố
  let summary = '';
  if (isResolved) {
    summary = currentNode?.resolutionDetails?.rootCause 
      ? `Sự cố đã được khắc phục tại bước "${currentNode.title}". Nguyên nhân gốc: ${currentNode.resolutionDetails.rootCause}.`
      : `Sự cố đã được khắc phục sau ${session.stepHistory.length} bước chẩn đoán theo kịch bản ${runbook.title}.`;
  } else {
    summary = currentNode?.escalationDetails?.targetTier
      ? `Sự cố vượt quá thẩm quyền xử lý L1. Cần chuyển tuyến khẩn cấp tới ${currentNode.escalationDetails.targetTier}.`
      : `Đã hoàn tất quy trình chẩn đoán sơ bộ. Cần chuyển giao đội ngũ chuyên trách.`;
  }

  // Danh sách hành động tiếp theo
  const nextActions: string[] = [];
  if (isResolved) {
    if (currentNode?.resolutionDetails?.verificationChecklist) {
      nextActions.push(...currentNode.resolutionDetails.verificationChecklist);
    } else {
      nextActions.push('Xác nhận lại với người dùng cuối về tình trạng dịch vụ.');
      nextActions.push('Đóng ticket hỗ trợ và lưu vết nhật ký.');
    }
  } else {
    if (currentNode?.escalationDetails?.requiredInfo) {
      nextActions.push(`Bàn giao các thông tin bắt buộc: ${currentNode.escalationDetails.requiredInfo.join('; ')}`);
    }
    if (currentNode?.escalationDetails?.contactChannel) {
      nextActions.push(`Liên hệ qua kênh: ${currentNode.escalationDetails.contactChannel}`);
    }
    nextActions.push(`Gán ticket cho ${currentNode?.escalationDetails?.targetTier || 'đội ngũ cấp cao'} với mức ưu tiên ${priority}.`);
  }

  const reportId = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${session.sessionId.slice(-6).toUpperCase()}`;

  return {
    reportId,
    title: `[${outcome.toUpperCase()}] ${runbook.title} - ${session.ticketId || 'No Ticket ID'}`,
    ticketId: session.ticketId,
    technician: session.technicianName || 'L1 Helpdesk Specialist',
    priority,
    outcome,
    osiScope,
    startedAt: session.startedAt,
    completedAt: session.completedAt || new Date().toISOString(),
    durationMinutes,
    summary,
    auditSteps: session.stepHistory,
    escalationInfo: currentNode?.escalationDetails,
    resolutionInfo: currentNode?.resolutionDetails,
    nextActions,
  };
}

/**
 * Định dạng Báo cáo sự cố thành chuỗi Markdown chuẩn ITIL,
 * sẵn sàng dán trực tiếp vào Jira, ServiceNow, Redmine hoặc email bàn giao.
 */
export function formatReportAsMarkdown(report: IncidentReportPayload): string {
  const headerIcon = report.outcome === 'Resolved' ? '✅' : '🚨';
  
  let md = `# ${headerIcon} BIÊN BẢN SỰ CỐ IT (INCIDENT DIAGNOSTIC REPORT)\n\n`;
  md += `**Mã Báo Cáo**: \`${report.reportId}\`  \n`;
  if (report.ticketId) {
    md += `**Mã Ticket**: \`${report.ticketId}\`  \n`;
  }
  md += `**Kỹ Thuật Viên**: ${report.technician}  \n`;
  md += `**Thời Điểm Bắt Đầu**: ${new Date(report.startedAt).toLocaleString('vi-VN')}  \n`;
  md += `**Thời Điểm Hoàn Tất**: ${new Date(report.completedAt).toLocaleString('vi-VN')} (${report.durationMinutes} phút)  \n`;
  md += `**Kết Quả Chẩn Đoán**: **${report.outcome.toUpperCase()}**  \n`;
  md += `**Mức Độ Ưu Tiên**: \`${report.priority}\`  \n`;
  md += `**Phạm Vi Tầng OSI**: \`${report.osiScope}\`  \n\n`;

  md += `## 1. Tóm Tắt Diễn Biến & Kết Luận\n`;
  md += `> ${report.summary}\n\n`;

  if (report.outcome === 'Resolved' && report.resolutionInfo) {
    md += `## 2. Thông Tin Khắc Phục Nghiệm Thu\n`;
    md += `- **Nguyên nhân gốc rễ**: ${report.resolutionInfo.rootCause}\n`;
    md += `- **Biện pháp xử lý**: ${report.resolutionInfo.remedyAction}\n`;
    if (report.resolutionInfo.verificationChecklist?.length) {
      md += `\n**Kiểm tra xác nhận (Verification Checklist)**:\n`;
      for (const item of report.resolutionInfo.verificationChecklist) {
        md += `- [x] ${item}\n`;
      }
    }
    if (report.resolutionInfo.preventativeMeasures?.length) {
      md += `\n**Khuyến nghị phòng ngừa tái phát**:\n`;
      for (const item of report.resolutionInfo.preventativeMeasures) {
        md += `- ${item}\n`;
      }
    }
    md += `\n`;
  }

  if (report.outcome === 'Escalated' && report.escalationInfo) {
    md += `## 2. Thông Tin Bàn Giao Chuyển Tuyến (Escalation Handover)\n`;
    md += `- **Đội ngũ tiếp nhận**: **${report.escalationInfo.targetTier}**\n`;
    md += `- **Mức ưu tiên đề xuất**: \`${report.escalationInfo.priority}\`\n`;
    if (report.escalationInfo.contactChannel) {
      md += `- **Kênh liên lạc khẩn cấp**: ${report.escalationInfo.contactChannel}\n`;
    }
    if (report.escalationInfo.suggestedRemediation) {
      md += `- **Nhận định sơ bộ**: ${report.escalationInfo.suggestedRemediation}\n`;
    }
    md += `\n**Thông tin bàn giao bắt buộc**:\n`;
    for (const info of report.escalationInfo.requiredInfo) {
      md += `- [ ] ${info}\n`;
    }
    md += `\n`;
  }

  md += `## 3. Lịch Sử Chẩn Đoán Chi Tiết (Audit Trail - ${report.auditSteps.length} bước)\n\n`;
  if (report.auditSteps.length === 0) {
    md += `*Không có bước trung gian nào được ghi nhận.*\n\n`;
  } else {
    md += `| Bước | Tầng OSI | Thao Tác Kiểm Tra | Kết Quả Lựa Chọn | Thời Điểm |\n`;
    md += `|:---:|:---:|:---|:---|:---|\n`;
    for (const step of report.auditSteps) {
      const timeStr = new Date(step.timestamp).toLocaleTimeString('vi-VN');
      const osi = step.osiLayer || 'N/A';
      const cmd = step.commandCli ? ` \`${step.commandCli}\` ` : '';
      md += `| ${step.stepIndex} | ${osi} | ${step.nodeTitle}${cmd} | **${step.chosenBranchLabel}** | ${timeStr} |\n`;
    }
    md += `\n`;
  }

  md += `## 4. Hành Động Tiếp Theo Khuyến Nghị\n`;
  for (const act of report.nextActions) {
    md += `- ${act}\n`;
  }
  md += `\n---\n*Báo cáo được sinh tự động bởi Helpdesk Runbook Tree (Zero-Ops Edition).*`;

  return md;
}
