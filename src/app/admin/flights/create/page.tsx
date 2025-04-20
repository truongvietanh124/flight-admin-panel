// src/app/admin/flights/create/page.tsx
'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

// --- Interfaces ---
interface FlightFormData {
  airlineLogo: string;
  airlineName: string;
  arriveTime: string;
  classSeat: string;
  date: string;
  from: string; // Sẽ là tên địa điểm được chọn
  fromShort: string; // Vẫn nhập tay
  numberSeat: number | string;
  price: number | string;
  time: string;
  to: string; // Sẽ là tên địa điểm được chọn
  toShort: string; // Vẫn nhập tay
}

interface Airline {
    Id: number | string;
    Name: string;
}

interface LocationData { // <<< THÊM INTERFACE CHO LOCATION
    Id: number | string;
    Name: string;
}

export default function CreateFlightPage() {
  // --- States ---
  const [formData, setFormData] = useState<FlightFormData>({
    airlineLogo: '', airlineName: '', arriveTime: '', classSeat: 'Economy Class', date: '',
    from: '', fromShort: '', numberSeat: '', price: '', time: '', to: '', toShort: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(true);

  const [locations, setLocations] = useState<LocationData[]>([]); // <<< STATE CHO LOCATIONS
  const [loadingLocations, setLoadingLocations] = useState(true); // <<< STATE LOADING LOCATIONS

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Airlines
      setLoadingAirlines(true);
      try {
        const airlineRes = await fetch('/api/planes');
        if (!airlineRes.ok) throw new Error('Failed to fetch airlines');
        const airlineData: Airline[] = await airlineRes.json();
        setAirlines(airlineData);
      } catch (err) { console.error("Error fetching airlines:", err); }
      finally { setLoadingAirlines(false); }

      // Fetch Locations
      setLoadingLocations(true); // <<< BẮT ĐẦU LOADING LOCATIONS
      try {
        const locationRes = await fetch('/api/locations'); // <<< GỌI API LOCATIONS
        if (!locationRes.ok) throw new Error('Failed to fetch locations');
        const locationData: LocationData[] = await locationRes.json();
        setLocations(locationData); // <<< CẬP NHẬT STATE LOCATIONS
      } catch (err) { console.error("Error fetching locations:", err); }
      finally { setLoadingLocations(false); } // <<< KẾT THÚC LOADING LOCATIONS
    };

    fetchData();
  }, []);

  // --- Handlers ---
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prevState => ({ ...prevState, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null); setSuccessMessage(null);
    console.log('Submitting form data:', formData);
    const dataToSend = {
      ...formData,
      numberSeat: parseInt(String(formData.numberSeat), 10) || 0,
      price: parseInt(String(formData.price), 10) || 0,
    };
    try {
      const response = await fetch('/api/flights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.details || result.error || `HTTP error! status: ${response.status}`); }
      console.log('API response success:', result);
      setSuccessMessage(`Chuyến bay đã được tạo thành công! ID: ${result.flightId}`);
      setFormData({ airlineLogo: '', airlineName: '', arriveTime: '', classSeat: 'Economy Class', date: '', from: '', fromShort: '', numberSeat: '', price: '', time: '', to: '', toShort: '' });
    } catch (err: any) { console.error('Error submitting form:', err); setError(err.message || 'Đã có lỗi xảy ra khi tạo chuyến bay.'); }
    finally { setIsLoading(false); }
  };

  // --- JSX ---
  return (
    <Box sx={{ maxWidth: '800px', margin: '2rem auto', p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom> Tạo chuyến bay mới </Typography>
      <form onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        <Grid container spacing={2}>
          {/* Hãng Bay */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required disabled={loadingAirlines}>
              <InputLabel id="airlineName-label">Tên Hãng bay</InputLabel>
              <Select labelId="airlineName-label" id="airlineName" name="airlineName" value={formData.airlineName} label="Tên Hãng bay" onChange={handleSelectChange}>
                <MenuItem value="" disabled> {loadingAirlines ? 'Đang tải...' : '-- Chọn Hãng Bay --'} </MenuItem>
                {!loadingAirlines && airlines.map((airline) => ( <MenuItem key={airline.Id} value={airline.Name}> {airline.Name} </MenuItem> ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="URL Logo Hãng bay" name="airlineLogo" type="url" value={formData.airlineLogo} onChange={handleChange} fullWidth required margin="normal"/>
          </Grid>
          {/* Thời gian */}
          <Grid item xs={12} sm={4}> <TextField label="Giờ khởi hành" name="time" type="time" value={formData.time} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} /> </Grid>
          <Grid item xs={12} sm={4}> <TextField label="Giờ đến" name="arriveTime" type="time" value={formData.arriveTime} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} /> </Grid>
          <Grid item xs={12} sm={4}> <TextField label="Ngày bay" name="date" type="date" value={formData.date} onChange={handleChange} fullWidth required margin="normal" InputLabelProps={{ shrink: true }} /> </Grid>

          {/* --- CẬP NHẬT ĐỊA ĐIỂM --- */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required disabled={loadingLocations}> {/* <<< THÊM FormControl */}
              <InputLabel id="from-label">Điểm đi</InputLabel>
              <Select labelId="from-label" id="from" name="from" value={formData.from} label="Điểm đi" onChange={handleSelectChange} >
                <MenuItem value="" disabled> {loadingLocations ? 'Đang tải...' : '-- Chọn Điểm Đi --'} </MenuItem>
                {!loadingLocations && locations.map((loc) => ( <MenuItem key={loc.Id} value={loc.Name}> {loc.Name} </MenuItem> ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Mã Điểm đi (Nhập tay)" name="fromShort" value={formData.fromShort} onChange={handleChange} fullWidth required margin="normal" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required disabled={loadingLocations}> {/* <<< THÊM FormControl */}
              <InputLabel id="to-label">Điểm đến</InputLabel>
              <Select labelId="to-label" id="to" name="to" value={formData.to} label="Điểm đến" onChange={handleSelectChange} >
                <MenuItem value="" disabled> {loadingLocations ? 'Đang tải...' : '-- Chọn Điểm Đến --'} </MenuItem>
                {!loadingLocations && locations.map((loc) => ( <MenuItem key={loc.Id} value={loc.Name}> {loc.Name} </MenuItem> ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Mã Điểm đến (Nhập tay)" name="toShort" value={formData.toShort} onChange={handleChange} fullWidth required margin="normal" />
          </Grid>

          {/* Thông tin khác */}
          <Grid item xs={12} sm={4}> <FormControl fullWidth margin="normal" required> <InputLabel id="classSeat-label">Hạng ghế</InputLabel> <Select labelId="classSeat-label" id="classSeat" name="classSeat" value={formData.classSeat} label="Hạng ghế" onChange={handleSelectChange} > <MenuItem value="Economy Class">Economy Class</MenuItem> <MenuItem value="Business Class">Business Class</MenuItem> <MenuItem value="First Class">First Class</MenuItem> </Select> </FormControl> </Grid>
          <Grid item xs={12} sm={4}> <TextField label="Tổng số ghế" name="numberSeat" type="number" value={formData.numberSeat} onChange={handleChange} fullWidth required margin="normal" InputProps={{ inputProps: { min: 1 } }} /> </Grid>
          <Grid item xs={12} sm={4}> <TextField label="Giá vé (VNĐ)" name="price" type="number" value={formData.price} onChange={handleChange} fullWidth required margin="normal" InputProps={{ inputProps: { min: 0 } }} /> </Grid>

          {/* Nút Submit */}
          <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}> <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null} > {isLoading ? 'Đang tạo...' : 'Tạo chuyến bay'} </Button> </Grid>
        </Grid>
      </form>
    </Box>
  );
}