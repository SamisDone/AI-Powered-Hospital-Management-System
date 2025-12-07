import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCollection } from '../firebase/utils';
import Layout from '../components/Layout';
import './DoctorSearch.css';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const filters = [{ field: 'role', operator: '==', value: 'doctor' }];
      if (specialty) {
        filters.push({ field: 'specialty', operator: '==', value: specialty });
      }
      
      const result = await getCollection('users', filters);
      
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const name = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <Layout>
      <div className="doctor-search-page">
        <h1>Find Doctors</h1>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="specialty-filter"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
            <option value="General">General</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading doctors...</div>
        ) : (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                  {doctor.specialty && <p className="specialty">{doctor.specialty}</p>}
                  {doctor.qualifications && <p className="qualifications">{doctor.qualifications}</p>}
                  {doctor.bio && <p className="bio">{doctor.bio}</p>}
                </div>
                <div className="doctor-actions">
                  <Link
                    to={`/doctors/${doctor.id}/slots`}
                    className="btn-primary"
                  >
                    View Availability
                  </Link>
                  <Link
                    to={`/appointments/book/${doctor.id}`}
                    className="btn-secondary"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="no-results">No doctors found</div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorSearch;

