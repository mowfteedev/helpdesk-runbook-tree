# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: helpdesk-runbook-tree
*Cập nhật lần cuối: 2026-09-11 21:18*

---

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Hoàn thiện Lõi Engine & Khởi động Chuỗi Triển Khai Zero-Ops (Phase 1 -> Deployment)
- **Tiến độ tổng thể**: **4/13 đầu việc đã nghiệm thu 100%**, mã nguồn đã đồng bộ trên nhánh `main`.
- **Trọng tâm hiện tại**:
  1. Đã khóa kiến trúc **Zero-Server / Zero-Ops** vận hành 100% trên GitHub Pages qua [ADR-0002](adr/0002-kien-truc-van-hanh-github-pages-zero-ops.md).
  2. Đã hoàn tất toàn bộ hệ thống tài liệu kỹ thuật, cẩm nang mở rộng Runbook và hướng dẫn triển khai.
  3. Sẵn sàng khởi động khâu kết nối bộ nhớ LocalStorage (Task 5) và pipeline CI/CD GitHub Actions (Task 6).

---

## 📋 Bảng Phân Công Nhiệm Vụ & Tiêu Chí Nghiệm Thu (Task Delegation Matrix)

| STT | Đầu việc cụ thể | Chuyên gia phụ trách | File / Module tác động | Tiêu chí Nghiệm thu (Đạt chuẩn) | Trạng thái |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | **Khởi tạo Scaffold Svelte 5 + Vite + Tailwind CSS** | `@tech-lead` | `package.json`, `vite.config.ts`, `app.css`, `App.svelte` | Khởi chạy `npm run dev` không lỗi, bundle build sạch sẽ (~26kB gzip) | 🟢 Đã xong (`f7f6996`) |
| 2 | **Định nghĩa Data Contract & Schema Runbook** | `@database` / Data | `src/types/runbook.ts`, `src/types/index.ts` | 100% strict TypeScript types, hỗ trợ đầy đủ Command, Sample Output, Branches, Escalation | 🟢 Đã xong (`b07f0d6`) |
| 3 | **Xây dựng Bộ dữ liệu chẩn đoán thực tế Network L1-L3** | `@database` / Data | `src/data/network-runbook.ts`, `src/data/index.ts` | 22 nodes bao quát từ cáp mạng L1 -> DHCP -> Gateway -> WAN -> DNS L7 kèm command & output mẫu | 🟢 Đã xong (`fe4b46c`) |
| 4 | **Xây dựng Traversal Engine & DAG Validator** | `@backend` / Engine | `src/engine/traversal.ts`, `src/engine/validator.ts` | Thuật toán DFS phát hiện cycle, BFS tìm shortest path, không có dead-end node mồ côi | 🟢 Đã xong (`478b736`) |
| 5 | **Xây dựng Session Store & Audit Trail** | `@backend` / Engine | `src/engine/session-store.ts` | Lưu vết đầy đủ các bước đã đi qua, hỗ trợ Undo/Backtrack không mất state, lưu LocalStorage | 🟢 Đã xong |
| 6 | **Tự động hóa CI/CD Deploy GitHub Pages** | `@devops` | `.github/workflows/deploy.yml` | Push code tự động build & deploy lên GitHub Pages (`https://mowfteedev.github.io/...`) | ⏳ Sẵn sàng làm |
| 7 | **Thiết kế Visual System & Terminal Theme** | `@designer` | `src/styles/theme.css` | Giao diện chuẩn IT Ops Dark/Light, Badge màu OSI L1-L7, Badge độ ưu tiên P1-P4 | ⚪ Chờ duyệt |
| 8 | **Xây dựng Interactive UI Components** | `@frontend` | `src/components/runbook/*` | Terminal output card, nút Copy CLI 1-click có visual cue, nút rẽ nhánh responsive | ⚪ Chờ duyệt |
| 9 | **Module Sinh Báo Cáo Sự Cố (Markdown & PDF)** | `@frontend` + `@backend` | `src/engine/report-generator.ts`, `src/components/report/*` | Xuất Markdown chuẩn ITIL (Jira/ServiceNow ready) và xuất file PDF tải về ngay | ⚪ Chờ duyệt |
| 10 | **Rà soát Mã Nguồn & Tối ưu Bundle** | `@code-reviewer` | Toàn bộ `src/` | Không any, không memory leak, clean component structure | ⚪ Chờ duyệt |
| 11 | **Kiểm tra An toàn Thông tin & XSS Guard** | `@security` | Sanitize utils, Report generator | Ngăn chặn XSS khi render markdown, không hardcode thông tin nhạy cảm | ⚪ Chờ duyệt |
| 12 | **Kiểm thử Phá hoại Cực hạn (Adversarial QA)** | `@tester` | `tests/traversal.spec.ts` | Test backtrack nhiều lần, test xuất report ở node bất kỳ, test offline mode | ⚪ Chờ duyệt |
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
