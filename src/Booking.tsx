import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import './App.css'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type TimeSlot = 'morning' | 'afternoon' | 'evening';

interface BookingInfo  {
  date: string;
  timeSlot: TimeSlot;
};

function Booking({warmOrCold}: {warmOrCold: 'warm' | 'cold'}) {
  const [date, setDate] = useState<Value>(new Date());
  const [selectedDate, setSelectedDate] = useState<ValuePiece>(null)
  const [bookedSlots, setBookedSlots] = useState<BookingInfo[]>([]);
  const [holidays, setHolidays] = useState<string[]>([])

  useEffect(() => {
    fetchRedDays();
  },[])

  const fetchRedDays = () => {
    fetch('http://sholiday.faboul.se/dagar/v2.1/2024')
      .then(response => {
        return response.json();
      })
      .then(data => {
        const holidayArray = data.dagar.filter((day: any) => day.hasOwnProperty("helgdag"))
                                        .map((day: any) => day.datum);
        setHolidays(holidayArray);
        console.log(holidayArray)
      })
  };

  const isMonday =(checkDate: Date) => {
    return checkDate.getDay()=== 1;
  }

  const isHoliday = (checkDate: Date) => {
    const checkMonth = checkDate.getMonth() + 1;
    const checkDay = checkDate.getDate();
    return holidays.some((holiday: string) => {
      const [holidayMonth, holidayDay] = holiday.split('-').slice(1).map(Number);
      return checkMonth === holidayMonth && checkDay === holidayDay;
    });
  };

  const localStorageKey = warmOrCold === 'warm' ? 'warmBookings' : 'coldBookings';

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const storedBookings = JSON.parse(localStorage.getItem(localStorageKey) ?? '[]') as BookingInfo[];
    const selectedBookings = storedBookings.filter(booking => booking.date === date.toLocaleDateString().slice(0, 10));
    setBookedSlots(selectedBookings);
  };

  const isSlotBooked = (timeSlot: TimeSlot) => {
    return bookedSlots.some(booking => booking.timeSlot === timeSlot);
  };

  const bookSlot = (timeSlot: TimeSlot) => {
    if (selectedDate && !holidays.includes(selectedDate.toLocaleDateString().slice(0,10))) {
      const bookingInfo: BookingInfo = {
        date: selectedDate.toLocaleDateString().slice(0, 10),
        timeSlot: timeSlot,
      };
      const bookings = JSON.parse(localStorage.getItem(localStorageKey) ?? '[]') as BookingInfo[];
      localStorage.setItem(localStorageKey, JSON.stringify([...bookings, bookingInfo]));
      setBookedSlots([...bookedSlots, bookingInfo]);
    }
  };

  const unbookSlot = (timeSlot: TimeSlot) => {
    if (selectedDate) {
      const updatedBookings = bookedSlots.filter(booking => !(booking.date === selectedDate.toLocaleDateString().slice(0, 10) && booking.timeSlot === timeSlot));
      setBookedSlots(updatedBookings);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedBookings));
    }
  };
  
  const handleBookingButton = (timeSlot: TimeSlot) => {
    if (isSlotBooked(timeSlot)) {
      unbookSlot(timeSlot);
    } else {
      bookSlot(timeSlot);
    }
  };

  return (
    <div className ="booking">
      <Calendar onChange={setDate} value={date} onClickDay={handleDateSelect}/>
      {selectedDate && 
        <div className="selectedDate">
          <p>Datum: {selectedDate.toLocaleDateString()}</p>

          <p>Förmiddag: {isSlotBooked('morning') ? 'Bokad' : 'Ledig'}
          <button onClick={() => handleBookingButton('morning')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('morning') ? 'Avboka Förmiddag' : 'Boka Förmiddag'}
          </button></p>

          <p>Eftermiddag: {isSlotBooked('afternoon') ? 'Bokad' : 'Ledig'}
          <button onClick={() => handleBookingButton('afternoon')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('afternoon') ? 'Avboka eftermiddag' : 'Boka eftermiddag'}
          </button></p>
          
          <p>Kväll: {isSlotBooked('evening') ? 'Bokad' : 'Ledig'}
          <button onClick={() => handleBookingButton('evening')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('evening') ? 'Avboka Kväll' : 'Boka Kväll'}
          </button></p>
        </div>
      }
    </div>
  );
}

export default Booking;
