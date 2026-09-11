# ADR-0001: Lựa chọn Mô hình Client-Side SPA (Svelte 5 + Vite + TypeScript) cho Helpdesk Runbook Tree
- **Ngày quyết định**: 2026-09-11
- **Người đề xuất**: `@tech-lead`
- **Trạng thái**: Đã phê duyệt

---

## 1. Bối cảnh & Thách thức (Context)
Dự án `helpdesk-runbook-tree` nhằm hỗ trợ kỹ thuật viên IT Support / Network Admin chẩn đoán sự cố mạng và hệ điều hành theo cây quyết định từ L1 đến L7, đồng thời tự động xuất Incident Report (Markdown/PDF).
Ràng buộc cốt lõi:
- **Tình huống sử dụng đặc thù**: Khi kỹ thuật viên đang xử lý sự cố rớt mạng cục bộ (L1/L2) hoặc mất DNS, hệ thống chẩn đoán **không thể và không được phụ thuộc vào máy chủ backend từ xa**.
- Cần tốc độ phản hồi tức thì (<50ms), chạy mượt trên cả laptop kỹ thuật lẫn điện thoại, có thể lưu trữ offline (Local-First).
- Cần cấu trúc dữ liệu cây chẩn đoán chặt chẽ, dễ bổ sung kịch bản mới mà không làm vỡ logic giao diện.

---

## 2. Quyết định (Decision)
1. **Kiến trúc hệ thống**: **Client-Side SPA / Offline-First Monolith** chạy hoàn toàn trên trình duyệt, không cần backend server cho MVP.
2. **Framework UI**: Sử dụng **Svelte 5 (Vite + TypeScript)** kết hợp **Tailwind CSS**.
3. **Mô hình Dữ liệu**: Data-driven JSON/TypeScript Node Graph, tách biệt hoàn toàn giữa Engine điều hướng (Traversal Engine) và Dữ liệu kịch bản (Runbooks).
4. **Xuất báo cáo (Report Generator)**: Tích hợp xuất file Markdown (chuẩn ITIL/ServiceNow/Jira) và xuất PDF trực tiếp từ trình duyệt (jsPDF / Print CSS).

---

## 3. Các Phương án Đã Bị Loại Bỏ (Alternatives Considered)

- **Phương án A: Alpine.js + Single File HTML**
  - *Lý do loại*: Dù triển khai cực nhanh và không cần build step, nhưng khi cây quyết định mở rộng ra nhiều chuyên đề (Mạng, Linux, Windows AD, DNS), việc quản lý state, lịch sử rẽ nhánh (backtracking/undo), và kiểm tra tính toàn vẹn dữ liệu (DAG validation) trên Alpine.js sẽ nhanh chóng trở thành mã nguồn "spaghetti", không có static typing để bắt lỗi gõ sai ID nút.
- **Phương án B: Full-stack Next.js / NestJS + PostgreSQL**
  - *Lý do loại*: **Vẽ vời công nghệ quá đà (Architecture Astronautics)**. Một công cụ chẩn đoán sự cố mạng lại đòi hỏi kết nối tới database server thì khi rớt mạng nội bộ, công cụ sẽ chết đầu tiên. Làm phức tạp hóa khâu deploy không cần thiết cho giai đoạn MVP.

---

## 4. Đánh Đổi & Hệ Quả (Trade-offs & Consequences)
- **Điểm lợi (Ưu điểm)**:
  - Chạy 100% offline, zero-latency, deploy tĩnh cực dễ (GitHub Pages / Cloudflare Pages hoàn toàn miễn phí).
  - TypeScript Type-Safe giúp bảo đảm cấu trúc Node ID không bao giờ bị link nhầm hoặc gãy nhánh.
  - Tối ưu kích thước bundle (<45KB gzip), Svelte 5 runes quản lý state lịch sử điều hướng cực kỳ trong sáng.
- **Điểm thiệt (Chi phí / Ràng buộc)**:
  - Cần quy trình build `npm run build` qua Vite.
  - Dữ liệu tùy biến nếu lưu cục bộ (LocalStorage/IndexedDB) sẽ không tự động đồng bộ giữa các máy (sẽ giải quyết ở pha sau bằng tính năng Import/Export JSON file).
