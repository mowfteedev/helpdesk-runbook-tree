# 🛠️ Cẩm Nang Xây Dựng & Thêm Kịch Bản Chẩn Đoán Mới (How To Add A Runbook)

> **Dành cho**: Network Engineers, Sysadmins, Security Analysts và các thành viên muốn đóng góp thêm kịch bản chẩn đoán vào hệ thống `helpdesk-runbook-tree`.

---

## ⚡ 5 Giây Hiểu Ngay: Cấu Trúc Runbook Là Gì?

Một **Runbook** là một **Đồ thị Có hướng Không chu trình (DAG - Directed Acyclic Graph)**, trong đó:
- **Node (Nút)**: Đại diện cho một bước kiểm tra (`diagnostic_step`), một thao tác can thiệp (`action_required`), hoặc một điểm kết thúc (`resolved` / `escalation`).
- **Branch (Nhánh rẽ)**: Đại diện cho kết quả của bước kiểm tra và chỉ rõ nút tiếp theo cần đi tới (`nextNodeId`).

```text
[Start Node] ---> (Kết quả A) ---> [Node Tiếp Theo] ---> (Kết quả A1) ---> [Resolved]
             ---> (Kết quả B) ---> [Thao Tác Sửa]  ---> (Thất bại)   ---> [Escalation P1]
```

---

## 📝 Quy Trình 3 Bước Thêm Runbook Mới

### Bước 1: Tạo File Kịch Bản Trong Thư Mục `src/data/`

Tạo một file mới, ví dụ: `src/data/dns-runbook.ts`:

```typescript
import type { Runbook, RunbookNode } from '../types/runbook';

const nodes: Record<string, RunbookNode> = {
  // 1. Nút xuất phát
  'dns-check-status': {
    id: 'dns-check-status',
    kind: 'diagnostic_step',
    osiLayer: 'L7',
    title: 'Kiểm tra Phân giải DNS Nội bộ',
    description: 'Chạy lệnh nslookup để kiểm tra máy chủ DNS công ty có phân giải được tên miền nội bộ hay không.',
    command: {
      cli: 'nslookup intranet.corp.internal',
      os: 'windows',
      description: 'Tra cứu địa chỉ IP của cổng thông tin nội bộ',
      sampleOutput: `Server:  dc01.corp.internal\nAddress:  10.0.0.10\n\nName:    intranet.corp.internal\nAddress:  10.0.10.50`,
      outputAnalysisGuide: 'Nếu trả về đúng IP 10.0.10.50: DNS tốt. Nếu báo "DNS request timed out": Máy chủ DNS nội bộ bị nghẽn.',
      requiresElevation: false,
    },
    branches: [
      {
        id: 'b-dns-ok',
        label: 'Phân giải đúng IP nội bộ (< 50ms)',
        nextNodeId: 'dns-resolved-success',
        badgeVariant: 'success',
        isExpectedOutcome: true,
      },
      {
        id: 'b-dns-fail',
        label: 'Request timed out / Server failure',
        nextNodeId: 'dns-escalate-l3',
        badgeVariant: 'danger',
      },
    ],
  },

  // 2. Nút kết thúc thành công
  'dns-resolved-success': {
    id: 'dns-resolved-success',
    kind: 'resolved',
    osiLayer: 'L7',
    title: 'DNS Hoạt Động Bình Thường',
    description: 'Dịch vụ phân giải tên miền hoàn toàn thông suốt.',
    branches: [],
    resolutionSummary: 'Phân giải DNS nội bộ hoạt động bình thường, không có lỗi.',
    resolutionDetails: {
      rootCause: 'Không phát hiện lỗi hạ tầng DNS.',
      remedyAction: 'Xác minh hoàn tất.',
      verificationChecklist: ['nslookup trả về IP chính xác.'],
    },
  },

  // 3. Nút kết thúc chuyển tuyến
  'dns-escalate-l3': {
    id: 'dns-escalate-l3',
    kind: 'escalation',
    osiLayer: 'L7',
    title: 'Chuyển Tuyến L3: Máy Chủ DNS Nội Bộ Treo',
    description: 'Dịch vụ DNS trên máy chủ Domain Controller không phản hồi yêu cầu.',
    branches: [],
    escalationDetails: {
      targetTier: 'L3 Systems',
      priority: 'P1 - Critical',
      contactChannel: 'Slack #sysadmin-oncall',
      requiredInfo: [
        'IP máy chủ DNS gặp lỗi',
        'Ảnh chụp màn hình lỗi nslookup',
        'Phạm vi phòng ban bị ảnh hưởng',
      ],
      suggestedRemediation: 'Khởi động lại dịch vụ DNS Server trên máy chủ Windows Server DC01.',
    },
  },
};

export const dnsRunbook: Runbook = {
  id: 'dns-troubleshooting',
  title: 'Chẩn Đoán Sự Cố Máy Chủ Tên Miền DNS',
  description: 'Quy trình kiểm tra từ cache DNS máy trạm tới DNS Forwarder và Active Directory DNS.',
  category: 'network',
  version: '1.0.0',
  estimatedMinutes: 3,
  targetAudience: 'Helpdesk L1, Sysadmin L2',
  startNodeId: 'dns-check-status',
  nodes,
  tags: ['dns', 'active-directory', 'nslookup', 'l7'],
  updatedAt: new Date().toISOString(),
};
```

---

### Bước 2: Đăng Ký Vào Registry Tập Trung (`src/data/index.ts`)

Mở file [`src/data/index.ts`](../src/data/index.ts) và bổ sung Runbook mới vào `runbookRegistry`:

```typescript
import { networkRunbook } from './network-runbook';
import { dnsRunbook } from './dns-runbook'; // Thêm import

export const runbookRegistry: Record<string, Runbook> = {
  [networkRunbook.id]: networkRunbook,
  [dnsRunbook.id]: dnsRunbook, // Đăng ký vào bảng tra cứu
};
```

---

### Bước 3: Kiểm Tra Toàn Vẹn Đồ Thị DAG

Chạy lệnh kiểm tra TypeScript và kiểm định đồ thị tự động:

```bash
# Kiểm tra lỗi cú pháp và kiểu dữ liệu
npm run check

# Đóng gói thử nghiệm
npm run build
```

---

## 🚨 Các Quy Tắc Bắt Buộc Khi Viết Runbook (Checklist Nghiệm Thu)

1. **Không tạo vòng lặp vô tận (No Cycles)**: Đồ thị bắt buộc phải là DAG. Tuyệt đối không cho một nhánh rẽ trỏ ngược lại chính nó hoặc tổ tiên của nó mà không có điều kiện thoát.
2. **Không để nút mồ côi (No Orphan Nodes)**: Mọi nút khai báo trong `nodes` bắt buộc phải đi tới được từ `startNodeId`.
3. **Nút kết thúc phải đóng (`branches: []`)**: Nếu `kind` là `'resolved'` hoặc `'escalation'`, mảng `branches` bắt buộc phải để trống (`[]`).
4. **Nút trung gian phải có nhánh rẽ**: Nếu `kind` là `'diagnostic_step'` hoặc `'action_required'`, bắt buộc phải có ít nhất 1 nhánh rẽ (không được để `branches: []`).
5. **Câu lệnh CLI phải thực tế & an toàn**:
   - Câu lệnh phải có mục đích rõ ràng (`description`).
   - Phải có ví dụ output thực tế (`sampleOutput`).
   - Phải có hướng dẫn đối chiếu output (`outputAnalysisGuide`).
   - Tuyệt đối không đưa các câu lệnh phá hoại như `rm -rf` hoặc `format` vào runbook.
