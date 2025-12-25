import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Trash2, Calendar, User, Eye, Search } from 'lucide-react';
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
import { addDocument, listenToCollection, deleteDocument } from '@/lib/firebase-utils';
import { supabase } from '@/lib/supabase';

interface MedicalRecord {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  title: string;
  type: 'report' | 'lab' | 'imaging' | 'prescription' | 'other';
  fileUrl: string;
  fileName: string;
  date: string;
  notes?: string;
}

const typeColors: Record<string, string> = {
  report: 'bg-blue-100 text-blue-700',
  lab: 'bg-green-100 text-green-700',
  imaging: 'bg-purple-100 text-purple-700',
  prescription: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function MedicalRecordsPage() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'report' as MedicalRecord['type'],
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MedicalRecord['type']>('all');

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    if (!userProfile?.uid) return;

    const isAdmin = userProfile?.role === 'admin';
    const constraints = isAdmin
      ? []
      : [{ field: isDoctor ? 'doctorId' : 'patientId', operator: '==', value: userProfile.uid }];

    const unsubscribe = listenToCollection<MedicalRecord>(
      'medical_records',
      constraints as any,
      (data) => {
        setRecords(data.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid, isDoctor]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    if (!formData.title) {
      toast.error('Please enter a title for the record');
      return;
    }

    setUploading(true);
    try {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${userProfile.uid}/${Date.now()}_${sanitizedFileName}`;
      const { data, error } = await supabase.storage
        .from('medical_records')
        .upload(fileName, file);

      if (error) {
        toast.error('Failed to upload file: ' + error.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('medical_records')
        .getPublicUrl(data.path);

      if (data && publicUrl) {
        const record: Omit<MedicalRecord, 'id'> = {
          patientId: userProfile.uid,
          patientName: `${userProfile.firstName} ${userProfile.lastName}`,
          title: formData.title,
          type: formData.type,
          fileUrl: publicUrl,
          fileName: file.name,
          date: new Date().toISOString().split('T')[0],
          notes: formData.notes
        };

        const result = await addDocument('medical_records', record);

        if (result.success) {
          toast.success('Record uploaded successfully!');
          setFormData({ title: '', type: 'report', notes: '' });
        }
      } else {
        toast.error('Failed to get public URL');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteDocument('medical_records', id);
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="Medical Records">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">
              {isDoctor ? 'View patient medical records' : 'Upload and manage your medical records'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {(['all', 'report', 'lab', 'imaging', 'prescription', 'other'] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className="capitalize whitespace-nowrap"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Form (Patient only) */}
        {!isDoctor && (
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4">Upload New Record</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Blood Test Results"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MedicalRecord['type'] })}
                  className="w-full p-2 rounded-lg border bg-background"
                >
                  <option value="report">Report</option>
                  <option value="lab">Lab Results</option>
                  <option value="imaging">Imaging</option>
                  <option value="prescription">Prescription</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !formData.title}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Records List */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No medical records found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : isDoctor
                    ? "No patient records to display"
                    : "Upload your first medical record to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {record.title}
                    </CardTitle>
                    <Badge className={typeColors[record.type]}>
                      {record.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground truncate">
                    {record.fileName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {record.date}
                    </div>
                    {isDoctor && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {record.patientName}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={record.fileUrl} download={record.fileName}>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    {!isDoctor && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => record.id && handleDelete(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
