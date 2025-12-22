import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Calendar, User, X, Trash2, TestTube, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocument, listenToCollection, updateDocument } from '@/lib/firebase-utils';
import { seedTestsCollection } from '@/lib/seed-data';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Test {
  id?: string;
  name: string;
  category?: string;
  instructions?: string;
}

interface Prescription {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medications?: Medication[];
  tests?: Test[];
  startDate: string;
  status: 'active' | 'completed';
  notes?: string;
  // Legacy fields for backward compatibility
  medication?: string;
  dosage?: string;
  frequency?: string;
  refillsRemaining?: number;
}

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyMedication: Medication = { name: '', dosage: '', frequency: '', duration: '' };
const emptyTest: Test = { name: '', instructions: '' };

export default function PrescriptionsPage() {
  const { userProfile } = useAuth();
  const search = useSearch({ strict: false }) as any;
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<{id: string, name: string}[]>([]);
  const [availableTests, setAvailableTests] = useState<{id: string, name: string, category: string}[]>([]);
  
  const urlPatientId = search.patientId;
  const urlPatientName = search.patientName;

  useEffect(() => {
    const init = async () => {
      // Seed if catalog is incomplete
      await seedTestsCollection();
      
      // Fetch available tests for the searchable dropdown
      const unsub = listenToCollection<any>(
        'available_tests',
        [],
        (data) => {
          setAvailableTests(data.map(t => ({ 
            id: t.id, 
            name: t.name, 
            category: t.category || 'General' 
          })));
        }
      );
      return unsub;
    };

    let unsub: () => void;
    init().then(cleanup => {
      if (cleanup) unsub = cleanup;
    });

    return () => unsub && unsub();
  }, []);
  
  const [formData, setFormData] = useState({
    patientId: urlPatientId || '',
    medications: [{ ...emptyMedication }] as Medication[],
    tests: [] as Test[],
    notes: ''
  });

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    if (urlPatientId && urlPatientName && isDoctor) {
      setPatients(prev => {
        if (!prev.find(p => p.id === urlPatientId)) {
          return [...prev, { id: urlPatientId, name: urlPatientName }];
        }
        return prev;
      });
      setFormData(prev => ({ ...prev, patientId: urlPatientId }));
      setShowForm(true);
      // Clear search params after consuming them
      navigate({ to: '/prescriptions', search: {}, replace: true });
    }
  }, [urlPatientId, urlPatientName, isDoctor, navigate]);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const field = isDoctor ? 'doctorId' : 'patientId';
    const unsubscribe = listenToCollection<Prescription>(
      'prescriptions',
      [{ field, operator: '==', value: userProfile.uid }],
      (data) => {
        setPrescriptions(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid, isDoctor]);

  useEffect(() => {
    if (userProfile?.uid && isDoctor) {
      // Keep patient list updated based on appointments
      const unsubscribe = listenToCollection<any>(
        'appointments',
        [{ field: 'doctorId', operator: '==', value: userProfile.uid }],
        (data) => {
          const uniquePatients = new Map();
          data.forEach(apt => {
            if (!uniquePatients.has(apt.patientId)) {
              uniquePatients.set(apt.patientId, { id: apt.patientId, name: apt.patientName });
            }
          });
          setPatients(Array.from(uniquePatients.values()));
        }
      );
      return () => unsubscribe();
    }
  }, [userProfile?.uid, isDoctor]);

  const addMedication = () => {
    setFormData({ ...formData, medications: [...formData.medications, { ...emptyMedication }] });
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      setFormData({ ...formData, medications: formData.medications.filter((_, i) => i !== index) });
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...formData.medications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, medications: updated });
  };

  const addTest = () => {
    setFormData({ ...formData, tests: [...formData.tests, { ...emptyTest }] });
  };

  const removeTest = (index: number) => {
    setFormData({ ...formData, tests: formData.tests.filter((_, i) => i !== index) });
  };

  const updateTest = (index: number, field: keyof Test, value: string) => {
    const updated = [...formData.tests];
    updated[index] = { ...updated[index], [field]: value };
    
    // If the name changed, try to find a matching test to link ID/Category
    if (field === 'name') {
      const match = availableTests.find(t => t.name.toLowerCase() === value.toLowerCase());
      if (match) {
        updated[index].id = match.id;
        updated[index].category = match.category;
      }
    }
    
    setFormData({ ...formData, tests: updated });
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      medications: [{ ...emptyMedication }],
      tests: [],
      notes: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    const validMeds = formData.medications.filter(m => m.name && m.dosage);
    if (validMeds.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    setSaving(true);
    try {
      const prescription: Omit<Prescription, 'id'> = {
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        doctorId: userProfile.uid,
        doctorName: `Dr. ${userProfile.firstName} ${userProfile.lastName}`,
        medications: validMeds,
        tests: formData.tests.filter(t => t.name),
        startDate: getLocalDate(),
        status: 'active',
        notes: formData.notes
      };

      const result = await addDocument('prescriptions', prescription);
      
      if (result.success) {
        // Create notification for the patient
        const hasTests = prescription.tests && prescription.tests.length > 0;
        await addDocument('notifications', {
          userId: formData.patientId,
          title: 'New Prescription Issued',
          message: `Dr. ${userProfile.firstName} ${userProfile.lastName} has issued a new prescription for you${hasTests ? ' including diagnostic tests' : ''}.`,
          type: 'prescription',
          read: false
        });

        toast.success('Prescription created!');
        resetForm();
      }
    } catch {
      toast.error('Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    const rx = prescriptions.find(p => p.id === id);
    if (!rx || !userProfile) return;

    try {
      await updateDocument('prescriptions', id, { status: 'completed' });
      
      // Notify patient
      await addDocument('notifications', {
        userId: rx.patientId,
        title: 'Prescription Completed',
        message: `Your prescription issued by Dr. ${userProfile.firstName} ${userProfile.lastName} has been marked as completed/archived.`,
        type: 'prescription',
        read: false
      });

      toast.success('Prescription marked as completed');
    } catch {
      toast.error('Failed to update prescription');
    }
  };

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Prescriptions">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Prescriptions</h1>
            <p className="text-muted-foreground">
              {isDoctor ? 'Manage prescriptions for your patients' : 'View your prescriptions'}
            </p>
          </div>
          {isDoctor && (
            <Button variant="gradient" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          )}
        </div>

        {/* New Prescription Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg">Create Prescription</h3>
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full p-2 rounded-lg border bg-background"
                      required
                    >
                      <option value="">Select patient...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Medications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Medications
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Medicine
                      </Button>
                    </div>
                    
                    {formData.medications.map((med, index) => (
                      <div key={index} className="grid grid-cols-5 gap-3 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-xs">Medicine Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="e.g., Paracetamol"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Frequency</Label>
                          <Input
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="e.g., 3 times/day"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration</Label>
                          <Input
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeMedication(index)}
                            disabled={formData.medications.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tests Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base flex items-center gap-2">
                        <TestTube className="w-4 h-4" />
                        Prescribed Tests
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTest}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Test
                      </Button>
                    </div>
                    
                    {formData.tests.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No tests added</p>
                    ) : (
                      formData.tests.map((test, index) => (
                        <div key={index} className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-xs">Test Name</Label>
                            <Input
                              value={test.name}
                              onChange={(e) => updateTest(index, 'name', e.target.value)}
                              placeholder="e.g., Blood Sugar Test"
                              list="available-tests"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Instructions</Label>
                            <Input
                              value={test.instructions || ''}
                              onChange={(e) => updateTest(index, 'instructions', e.target.value)}
                              placeholder="e.g., Fasting required"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeTest(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <datalist id="available-tests">
                    {availableTests.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.category}
                      </option>
                    ))}
                  </datalist>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special instructions..."
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Creating...' : 'Create Prescription'}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prescriptions List */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : prescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prescriptions</h3>
              <p className="text-muted-foreground">
                {isDoctor 
                  ? "You haven't created any prescriptions yet"
                  : "You don't have any prescriptions"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <Card key={rx.id} className={rx.status === 'completed' ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {isDoctor ? rx.patientName : rx.doctorName}
                    </CardTitle>
                    <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}>
                      {rx.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rx.startDate}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                   {/* Medications (New Schema) */}
                  {rx.medications && rx.medications.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Pill className="w-3 h-3" /> Medications
                      </p>
                      {rx.medications.map((med, i) => (
                        <div key={i} className="text-sm p-2 bg-muted/30 rounded">
                          <span className="font-medium">{med.name}</span>
                          <span className="text-muted-foreground"> - {med.dosage}</span>
                          {med.frequency && <span className="text-muted-foreground">, {med.frequency}</span>}
                          {med.duration && <span className="text-muted-foreground"> for {med.duration}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Medication (Legacy Schema) */}
                  {rx.medication && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Pill className="w-3 h-3" /> Medication
                      </p>
                      <div className="text-sm p-2 bg-muted/30 rounded">
                        <span className="font-medium">{rx.medication}</span>
                        <span className="text-muted-foreground"> - {rx.dosage}</span>
                        {rx.frequency && <span className="text-muted-foreground">, {rx.frequency}</span>}
                        {rx.refillsRemaining !== undefined && (
                          <div className="mt-1 text-xs text-primary">
                            {rx.refillsRemaining} refills remaining
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Tests */}
                  {rx.tests && rx.tests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <TestTube className="w-3 h-3" /> Tests
                      </p>
                      {rx.tests.map((test, i) => (
                        <div key={i} className="text-sm p-2 bg-accent/10 rounded">
                          <span className="font-medium">{test.name}</span>
                          {test.instructions && (
                            <span className="text-muted-foreground"> - {test.instructions}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {rx.notes && (
                    <p className="text-sm text-muted-foreground italic">Note: {rx.notes}</p>
                  )}

                  {isDoctor && rx.status === 'active' && (
                    <div className="pt-2">
                      <Button size="sm" variant="outline" onClick={() => rx.id && handleComplete(rx.id)}>
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
