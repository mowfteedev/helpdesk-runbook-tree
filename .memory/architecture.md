# 🏛️ Kiến Trúc Hệ Thống: IT Support Diagnostic Decision Tree & Interactive Runbooks
**GitHub Repo**: `helpdesk-runbook-tree`  
**Tagline**: *Interactive L1-L3 troubleshooting tree and incident report generator*  
**Kiến trúc sư**: `@tech-lead` (mowftee-guild)

---

## 1. Tổng Quan & Mục Tiêu Kỹ Thuật
- **Mục tiêu sản phẩm**: Cung cấp công cụ chẩn đoán sự cố mạng, dịch vụ và hệ điều hành theo cây quyết định (L1 đến L7). Giúp kỹ thuật viên Helpdesk & Network Admin chẩn đoán có phương pháp (guided troubleshooting), giảm MTTR (Mean Time to Resolve), và tự động tạo Biên bản Sự cố (Incident Report) chuẩn hóa khi chuyển tuyến (escalate).
- **Kiến trúc chủ đạo**: **Client-Side SPA / Offline-First Monolith** (không phụ thuộc backend máy chủ để đảm bảo kỹ thuật viên vẫn dùng được khi mạng nội bộ/internet gặp sự cố).
- **Môi trường chạy**: Trình duyệt Web (Modern Browsers), PWA / Static Hosting (GitHub Pages / Vercel / Cloudflare Pages).

---

## 2. Công Nghệ Sử Dụng (Tech Stack) & Đánh Đổi

| Thành phần | Công nghệ lựa chọn | Lý do & Đánh đổi kỹ thuật |
| :--- | :--- | :--- |
| **Framework UI** | **Svelte 5 + Vite (TypeScript)** | **Ưu điểm**: Zero-virtual-DOM, reactive state tự nhiên cho cây quyết định, bundle siêu nhẹ (< 45KB gzip), TypeScript type-safe tuyệt đối cho Schema dữ liệu cây. <br>**Đánh đổi**: Cần bước build Vite (so với Alpine.js single HTML), nhưng loại bỏ hoàn toàn nguy cơ spaghetti code khi cây phình to. |
| **Styling** | **Tailwind CSS + Lucide Icons** | Giao diện chuẩn IT Ops / Terminal / Dark Mode hiện đại, trực quan, hỗ trợ Mobile/Desktop responsive. |
| **Dữ liệu Runbook** | **JSON / TypeScript Schema (Static Bundled + Local Storage)** | Data-driven: Toàn bộ cây chẩn đoán là cấu trúc dữ liệu thuần túy (Node Graph), tách biệt hoàn toàn khỏi code giao diện. Cho phép import/export cây chẩn đoán tùy chỉnh. |
| **Báo cáo sự cố** | **jsPDF + html2canvas + Native Print CSS + Markdown Exporter** | Hỗ trợ 2 chế độ: Xuất Markdown để paste vào Jira/ServiceNow/Slack, và xuất file PDF chuyên nghiệp lưu trữ nội bộ. |

---

## 3. Ranh Giới Nghiệp Vụ & Cấu Trúc Module

