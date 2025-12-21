import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GlassCard } from '@/components/ui/GlassCard';
import { addDocument, getCollection, deleteDocument, updateDocument } from '@/lib/firebase-utils';

interface TimeSlot {
  id?: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export default function DoctorAvailabilityPage() {
  const { userProfile } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isActive: true
  });

  useEffect(() => {
    if (userProfile?.uid) {
      fetchSlots();
    }
  }, [userProfile?.uid]);

  const fetchSlots = async () => {
    if (!userProfile?.uid) return;
    
    try {
      const result = await getCollection<TimeSlot>('availability', [
        { field: 'doctorId', operator: '==', value: userProfile.uid }
      ]);
      
      if (result.success && result.data) {
        setSlots(result.data.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      }
    } catch {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!userProfile?.uid) return;
    
    setSaving(true);
    try {
      const slotData: TimeSlot = {
        doctorId: userProfile.uid,
        dayOfWeek: newSlot.dayOfWeek!,
        startTime: newSlot.startTime!,
        endTime: newSlot.endTime!,
        slotDuration: newSlot.slotDuration!,
        isActive: newSlot.isActive!
      };

      const result = await addDocument('availability', slotData);
      
      if (result.success) {
        toast.success('Time slot added!');
        setShowAddForm(false);
        setNewSlot({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: true
        });
        fetchSlots();
      } else {
        toast.error('Failed to add time slot');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const result = await deleteDocument('availability', slotId);
      if (result.success) {
        toast.success('Time slot removed');
        setSlots(slots.filter(s => s.id !== slotId));
      }
    } catch {
      toast.error('Failed to delete slot');
    }
  };

  const handleToggleActive = async (slot: TimeSlot) => {
    if (!slot.id) return;
    
    try {
      const result = await updateDocument('availability', slot.id, {
        isActive: !slot.isActive
      });
      
      if (result.success) {
        setSlots(slots.map(s => 
          s.id === slot.id ? { ...s, isActive: !s.isActive } : s
        ));
      }
    } catch {
      toast.error('Failed to update slot');
    }
  };

  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    dayIndex: index,
    slots: slots.filter(s => s.dayOfWeek === index)
  }));

  return (
    <DashboardLayout role={userProfile?.role || 'doctor'} title="My Availability">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Availability Settings</h1>
            <p className="text-muted-foreground">Manage your available time slots for appointments</p>
          </div>
          <Button variant="gradient" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        {/* Add Slot Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">Add New Time Slot</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <select
                      value={newSlot.dayOfWeek}
                      onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border bg-background"
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <option key={day} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <select
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full p-2 rounded-lg border bg-background"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <select
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full p-2 rounded-lg border bg-background"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Slot Duration</Label>
                    <select
                      value={newSlot.slotDuration}
                      onChange={(e) => setNewSlot({ ...newSlot, slotDuration: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border bg-background"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleAddSlot} disabled={saving} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Availability Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32 bg-muted/50" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slotsByDay.map(({ day, slots: daySlots }) => (
              <Card key={day} className={daySlots.length > 0 ? '' : 'opacity-60'}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots set</p>
                  ) : (
                    daySlots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        layout
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          slot.isActive ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.isActive}
                            onCheckedChange={() => handleToggleActive(slot)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => slot.id && handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {slots.length > 0 && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Availability Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {slots.filter(s => s.isActive).length} active time slots across {
                    new Set(slots.filter(s => s.isActive).map(s => s.dayOfWeek)).size
                  } days
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {slots.filter(s => s.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Slots</p>
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
