/**
 * ==============================================================================
 * 🌲 HELPDESK RUNBOOK TREE - TRAVERSAL ENGINE
 * ==============================================================================
 * Layer: Core Engine (@backend / mowftee-guild)
 * Purpose: Deterministic stateful navigation through Runbook Decision Trees.
 *          Manages step transitions, audit trail history, and backtracking.
 * ==============================================================================
 */

import type { 
  Runbook, 
  RunbookNode, 
  DecisionBranch, 
  SessionStepRecord, 
  DiagnosticSession 
} from '../types/runbook';
import { assertValidRunbook } from './validator';

/**
 * Tuỳ chọn khi tạo mới một phiên điều hướng Traversal Engine.
 */
export interface TraversalEngineOptions {
  /** Tự động kiểm tra tính toàn vẹn của Runbook khi khởi tạo (mặc định: true) */
  autoValidate?: boolean;
  /** Tên kỹ thuật viên phụ trách */
  technicianName?: string;
  /** Mã ticket hỗ trợ (Jira / ServiceNow) */
  ticketId?: string;
}

/**
 * Lõi điều hướng phiên chẩn đoán Runbook (Stateful Traversal Engine).
 */
export class TraversalEngine {
  private runbook: Runbook;
  private currentNodeId: string;
  private history: SessionStepRecord[] = [];
  private sessionId: string;
  private technicianName?: string;
  private ticketId?: string;
  private startedAt: string;
  private completedAt?: string;

  constructor(runbook: Runbook, options?: TraversalEngineOptions) {
    if (options?.autoValidate !== false) {
      assertValidRunbook(runbook);
    }

    this.runbook = runbook;
    this.currentNodeId = runbook.startNodeId;
    this.sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.startedAt = new Date().toISOString();
    this.technicianName = options?.technicianName;
    this.ticketId = options?.ticketId;
  }

  // --------------------------------------------------------------------------
  // GETTERS & STATUS
  // --------------------------------------------------------------------------

  /**
   * Trả về thông tin Runbook đang thực thi.
   */
  public getRunbook(): Runbook {
    return this.runbook;
  }

  /**
   * Trả về Node hiện tại mà kỹ thuật viên đang xem.
   */
  public getCurrentNode(): RunbookNode {
    const node = this.runbook.nodes[this.currentNodeId];
    if (!node) {
      throw new Error(`Node ID hiện tại "${this.currentNodeId}" không tồn tại trong Runbook "${this.runbook.id}".`);
    }
    return node;
  }

  /**
   * Trả về danh sách các nhánh rẽ khả dụng từ Node hiện tại.
   */
  public getCurrentBranches(): DecisionBranch[] {
    return this.getCurrentNode().branches || [];
  }

  /**
   * Kiểm tra xem bước hiện tại có thể quay lại (Undo/Backtrack) được không.
   */
  public get canBacktrack(): boolean {
    return this.history.length > 0;
  }

  /**
   * Kiểm tra xem phiên chẩn đoán đã tới nút kết thúc (Resolved hoặc Escalation) chưa.
   */
  public get isTerminal(): boolean {
    const kind = this.getCurrentNode().kind;
    return kind === 'resolved' || kind === 'escalation';
  }

  /**
   * Kiểm tra xem phiên chẩn đoán đã kết thúc ở trạng thái ĐÃ GIẢI QUYẾT XONG chưa.
   */
  public get isResolved(): boolean {
    return this.getCurrentNode().kind === 'resolved';
  }

  /**
   * Kiểm tra xem phiên chẩn đoán đã kết thúc ở trạng thái CẦN CHUYỂN TUYẾN chưa.
   */
  public get isEscalated(): boolean {
    return this.getCurrentNode().kind === 'escalation';
  }

  /**
   * Trả về toàn bộ lịch sử các bước đã trải qua (Audit Trail).
   */
  public getHistory(): readonly SessionStepRecord[] {
    return [...this.history];
  }

