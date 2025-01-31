import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut } from '../redux/checkin/checkinActions';

export default function CheckInOut() {
  const { currentUser } = useSelector((state) => state.user);
  const { isCheckedIn, lastCheckIn, lastCheckOut, loading, error } = useSelector((state) => state.checkin);
  const dispatch = useDispatch();

  const handleCheckIn = () => {
    if (currentUser && currentUser._id) {
      dispatch(checkIn(currentUser._id));
    } else {
      console.error('currentUser ID is not available');
    }
  };

  const handleCheckOut = () => {
    if (currentUser && currentUser._id) {
      dispatch(checkOut(currentUser._id));
    } else {
      console.error('currentUser ID is not available');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div>
      <h1>Check In/Out</h1>
      <button onClick={handleCheckIn} disabled={loading || isCheckedIn}>
        Check In
      </button>
      <button onClick={handleCheckOut} disabled={loading || !isCheckedIn}>
        Check Out
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <p>Checked In: {isCheckedIn ? 'Yes' : 'No'}</p>
        <p>Last Check In: {formatDate(lastCheckIn)}</p>
        <p>Last Check Out: {formatDate(lastCheckOut)}</p>
      </div>
    </div>
  );
}