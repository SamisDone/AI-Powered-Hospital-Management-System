import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { updateDocument, uploadFile } from '@/lib/firebase-utils';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

export default function ProfilePage() {
  const { userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    bio: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience?.toString() || '',
        consultationFee: userProfile.consultationFee?.toString() || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    try {
      const updateData: Partial<UserProfile> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      if (userProfile.role === 'doctor') {
        updateData.specialization = formData.specialization;
        updateData.experience = parseInt(formData.experience) || 0;
        updateData.consultationFee = parseInt(formData.consultationFee) || 0;
        updateData.bio = formData.bio;
      }

      const result = await updateDocument('users', userProfile.uid, updateData);
      
      if (result.success) {
        setUserProfile({ ...userProfile, ...updateData });
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const path = `avatars/${userProfile.uid}/${Date.now()}_${file.name}`;
      const result = await uploadFile(file, path);

      if (result.success && result.data) {
        // Update user profile with new avatar URL
        const updateResult = await updateDocument('users', userProfile.uid, {
          avatar: result.data.url
        });

        if (updateResult.success) {
          setUserProfile({ ...userProfile, avatar: result.data.url });
          toast.success('Profile picture updated!');
        }
      } else {
        toast.error('Failed to upload image');
      }
    } catch {
      toast.error('An error occurred while uploading');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Profile Settings">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn}>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile?.avatar} />
                    <AvatarFallback className="text-2xl">
                      {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {userProfile?.email}
                  </CardDescription>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                    {userProfile?.role}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-9"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                      disabled={loading}
                    />
                  </div>
                </div>

                {userProfile?.role === 'doctor' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold">Professional Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          placeholder="e.g., Cardiology"
                          disabled={loading}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                          <Input
                            id="consultationFee"
                            name="consultationFee"
                            type="number"
                            value={formData.consultationFee}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Tell patients about yourself..."
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button type="submit" variant="gradient" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
