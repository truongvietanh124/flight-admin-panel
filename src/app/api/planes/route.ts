// src/app/api/planes/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { DataSnapshot } from 'firebase-admin/database';

// Định nghĩa kiểu dữ liệu cho hãng bay trong DB
interface PlaneData {
    Id: number;
    Name: string;
    // Có thể thêm logoUrl nếu bạn cập nhật cấu trúc DB sau này
    // logoUrl?: string;
}

export async function GET(request: Request) {
    console.log('Received GET request to /api/planes');
    try {
        const planesRef = adminDb.ref('/Plane');
        const snapshot: DataSnapshot = await planesRef.once('value');

        if (snapshot.exists()) {
            const planesData = snapshot.val();
            // Chuyển object từ Firebase thành array
            const planesArray: PlaneData[] = Object.keys(planesData).map(key => ({
               ...(planesData[key] as Omit<PlaneData, 'Id'>), // Lấy các trường từ DB
               Id: parseInt(key, 10) // Lấy Id từ key nếu cần, hoặc dùng Id bên trong object
               // Hoặc nếu object trong DB đã có Id đúng:
               // ...(planesData[key] as PlaneData)
            })).sort((a, b) => a.Name.localeCompare(b.Name)); // Sắp xếp theo tên cho dễ chọn

            console.log(`Workspaceed ${planesArray.length} planes.`);
            return NextResponse.json(planesArray, { status: 200 });
        } else {
            console.log('No planes found.');
            return NextResponse.json([], { status: 200 }); // Trả về mảng rỗng
        }

    } catch (error: any) {
        console.error('Error fetching planes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch planes.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}