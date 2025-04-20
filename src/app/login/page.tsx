// src/app/login/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Hook để điều hướng
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth"; 
// Import hàm đăng nhập và auth instance từ firebaseClient
import { auth } from '@/lib/firebaseClient'; // Đảm bảo đường dẫn đúng


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Hook để chuyển trang sau khi đăng nhập

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Đăng nhập bằng Firebase Auth client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful:', user.uid);

      // 2. Lấy ID Token từ user
      const idToken = await user.getIdToken();
      console.log('Got ID Token');

      // 3. Gửi ID Token đến API để tạo session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }), // Gửi idToken trong body
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create session cookie');
      }
      console.log('Session cookie created via API');

      // 4. Chuyển hướng đến trang admin sau khi session cookie được tạo
      // TODO: Nên kiểm tra quyền admin trước khi chuyển hướng
      router.push('/admin/flights/create'); // Hoặc trang admin mặc định

    } catch (err: any) {
      console.error('Login or session creation failed:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Email hoặc mật khẩu không đúng.');
      } else if (err.code === 'auth/invalid-email') {
          setError('Định dạng email không hợp lệ.');
      } else {
           setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Chiều cao tối thiểu để căn giữa
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Login
      </Typography>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          mt: 1,
          p: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 1,
          width: '100%', // Chiếm hết chiều rộng container
          maxWidth: '400px', // Giới hạn chiều rộng tối đa
        }}
      >
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Địa chỉ Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Mật khẩu"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
        </Button>
      </Box>
    </Box>
  );
}