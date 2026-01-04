import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocument, listenToCollection, addDocument } from '@/lib/firebase-utils';
import type { UserProfile } from '@/contexts/AuthContext';

interface TimeSlot {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface Appointment {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
}

// Generate next 14 days
const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isToday: i === 0
    });
  }
  return days;
};

// Generate time slots from availability
const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += duration;
  }
  
  return slots;
};

export default function DoctorSlotsPage() {
  const { doctorId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [doctor, setDoctor] = useState<UserProfile | null>(null);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const nextDays = getNextDays();

  useEffect(() => {
    if (!doctorId) return;

    // 1. Fetch static doctor info (rarely changes, but could be real-time if needed)
    getDocument<UserProfile>('users', doctorId).then((res: { success: boolean; data?: UserProfile }) => {
      if (res.success && res.data) setDoctor(res.data);
    });

    // 2. Listen to availability changes
    const unsubAvail = listenToCollection<TimeSlot>(
      'availability',
      [
        { field: 'doctorId', operator: '==', value: doctorId },
        { field: 'isActive', operator: '==', value: true }
      ],
      (data: TimeSlot[]) => setAvailability(data)
    );

    // 3. Listen to booked slots (appointments)
    const unsubAppts = listenToCollection<Appointment>(
      'appointments',
      [{ field: 'doctorId', operator: '==', value: doctorId }],
      (data: Appointment[]) => {
        setBookedSlots(data);
        setLoading(false);
      }
    );

    return () => {
      unsubAvail();
      unsubAppts();
    };
  }, [doctorId]);

  const getAvailableSlotsForDate = (dateStr: string, dayOfWeek: number) => {
    const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);
    if (dayAvailability.length === 0) return [];

    const allSlots: string[] = [];
    dayAvailability.forEach(avail => {
      const slots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration);
      allSlots.push(...slots);
    });

    // Filter out already booked slots
    const bookedTimes = bookedSlots
      .filter(apt => apt.date === dateStr)
      .map(apt => apt.time);

    return allSlots.filter(slot => !bookedTimes.includes(slot));
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !userProfile || !doctor) return;

    setBooking(true);
    try {
      const appointmentData = {
        patientId: userProfile.uid,
        doctorId: doctor.uid,
        patientName: `${userProfile.firstName} ${userProfile.lastName}`,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled',
        reason: '',
        createdAt: new Date()
      };

      const result = await addDocument('appointments', appointmentData);
      
      if (result.success) {
        // Create bill
        await addDocument('bills', {
          patientId: userProfile.uid,
          patientName: `${userProfile.firstName} ${userProfile.lastName}`,
          doctorId: doctor.uid,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          type: 'appointment',
          description: `Consultation with Dr. ${doctor.firstName} ${doctor.lastName}`,
          amount: Number(doctor.consultationFee) || 500,
          date: new Date().toISOString(),
          status: 'unpaid',
          appointmentId: result.id
        });

        // Create notification for the doctor
        await addDocument('notifications', {
          userId: doctor.uid,
          title: 'New Appointment Booked',
          message: `${userProfile.firstName} ${userProfile.lastName} has booked an appointment for ${selectedDate} at ${selectedTime}`,
          type: 'appointment',
          read: false
        });

        // Create notification for the patient
        await addDocument('notifications', {
          userId: userProfile.uid,
          title: 'Appointment Confirmed',
          message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} is confirmed for ${selectedDate} at ${selectedTime}`,
          type: 'appointment',
          read: false
        });

        toast.success('Appointment booked successfully!');
        navigate({ to: '/appointments' });
      } else {
        toast.error('Failed to book appointment');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setBooking(false);
    }
  };

  const selectedDayInfo = selectedDate 
    ? nextDays.find(d => d.date === selectedDate)
    : null;

  const availableSlotsForSelectedDate = selectedDayInfo
    ? getAvailableSlotsForDate(selectedDate!, selectedDayInfo.dayOfWeek)
    : [];

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Book Appointment">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate({ to: '/doctor/search' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Doctors
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : doctor ? (
          <>
            {/* Doctor Info */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="text-lg">
                    {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">Dr. {doctor.firstName} {doctor.lastName}</h2>
                  <Badge variant="secondary">{doctor.specialization || 'General'}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {doctor.experience || '5'}+ years experience • {doctor.consultationFee || '500'} BDT per visit
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium italic">
                    Note: Availability is managed by the doctor in real-time.
                  </p>
                </div>
              </div>
            </GlassCard>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {nextDays.map((day) => {
                      const hasSlots = availability.some(a => a.dayOfWeek === day.dayOfWeek);
                      return (
                        <button
                          key={day.date}
                          onClick={() => {
                            setSelectedDate(day.date);
                            setSelectedTime(null);
                          }}
                          disabled={!hasSlots}
                          className={`p-3 rounded-lg border text-sm transition-all ${
                            selectedDate === day.date
                              ? 'bg-primary text-primary-foreground border-primary'
                              : hasSlots
                              ? 'hover:border-primary/50 hover:bg-primary/5'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-medium">{day.label}</div>
                          {day.isToday && <span className="text-xs opacity-75">Today</span>}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Select Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <p className="text-muted-foreground text-center py-8">
                      Please select a date first
                    </p>
                  ) : availableSlotsForSelectedDate.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground/20" />
                      <p className="text-muted-foreground">
                        No available slots for this date.
                      </p>
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                        Tip: Doctors may have different schedules for different days. Try selecting another date.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlotsForSelectedDate.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Confirm Appointment</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedDayInfo?.label} at {selectedTime} with Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="gradient" 
                      size="lg" 
                      onClick={handleBookAppointment}
                      disabled={booking}
                    >
                      {booking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Doctor not found</h3>
              <p className="text-muted-foreground">
                The doctor you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
