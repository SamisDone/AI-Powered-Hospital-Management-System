import { useState } from "react";
import { 
  User, 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Shield, 
  Save, 
  UserCircle 
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { updateDocument } from "@/lib/firebase-utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const { userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phone: userProfile?.phone || "",
    specialization: userProfile?.specialization || "",
    bio: userProfile?.bio || "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      const result = await updateDocument('users', userProfile.uid, formData);
      if (result.success) {
        setUserProfile({ ...userProfile, ...formData });
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = userProfile?.role === 'doctor';

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and profile</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass border-border/50 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lock className="w-4 h-4 mr-2" /> Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 outline-none">
            <GlassCard className="p-8">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/30 group-hover:border-primary/60 transition-colors overflow-hidden">
                      {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-12 h-12 text-primary/40 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{userProfile?.firstName} {userProfile?.lastName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{userProfile?.role}</p>
                    <Button variant="outline" size="sm" className="mt-2 text-xs">Change Avatar</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={userProfile?.email} disabled className="bg-muted/50" />
                    <p className="text-[10px] text-muted-foreground italic">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                  {isDoctor && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input 
                        id="specialization" 
                        value={formData.specialization} 
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})} 
                      />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio / About</Label>
                    <textarea 
                      id="bio"
                      className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="px-8 shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </TabsContent>

          <TabsContent value="account" className="outline-none">
            <GlassCard className="p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Security Settings
                </h3>
                <p className="text-sm text-muted-foreground text-balance">Update your password and maintain your account security</p>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">Last updated 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">Update Password</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <div>
                    <p className="font-medium text-destructive">Account Deletion</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="notifications" className="outline-none">
            <GlassCard className="p-8 space-y-6">
               <div className="space-y-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Notification Preferences
                </h3>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified about important updates</p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  { title: "Email Notifications", desc: "Receive appointment reminders via email" },
                  { title: "System Alerts", desc: "Get notified about system updates and health tips" },
                  { title: "Appointment Updates", desc: "Real-time updates for booked appointments" }
                ].map((pref, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div>
                      <p className="font-medium text-sm">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-primary/20 relative cursor-pointer group">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-primary shadow-sm group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
