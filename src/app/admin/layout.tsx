// src/app/admin/layout.tsx
'use client'; // Cần cho các event handler (logout) và có thể cả state sau này

import * as React from 'react';
import Link from 'next/link'; // Dùng Link của Next.js để routing client-side
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
// import AppBar from '@mui/material/AppBar'; // Có thể dùng nếu muốn có thanh header ngang
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';

// Import các Icons (Cần cài đặt: npm install @mui/icons-material)
import FlightIcon from '@mui/icons-material/Flight'; // Icon máy bay
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Icon thêm mới
import PeopleIcon from '@mui/icons-material/People'; // Icon người dùng
import DashboardIcon from '@mui/icons-material/Dashboard'; // Icon dashboard
import LogoutIcon from '@mui/icons-material/Logout'; // Icon đăng xuất
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Icon quản trị viên
const drawerWidth = 240; // Chiều rộng của sidebar
import { useRouter } from 'next/navigation'; // Dùng router để điều hướng sau khi logout
import { signOut } from 'firebase/auth'; // Dùng để đăng xuất (sẽ thêm sau khi thiết lập Auth)
import { auth } from '@/lib/firebaseClient'; // Import auth instance đã khởi tạo
import { useAuth } from '@/context/AuthContext'; // Có thể dùng nếu cần thông tin người dùng hiện tại
export default function AdminLayout({
  children, // children là nội dung của trang con sẽ được hiển thị bên phải sidebar
}: {
  children: React.ReactNode;
}) {

  // --- Hàm xử lý Logout (Tạm thời) ---
  // TODO: Thay thế bằng logic gọi Firebase signOut sau khi thiết lập Auth
  const router = useRouter(); // Hook để điều hướng

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      // 1. Gọi API để xóa session cookie phía server
      const response = await fetch('/api/auth/session', { method: 'DELETE' });
      if (!response.ok) {
          console.error("Failed to clear session cookie via API");
          // Vẫn tiếp tục logout phía client
      } else {
          console.log("Session cookie cleared via API");
      }

      // 2. Đăng xuất khỏi Firebase phía client
      await signOut(auth);
      console.log("Firebase client signed out");

      // 3. Chuyển hướng về trang đăng nhập
      router.push('/login');

    } catch (error) {
      console.error('Error during logout:', error);
      alert('Đã có lỗi xảy ra khi đăng xuất.');
      // Dù lỗi vẫn nên thử chuyển hướng
      router.push('/login');
    }
  };

  // --- Danh sách các mục điều hướng ---
  const menuItems = [
    // { text: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
    { text: 'Tạo chuyến bay', href: '/admin/flights/create', icon: <AddCircleOutlineIcon /> },
    { text: 'Xem chuyến bay', href: '/admin/flights', icon: <FlightIcon /> },
    { text: 'Quản trị viên', href: '/admin/administrators', icon: <AdminPanelSettingsIcon /> },
    { text: 'Quản lý Users', href: '/admin/users', icon: <PeopleIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Chuẩn hóa CSS */}
      <CssBaseline />

      {/* Sidebar cố định bên trái */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0, // Không co lại khi nội dung thay đổi
          '& .MuiDrawer-paper': { // Style cho phần giấy của Drawer
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5', // Màu nền nhẹ cho sidebar (tùy chọn)
          },
        }}
        variant="permanent" // Sidebar luôn hiển thị
        anchor="left" // Vị trí bên trái
      >
        {/* Phần Logo ở trên cùng */}
        <Toolbar sx={{ justifyContent: 'center', p: 1 }}> {/* Dùng Toolbar để căn chỉnh */}
          {/* <img src="/path/to/your/logo.png" alt="Logo" width="100" /> */}
          <Typography variant="h6" noWrap component="div">
            ✈️ Flight Admin
          </Typography>
        </Toolbar>
        <Divider /> {/* Đường kẻ phân cách */}

        {/* Danh sách các mục điều hướng */}
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              {/* Dùng Link của Next.js bọc ListItemButton */}
              <Link href={item.href} passHref legacyBehavior>
                <ListItemButton component="a"> {/* component="a" cần thiết cho legacyBehavior */}
                  <ListItemIcon sx={{ minWidth: 40 }}> {/* Icon */}
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} /> {/* Tên mục */}
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>

        {/* Phần dưới cùng của Sidebar */}
        <Box sx={{ flexGrow: 1 }} /> {/* Đẩy phần tử xuống dưới */}
        <Divider />
        <Box sx={{ p: 2 }}> {/* Padding cho nút logout */}
          <Button
            variant="contained"
            color="error" // Màu đỏ cho logout
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth // Chiếm hết chiều rộng sidebar
          >
            Đăng xuất
          </Button>
        </Box>
      </Drawer>

      {/* Phần nội dung chính bên phải */}
      <Box
        component="main"
        sx={{
            flexGrow: 1, // Chiếm hết không gian còn lại
            bgcolor: 'background.default', // Màu nền mặc định
            p: 3, // Padding cho nội dung chính
            marginLeft: `${drawerWidth}px` // Đẩy nội dung sang phải bằng chiều rộng sidebar
        }}
      >
        {/* <Toolbar /> */} {/* Cần nếu dùng AppBar để tránh nội dung bị che */}
        {/* Hiển thị nội dung của trang con (ví dụ: form tạo chuyến bay) */}
        {children}
      </Box>
    </Box>
  );
}