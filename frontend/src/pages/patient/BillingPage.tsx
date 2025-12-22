import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Receipt, Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { listenToCollection, updateDocument } from '@/lib/firebase-utils';
import { generateBillPDF } from '@/lib/pdf-utils';

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  type: 'appointment' | 'test';
  description: string;
  amount: number;
  date: string;
  status: 'unpaid' | 'paid';
  doctorName?: string;
}

export default function BillingPage() {
  const { userProfile } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    if (!userProfile) return;

    let unsub: () => void;
    
    // If admin, show all bills, else show only user's bills
    const constraints = userProfile.role === 'admin' 
      ? [] 
      : [{ field: 'patientId', operator: '==', value: userProfile.uid }];

    unsub = listenToCollection<Bill>(
      'bills',
      constraints as any,
      (data) => {
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBills(sorted);
        setLoading(false);
      }
    );

    return () => unsub && unsub();
  }, [userProfile?.uid, userProfile?.role]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = async (bill: Bill) => {
    try {
      await generateBillPDF(bill);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const toggleStatus = async (bill: Bill) => {
    const newStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    try {
      await updateDocument('bills', bill.id, { status: newStatus });
      toast.success(`Bill marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout 
      role={userProfile?.role || 'patient'} 
      title={userProfile?.role === 'admin' ? "Financial Management" : "Billing & Invoices"}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">View and download your medical bills</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {(['all', 'paid', 'unpaid'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className="capitalize flex-1 sm:flex-initial"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No bills found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "You don't have any billing records yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-4 px-4 font-medium">Date</th>
                      <th className="text-left py-4 px-4 font-medium">Invoice ID</th>
                      <th className="text-left py-4 px-4 font-medium">Description</th>
                      <th className="text-left py-4 px-4 font-medium">Type</th>
                      <th className="text-left py-4 px-4 font-medium">Amount</th>
                      <th className="text-left py-4 px-4 font-medium">Status</th>
                      <th className="text-right py-4 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          {new Date(bill.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">
                          {bill.id.slice(0, 8)}...
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium max-w-[200px] truncate">{bill.description}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            {bill.doctorName && (
                              <p className="text-[10px] text-muted-foreground italic">Dr. {bill.doctorName}</p>
                            )}
                            {userProfile?.role === 'admin' && (
                              <p className="text-xs text-muted-foreground">{bill.patientName}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 capitalize">
                          {bill.type}
                        </td>
                        <td className="py-4 px-4 font-bold">
                          {bill.amount} BDT
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={bill.status === 'paid' ? 'success' : 'secondary'}>
                            {bill.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {userProfile?.role === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleStatus(bill)}
                                className={bill.status === 'paid' ? 'text-destructive' : 'text-success'}
                              >
                                {bill.status === 'paid' ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Unpaid
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Paid
                                  </>
                                )}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDownload(bill)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