```
helpdesk-runbook-tree/
├── .memory/                      # Bộ nhớ dự án của mowftee-guild
│   ├── adr/                      # Các biên bản quyết định kiến trúc
│   ├── architecture.md           # Nguồn chân lý kiến trúc
│   └── progress.md               # Bảng tiến độ tác chiến
├── src/
│   ├── assets/                   # Icon, hình ảnh, tài nguyên tĩnh
│   ├── data/                     # Bộ dữ liệu Runbook chuẩn hóa (Network, OS, DNS, Web)
│   │   ├── network-l1-l3.ts      # Cây chẩn đoán Mạng (Physical, IP, Gateway, DNS)
│   │   ├── os-windows.ts         # Cây chẩn đoán Windows (Service, EventLog, WinRM)
│   │   ├── os-linux.ts           # Cây chẩn đoán Linux (Disk, Memory, systemd, SSH)
│   │   └── index.ts              # Registry tập trung các cây
│   ├── engine/                   # Lõi điều hướng cây chẩn đoán (Tree Traversal & State)
│   │   ├── tree-validator.ts     # Kiểm tra tính toàn vẹn (chống loop vô tận, phát hiện node mồ côi)
│   │   ├── session-store.ts      # Quản lý phiên chẩn đoán, lịch sử hành trình (Breadcrumb/Audit)
│   │   └── report-generator.ts   # Chuyển đổi lịch sử phiên thành Incident Report (MD/PDF)
│   ├── types/                    # Định nghĩa Interface & Schema (TypeScript)
│   │   └── runbook.ts            # Runbook, Node, Command, Option, IncidentReport types
│   ├── components/               # Giao diện người dùng
│   │   ├── layout/               # Header, Sidebar, Runbook Selector
│   │   ├── runbook/              # StepViewer, TerminalSnippet, OptionButtons, HistoryBreadcrumb
│   │   └── report/               # IncidentReportModal, ExportOptions, Preview
│   ├── App.svelte                # Root Component điều phối
│   └── main.ts                   # Điểm khởi động ứng dụng
```

---

## 4. Đặc Tả Dữ Liệu Cây Chẩn Đoán (Runbook Tree Schema)

Một Node trong cây tuân thủ hợp đồng dữ liệu chuẩn:
```typescript
export type NodeKind = 'diagnostic_step' | 'action_required' | 'resolved' | 'escalation';

export interface CommandSnippet {
  cli: string;                    // Câu lệnh mẫu: ping 8.8.8.8 -t
  os: 'windows' | 'linux' | 'all';
  description: string;            // Mục đích kiểm tra
  sampleOutput: string;           // Output mẫu của lệnh
  outputAnalysisGuide: string;    // Hướng dẫn đọc output để chọn nhánh
}

export interface DecisionBranch {
  label: string;                  // Nhãn nút bấm: "Nhận được Reply từ Gateway"
  nextNodeId: string;             // ID node tiếp theo
  badgeVariant?: 'success' | 'danger' | 'warning' | 'neutral';
}

export interface RunbookNode {
  id: string;                     // Mã định danh node (vd: "net-gw-ping")
  kind: NodeKind;
  title: string;
  osiLayer?: 'L1' | 'L2' | 'L3' | 'L4' | 'L7';
  description: string;
  command?: CommandSnippet;
  branches: DecisionBranch[];
  escalationDetails?: {
    targetTier: 'L2 Network Team' | 'L3 Systems' | 'ISP NOC';
    priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
    requiredInfo: string[];
  };
  resolutionSummary?: string;
}
```

---

## 5. Quy Chuẩn Kỹ Thuật Bắt Buộc (Guild Standards)
1. **Offline Capability**: Không có bất kỳ API call nào ra ngoài bắt buộc để chạy chức năng cốt lõi. Mất mạng vẫn hoạt động 100%.
2. **Deterministic Tree Traversal**: Cây chẩn đoán là Đồ thị có hướng không chu trình (DAG). Bắt buộc có Engine Validator kiểm tra cycle và dead-end node trước khi nạp.
3. **Audit Trail Immutability**: Mọi bước người dùng chọn đều được ghi nhận vào `SessionHistory` có timestamp, không làm mất dấu vết khi chuyển nhánh.
4. **Copy-to-Clipboard**: 100% câu lệnh chẩn đoán có nút 1-click copy kèm visual feedback.
5. **Incident Report Standard**: Biên bản sự cố xuất ra phải chuẩn format ITIL (Tên sự cố, Mức độ ưu tiên, Thời gian bắt đầu, Các bước đã kiểm tra + Kết quả, Điểm kết luận/chuyển tuyến).
