import './App.css'
import Booking from './Booking';

function Warm() {
  
  return (
    <>
    <div className='warm'>
      <h1>Tider för varma avdelningen</h1>
    </div>
    <div>
      <Booking warmOrCold='warm'/>
    </div>
    </>
  );
}

export default Warm;
