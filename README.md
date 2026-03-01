# Real-time Chat Application (V-Chat) 🚀

Một ứng dụng nhắn tin thời gian thực (Real-time) được xây dựng trên nền tảng MERN Stack, cho phép người dùng kết nối, kết bạn và trò chuyện tức thì.

## 📌 Tổng quan dự án
Dự án được phát triển nhằm giải quyết bài toán giao tiếp trực tuyến với độ trễ thấp, đảm bảo tính đồng bộ dữ liệu giữa các người dùng trong môi trường thời gian thực.

## 🛠 Tech Stack
* **Frontend:** React.js, Context API/Redux, Tailwind CSS.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose).
* **Real-time:** Socket.io (WebSockets).
* **Authentication:** JSON Web Token (JWT) & bcryptjs.

## ✨ Tính năng chính
* **Xác thực:** Đăng ký, đăng nhập và bảo mật phiên làm việc với JWT.
* **Kết bạn:** Tìm kiếm người dùng và quản lý danh sách bạn bè.
* **Chat cá nhân:** Nhắn tin 1-1 với tốc độ phản hồi tính bằng milisecond.
* **Chat nhóm:** Tạo phòng chat, quản lý thành viên và trò chuyện tập thể.
* **Trạng thái:** Hiển thị trạng thái Online/Offline của người dùng.
* **Responsive:** Giao diện tối ưu hóa cho cả thiết bị di động và máy tính.

## 💡 Giải pháp kỹ thuật nổi bật
* **Tối ưu hóa WebSockets:** Sử dụng Socket.io để thiết lập kết nối song công, giảm thiểu Overhead so với HTTP polling truyền thống.
* **Bảo mật dữ liệu:** Mã hóa mật khẩu một chiều với `bcryptjs` trước khi lưu trữ vào database.
* **Quản lý State:** Xử lý luồng dữ liệu tin nhắn và trạng thái ứng dụng đồng bộ, tránh tình trạng re-render dư thừa.

## 🚀 Cài đặt dự án

1. **Clone dự án:**
   ```bash
   git clone [https://github.com/dvushine0411/My_First_ChatApp.git](https://github.com/dvushine0411/My_First_ChatApp.git)
