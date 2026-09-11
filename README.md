# 🌲 Helpdesk Runbook Tree

> **Interactive L1-L3 Troubleshooting Tree & Incident Report Generator**  
> *Hệ thống cây quyết định hỗ trợ kỹ thuật viên Helpdesk và Network Admin xử lý sự cố mạng, dịch vụ và hệ điều hành theo quy trình chuẩn từ tầng L1 đến L7.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Stack-Svelte_5_%7C_Tailwind_CSS_%7C_TypeScript-ff3e00)](https://svelte.dev/)
[![Offline First](https://img.shields.io/badge/Offline--First-100%25-green)](https://github.com/mowfteedev/helpdesk-runbook-tree)

---

## 🎯 Điểm Nổi Bật (Key Features)

- **Interactive Decision Tree**: Điều hướng chẩn đoán sự cố mạng và hệ điều hành từng bước trực quan.
- **Guided CLI & Sample Output**: Mỗi bước rẽ nhánh đều đi kèm câu lệnh kiểm tra thực tế (`ping`, `tracert`, `nslookup`, `ipconfig`, `systemctl`) và ví dụ output tương ứng để đối chiếu.
- **1-Click Command Copy**: Sao chép lệnh nhanh chóng kèm phản hồi trực quan.
- **Audit Trail & Breadcrumb**: Ghi lại toàn bộ hành trình chẩn đoán, hỗ trợ quay lại (backtrack) mà không mất dữ liệu.
- **Incident Report Generator**: Tự động tổng hợp dữ liệu chẩn đoán thành biên bản sự cố chuẩn ITIL dạng **Markdown** (sẵn sàng dán vào Jira/ServiceNow) và **PDF**.
- **100% Offline-First**: Hoạt động hoàn toàn trên trình duyệt, không phụ thuộc vào internet khi gặp sự cố mạng nội bộ.

---

## 🏛️ Kiến Trúc & Tài Liệu Kỹ Thuật

Dự án được xây dựng và quản lý bởi **`mowftee-guild`**:
- [Kiến trúc hệ thống](.memory/architecture.md)
- [Bảng tiến độ tác chiến](.memory/progress.md)
- [Biên bản quyết định kiến trúc (ADR-0001)](.memory/adr/0001-khoi-tao-du-an.md)

---

## 🚀 Cài Đặt & Phát Triển (Quick Start)

Yêu cầu môi trường: **Node.js >= 18**

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy môi trường phát triển (HMR)
npm run dev

# 3. Kiểm tra kiểu TypeScript & cú pháp Svelte
npm run check

# 4. Đóng gói production bundle
npm run build

# 5. Xem trước bản đóng gói
npm run preview
```

