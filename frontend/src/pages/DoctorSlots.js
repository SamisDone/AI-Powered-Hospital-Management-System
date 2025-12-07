import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, getCollection } from '../firebase/utils';
import Layout from '../components/Layout';
import './DoctorSlots.css';

const DoctorSlots = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const fetchDoctor = async () => {
    try {
      const result = await getDocument('users', doctorId);
      if (result.success) {
        setDoctor(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const filters = [
        { field: 'doctorId', operator: '==', value: doctorId },
        { field: 'appointmentDate', operator: '==', value: selectedDate },
        { field: 'status', operator: '==', value: 'scheduled' }
      ];
      
      const result = await getCollection('appointments', filters);
      const bookedSlots = result.success ? result.data.map(a => a.appointmentTime) : [];
      
      const slots = generateTimeSlots(bookedSlots);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const generateTimeSlots = (bookedSlots) => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!bookedSlots.includes(time)) {
          slots.push(time);
        }
      }
    }
    
    return slots;
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="doctor-slots-page">
        {doctor && (
          <>
            <h1>Dr. {doctor.firstName} {doctor.lastName}</h1>
            {doctor.specialty && <p className="specialty">Specialty: {doctor.specialty}</p>}
          </>
        )}

        <div className="slots-container">
          <div className="form-group">
            <label>Select Date to View Available Slots</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
            />
          </div>

          {selectedDate && (
            <div className="available-slots">
              <h3>Available Time Slots</h3>
              {availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map((slot) => (
                    <Link
                      key={slot}
                      to={`/appointments/book/${doctorId}?date=${selectedDate}&time=${slot}`}
                      className="slot-button"
                    >
                      {slot}
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No available slots for this date</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorSlots;

