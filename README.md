

# **Hệ Thống Hồ Sơ Bệnh Án Điện Tử ClinicSys**

> **Giới thiệu:** ClinicSys là một hệ thống hồ sơ bệnh án điện tử (Electronic Medical Record - EMR) được thiết kế nhằm đơn giản hóa quy trình làm việc cho các phòng khám tư nhân quy mô vừa và nhỏ tại Việt Nam.


### **1. Bối Cảnh và Vấn Đề (Problem Statement)**

*   **Bối cảnh (Context):** Hiện tại, các phòng khám tư nhân vừa và nhỏ ở Việt Nam thường quản lý hồ sơ bệnh nhân và các hoạt động vận hành thông qua phương pháp thủ công (sổ sách, giấy tờ) hoặc sử dụng các phần mềm riêng lẻ, thiếu tính liên kết.
*   **Hậu quả (Consequences):** Nhiều thách thức và rủi ro:
    *   **Kém hiệu quả:** Quy trình đăng ký bệnh nhân và tra cứu lịch sử bệnh án phức tạp, tốn nhiều thời gian.
    *   **Rủi ro mất mát dữ liệu:** Dữ liệu bệnh án có nguy cơ cao bị thất lạc hoặc hư hỏng do các yếu tố vật lý (hỏa hoạn, ẩm mốc) hoặc do sai sót của con người (human error).
    *   **Khó khăn trong quản lý:** Việc tổng hợp dữ liệu để tạo các báo cáo vận hành (ví dụ: doanh thu, tần suất dịch vụ) rất khó khăn và không kịp thời.
*   **Giải pháp đề xuất - ClinicSys (Proposed Solution):**
    *   ClinicSys là một hệ thống hồ sơ bệnh án điện tử (EMR) được xây dựng trên nền tảng web.
    *   **Mục tiêu:** Tinh gọn và tự động hóa toàn bộ quy trình vận hành của phòng khám, bao gồm:
        * quản lý lịch hẹn
        * lưu trữ hồ sơ bệnh án
        * xuất hóa đơn thanh toán.
    *   **Các tiêu chí chính:** Hệ thống được thiết kế để đảm bảo các yếu tố **Bảo mật**, **Thân thiện với người dùng** và **Hiệu quả**.

---

### **2. Tích Hợp Công Cụ Bên Thứ Ba (Third-Party Tool Interface)**

Để nâng cao tính năng và trải nghiệm, ClinicSys sẽ tích hợp với các dịch vụ bên ngoài thông qua Giao diện Lập trình Ứng dụng (API).

1.  **Google Gemini API / OpenAI API (Dịch vụ Trí tuệ nhân tạo - AI):**
    *   **Chức năng:**
        *   Hỗ trợ bác sĩ bằng cách tự động gợi ý các mã chẩn đoán bệnh theo chuẩn **ICD-10** dựa trên các ghi chú triệu chứng dạng văn bản tự do.
        *   Kiểm tra và cảnh báo về các **tương tác thuốc (drug-to-drug interactions)** tiềm ẩn khi bác sĩ kê đơn.
    *   **Giao diện tích hợp:** RESTful API (qua giao thức HTTPS).

2.  **Thư Viện Tạo PDF (PDF Generation Library - ví dụ: iTextSharp cho .NET, PDFBox cho Java):**
    *   **Chức năng:** Tạo ra các tài liệu có thể in ấn hoặc lưu trữ dưới dạng PDF, bao gồm: biên lai, hóa đơn, báo cáo y khoa và đơn thuốc.
    *   **Giao diện tích hợp:** Tích hợp dưới dạng thư viện phía máy chủ (Server-side library integration).

3.  **Dịch Vụ Gửi Thông Báo qua Zalo/Viber/Telegram/Email (ví dụ: ZNS API):**
    *   **Chức năng:** Tự động gửi các thông báo chính thức đến bệnh nhân, phổ biến nhất là nhắc lịch hẹn và các thông báo quan trọng khác. Việc tích hợp với Zalo được ưu tiên do sự phổ biến của nền tảng này tại Việt Nam.
    *   **Giao diện tích hợp:** RESTful API (qua giao thức HTTPS).

---

### **3. Các Đối Tượng Tương Tác (External Entity Specification)**

Hệ thống sẽ được vận hành và tương tác bởi các đối tượng (người dùng và hệ thống) sau:

1.  **Lễ tân (Receptionist):**
    *   **Vai trò:** Là nhân viên phòng khám, chịu trách nhiệm đăng ký thông tin bệnh nhân, quản lý lịch hẹn, làm thủ tục check-in và xử lý thanh toán.
    *   **Quyền hạn:** Truy cập hệ thống với các quyền hạn giới hạn, tập trung vào các tác vụ hành chính.

