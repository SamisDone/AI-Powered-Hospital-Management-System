import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Search, Filter, Stethoscope, Star, Clock } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { listenToCollection } from '@/lib/firebase-utils';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DoctorSearchPage() {
  const { userProfile } = useAuth();
  const [doctors, setDoctors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = listenToCollection<UserProfile>(
      'users',
      [{ field: 'role', operator: '==', value: 'doctor' }],
      (data: UserProfile[]) => {
        setDoctors(data);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredDoctors = doctors.filter(doctor => 
    `${doctor.firstName} ${doctor.lastName} ${doctor.specialization || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Find Doctors">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Find a Doctor</h1>
            <p className="text-muted-foreground">Browse and book appointments with specialists</p>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div variants={fadeIn}>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No doctors available at the moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={doctor.avatar} />
                          <AvatarFallback className="text-lg">
                            {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            {doctor.specialization || 'General'}
                          </Badge>
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>4.8</span>
                            <span className="mx-1">•</span>
                            <Clock className="w-4 h-4" />
                            <span>{doctor.experience || '5'}+ yrs</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Fee: </span>
                          <span className="font-semibold">${doctor.consultationFee || '50'}</span>
                        </div>
                        <Link to="/doctor/$doctorId/slots" params={{ doctorId: doctor.uid }}>
                          <Button size="sm" variant="gradient">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
