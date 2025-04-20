// src/context/AuthContext.tsx
'use client'; // Provider sẽ dùng hook, nên cần 'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import { auth } from '@/lib/firebaseClient'; // Import auth instance đã khởi tạo
import CircularProgress from '@mui/material/CircularProgress'; // Để hiển thị loading
import Box from '@mui/material/Box';

// Định nghĩa kiểu dữ liệu cho giá trị Context
interface AuthContextType {
  currentUser: User | null; // User object từ Firebase Auth hoặc null
  loading: boolean;         // Trạng thái chờ xác thực ban đầu
  // Sẽ thêm isAdmin?: boolean vào đây sau khi thiết lập Custom Claims
}

// Tạo Context với giá trị mặc định là undefined ban đầu
// Sử dụng undefined giúp phát hiện lỗi nếu dùng Context bên ngoài Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Bắt đầu là loading

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái xác thực của Firebase
    // onAuthStateChanged trả về một hàm để hủy đăng ký listener (unsubscribe)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth State Changed:', user ? `User UID: ${user.uid}` : 'No user');
      setCurrentUser(user); // Cập nhật user state (user hoặc null)
      setLoading(false);   // Đánh dấu đã kiểm tra xong
      // TODO: Khi có user, sẽ gọi user.getIdTokenResult(true) để lấy custom claims ở đây
    });

    // Cleanup: Hủy đăng ký listener khi component unmount
    return () => unsubscribe();
  }, []); // Mảng dependency rỗng [] đảm bảo effect chỉ chạy 1 lần khi mount

  // Giá trị cung cấp bởi Context Provider
  const value = { currentUser, loading };

  // Hiển thị màn hình loading toàn trang trong khi chờ xác thực ban đầu
  // Điều này tránh việc hiển thị giao diện sai (ví dụ: hiện nút login khi đang đăng nhập)
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Cung cấp giá trị context cho các component con
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Tạo Custom Hook để dễ dàng sử dụng Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};