2.  **Bác sĩ (Doctor):**
    *   **Vai trò:** Là chuyên gia y tế, chịu trách nhiệm khám và điều trị cho bệnh nhân.
    *   **Quyền hạn:** Truy cập lịch sử bệnh án của bệnh nhân, ghi chú thông tin khám bệnh, đưa ra chẩn đoán và kê đơn thuốc.

3.  **Quản trị viên (Clinic Administrator):**
    *   **Vai trò:** Là chủ sở hữu hoặc người quản lý phòng khám, giám sát toàn bộ hoạt động.
    *   **Quyền hạn:** Quản lý tài khoản nhân viên, cấu hình danh mục dịch vụ và giá, quản lý kho thuốc và xem các báo cáo tài chính, vận hành.

4.  **Bệnh nhân (Patient):**
    *   **Vai trò:** Là một đối tượng bên ngoài có thông tin được quản lý trong hệ thống. Bệnh nhân tương tác gián tiếp với hệ thống (thông qua nhân viên phòng khám) và nhận các thông báo tự động.

5.  **Dịch vụ AI (AI Service):**
    *   **Vai trò:** Là một hệ thống bên ngoài (ví dụ: Gemini) cung cấp các gợi ý thông minh (mã ICD-10, tương tác thuốc) và tích hợp vào giao diện làm việc của Bác sĩ.

---

### **4. Các Kịch Bản Sử Dụng (Use Cases/User Stories)**

Các yêu cầu chức năng được mô tả dưới dạng User Stories và được phân nhóm theo quy trình nghiệp vụ.

*   **Nhóm 1: Quản Trị Người Dùng (User Administration)**
    *  > **UC1:** Với vai trò là **Quản trị viên**, tôi muốn **tạo và quản lý tài khoản người dùng** cho nhân viên (Lễ tân, Bác sĩ) với cơ chế **phân quyền theo vai trò (Role-Based Access Control)**.
    *  > **UC2:** Với vai trò là **nhân viên (Bác sĩ/Lễ tân)**, tôi muốn **đăng nhập vào hệ thống** bằng thông tin đăng nhập của riêng mình.

*   **Nhóm 2: Thiết Lập Dữ Liệu Ban Đầu (Master Data Setup)**
    *  > **UC3:** Với vai trò là **Quản trị viên**, tôi muốn **quản lý danh mục các dịch vụ y tế** của phòng khám cùng với bảng giá tương ứng.
    *  > **UC4:** Với vai trò là **Quản trị viên**, tôi muốn **quản lý danh mục các loại thuốc** có trong nhà thuốc của phòng khám.
    *  > **UC5:** Với vai trò là **Quản trị viên**, tôi muốn **nhập (import) và quản lý cơ sở dữ liệu mã bệnh ICD-10**.

*   **Nhóm 3: Quy Trình Nghiệp Vụ (Business Process)**
    *  > **UC6:** Với vai trò là **Lễ tân**, tôi muốn **đăng ký thông tin cho bệnh nhân mới** hoặc **tìm kiếm hồ sơ của bệnh nhân đã có**.
    *  > **UC7:** Với vai trò là **Lễ tân**, tôi muốn **đặt, dời hoặc hủy lịch hẹn** cho bệnh nhân trên giao diện lịch làm việc (calendar view).
    *  > **UC8:** Với vai trò là **Lễ tân**, tôi muốn **quản lý hàng đợi khám bệnh** trong ngày và thực hiện **check-in** cho bệnh nhân khi họ đến.
    *  > **UC9:** Với vai trò là **Bác sĩ**, tôi muốn **xem danh sách các bệnh nhân đang chờ đến lượt khám** của mình.
    *  > **UC10:** Với vai trò là **Bác sĩ**, tôi muốn **mở hồ sơ bệnh án** để xem toàn bộ lịch sử y tế của bệnh nhân, bao gồm các chẩn đoán và đơn thuốc trong quá khứ.
    *  > **UC11:** Với vai trò là **Bác sĩ**, tôi muốn **ghi lại các chỉ số sinh tồn, triệu chứng và chẩn đoán** cho lần khám hiện tại.
    *  > **UC12:** Với vai trò là **Bác sĩ**, tôi muốn **nhận được gợi ý mã ICD-10 từ AI** ngay khi tôi đang nhập thông tin chẩn đoán.
    *  > **UC13:** Với vai trò là **Bác sĩ**, tôi muốn **tạo một đơn thuốc điện tử** và **nhận được cảnh báo từ AI** về các tương tác thuốc có thể xảy ra.
    *  > **UC14:** Với vai trò là **Lễ tân**, tôi muốn **tạo một hóa đơn chi tiết** cho bệnh nhân dựa trên các dịch vụ và thuốc đã sử dụng.

