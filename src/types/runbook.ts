/**
 * ==============================================================================
 * 🌲 HELPDESK RUNBOOK TREE - DATA CONTRACT & TYPE DEFINITIONS
 * ==============================================================================
 * Layer: Data & Schema Contract (@database / mowftee-guild)
 * Purpose: Strict, type-safe schema for Diagnostic Decision Trees,
 *          Traversal Execution, Audit Trails, and Incident Reports.
 * ==============================================================================
 */

/**
 * Phân loại tầng mạng theo mô hình chuẩn OSI (Open Systems Interconnection).
 */
export type OSILayer = 'L1' | 'L2' | 'L3' | 'L4' | 'L7';

/**
 * Tên gọi đầy đủ hiển thị trực quan cho từng tầng OSI.
 */
export const OSI_LAYER_LABELS: Record<OSILayer, string> = {
  L1: 'L1 - Physical (Cáp, Cổng mạng, NIC, Wi-Fi Link)',
  L2: 'L2 - Data Link (Ethernet, MAC, Switch, ARP, VLAN)',
  L3: 'L3 - Network (IP, Subnet, Default Gateway, Routing)',
  L4: 'L4 - Transport (TCP/UDP Ports, Firewall Rules, MTU)',
  L7: 'L7 - Application (DNS, HTTP/S, SSL/TLS, DHCP, Services)',
};

/**
 * Phân loại bản chất của nút trong cây quyết định chẩn đoán.
 * - diagnostic_step: Bước kiểm tra, chạy lệnh chẩn đoán (ping, tracert, nslookup...)
 * - action_required: Thao tác can thiệp trực tiếp (cắm lại cáp, khởi động lại dịch vụ)
 * - resolved: Điểm kết thúc thành công - Sự cố đã được xử lý triệt để
 * - escalation: Điểm kết thúc chuyển tuyến - Cần bàn giao đội cấp cao (L2/L3/ISP)
 */
export type NodeKind = 'diagnostic_step' | 'action_required' | 'resolved' | 'escalation';

/**
 * Hệ điều hành áp dụng cho câu lệnh kiểm tra.
 */
export type TargetOS = 'windows' | 'linux' | 'macos' | 'all';

/**
 * Mức độ nghiêm trọng của sự cố theo chuẩn ITIL.
 */
export type IncidentPriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';

/**
 * Đội ngũ tiếp nhận khi chuyển tuyến sự cố.
 */
export type EscalationTier = 
  | 'L2 Network Team' 
  | 'L3 Systems' 
  | 'ISP NOC' 
  | 'Security Ops (SOC)' 
  | 'DevOps / Cloud Admin'
  | string;

/**
 * Biến thể màu sắc của nút rẽ nhánh trên giao diện.
 */
export type BranchVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

/**
 * Cấu trúc câu lệnh CLI mẫu đi kèm bước chẩn đoán.
 */
export interface CommandSnippet {
  /** Câu lệnh thực tế: e.g. `ping 192.168.1.1 -n 4` */
  cli: string;
  /** Hệ điều hành áp dụng */
  os: TargetOS;
  /** Mục đích kiểm tra của lệnh */
  description: string;
  /** Output mẫu khi lệnh chạy bình thường hoặc có lỗi */
  sampleOutput: string;
  /** Hướng dẫn kỹ thuật viên đọc và phân tích kết quả output */
  outputAnalysisGuide: string;
  /** Lệnh có đòi hỏi quyền quản trị cao nhất (Run as Admin / sudo) không */
  requiresElevation?: boolean;
  /** Thời gian khuyến nghị timeout (giây) */
  timeoutSeconds?: number;
}

/**
 * Nhánh rẽ quyết định từ một nút chẩn đoán sang nút tiếp theo.
 */
export interface DecisionBranch {
  /** Mã định danh nhánh (tùy chọn) */
  id?: string;
  /** Nhãn hiển thị trên nút bấm (vd: "Nhận được Reply từ Gateway") */
  label: string;
  /** Giải thích chi tiết điều kiện chọn nhánh này */
  description?: string;
  /** Mã định danh của nút đích tiếp theo trong đồ thị */
  nextNodeId: string;
  /** Màu sắc trực quan (xanh, đỏ, vàng, xám) */
  badgeVariant?: BranchVariant;
  /** Nhánh này có phải là kết quả kỳ vọng/bình thường không */
  isExpectedOutcome?: boolean;
}

/**
 * Thông tin chi tiết khi sự cố cần chuyển tuyến (Escalation).
 */