  /**
   * Trả về số bước đã thực hiện.
   */
  public get stepCount(): number {
    return this.history.length;
  }

  /**
   * ID phiên chẩn đoán hiện tại.
   */
  public get id(): string {
    return this.sessionId;
  }

  // --------------------------------------------------------------------------
  // STATE MUTATION (NAVIGATION)
  // --------------------------------------------------------------------------

  /**
   * Lựa chọn một nhánh rẽ để điều hướng sang bước tiếp theo.
   * @param branchSelector Chỉ số (0, 1...) hoặc Branch ID / Next Node ID
   * @param note Ghi chú của kỹ thuật viên tại bước này
   */
  public selectBranch(
    branchSelector: number | string, 
    note?: string
  ): RunbookNode {
    if (this.isTerminal) {
      throw new Error(`Không thể rẽ nhánh từ nút kết thúc "${this.currentNodeId}" (${this.getCurrentNode().title}).`);
    }

    const currentNode = this.getCurrentNode();
    const branches = currentNode.branches;

    let targetBranch: DecisionBranch | undefined;

    if (typeof branchSelector === 'number') {
      targetBranch = branches[branchSelector];
    } else {
      targetBranch = branches.find(
        b => b.id === branchSelector || b.nextNodeId === branchSelector || b.label === branchSelector
      );
    }

    if (!targetBranch) {
      throw new Error(
        `Nhánh rẽ hợp lệ không tìm thấy với tham số "${branchSelector}" tại nút "${currentNode.id}".`
      );
    }

    const nextNode = this.runbook.nodes[targetBranch.nextNodeId];
    if (!nextNode) {
      throw new Error(
        `Nút đích "${targetBranch.nextNodeId}" không tồn tại trong Runbook "${this.runbook.id}".`
      );
    }

    // Ghi nhật ký vào Audit Trail
    const stepRecord: SessionStepRecord = {
      stepIndex: this.history.length + 1,
      nodeId: currentNode.id,
      nodeTitle: currentNode.title,
      osiLayer: currentNode.osiLayer,
      nodeKind: currentNode.kind,
      commandCli: currentNode.command?.cli,
      chosenBranchLabel: targetBranch.label,
      chosenNextNodeId: targetBranch.nextNodeId,
      timestamp: new Date().toISOString(),
      technicianNote: note,
    };

    this.history.push(stepRecord);
    this.currentNodeId = targetBranch.nextNodeId;

    // Nếu đã tới nút kết thúc, ghi nhận completedAt
    if (this.isTerminal && !this.completedAt) {
      this.completedAt = new Date().toISOString();
    }

    return nextNode;
  }

  /**
   * Quay lại 1 bước trước đó (Undo / Backtrack).
   * Trả về Node đã được khôi phục hoặc null nếu đang ở nút xuất phát.
   */
  public backtrack(): RunbookNode | null {
    if (!this.canBacktrack) {
      return null;
    }

    const lastStep = this.history.pop()!;
    this.currentNodeId = lastStep.nodeId;
    this.completedAt = undefined;

    return this.getCurrentNode();
  }

  /**
   * Nhảy trực tiếp về một bước trong quá khứ thông qua breadcrumb.
   * Cắt bỏ toàn bộ các bước sau bước đó.
   */
  public jumpToStep(targetStepIndex: number): RunbookNode | null {
    if (targetStepIndex < 1 || targetStepIndex > this.history.length) {
      return null;
    }

    // Cắt bỏ history từ targetStepIndex - 1 trở đi
    const targetStep = this.history[targetStepIndex - 1];
    this.history = this.history.slice(0, targetStepIndex - 1);
    this.currentNodeId = targetStep.nodeId;
    this.completedAt = undefined;

    return this.getCurrentNode();
  }

