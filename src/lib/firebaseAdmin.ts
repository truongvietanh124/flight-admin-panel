import * as admin from 'firebase-admin';

// Đảm bảo rằng SDK chỉ được khởi tạo một lần duy nhất
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Thay thế các ký tự '\n' trong chuỗi bằng ký tự xuống dòng thực sự
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.stack);
    }
}

// Export các thành phần cần thiết để sử dụng ở nơi khác
// Ví dụ: export Realtime Database instance
export const adminDb = admin.database();
export const adminAuth = admin.auth(); // Nếu cần dùng Auth
// Export chính admin instance nếu cần dùng các tính năng khác
export default admin;