export interface EscalationDetails {
  /** Đội ngũ chuyên trách tiếp nhận */
  targetTier: EscalationTier;
  /** Mức độ ưu tiên của ticket sự cố */
  priority: IncidentPriority;
  /** Kênh liên hệ khẩn cấp (vd: #noc-alerts Slack, Hotline NOC) */
  contactChannel?: string;
  /** Danh sách thông tin bắt buộc phải thu thập trước khi chuyển giao */
  requiredInfo: string[];
  /** Tóm tắt nhận định ban đầu và giả thuyết nguyên nhân */
  suggestedRemediation?: string;
}

/**
 * Thông tin tổng kết khi sự cố được giải quyết thành công (Resolved).
 */
export interface ResolutionDetails {
  /** Nguyên nhân gốc rễ đã xác định */
  rootCause: string;
  /** Biện pháp khắc phục đã thực hiện */
  remedyAction: string;
  /** Các bước kiểm tra lại (verification checklist) */
  verificationChecklist?: string[];
  /** Khuyến nghị phòng ngừa tái phát */
  preventativeMeasures?: string[];
}

/**
 * Cấu trúc một Node đơn lẻ trong Cây Quyết Định (DAG Node Contract).
 */
export interface RunbookNode {
  /** Khóa chính định danh duy nhất (e.g. "net-phy-link", "net-gw-ping") */
  id: string;
  /** Phân loại bản chất của nút */
  kind: NodeKind;
  /** Tiêu đề súc tích của bước chẩn đoán */
  title: string;
  /** Tầng mạng OSI tương ứng */
  osiLayer?: OSILayer;
  /** Mô tả chi tiết hành động hoặc câu hỏi nghiệp vụ */
  description: string;
  /** Bối cảnh kỹ thuật chuyên sâu (giúp kỹ thuật viên L1 hiểu lý do tại sao) */
  technicalContext?: string;
  /** Câu lệnh kiểm tra chính */
  command?: CommandSnippet;
  /** Các câu lệnh tương đương trên OS khác (vd Linux thay thế cho Windows) */
  alternativeCommands?: CommandSnippet[];
  /** Danh sách các nhánh rẽ điều hướng */
  branches: DecisionBranch[];
  /** Thông tin chuyển tuyến (Bắt buộc nếu kind === 'escalation') */
  escalationDetails?: EscalationDetails;
  /** Thông tin giải quyết (Bắt buộc nếu kind === 'resolved') */
  resolutionDetails?: ResolutionDetails;
  /** Tóm tắt giải quyết ngắn gọn (Hỗ trợ tương thích ngược) */
  resolutionSummary?: string;
}

/**
 * Danh mục chuyên đề của Runbook.
 */
export type RunbookCategory = 'network' | 'windows' | 'linux' | 'database' | 'security';

/**
 * Toàn bộ thực thể Runbook hoàn chỉnh (Schema cấp cao nhất).
 */
export interface Runbook {
  /** Khóa chính định danh Runbook (e.g. "network-l1-l3") */
  id: string;
  /** Tên Runbook hiển thị trên giao diện */
  title: string;
  /** Mô tả phạm vi chẩn đoán */
  description: string;
  /** Danh mục chuyên đề */
  category: RunbookCategory;
  /** Phiên bản lược đồ (Semantic Versioning) */
  version: string;
  /** Thời gian ước tính hoàn thành (phút) */
  estimatedMinutes: number;
  /** Đối tượng kỹ thuật viên mục tiêu (L1 Helpdesk, NOC, Sysadmin) */
  targetAudience: string;
  /** Nút gốc xuất phát hành trình chẩn đoán */
  startNodeId: string;
  /** Tập hợp tất cả các Node được đánh chỉ mục theo ID: O(1) Lookup */
  nodes: Record<string, RunbookNode>;
  /** Bộ thẻ phân loại */
  tags: string[];
  /** Thời điểm cập nhật cuối cùng (ISO 8601) */
  updatedAt: string;
}

// ==============================================================================
// 📋 SESSION AUDIT TRAIL & INCIDENT REPORT CONTRACTS
// ==============================================================================

/**
 * Bản ghi nhật ký một bước mà kỹ thuật viên đã trải qua trong phiên chẩn đoán.
 */