  /**
   * Khởi động lại toàn bộ phiên về trạng thái xuất phát ban đầu.
   */
  public reset(): RunbookNode {
    this.currentNodeId = this.runbook.startNodeId;
    this.history = [];
    this.completedAt = undefined;
    this.startedAt = new Date().toISOString();
    return this.getCurrentNode();
  }

  // --------------------------------------------------------------------------
  // METRICS & UX HELPERS
  // --------------------------------------------------------------------------

  /**
   * Trả về danh sách đường đi breadcrumb trực quan cho giao diện người dùng.
   */
  public getBreadcrumbPath(): Array<{
    stepIndex: number;
    nodeId: string;
    title: string;
    branchLabel: string;
  }> {
    return this.history.map(step => ({
      stepIndex: step.stepIndex,
      nodeId: step.nodeId,
      title: step.nodeTitle,
      branchLabel: step.chosenBranchLabel,
    }));
  }

  /**
   * Tính toán số bước ngắn nhất còn lại từ Node hiện tại tới nút kết thúc (Resolved/Escalation) bằng BFS.
   */
  public getShortestRemainingSteps(): number {
    if (this.isTerminal) return 0;

    const visited = new Set<string>();
    const queue: Array<{ id: string; distance: number }> = [{ id: this.currentNodeId, distance: 0 }];
    visited.add(this.currentNodeId);

    while (queue.length > 0) {
      const { id, distance } = queue.shift()!;
      const node = this.runbook.nodes[id];
      if (!node) continue;

      if (node.kind === 'resolved' || node.kind === 'escalation') {
        return distance;
      }

      for (const branch of node.branches || []) {
        if (!visited.has(branch.nextNodeId)) {
          visited.add(branch.nextNodeId);
          queue.push({ id: branch.nextNodeId, distance: distance + 1 });
        }
      }
    }

    return 1;
  }

  /**
   * Ước lượng tiến độ hoàn thành (tính theo phần trăm 0 - 100%).
   */
  public getProgressPercentage(): number {
    if (this.isTerminal) return 100;
    const currentSteps = this.history.length;
    const remaining = this.getShortestRemainingSteps();
    const total = currentSteps + remaining;
    if (total === 0) return 0;
    return Math.min(95, Math.round((currentSteps / total) * 100));
  }

  // --------------------------------------------------------------------------
  // SERIALIZATION & RESTORE (LOCAL STORAGE / AUDIT RECORD)
  // --------------------------------------------------------------------------

  /**
   * Xuất trạng thái hiện tại ra định dạng DiagnosticSession chuẩn.
   */
  public toDiagnosticSession(): DiagnosticSession {
    let status: DiagnosticSession['status'] = 'in_progress';
    if (this.isResolved) status = 'resolved';
    else if (this.isEscalated) status = 'escalated';

    return {
      sessionId: this.sessionId,
      runbookId: this.runbook.id,
      runbookTitle: this.runbook.title,
      ticketId: this.ticketId,
      technicianName: this.technicianName,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      currentNodeId: this.currentNodeId,
      stepHistory: [...this.history],
      status,
    };
  }

  /**
   * Khôi phục một TraversalEngine từ một phiên đã lưu trữ trước đó.
   */
  public static fromDiagnosticSession(
    runbook: Runbook, 
    session: DiagnosticSession
  ): TraversalEngine {
    if (session.runbookId !== runbook.id) {
      throw new Error(
        `Session thuộc về Runbook "${session.runbookId}", không khớp với Runbook cung cấp "${runbook.id}".`
      );
    }

    const engine = new TraversalEngine(runbook, { autoValidate: false });
    engine.sessionId = session.sessionId;
    engine.technicianName = session.technicianName;
    engine.ticketId = session.ticketId;
    engine.startedAt = session.startedAt;
    engine.completedAt = session.completedAt;
    engine.currentNodeId = session.currentNodeId;
    engine.history = [...session.stepHistory];

    return engine;
  }
}
