# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: helpdesk-runbook-tree
*Cập nhật lần cuối: 2026-09-11 21:18*

---

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoàn thiện Toàn Bộ 13/13 Hạng Mục Tác Chiến & Triển Khai Production Zero-Ops
- **Tiến độ tổng thể**: **13/13 đầu việc đã nghiệm thu 100%**, mã nguồn sẵn sàng đẩy lên GitHub Pages.
- **Trọng tâm hiện tại**:
  1. Cây chẩn đoán tương tác thực tế (Interactive Troubleshooting Tree) hoàn chỉnh với 22 nodes mạng.
  2. Bảng điều khiển ITIL: Terminal Command Card với 1-click copy, Output guide, Branching decision, Audit trail stepper, Backtrack & Reset.
  3. Module xuất báo cáo sự cố chuẩn ITIL (Markdown cho Jira/ServiceNow/GLPI & In/Lưu PDF).

---

## 📋 Bảng Phân Công Nhiệm Vụ & Tiêu Chí Nghiệm Thu (Task Delegation Matrix)

| STT | Đầu việc cụ thể | Chuyên gia phụ trách | File / Module tác động | Tiêu chí Nghiệm thu (Đạt chuẩn) | Trạng thái |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | **Khởi tạo Scaffold Svelte 5 + Vite + Tailwind CSS** | `@tech-lead` | `package.json`, `vite.config.ts`, `app.css`, `App.svelte` | Khởi chạy `npm run dev` không lỗi, bundle build sạch sẽ (~26kB gzip) | 🟢 Đã xong (`f7f6996`) |
| 2 | **Định nghĩa Data Contract & Schema Runbook** | `@database` / Data | `src/types/runbook.ts`, `src/types/index.ts` | 100% strict TypeScript types, hỗ trợ đầy đủ Command, Sample Output, Branches, Escalation | 🟢 Đã xong (`b07f0d6`) |
| 3 | **Xây dựng Bộ dữ liệu chẩn đoán thực tế Network L1-L3** | `@database` / Data | `src/data/network-runbook.ts`, `src/data/index.ts` | 22 nodes bao quát từ cáp mạng L1 -> DHCP -> Gateway -> WAN -> DNS L7 kèm command & output mẫu | 🟢 Đã xong (`fe4b46c`) |
| 4 | **Xây dựng Traversal Engine & DAG Validator** | `@backend` / Engine | `src/engine/traversal.ts`, `src/engine/validator.ts` | Thuật toán DFS phát hiện cycle, BFS tìm shortest path, không có dead-end node mồ côi | 🟢 Đã xong (`478b736`) |
| 5 | **Xây dựng Session Store & Audit Trail** | `@backend` / Engine | `src/engine/session-store.ts` | Lưu vết đầy đủ các bước đã đi qua, hỗ trợ Undo/Backtrack không mất state, lưu LocalStorage | 🟢 Đã xong (`b75d17d`) |
| 6 | **Tự động hóa CI/CD Deploy GitHub Pages** | `@devops` | `.github/workflows/deploy.yml` | Push code tự động build & deploy lên GitHub Pages (`https://mowfteedev.github.io/...`) | 🟢 Đã xong |
| 7 | **Thiết kế Visual System & Terminal Theme** | `@designer` | `src/app.css`, `src/components/ui/Badge.svelte` | Giao diện chuẩn IT Ops Dark/Light, Badge màu OSI L1-L7, Badge độ ưu tiên P1-P4 | 🟢 Đã xong |
| 8 | **Xây dựng Interactive UI Components** | `@frontend` | `src/components/runbook/*`, `src/App.svelte` | Terminal output card, nút Copy CLI 1-click có visual cue, nút rẽ nhánh responsive, Backtrack | 🟢 Đã xong |
| 9 | **Module Sinh Báo Cáo Sự Cố (Markdown & PDF)** | `@frontend` + `@backend` | `src/engine/report-generator.ts`, `src/components/report/*` | Xuất Markdown chuẩn ITIL (Jira/ServiceNow ready) và in/xuất file PDF tải về ngay | 🟢 Đã xong |
| 10 | **Rà soát Mã Nguồn & Tối ưu Bundle** | `@code-reviewer` | Toàn bộ `src/` | 100% type safety, svelte-check 0 error 0 warning, bundle ~49kB gzip | 🟢 Đã nghiệm thu |
| 11 | **Kiểm tra An toàn Thông tin & XSS Guard** | `@security` | Report generator, UI components | Không dùng eval/innerHTML rủi ro, sanitized Markdown preview, local-first | 🟢 Đã nghiệm thu |
| 12 | **Kiểm thử Phá hoại Cực hạn (Adversarial QA)** | `@tester` | Headless Chrome/Firefox | Test điều hướng thực tế, test Backtrack, test phục hồi session LocalStorage | 🟢 Đã nghiệm thu |
| 13 | **Tài liệu Bàn giao & Cẩm nang Custom Runbook** | `@doc-writer` | `README.md`, `docs/*` | Đạt chuẩn "5 giây hiểu ngay", hướng dẫn JSON schema chi tiết để mở rộng | 🟢 Đã hoàn thành |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Sẵn sàng làm / Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Ràng Buộc Kỹ Thuật (Decisions & Context Notes)

1. **Kiến trúc Zero-Server & Zero-Ops (ADR-0002)**:
   - Toàn bộ ứng dụng chạy trực tiếp trên trình duyệt máy khách (Client-Side Monolith).
   - Điểm xuất bản chính thức: **GitHub Pages CDN Edge** (Miễn phí 100%, 0đ tiền duy trì server).
   - Base path trong `vite.config.ts` được khóa cứng ở `base: './'` để tài nguyên tải mượt mà trên subpath `/helpdesk-runbook-tree/`.
2. **Cấu Trúc Lược Đồ Dữ Liệu Tối Ưu Truy Vấn**:
   - `nodes` trong Runbook được lưu dạng Dictionary `Record<string, RunbookNode>` thay vì mảng phẳng, đem lại tốc độ truy xuất $O(1)$ cho Traversal Engine.
3. **Toàn Vẹn Đồ Thị DAG**:
   - Mọi kịch bản Runbook trước khi nạp đều được thẩm định qua `validateRunbook()` bằng thuật toán DFS 3 màu để bảo đảm triệt tiêu hoàn toàn chu trình vòng lặp và node mồ côi.
4. **Cơ Chế Local-First**:
   - Tiến trình phiên chẩn đoán lưu thẳng vào `localStorage` của trình duyệt, đảm bảo kỹ thuật viên không bị mất dữ liệu khi mất mạng hoặc reload tab.
