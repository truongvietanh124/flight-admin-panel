import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; // Import Realtime DB instance đã khởi tạo
import { DataSnapshot } from 'firebase-admin/database'; // Import kiểu DataSnapshot

// Định nghĩa kiểu dữ liệu cho chuyến bay nhận từ client khi tạo mới (POST)
interface NewFlightData {
  airlineLogo: string;
  airlineName: string;
  arriveTime: string; // HH:mm (Giờ đến)
  classSeat: string;
  date: string;
  from: string;
  fromShort: string;
  numberSeat: number;
  price: number;
  time: string; // HH:mm (Giờ đi)
  to: string;
  toShort: string;
}

// Định nghĩa kiểu dữ liệu cho đối tượng chuyến bay hoàn chỉnh lưu trong DB
interface Flight extends NewFlightData {
    id: number;
    reservedSeats: string;
}


// --- HÀM TẠO MỚI CHUYẾN BAY (ĐÃ CÓ) ---
export async function POST(request: Request) {
    console.log('Received POST request to /api/flights');
    try {
        const flightData: NewFlightData = await request.json();
        console.log('Received flight data:', flightData);

        const flightsRef = adminDb.ref('/Flights');
        const snapshot: DataSnapshot = await flightsRef.orderByKey().limitToLast(1).once('value');

        let nextId = 0;
        if (snapshot.exists() && snapshot.numChildren() > 0) {
            const lastKey = Object.keys(snapshot.val())[0];
            const lastId = parseInt(lastKey, 10);
            if (!isNaN(lastId)) {
                nextId = lastId + 1;
            } else {
                console.warn("Last key is not a number:", lastKey);
                const allKeysSnapshot = await flightsRef.once('value');
                if (allKeysSnapshot.exists()) {
                    const keys = Object.keys(allKeysSnapshot.val());
                    const numericKeys = keys.map(k => parseInt(k, 10)).filter(k => !isNaN(k));
                    if (numericKeys.length > 0) {
                        nextId = Math.max(...numericKeys) + 1;
                    }
                }
            }
        }
        console.log('Calculated next flight ID:', nextId);

        const flightToSave: Flight = { // Sử dụng kiểu Flight hoàn chỉnh
            ...flightData,
            id: nextId,
            reservedSeats: "",
        };

        const newFlightRef = adminDb.ref(`/Flights/${nextId}`);
        await newFlightRef.set(flightToSave);
        console.log('Flight data saved successfully to Firebase at ref:', newFlightRef.toString());

        return NextResponse.json(
            { message: 'Flight created successfully!', flightId: nextId, data: flightToSave },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Error creating flight:', error);
        return NextResponse.json(
            { error: 'Failed to create flight.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}


// --- HÀM MỚI: LẤY DANH SÁCH CHUYẾN BAY ---
export async function GET(request: Request) {
    console.log('Received GET request to /api/flights');
    try {
        // 1. Lấy tham chiếu đến nút /Flights
        const flightsRef = adminDb.ref('/Flights');

        // 2. Đọc dữ liệu một lần từ Firebase
        const snapshot: DataSnapshot = await flightsRef.once('value');

        // 3. Xử lý dữ liệu snapshot
        if (snapshot.exists()) {
            // Dữ liệu tồn tại, snapshot.val() trả về object dạng { "0": {...}, "1": {...} }
            const flightsData = snapshot.val();

            // Chuyển đổi object thành array để dễ sử dụng ở frontend
            const flightsArray: Flight[] = Object.keys(flightsData).map(key => ({
                // Giả định cấu trúc dữ liệu trong DB khớp với interface Flight
                ...(flightsData[key] as Omit<Flight, 'id'>), // Lấy tất cả trừ id (vì id đã có sẵn)
                 id: parseInt(key, 10) // Lấy id từ key (chuyển sang số nếu cần)
                // Hoặc nếu object trong DB đã chứa 'id':
                // ...(flightsData[key] as Flight)
            }));

            console.log(`Workspaceed ${flightsArray.length} flights.`);
            // 4. Trả về mảng dữ liệu chuyến bay
            return NextResponse.json(flightsArray, { status: 200 });
        } else {
            // Không có dữ liệu chuyến bay nào
            console.log('No flights found.');
            return NextResponse.json([], { status: 200 }); // Trả về mảng rỗng
        }

    } catch (error: any) {
        // Xử lý lỗi
        console.error('Error fetching flights:', error);
        return NextResponse.json(
            { error: 'Failed to fetch flights.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}