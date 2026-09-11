# ADR-0002: Lựa Chọn Nền Tảng Vận Hành "Zero-Ops" Trên GitHub Pages (Serverless & Offline-First)
- **Ngày quyết định**: 2026-09-11
- **Người đề xuất**: `@tech-lead`
- **Người phê duyệt**: Bang chủ
- **Trạng thái**: Đã phê duyệt (Approved)

---

## 1. Bối cảnh & Ràng buộc Thực Tế (Context)

Dự án `helpdesk-runbook-tree` được xây dựng nhằm phục vụ kỹ thuật viên IT Support, Helpdesk L1-L3 và Network Admin chẩn đoán sự cố mạng và hệ điều hành.
Ràng buộc vận hành cốt lõi từ Bang chủ:
1. **Không có máy chủ riêng (No Private Server)**: Không đầu tư chi phí thuê VPS, Cloud Server (EC2/Droplet), hay duy trì máy chủ vật lý.
2. **Không tốn chi phí định kỳ (Zero Maintenance Cost)**: 0đ tiền duy trì hạ tầng, băng thông hay bản quyền phần mềm quản trị.
3. **Tự động hóa tuyệt đối (Zero-Ops)**: Mỗi khi lập trình viên trong bang hội hoàn thành mã nguồn và `git push origin main`, hệ thống phải tự động đóng gói, kiểm thử kiểu và xuất bản trực tiếp lên trang web công khai mà không cần bất kỳ thao tác thủ công nào.
4. **Khả năng hoạt động khi mất kết nối (Offline-First)**: Kỹ thuật viên khi gặp sự cố đứt mạng nội bộ hoặc đứng tại phòng Server vẫn phải mở công cụ lên tra cứu và sử dụng được bình thường.

---

## 2. Quyết định Kiến Trúc (Decision)

1. **Khóa cứng nền tảng xuất bản chính thức trên GitHub Pages**:
   - Sử dụng hạ tầng CDN toàn cầu của GitHub Pages (kết hợp mạng phân phối Fastly Edge) để phân phối file tĩnh của ứng dụng.
   - Địa chỉ truy cập chính thức: `https://mowfteedev.github.io/helpdesk-runbook-tree/`.

2. **Quy trình Tự động hóa CI/CD qua GitHub Actions (`deploy-pages@v4`)**:
   - Mọi commit merge vào nhánh `main` sẽ kích hoạt workflow `.github/workflows/deploy.yml`.
   - Pipeline tự động chạy kiểm thử TypeScript (`npm run check`), đóng gói bundle Vite (`npm run build`), tự sinh file dự phòng `dist/404.html` và đẩy artifact lên GitHub Pages trong vòng dưới 60 giây.

3. **Cơ chế Triệt Tiêu Lỗi Đường Dẫn Subpath & Tải Lại Trang (Anti-404 SPA Guard)**:
   - Cấu hình `base: './'` trong [`vite.config.ts`](../../vite.config.ts) để toàn bộ tài nguyên (JS, CSS, SVG icons) sử dụng đường dẫn tương đối, bảo đảm không bao giờ bị lỗi 404 do tiền tố repository `/helpdesk-runbook-tree/`.
   - Tự động nhân bản `index.html` thành `404.html` trong thư mục `dist/` khi build để khi người dùng reload ở bất kỳ đường dẫn nào, GitHub Pages vẫn trả về ứng dụng Svelte SPA thay vì trang 404 mặc định của GitHub.

4. **Lưu Trữ Cục Bộ (Local-First Persistence)**:
   - Không sử dụng cơ sở dữ liệu từ xa (Remote Database). Toàn bộ lịch sử các phiên chẩn đoán, audit trail, các ticket dở dang được lưu trữ trực tiếp trong `localStorage` của trình duyệt kỹ thuật viên.
   - Cung cấp tính năng Import/Export file JSON để sao lưu hoặc chuyển giao giữa các ca trực.

5. **Sinh Báo Cáo Tại Phía Trình Duyệt (Client-Side Incident Report Generation)**:
   - Việc sinh báo cáo sự cố chuẩn ITIL (định dạng Markdown và PDF) được thực hiện 100% bằng thư viện JavaScript phía client (`jsPDF`, HTML print CSS, Native Clipboard API), không phụ thuộc vào bất kỳ API máy chủ nào.

---

## 3. Các Phương Án Đã Bị Loại Bỏ (Alternatives Considered)

| Phương án | Lý do loại bỏ |
| :--- | :--- |
| **Thuê VPS Linux (Nginx + Docker)** | Phát sinh chi phí hàng tháng (5$ - 10$/tháng), đòi hỏi công sức vá lỗi bảo mật OS, gia hạn SSL định kỳ và cấu hình sao lưu dữ liệu. Vi phạm tiêu chí không có server. |
| **Vercel / Netlify** | Dù có gói miễn phí nhưng có giới hạn về băng thông (Fair Use Policy) và yêu cầu tạo tài khoản liên kết dịch vụ bên thứ ba. Trong khi mã nguồn đã nằm sẵn trên GitHub, sử dụng luôn GitHub Pages là giải pháp tinh gọn nhất, không phân tán công cụ. |
| **Fullstack Web Service (Node.js/Go backend)** | Trái ngược hoàn toàn với triết lý sản phẩm: Một công cụ sửa mạng mà đòi hỏi server backend từ xa thì khi mất mạng, công cụ sẽ chết đầu tiên. |

---

## 4. Phân Tích Đánh Đổi & Hệ Quả (Consequences & Trade-offs)

### Ưu điểm (Điểm lợi):
- **Chi phí vận hành**: **0 VNĐ / tháng**.
- **Độ sẵn sàng (High Availability)**: Hưởng trọn vẹn SLA 99.9% của GitHub và Fastly CDN.
- **Bảo mật tuyệt đối**: Không có database server mở cổng ra ngoài, loại bỏ hoàn toàn nguy cơ tấn công SQL Injection hay khai thác lỗi máy chủ (RCE).
- **Tốc độ tải trang tức thì**: Toàn bộ bundle kích thước siêu nhẹ (~26 kB gzip), tải trang lần đầu dưới 200ms và các lần sau được cache ngay trên máy.

### Nhược điểm & Ràng buộc kỹ thuật (Đã có giải pháp):
- **Không có backend đồng bộ tự động giữa nhiều máy**: Nếu kỹ thuật viên A dùng máy tính A lưu ticket, máy tính B của kỹ thuật viên B sẽ không tự thấy $\rightarrow$ *Giải pháp*: Cung cấp tính năng Export file JSON và copy biên bản sự cố dạng Markdown/PDF để dán vào hệ thống ticket chung (Jira/ServiceNow).
- **GitHub Pages không có server-side URL rewrite**: Reload trang ở subpath có thể ăn 404 $\rightarrow$ *Giải pháp*: Đã cấu hình `base: './'` và sinh sẵn `404.html` đón đầu toàn bộ request.
