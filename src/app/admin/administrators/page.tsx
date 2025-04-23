// src/app/admin/administrators/page.tsx
'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Input from '@mui/material/Input'; // Dùng Input cơ bản cho file
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Icon upload

// Import Firebase Storage functions và client config
import { storage } from '@/lib/firebaseClient'; // <<< Import Storage đã khởi tạo
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage"; // <<< Import các hàm Storage

export default function AdministratorsPage() {
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Lưu URL sau khi upload
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Xử lý khi chọn file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadedImageUrl(null); // Reset URL cũ khi chọn file mới
      setUploadProgress(0);
    }
  };

  // Xử lý submit form (Upload ảnh trước, sau đó gọi API tạo admin)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
        setError("Vui lòng nhập email.");
        return;
    }
    // Không bắt buộc phải có ảnh, nhưng nếu có thì upload
    if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0);

        // Tạo tham chiếu đến vị trí lưu file trên Storage (ví dụ: admin_avatars/user_email.jpg)
        // Nên có cách đặt tên file tốt hơn để tránh trùng lặp, ví dụ dùng timestamp hoặc UID nếu có
        const fileExtension = selectedFile.name.split('.').pop();
        const storageRef = ref(storage, `admin_avatars/${email}_${Date.now()}.${fileExtension}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        // Lắng nghe sự kiện upload
        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // Cập nhật tiến trình upload
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
                console.log('Upload is ' + progress + '% done');
            },
            (uploadError) => {
                // Xử lý lỗi upload
                console.error("Upload failed:", uploadError);
                setError(`Lỗi tải ảnh lên: ${uploadError.message}`);
                setIsUploading(false);
            },
            async () => {
                // Upload thành công, lấy download URL
                console.log('File available at', await getDownloadURL(uploadTask.snapshot.ref));
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setUploadedImageUrl(downloadURL);
                    setIsUploading(false);
                    // --- SAU KHI CÓ URL, GỌI API TẠO ADMIN ---
                    await createAdminOnBackend(email, downloadURL);
                } catch (getUrlError) { // getUrlError có kiểu unknown
                    console.error("Failed to get download URL:", getUrlError);
                
                    // Kiểm tra kiểu trước khi truy cập .message
                    let errorMessage = "Lỗi không xác định khi lấy URL ảnh.";
                    if (getUrlError instanceof Error) {
                        // Nếu đúng là Error, giờ mới truy cập .message an toàn
                        errorMessage = `Lỗi lấy URL ảnh: ${getUrlError.message}`;
                    } else if (typeof getUrlError === 'string') {
                        // Hoặc xử lý trường hợp lỗi là một chuỗi
                         errorMessage = `Lỗi lấy URL ảnh: ${getUrlError}`;
                    }
                    // ... các trường hợp khác nếu cần ...
                
                    setError(errorMessage); // Sử dụng thông báo lỗi đã được xử lý
                    setIsUploading(false);
                }
            }
        );
    } else {
        // Nếu không chọn ảnh, gọi API tạo admin mà không có ảnh
        await createAdminOnBackend(email, null);
    }
  };

  // --- Hàm gọi API Backend (hiện tại là placeholder) ---
  const createAdminOnBackend = async (adminEmail: string, imageUrl: string | null) => {
      setIsCreatingAdmin(true);
      setError(null); // Reset lỗi trước khi gọi API mới
      console.log("Calling backend to create admin:", { email: adminEmail, profileImageUrl: imageUrl });

      // TODO: Thực hiện fetch POST đến API endpoint thật (ví dụ: /api/administrators)
      // Backend API này cần được tạo và bảo mật đúng cách sau khi có hệ thống Auth
      try {
          // const response = await fetch('/api/administrators', { // Thay bằng API thật
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json', /* Thêm Auth Header nếu cần */ },
          //     body: JSON.stringify({ email: adminEmail, profileImageUrl: imageUrl })
          // });
          // const result = await response.json();
          // if (!response.ok) throw new Error(result.details || result.error || 'Failed to create admin');

          // --- Giả lập thành công ---
          await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng
          const result = { message: `Admin ${adminEmail} created successfully (simulated).` };
          // --- Hết phần giả lập ---

          setSuccessMessage(result.message);
          setEmail('');
          setSelectedFile(null);
          setUploadedImageUrl(null);
          setUploadProgress(0);

      } catch (err: any) {
          console.error("Error calling backend API:", err);
          setError(err.message || 'Lỗi khi gọi API tạo admin.');
      } finally {
          setIsCreatingAdmin(false);
      }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý Quản trị viên
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 3, border: '1px solid #eee', borderRadius: 2, maxWidth: 500 }}>
         <Typography variant="h6" component="h2" gutterBottom>
            Tạo Admin Mới
         </Typography>

         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
         {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

         <TextField
            label="Email Admin mới"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            disabled={isUploading || isCreatingAdmin}
         />

        <Box sx={{ my: 2 }}>
            <Button
                variant="outlined"
                component="label" // Biến Button thành label cho input file
                startIcon={<CloudUploadIcon />}
                disabled={isUploading || isCreatingAdmin}
            >
                Chọn ảnh đại diện
                <input
                    type="file"
                    hidden // Ẩn input gốc
                    accept="image/*" // Chỉ chấp nhận file ảnh
                    onChange={handleFileChange}
                />
            </Button>
            {selectedFile && <Typography sx={{ display: 'inline', ml: 2 }}>{selectedFile.name}</Typography>}
        </Box>

        {/* Hiển thị tiến trình upload */}
        {isUploading && (
            <Box sx={{ width: '100%', my: 1 }}>
                <CircularProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ ml: 1 }}>{Math.round(uploadProgress)}%</Typography>
            </Box>
        )}
        {/* Hiển thị ảnh đã upload (nếu có) */}
         {uploadedImageUrl && !isUploading && (
            <Box sx={{ my: 2 }}>
                 <Typography variant="caption">Upload thành công:</Typography>
                 <img src={uploadedImageUrl} alt="Uploaded avatar" height="100" style={{ display: 'block', marginTop: '8px' }}/>
             </Box>
         )}

         <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUploading || isCreatingAdmin}
            startIcon={(isUploading || isCreatingAdmin) ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ mt: 2 }}
          >
            {isUploading ? 'Đang tải ảnh...' : (isCreatingAdmin ? 'Đang tạo Admin...' : 'Tạo Admin')}
          </Button>
      </Box>
    </Box>
  );
}