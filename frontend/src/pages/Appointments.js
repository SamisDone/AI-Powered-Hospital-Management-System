import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCollection, updateDocument } from '../firebase/utils';
import Layout from '../components/Layout';
import './Appointments.css';

const Appointments = () => {
  const { currentUser, userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [currentUser, filter]);

  const fetchAppointments = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const filters = [];
      
      if (userProfile?.role === 'doctor') {
        filters.push({ field: 'doctorId', operator: '==', value: currentUser.uid });
      } else {
        filters.push({ field: 'userId', operator: '==', value: currentUser.uid });
      }

      if (filter !== 'all') {
        filters.push({ field: 'status', operator: '==', value: filter });
      }

      const result = await getCollection('appointments', filters, 
        { field: 'appointmentDate', direction: 'asc' });
      
      if (result.success) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const result = await updateDocument('appointments', appointmentId, {
        status: 'cancelled',
        updatedAt: new Date()
      });

      if (result.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'badge-primary',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      pending: 'badge-warning'
    };
    return <span className={`badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  return (
    <Layout>
      <div className="appointments-page">
        <h1>My Appointments</h1>
        
        <div className="appointments-filters">
          <button
            className={filter === 'all' ? 'filter-active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'scheduled' ? 'filter-active' : ''}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button
            className={filter === 'completed' ? 'filter-active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={filter === 'cancelled' ? 'filter-active' : ''}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading appointments...</div>
        ) : (
          <div className="appointments-list">
            {appointments.length === 0 ? (
              <div className="no-appointments">No appointments found</div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <h3>
                      {userProfile?.role === 'doctor' 
                        ? `Patient: ${appointment.patientName}`
                        : `Dr. ${appointment.doctorName}`
                      }
                    </h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="appointment-details">
                    <p><strong>Date:</strong> {new Date(appointment.appointmentDate?.toDate?.() || appointment.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                    {appointment.reason && <p><strong>Reason:</strong> {appointment.reason}</p>}
                    {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                  </div>
                  {appointment.status === 'scheduled' && userProfile?.role !== 'doctor' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="btn-danger"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;