*   **Nhóm 4: Bảng Điều Khiển (Dashboard & Homepage)**
    *  > **UC15:** Với vai trò là **Bác sĩ**, bảng điều khiển của tôi cần hiển thị **lịch hẹn trong ngày và hàng đợi bệnh nhân** của tôi.
    *  > **UC16:** Với vai trò là **Lễ tân**, bảng điều khiển của tôi cần hiển thị **lịch hẹn tổng quan của phòng khám và trạng thái check-in** của bệnh nhân.
    *  > **UC17:** Với vai trò là **Quản trị viên**, tôi muốn có một bảng điều khiển hiển thị các **chỉ số hiệu suất kinh doanh (KPIs)** quan trọng như: doanh thu theo ngày, số lượng bệnh nhân và các dịch vụ phổ biến nhất.

---

### **5. Các Ràng Buộc Nghiệp Vụ (Business Rules)**

Đây là các quy tắc và yêu cầu phi chức năng mà hệ thống bắt buộc phải tuân thủ.

1.  **Phân Quyền Truy Cập (Role-Based Access Control - RBAC):**
    *   Quyền truy cập hệ thống phải được kiểm soát nghiêm ngặt.
    *   **Lễ tân:** Không được phép xem chi tiết nội dung khám bệnh (clinical notes).
    *   **Bác sĩ:** Không được phép truy cập các báo cáo tài chính.
    *   **Quản trị viên:** Có toàn quyền truy cập tất cả các chức năng.

2.  **Bảo Mật và Quyền Riêng Tư (Data Security and Privacy):**
    *   Tất cả dữ liệu bệnh nhân phải được **mã hóa (encrypted)** cả khi lưu trữ (at rest) và khi truyền tải (in transit).
    *   Hệ thống phải tuân thủ **Nghị định 13/2023/NĐ-CP** của Chính phủ Việt Nam về Bảo vệ dữ liệu cá nhân.
    *   Hệ thống phải ghi lại **nhật ký hoạt động (system logs)** để theo dõi ai đã truy cập hoặc sửa đổi hồ sơ bệnh nhân.

3.  **Tiêu Chuẩn Mã Hóa Y Tế (Medical Coding Standards):**
    *   Hệ thống phải sử dụng Bảng phân loại quốc tế về bệnh tật phiên bản thứ 10 (**ICD-10**) để ghi nhận chẩn đoán, theo quy định của Bộ Y tế Việt Nam.

4.  **Hỗ Trợ Quyết Định Lâm Sàng (Clinical Decision Support):**
    *   Các gợi ý do AI cung cấp (mã bệnh, tương tác thuốc) chỉ mang tính chất **tham khảo**.
    *   Quyết định lâm sàng cuối cùng **luôn thuộc về bác sĩ**. Điều này phải được thể hiện rõ ràng trên giao diện người dùng (UI).

5.  **Lưu Vết Kiểm Tra (Audit Trail):**
    *   Hệ thống phải duy trì một nhật ký **không thể thay đổi (immutable log)** cho tất cả các hành động quan trọng (ví dụ: tạo đơn thuốc, thay đổi chẩn đoán), ghi rõ người thực hiện và dấu thời gian (timestamp) để đảm bảo tính minh bạch và có thể truy vết khi cần.

---

### **6. Tài Liệu Tham Chiếu (References)**

1.  **Thông tư 27/2021/TT-BYT quy định hồ sơ sức khỏe điện tử:**
    *   **URL:** `https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Thong-tu-27-2021-TT-BYT-quy-dinh-ho-so-suc-khoe-dien-tu-488800.aspx`
    *   **Mức độ liên quan:** Cung cấp các tiêu chuẩn và trường dữ liệu bắt buộc cho một hệ thống EMR tại Việt Nam, đóng vai trò là nền tảng để xây dựng mô hình dữ liệu (data models) của dự án.

2.  **Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân:**
    *   **URL:** `https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=207997`
    *   **Mức độ liên quan:** Đưa ra các quy định pháp lý về việc xử lý và bảo mật dữ liệu cá nhân của bệnh nhân mà hệ thống phải tuân thủ.

3.  **Hướng Dẫn của Bộ Y tế về ICD-10:**
    *   **Mức độ liên quan:** Bộ Y tế yêu cầu bắt buộc sử dụng ICD-10 để phân loại bệnh. Hệ thống phải sử dụng phiên bản được Việt hóa để phục vụ cho việc báo cáo và các yêu cầu về bảo hiểm y tế.