export interface SessionStepRecord {
  /** Thứ tự bước trong hành trình (bắt đầu từ 1) */
  stepIndex: number;
  /** Node ID đã ghé thăm */
  nodeId: string;
  /** Tiêu đề bước */
  nodeTitle: string;
  /** Tầng OSI */
  osiLayer?: OSILayer;
  /** Bản chất node */
  nodeKind: NodeKind;
  /** Câu lệnh đã copy/thực thi */
  commandCli?: string;
  /** Nhãn nhánh đã lựa chọn */
  chosenBranchLabel: string;
  /** Nút tiếp theo được điều hướng tới */
  chosenNextNodeId: string;
  /** Thời điểm thực hiện (ISO 8601) */
  timestamp: string;
  /** Ghi chú thủ công của kỹ thuật viên tại bước này (nếu có) */
  technicianNote?: string;
}

/**
 * Trạng thái của một phiên chẩn đoán đang diễn ra.
 */
export interface DiagnosticSession {
  /** ID phiên ngẫu nhiên (UUIDv7 hoặc nanoId) */
  sessionId: string;
  /** Runbook đang chạy */
  runbookId: string;
  /** Tiêu đề Runbook */
  runbookTitle: string;
  /** Mã số ticket (nếu có, ví dụ: "INC-84920") */
  ticketId?: string;
  /** Tên kỹ thuật viên phụ trách */
  technicianName?: string;
  /** Thời điểm bắt đầu */
  startedAt: string;
  /** Thời điểm kết thúc (nếu đã xong) */
  completedAt?: string;
  /** Node hiện tại trên màn hình */
  currentNodeId: string;
  /** Toàn bộ lịch sử các bước đã đi qua (Hỗ trợ Undo/Backtracking) */
  stepHistory: SessionStepRecord[];
  /** Trạng thái tổng thể */
  status: 'in_progress' | 'resolved' | 'escalated' | 'abandoned';
}

/**
 * Cấu trúc dữ liệu Biên Bản Sự Cố chuẩn ITIL sẵn sàng xuất ra Markdown / PDF.
 */
export interface IncidentReportPayload {
  /** Mã báo cáo (e.g. "RPT-20260911-NET-001") */
  reportId: string;
  /** Tiêu đề sự cố */
  title: string;
  /** Mã ticket liên kết (Jira / ServiceNow / GLPI) */
  ticketId?: string;
  /** Kỹ thuật viên lập báo cáo */
  technician: string;
  /** Mức độ ưu tiên */
  priority: IncidentPriority;
  /** Trạng thái kết luận */
  outcome: 'Resolved' | 'Escalated';
  /** Tầng OSI chịu ảnh hưởng */
  osiScope: string;
  /** Thời gian bắt đầu và kết thúc */
  startedAt: string;
  completedAt: string;
  /** Tổng thời gian chẩn đoán (phút) */
  durationMinutes: number;
  /** Tóm tắt nguyên nhân và diễn biến */
  summary: string;
  /** Lịch sử các bước kiểm tra thực tế kèm kết quả */
  auditSteps: SessionStepRecord[];
  /** Thông tin bàn giao (nếu chuyển tuyến) */
  escalationInfo?: EscalationDetails;
  /** Thông tin nghiệm thu khắc phục (nếu đã xử lý) */
  resolutionInfo?: ResolutionDetails;
  /** Các hành động tiếp theo khuyến nghị */
  nextActions: string[];
}

// ==============================================================================
// 🔍 TYPE GUARDS & HELPER UTILITIES
// ==============================================================================

/**
 * Type guard kiểm tra xem một node có phải là điểm kết thúc giải quyết xong không.
 */
export function isResolvedNode(node: RunbookNode): boolean {
  return node.kind === 'resolved';
}

/**
 * Type guard kiểm tra xem một node có phải là điểm kết thúc chuyển tuyến không.
 */
export function isEscalationNode(node: RunbookNode): boolean {
  return node.kind === 'escalation';
}

/**
 * Type guard kiểm tra xem một node có câu lệnh CLI đính kèm không.
 */
export function hasCommand(node: RunbookNode): node is RunbookNode & { command: CommandSnippet } {
  return typeof node.command !== 'undefined' && node.command.cli.trim().length > 0;
}

/**
 * Lỗi kiểm tra tính toàn vẹn của Đồ thị Cây Quyết Định (DAG Integrity Error).
 */
export interface DAGValidationError {
  code: 'MISSING_START_NODE' | 'ORPHAN_NODE' | 'CYCLE_DETECTED' | 'INVALID_TARGET_NODE' | 'EMPTY_BRANCHES_ON_NON_TERMINAL';
  message: string;
  nodeId?: string;
  targetNodeId?: string;
  cyclePath?: string[];
}
