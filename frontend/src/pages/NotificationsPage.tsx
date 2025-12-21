import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, Pill, AlertCircle, Trash2, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { updateDocument, deleteDocument, listenToCollection } from "@/lib/firebase-utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'system' | 'alert';
  read: boolean;
  createdAt: any;
}

export default function NotificationsPage() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = listenToCollection<Notification>(
      'notifications',
      [{ field: 'userId', operator: '==', value: userProfile.uid }],
      (data: Notification[]) => {
        setNotifications(data);
        setLoading(false);
      },
      { field: 'createdAt', direction: 'desc' }
    );

    return () => unsubscribe();
  }, [userProfile?.uid]);


  const markAsRead = async (id: string) => {
    try {
      await updateDocument('notifications', id, { read: true });
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => updateDocument('notifications', n.id, { read: true })));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDocument('notifications', id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="w-5 h-5 text-primary" />;
      case 'prescription': return <Pill className="w-5 h-5 text-success" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-destructive" />;
      default: return <Bell className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your health and system alerts</p>
          </div>
          {notifications.some(n => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <GlassCard className="p-0 overflow-hidden">
          <div className="divide-y divide-border/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">No notifications yet</h3>
                  <p className="text-muted-foreground">We'll notify you when something important happens.</p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-6 transition-colors hover:bg-muted/30 flex gap-4 ${!notification.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{notification.title}</h4>
                          {!notification.read && <Badge variant="default" className="h-2 w-2 rounded-full p-0" />}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="pt-2 flex gap-3">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
