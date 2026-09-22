/**
 * ============================================================
 *  CHỈNH SỬA THÔNG TIN CỦA BẠN TẠI ĐÂY - CHỈ 1 FILE DUY NHẤT
 * ============================================================
 */

export const config = {
  /** Tên bạn - hiển thị lớn ở màn hình đầu tiên */
  name: "Bùi Quang Phong",

  /** Dòng giới thiệu nhỏ phía trên tên */
  kicker: "Bách Khoa - Một tình yêu, một tương lai",

  /** Bằng cấp / chuyên ngành */
  degree: "Hãy đến dự lễ tốt nghiệp của mình nhé",

  /** Trường. Để chuỗi rỗng "" thì dòng này không hiện. */
  school: "",

  /** Khoá học. Để chuỗi rỗng "" thì dòng này không hiện. */
  classOf: "",

  /**
   * Thời điểm diễn ra buổi lễ (dùng cho đồng hồ đếm ngược).
   * Định dạng ISO, có múi giờ Việt Nam (+07:00).
   */
  eventISO: "2026-09-27T09:00:00+07:00",

  /** Các dòng hiển thị trong phần "Chi tiết buổi lễ" */
  event: {
    dateText: "Chủ nhật, 27/09/2026",
    timeText: "09:00 — 12:00",
    venue: "Hội trường C2",
    address: "Đại học Bách Khoa Hà Nội",
    dressCode: "Hãy mặc những gì bạn thích nhất nha",
    /** Link Google Maps tới địa điểm. Để "" nếu không muốn hiện nút chỉ đường. */
    mapsUrl: "https://maps.google.com/?q=Dai+hoc+Bach+Khoa+Ha+Noi",
  },

  /** Lời nhắn cá nhân ở giữa trang */
  message: [
    "Xin lỗi vì bây giờ mới có thể gửi được tới cậu tấm thiệp này 🥺 Dạo gần đây mình khá nhiều việc, và cũng muốn viết được một tấm thiệp thật đặc biệt, đặc biệt hơn tất cả những tấm thiệp mà cậu đã nhận trước kia. Nên là ... thông cảm cho mình nha. Hi vọng rằng nếu cậu đã đọc đến đây rồi, thì có thể dành thêm chút thời gian để đọc nốt những dòng tâm sự tiếp theo nhé.",
    "4 năm đại học là khoảng thời gian không ngắn mà cũng không dài. Nó đủ để khiến một phần thanh xuân của chúng ta trở nên tươi đẹp hơn, nhưng cũng đủ để để lại trong ta nhiều tiếc nuối. Với tớ, những năm tháng đó sẽ không thể trọn vẹn nếu không có cậu đồng hành.",
    "Mình xin gửi lời cảm ơn tới tất cả những người đã đồng hành với mình trong thời gian vừa qua, và cũng xin gửi lời xin lỗi vì những điều đã làm bạn buồn. Thời gian tới mình vẫn làm việc tại Hà Nội, vậy nên hẹn cậu một hôm nào đó có thể đi ăn, đi chơi,... anything you want nha.",
    "Cảm ơn và hẹn gặp lại. Mình rất mong được gặp bạn trong ngày đặc biệt này."
  ],

  /** Thông tin liên hệ hiển thị ở cuối trang */
  contact: {
    phone: "0867 087 569",
    email: "quangphonghd14@gmail.com",
  },

  /**
   * Các mốc trong hành trình (phần timeline).
   * Thêm / bớt tuỳ ý.
   */
  milestones: [
    { year: "2022", title: "Ngày đầu tiên", desc: "Bước vào môi trường mới với nhiều bỡ ngỡ nhưng cũng tràn đầy hi vọng, vào hành trình mới." },
    { year: "2023", title: "Những đêm không ngủ", desc: "Deadline, đồ án, những người bạn cùng thức tới sáng. Và CMATH - ngôi nhà thứ hai của mình." },
    { year: "2024", title: "Sự kiên trì", desc: "Sáng thực tập, chiều học đại cương, tối trợ giảng." },
    { year: "2025", title: "Thời gian dễ chịu nhất trong 4 năm đại học", desc: "Những môn chuyên ngành, những công việc vốn có, và ... một tình yêu dành cho người con gái ấy ở xứ sở kim chi." },
    { year: "2026", title: "Tốt nghiệp", desc: "Người ta thường nói, khi một cánh cửa đóng lại, một cánh cửa khác sẽ mở ra. Và nếu như bạn đủ yêu, thì hãy là người mở cánh cửa ấy, đừng để bản thân bị mắc kẹt." },
  ],
} as const;

export type Config = typeof config;
