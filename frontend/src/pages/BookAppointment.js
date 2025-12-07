import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDocument, getCollection, addDocument } from '../firebase/utils';
import Layout from '../components/Layout';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

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
    // Fetch existing appointments for the selected date
    try {
      const filters = [
        { field: 'doctorId', operator: '==', value: doctorId },
        { field: 'appointmentDate', operator: '==', value: selectedDate },
        { field: 'status', operator: '==', value: 'scheduled' }
      ];
      
      const result = await getCollection('appointments', filters);
      const bookedSlots = result.success ? result.data.map(a => a.appointmentTime) : [];
      
      // Generate available slots (simplified - in real app, use doctor's availability)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedDate || !selectedSlot) {
      setError('Please select date and time');
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData = {
        userId: currentUser.uid,
        doctorId: doctorId,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientName: `${currentUser.displayName || 'Patient'}`,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason: formData.reason,
        notes: formData.notes,
        status: 'scheduled',
        createdAt: new Date()
      };

      const result = await addDocument('appointments', appointmentData);

      if (result.success) {
        navigate('/appointments');
      } else {
        setError('Failed to book appointment');
      }
    } catch (error) {
      setError('Error booking appointment');
    } finally {
      setSubmitting(false);
    }
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
      <div className="book-appointment-page">
        <h1>Book Appointment</h1>
        {doctor && (
          <div className="doctor-info-card">
            <h2>Dr. {doctor.firstName} {doctor.lastName}</h2>
            {doctor.specialty && <p>Specialty: {doctor.specialty}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              required
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Select Time Slot</label>
              <div className="time-slots">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p>No available slots for this date</p>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Reason for Visit</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Regular checkup, Consultation"
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
              placeholder="Any additional information..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default BookAppointment;

