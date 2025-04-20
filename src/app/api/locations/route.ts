// src/app/api/locations/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { DataSnapshot } from 'firebase-admin/database';

// Định nghĩa kiểu dữ liệu cho địa điểm trong DB
interface LocationData {
    Id: number; // Hoặc string nếu ID không phải là số
    Name: string;
    // ShortName?: string; // Nếu bạn thêm sau này
}

export async function GET(request: Request) {
    console.log('Received GET request to /api/locations');
    try {
        const locationsRef = adminDb.ref('/Locations');
        const snapshot: DataSnapshot = await locationsRef.orderByChild('Name').once('value'); // Sắp xếp theo Name luôn

        if (snapshot.exists()) {
            const locationsData = snapshot.val();
            // Chuyển object từ Firebase thành array
            const locationsArray: LocationData[] = Object.keys(locationsData).map(key => ({
                ...(locationsData[key] as Omit<LocationData, 'Id'>),
                Id: parseInt(key, 10) // Hoặc dùng Id bên trong nếu có: ...(locationsData[key] as LocationData)
            }));
            // Không cần sort ở đây nữa vì đã orderByChild('Name')

            console.log(`Workspaceed ${locationsArray.length} locations.`);
            return NextResponse.json(locationsArray, { status: 200 });
        } else {
            console.log('No locations found.');
            return NextResponse.json([], { status: 200 });
        }

    } catch (error: any) {
        console.error('Error fetching locations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch locations.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}