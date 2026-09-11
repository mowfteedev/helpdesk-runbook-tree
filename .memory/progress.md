# 📌 Bảng Tiến Độ & Bộ Nhớ Tác Chiến: helpdesk-runbook-tree
*Cập nhật lần cuối: 2026-09-11 20:45*

## 🎯 Mục Tiêu Phiên Hiện Tại (Current Milestone)
- **Giai đoạn**: Phân chia tác chiến & Khởi tạo MVP (Phase 1: Foundation & Core Engine)
- **Trọng tâm**: Phân công chi tiết từng đầu việc với tiêu chí nghiệm thu rõ ràng cho các chuyên gia trong bang hội, kích hoạt khởi tạo dự án và lõi Engine.

---

## 📋 Bảng Phân Công Nhiệm Vụ & Tiêu Chí Nghiệm Thu (Task Delegation Matrix)

| STT | Đầu việc cụ thể | Chuyên gia phụ trách | File / Module tác động | Tiêu chí Nghiệm thu (Đạt chuẩn) | Trạng thái |
|:---:|:---|:---:|:---|:---|:---:|
| 1 | **Khởi tạo Scaffold Svelte 5 + Vite + Tailwind CSS** | `@tech-lead` | `package.json`, `vite.config.ts`, `tailwind.config.js` | Khởi chạy `npm run dev` không lỗi, bundle build sạch sẽ | ⏳ Đang làm |
| 2 | **Định nghĩa Data Contract & Schema Runbook** | `@database` / Data | `src/types/runbook.ts` | 100% strict TypeScript types, hỗ trợ đầy đủ Command, Sample Output, Branches, Escalation | ⚪ Chờ duyệt |
| 3 | **Xây dựng Bộ dữ liệu chẩn đoán thực tế Network L1-L3** | `@database` / Data | `src/data/network-runbook.ts` | Đầy đủ kịch bản từ cáp mạng -> DHCP -> Gateway -> WAN -> DNS kèm command & output mẫu | ⚪ Chờ duyệt |
| 4 | **Xây dựng Traversal Engine & DAG Validator** | `@backend` / Engine | `src/engine/traversal.ts`, `src/engine/validator.ts` | Thuật toán DFS phát hiện cycle, không có dead-end node mồ côi | ⚪ Chờ duyệt |
| 5 | **Xây dựng Session Store & Audit Trail** | `@backend` / Engine | `src/engine/session-store.ts` | Lưu vết đầy đủ các bước đã đi qua, hỗ trợ Undo/Backtrack không mất state | ⚪ Chờ duyệt |
| 6 | **Thiết kế Visual System & Terminal Theme** | `@designer` | `src/styles/theme.css` | Giao diện chuẩn IT Ops Dark/Light, Badge màu OSI L1-L7, Badge độ ưu tiên P1-P4 | ⚪ Chờ duyệt |
| 7 | **Xây dựng Interactive UI Components** | `@frontend` | `src/components/runbook/*` | Terminal output card, nút Copy CLI 1-click có visual cue, nút rẽ nhánh responsive | ⚪ Chờ duyệt |
| 8 | **Module Sinh Báo Cáo Sự Cố (Markdown & PDF)** | `@frontend` + `@backend` | `src/engine/report-generator.ts`, `src/components/report/*` | Xuất Markdown chuẩn ITIL (Jira/ServiceNow ready) và xuất file PDF tải về ngay | ⚪ Chờ duyệt |
| 9 | **Rà soát Mã Nguồn & Tối ưu Bundle** | `@code-reviewer` | Toàn bộ `src/` | Không any, không memory leak, clean component structure | ⚪ Chờ duyệt |
| 10 | **Kiểm tra An toàn Thông tin & XSS Guard** | `@security` | Sanitize utils, Report generator | Ngăn chặn XSS khi render markdown, không hardcode thông tin nhạy cảm | ⚪ Chờ duyệt |
| 11 | **Kiểm thử Phá hoại Cực hạn (Adversarial QA)** | `@tester` | `tests/traversal.spec.ts` | Test backtrack nhiều lần, test xuất report ở node bất kỳ, test offline mode | ⚪ Chờ duyệt |
| 12 | **Tự động hóa CI/CD Deploy GitHub Pages** | `@devops` | `.github/workflows/deploy.yml` | Push code tự động build & deploy lên GitHub Pages | ⚪ Chờ duyệt |
| 13 | **Tài liệu Bàn giao & Cẩm nang Custom Runbook** | `@doc-writer` | `README.md`, `docs/HOW_TO_ADD_RUNBOOK.md` | Đạt chuẩn "5 giây hiểu ngay", hướng dẫn JSON schema chi tiết để mở rộng | ⚪ Chờ duyệt |

*Quy ước trạng thái*: 🟢 Đã xong | ⏳ Đang làm | 🔴 Gặp lỗi/Blocker | ⚪ Chờ duyệt

---

## 🧠 Nhật Ký Quyết Định & Lưu Ý Bối Cảnh (Context Notes)
- Kiến trúc chọn: **Svelte 5 (Vite + TypeScript) + Tailwind CSS** chạy hoàn toàn trên client-side (Offline-first / Static SPA).
- Phân tách module rành mạch: `types` -> `data` -> `engine` -> `components`.
- Mọi câu lệnh trong Runbook đều phải có mục đích rõ ràng, cấm viết lệnh mơ hồ.
