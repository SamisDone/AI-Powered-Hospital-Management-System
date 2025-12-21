import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, Stethoscope, User as UserIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { listenToCollection, updateDocument } from '@/lib/firebase-utils';
import type { UserProfile } from '@/contexts/AuthContext';

const roleConfig = {
  patient: { icon: UserIcon, color: 'bg-blue-100 text-blue-700', label: 'Patient' },
  doctor: { icon: Stethoscope, color: 'bg-green-100 text-green-700', label: 'Doctor' },
  admin: { icon: Shield, color: 'bg-purple-100 text-purple-700', label: 'Admin' }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');

  useEffect(() => {
    const unsubscribe = listenToCollection<UserProfile>(
      'users',
      [],
      (data) => {
        setUsers(data);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDocument('users', userId, { isActive: !currentStatus });
      toast.success(currentStatus ? 'User deactivated' : 'User activated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  return (
    <DashboardLayout role="admin" title="User Management">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.patients}</p>
                <p className="text-sm text-muted-foreground">Patients</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.doctors}</p>
                <p className="text-sm text-muted-foreground">Doctors</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'patient', 'doctor', 'admin'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={roleFilter === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRoleFilter(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'No users registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredUsers.map((user) => {
                  const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.patient;
                  const RoleIcon = role.icon;
                  const isActive = user.isActive !== false;

                  return (
                    <div key={user.uid} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                            {!isActive && <span className="text-destructive ml-2">(Inactive)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={role.color}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {role.label}
                        </Badge>
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(user.uid, isActive)}
                          >
                            {isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
