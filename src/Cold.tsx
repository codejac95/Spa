import './App.css'
import Booking from './Booking';

function Cold() {

  return (
    <>
    
    <div className='cold'>
      <h1>Tider för kalla avdelningen</h1>
    </div>
    <div>
      <Booking warmOrCold='cold'/>
    </div>
    </>
  );
}

export default Cold;
