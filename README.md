# 🌲 Helpdesk Runbook Tree

> **Cây Quyết Định Chẩn Đoán Sự Cố Mạng L1–L7 & Tự Động Sinh Báo Cáo ITIL**  
> *Ứng dụng web tương tác nhẹ (~50kB), chạy 100% trên trình duyệt (Zero-Server), giúp kỹ thuật viên IT Helpdesk khoanh vùng sự cố nhanh chóng và xuất biên bản bàn giao chỉ bằng 1 cú click.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-mowfteedev.github.io-success?logo=github)](https://mowfteedev.github.io/helpdesk-runbook-tree/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Svelte_5_%7C_Tailwind_v4_%7C_Vite_8-cyan)](package.json)
[![Zero-Ops](https://img.shields.io/badge/Hosting-GitHub_Pages_Edge-purple)](https://mowfteedev.github.io/helpdesk-runbook-tree/)

---

## 📌 Điều Hướng Nhanh (Table of Contents)

- [🌐 Trải Nghiệm Trực Tiếp (Live Demo)](#-trải-nghiệm-trực-tiếp)
- [📖 Hướng Dẫn Sử Dụng Cơ Bản](#-hướng-dẫn-sử-dụng-cơ-bản)
- [⚡ Cài Đặt & Chạy Cục Bộ (3 Bước)](#-cài-đặt--chạy-cục-bộ-3-bước)
- [📁 Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [🛠️ Mở Rộng Thêm Kịch Bản Mới](#-mở-rộng-thêm-kịch-bản-mới)
- [📄 Bản Quyền](#-bản-quyền)

---

## 🌐 Trải Nghiệm Trực Tiếp

👉 **Mở ứng dụng ngay tại**: [https://mowfteedev.github.io/helpdesk-runbook-tree/](https://mowfteedev.github.io/helpdesk-runbook-tree/)

- **100% Miễn phí & Không cần server**: Chạy trực tiếp từ GitHub Pages Edge CDN.
- **Offline-First**: Tự động lưu tiến trình vào `localStorage`, mất mạng vẫn thao tác bình thường.

---

## 📖 Hướng Dẫn Sử Dụng Cơ Bản

Quy trình chẩn đoán sự cố mạng chỉ gồm 4 bước thao tác đơn giản:

```
[1. Đọc lệnh CLI] ──> [2. Chạy lệnh & Chọn kết quả] ──> [3. Điều hướng / Backtrack] ──> [4. Xuất Báo Cáo ITIL]
```

### Bước 1: Đọc hướng dẫn & Sao chép lệnh CLI
- Tại mỗi màn hình chẩn đoán, bạn sẽ thấy:
  - **Tầng OSI tương ứng**: `L1 Cáp vật lý`, `L2 DHCP`, `L3 Gateway/WAN`, `L7 DNS`.
  - **Câu lệnh CLI**: Bấm nút **"Sao chép"** (có chuyển đổi giữa Windows và Linux).
  - **Màn hình Terminal mẫu**: Xem ví dụ kết quả trả về đúng chuẩn.
  - **Hướng dẫn phân tích**: Giải thích ý nghĩa từng dòng output.

### Bước 2: Quan sát thực tế & Bấm nút rẽ nhánh
- Căn cứ vào kết quả thực tế trên máy người dùng, chọn nút tương ứng:
  - 🟢 **Xanh lá**: Kết quả bình thường (Ping thông, IP hợp lệ...).
  - 🔴 **Đỏ**: Kết quả lỗi (Mất cáp, Timeout, IP APIPA 169.254...).
  - 🟡 **Vàng**: Cảnh báo hoặc trường hợp đặc biệt.

### Bước 3: Sử dụng thanh lịch sử & Backtrack (Quay lại)
- **Quay lại bước trước (Undo)**: Bấm nút **"Quay lại bước trước"** ở góc dưới nếu bạn chọn nhầm nhánh.
- **Nhảy về bước bất kỳ**: Bấm trực tiếp vào các nút trên thanh **"Lịch sử chẩn đoán (Audit Trail)"** để quay ngược thời gian mà không mất dữ liệu.

### Bước 4: Nhận kết luận & Xuất báo cáo sự cố
Khi đến bước cuối cùng (Đã khắc phục hoặc Cần chuyển tuyến):
1. Bấm nút **"Xuất Báo Cáo ITIL"** (hoặc nút xuất báo cáo trên thanh tiêu đề).
2. Chọn hành động mong muốn:
   - **Chép Markdown**: Dán trực tiếp vào ticket Jira, ServiceNow, GLPI hoặc gửi qua Slack/Teams.
   - **Tải .md**: Lưu file markdown về máy.
   - **In / Xuất PDF**: Dùng lệnh in của trình duyệt để lưu thành file PDF chuyên nghiệp.

---

## ⚡ Cài Đặt & Chạy Cục Bộ (3 Bước)

### Yêu cầu:
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node 20 LTS hoặc 22).

### 1. Tải mã nguồn
```bash
git clone https://github.com/mowfteedev/helpdesk-runbook-tree.git
cd helpdesk-runbook-tree
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
> Mở trình duyệt tại: [`http://localhost:5173/`](http://localhost:5173/)

### Các lệnh hỗ trợ khác:
```bash
npm run check    # Kiểm tra kiểu dữ liệu TypeScript & Svelte
npm run build    # Đóng gói bản Production tĩnh vào thư mục dist/
npm run preview  # Chạy thử bản build production cục bộ
```

---

## 📁 Cấu Trúc Thư Mục

```text
helpdesk-runbook-tree/
├── .github/workflows/         # CI/CD tự động deploy lên GitHub Pages
├── docs/                      # Tài liệu kỹ thuật chi tiết
│   ├── HOW_TO_ADD_RUNBOOK.md  # Cẩm nang tạo kịch bản mới
│   └── DEPLOYMENT_GUIDE.md    # Hướng dẫn hạ tầng & deploy
├── src/
│   ├── types/                 # Định nghĩa TypeScript contract (Runbook, Node, Report)
│   ├── data/                  # Kịch bản chẩn đoán mạng L1–L3/L7 (22 nodes)
│   ├── engine/                # Thuật toán: DFS kiểm tra chu trình, BFS tính đường đi,
│   │                          # SessionStore (LocalStorage), Report Generator
│   ├── components/            # UI Components Svelte 5
│   │   ├── ui/                # Badge (OSI, Priority, Kind)
│   │   ├── runbook/           # CommandCard, TerminalOutput, BranchActions, AuditStepper
│   │   └── report/            # IncidentReportModal (Markdown & PDF)
│   ├── App.svelte             # Giao diện chính điều phối
│   ├── app.css                # Tailwind CSS v4 & Print styles
│   └── main.ts                # Điểm khởi động ứng dụng
├── index.html                 # HTML shell
├── vite.config.ts             # Cấu hình đóng gói Vite (base: './')
└── package.json
```

---

## 🛠️ Mở Rộng Thêm Kịch Bản Mới

Hệ thống được thiết kế theo dạng **Modular Plug-and-Play**:
1. Tạo file kịch bản mới trong `src/data/` (ví dụ: `windows-runbook.ts`, `linux-runbook.ts`).
2. Định nghĩa các Node chẩn đoán theo schema [`Runbook`](src/types/runbook.ts).
3. Đăng ký vào `src/data/index.ts`. Thuật toán sẽ tự động kiểm tra chu trình (cycle-free) và kích hoạt ngay trên giao diện.

> 📖 Xem hướng dẫn chi tiết từng bước tại: [docs/HOW_TO_ADD_RUNBOOK.md](docs/HOW_TO_ADD_RUNBOOK.md).

---

## 📄 Bản Quyền

Dự án được phân phối dưới giấy phép **[MIT License](LICENSE)**. Tự do sử dụng, tùy biến và triển khai nội bộ cho doanh nghiệp của bạn.
