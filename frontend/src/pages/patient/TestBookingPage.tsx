import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, Info, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { addDocument, listenToCollection } from '@/lib/firebase-utils';
import { seedTestsCollection } from '@/lib/seed-data';

interface TestItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function TestBookingPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [prescribedInfo, setPrescribedInfo] = useState<{name: string, doctorName: string}[]>([]);
  const [availableTests, setAvailableTests] = useState<TestItem[]>([]);
  const [bookedTestIds, setBookedTestIds] = useState<string[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let unsubTests: () => void;
    
    const init = async () => {
      console.log('Initializing TestBookingPage...');
      // Seed if empty or missing new catalog items
      await seedTestsCollection();
      
      // 1. Listen to available tests
      unsubTests = listenToCollection<TestItem>(
        'available_tests',
        [],
        (data) => {
          console.log(`Loaded ${data.length} available tests from Firestore`);
          setAvailableTests(data);
          setLoadingTests(false);
        }
      );
    };

    init();
    return () => unsubTests && unsubTests();
  }, []);

  useEffect(() => {
    if (!userProfile?.uid) return;

    // 2. Listen to existing test bookings to mark as booked
    const unsubBookings = listenToCollection<any>(
      'test_bookings',
      [{ field: 'patientId', operator: '==', value: userProfile.uid }],
      (data) => {
        const ids: string[] = [];
        data.forEach(b => {
          if (b.tests && Array.isArray(b.tests)) {
            b.tests.forEach((t: any) => {
              if (t.id) ids.push(t.id);
            });
          }
        });
        setBookedTestIds(ids);
      }
    );

    return () => unsubBookings();
  }, [userProfile?.uid]);

  useEffect(() => {
    if (!userProfile?.uid || availableTests.length === 0) return;

    console.log('Fetching prescriptions for patient:', userProfile.uid);
    const unsub = listenToCollection<any>(
      'prescriptions',
      [
        { field: 'patientId', operator: '==', value: userProfile.uid }
      ],
      (data) => {
        console.log(`Found ${data.length} total prescriptions for this patient`);
        const allPrescribed: {name: string, doctorName: string}[] = [];
        data.forEach(rx => {
          if (rx.tests && Array.isArray(rx.tests)) {
            rx.tests.forEach((t: any) => {
              allPrescribed.push({
                name: t.name.toLowerCase().trim(),
                doctorName: rx.doctorName || 'Unknown Doctor'
              });
            });
          }
        });
        
        setPrescribedInfo(allPrescribed);

        // Pre-select matching tests that haven't been booked yet
        const matchingIds = availableTests
          .filter(t => {
            const normalizedCatalogName = t.name.toLowerCase().trim();
            const isMatch = allPrescribed.some(p => 
              normalizedCatalogName.includes(p.name) || p.name.includes(normalizedCatalogName)
            );
            return isMatch && !bookedTestIds.includes(t.id);
          })
          .map(t => t.id);
        
        if (matchingIds.length > 0) {
          setSelectedTests(prev => {
            const combined = Array.from(new Set([...prev, ...matchingIds]));
            return combined;
          });
          toast.info(`${matchingIds.length} prescribed tests are ready for booking.`, {
            icon: <Info className="w-4 h-4" />
          });
        }
      }
    );

    return () => unsub();
  }, [userProfile?.uid, availableTests, bookedTestIds]);

  // Derived list: ONLY show tests that are prescribed (broad matching)
  const displayTests = availableTests
    .filter(t => {
      const normalizedCatalogName = t.name.toLowerCase().trim();
      return prescribedInfo.some(p => 
        normalizedCatalogName.includes(p.name) || p.name.includes(normalizedCatalogName)
      );
    })
    .map(t => {
      const normalizedCatalogName = t.name.toLowerCase().trim();
      const pMatch = prescribedInfo.find(p => 
        normalizedCatalogName.includes(p.name) || p.name.includes(normalizedCatalogName)
      );
      return { ...t, prescribedBy: pMatch?.doctorName || 'Unknown Doctor' };
    });
  
  console.log('Tests to display:', displayTests.length);

  const toggleTest = (id: string) => {
    if (bookedTestIds.includes(id)) return;
    setSelectedTests(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const totalAmount = displayTests
    .filter(t => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const handleBookTests = async () => {
    const selectedTestData = displayTests.filter(t => selectedTests.includes(t.id) && !bookedTestIds.includes(t.id));
    if (selectedTestData.length === 0 || !userProfile) return;

    setBooking(true);
    try {
      // 1. Create Test Booking Record
      const bookingData = {
        patientId: userProfile.uid,
        patientName: `${userProfile.firstName} ${userProfile.lastName}`,
        tests: selectedTestData,
        totalAmount,
        doctorName: selectedTestData[0]?.prescribedBy || 'Multiple Doctors',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const result = await addDocument('test_bookings', bookingData);

      if (result.success) {
        // 2. Create Bill
        await addDocument('bills', {
          patientId: userProfile.uid,
          patientName: `${userProfile.firstName} ${userProfile.lastName}`,
          doctorId: userProfile.uid, // Placeholder for patient-initiated bookings usually, but we want doc name
          doctorName: bookingData.doctorName,
          type: 'test',
          description: `Diagnostic Tests: ${selectedTestData.map(t => t.name).join(', ')}`,
          amount: totalAmount,
          date: new Date().toISOString(),
          status: 'unpaid',
          bookingId: result.id
        });

        // 3. Create Notification
        await addDocument('notifications', {
          userId: userProfile.uid,
          title: 'Tests Booked Successfully',
          message: `You have successfully booked ${selectedTestData.length} diagnostic tests. Please visit the clinic as per the schedule.`,
          type: 'appointment', // Using appointment type as it's most relevant
          read: false
        });

        toast.success('Tests booked successfully!');
        setSelectedTests([]); // Clear selected after booking
        navigate({ to: '/billing' });
      } else {
        toast.error('Failed to book tests');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setBooking(false);
    }
  };

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Test Booking">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prescribed Tests</h1>
            <p className="text-muted-foreground">Select and book the diagnostic tests prescribed by your doctor</p>
          </div>
    
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingTests ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-5 w-2/3 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-6 w-1/3 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : displayTests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <GlassCard className="p-8">
                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Prescribed Tests Found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Only tests prescribed by your doctor will appear here for booking. 
                  Check your prescriptions or consult with your physician.
                </p>
              </GlassCard>
            </div>
          ) : (
            displayTests.map((test) => {
              const isBooked = bookedTestIds.includes(test.id);
              const isPrescribed = prescribedInfo.some(
                p => test.name.toLowerCase().includes(p.name) || p.name.includes(test.name.toLowerCase())
              );

              return (
                <Card 
                  key={test.id} 
                  className={`relative transition-all ${
                    isBooked 
                      ? 'opacity-60 cursor-not-allowed bg-muted/20' 
                      : selectedTests.includes(test.id) 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer' 
                        : 'hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => !isBooked && toggleTest(test.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex flex-col gap-1">
                        {test.name}
                        <div className="flex gap-2">
                          {isPrescribed && (
                            <Badge variant="secondary" className="w-fit text-[10px] py-0 px-1 bg-green-500/10 text-green-600 border-green-500/20">
                              Prescribed
                            </Badge>
                          )}
                          {isBooked && (
                            <Badge variant="outline" className="w-fit text-[10px] py-0 px-1 bg-blue-500/10 text-blue-600 border-blue-500/20">
                              Booked
                            </Badge>
                          )}
                        </div>
                      </span>
                      {selectedTests.includes(test.id) && !isBooked && <Check className="w-5 h-5 text-primary" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground italic">Prescribed by {test.prescribedBy}</p>
                    </div>
                    <p className="text-xl font-bold text-primary">{test.price} BDT</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {selectedTests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
          >
            <GlassCard className="p-4 shadow-xl border-primary/20 bg-background/80 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedTests.length} tests selected</p>
                    <p className="text-lg font-bold">Total: {totalAmount} BDT</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedTests([])}>
                    Clear
                  </Button>
                  <Button variant="gradient" onClick={handleBookTests} disabled={booking}>
                    {booking ? 'Booking...' : 'Book Now'}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
