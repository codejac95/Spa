import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import './App.css'

type TimeSlot = 'Morgon' | 'Eftermiddag' | 'Kväll';

interface BookingInfo  {
  date: string;
  timeSlot: TimeSlot;
};

function Booking({warmOrCold}: {warmOrCold: 'warm' | 'cold'}) {
  const [selectedDate, setSelectedDate] = useState<Date>()
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
    <div className="booking">
      <Calendar onClickDay={handleDateSelect}/>
      {selectedDate && 
        <div className="selectedDate">
          <p>Datum: {selectedDate.toLocaleDateString()}</p>
  
          <p>Förmiddag: <span className={isSlotBooked('Morgon') ? 'redText' : 'greenText'}>{isSlotBooked('Morgon') ? 'Bokad' : 'Ledig'}</span>
          <button onClick={() => handleBookingButton('Morgon')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('Morgon') ? 'Avboka förmiddag' : 'Boka förmiddag'}
          </button></p>
  
          <p>Eftermiddag: <span className={isSlotBooked('Eftermiddag') ? 'redText' : 'greenText'}>{isSlotBooked('Eftermiddag') ? 'Bokad' : 'Ledig'}</span>
          <button onClick={() => handleBookingButton('Eftermiddag')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('Eftermiddag') ? 'Avboka eftermiddag' : 'Boka eftermiddag'}
          </button></p>
          
          <p>Kväll: <span className={isSlotBooked('Kväll') ? 'redText' : 'greenText'}>{isSlotBooked('Kväll') ? 'Bokad' : 'Ledig'}</span>
          <button onClick={() => handleBookingButton('Kväll')} disabled={isHoliday(selectedDate) || isMonday(selectedDate)}>
            {isSlotBooked('Kväll') ? 'Avboka kväll' : 'Boka kväll'}
          </button></p>
        </div>
      }
    </div>
  );
}
export default Booking;
