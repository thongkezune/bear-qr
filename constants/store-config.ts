/**
 * Cấu hình cửa hàng Omemo
 * Bạn có thể thay đổi các thông số này để cập nhật toàn bộ hệ thống
 */
export const STORE_CONFIG = {
  // Thông tin giao hàng
  shipping: {
    fee: 30000, // Phí ship đồng giá (VND)
    freeShippingThreshold: 1000000, // Miễn phí ship cho đơn trên 1 triệu (nếu cần)
  },

  // Thông tin thanh toán (VietQR)
  payment: {
    bankName: "MB Bank", // Tên ngân hàng
    accountNumber: "YOUR_ACCOUNT_NUMBER", // Số tài khoản
    accountName: "YOUR_ACCOUNT_NAME", // Tên chủ tài khoản
    bankId: "mbbank", // ID ngân hàng theo VietQR (mbbank, vcb, tcb...)
  },

  // Thông tin liên hệ
  contact: {
    email: "saitama13102002@gmail.com",
    phone: "0918298328",
  },

  // Thông tin thông báo
  notifications: {
    adminEmail: "saitama13102002@gmail.com", // Email nhận thông báo đơn hàng mới
    zaloPhone: "0918298328", // Số điện thoại Zalo nhận tư vấn
  }
};
