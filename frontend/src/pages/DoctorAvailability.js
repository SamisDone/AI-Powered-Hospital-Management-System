import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addDocument, getCollection, updateDocument } from '../firebase/utils';
import Layout from '../components/Layout';
import './DoctorAvailability.css';

const DoctorAvailability = () => {
  const { currentUser, userProfile } = useAuth();
  const [availability, setAvailability] = useState({
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '13:00', available: false },
    sunday: { start: '09:00', end: '13:00', available: false }
  });
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!currentUser) return;

      try {
        const filters = [{ field: 'doctorId', operator: '==', value: currentUser.uid }];
        const result = await getCollection('doctorAvailability', filters);
        
        if (result.success && result.data.length > 0) {
          const avail = result.data[0];
          setAvailability(avail.schedule || availability);
          setSlotDuration(avail.slotDuration || 30);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, [currentUser]);

  const handleDayChange = (day, field, value) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const availabilityData = {
        doctorId: currentUser.uid,
        schedule: availability,
        slotDuration: slotDuration,
        updatedAt: new Date()
      };

      // Check if availability exists
      const filters = [{ field: 'doctorId', operator: '==', value: currentUser.uid }];
      const existing = await getCollection('doctorAvailability', filters);

      let result;
      if (existing.success && existing.data.length > 0) {
        result = await updateDocument('doctorAvailability', existing.data[0].id, availabilityData);
      } else {
        result = await addDocument('doctorAvailability', availabilityData);
      }

      if (result.success) {
        setMessage('Availability updated successfully!');
      } else {
        setMessage('Failed to update availability');
      }
    } catch (error) {
      setMessage('Error updating availability');
    }
    
    setLoading(false);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Layout>
      <div className="availability-page">
        <h1>Set Availability</h1>
        <form onSubmit={handleSubmit} className="availability-form">
          <div className="form-group">
            <label>Slot Duration (minutes)</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div className="availability-schedule">
            {days.map((day) => (
              <div key={day} className="day-schedule">
                <div className="day-header">
                  <label className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={availability[day].available}
                      onChange={(e) => handleDayChange(day, 'available', e.target.checked)}
                    />
                    <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  </label>
                </div>
                {availability[day].available && (
                  <div className="day-times">
                    <input
                      type="time"
                      value={availability[day].start}
                      onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={availability[day].end}
                      onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default DoctorAvailability;

