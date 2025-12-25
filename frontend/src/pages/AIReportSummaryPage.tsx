import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Search,
  Download,
  Clock,
  Brain,
  MessageSquare,
  History,
  Loader2,
  ArrowLeft,
  Activity
} from "lucide-react";
import { useParams, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/contexts/AuthContext";
import { listenToCollection, getDocument } from "@/lib/firebase-utils";
import { analyzeMedicalRecord } from "@/lib/ai-handler";
import { MedAvatar } from "@/components/ui/MedAvatar";

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  fileName: string;
  fileUrl: string;
  // Store AI analysis if already done (in a real app, save to DB)
  summary?: string;
}

export default function AIReportSummaryPage() {
  const { userProfile } = useAuth();
  const params = useParams({ strict: false });
  // If doctor route with patientId, use that. Otherwise use current user's id.
  const targetUserId = (params as any).patientId || userProfile?.uid;
  const isDoctorView = !!(params as any).patientId;

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patientProfile, setPatientProfile] = useState<UserProfile | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);
  // Changed: Analysis result is now just a string based on new Gemini implementation
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) return;

    // Fetch patient profile if in doctor view
    if (isDoctorView) {
      getDocument<UserProfile>('users', targetUserId).then(res => {
        if (res.success && res.data) {
          setPatientProfile(res.data);
        }
      });
    }

    const unsubscribe = listenToCollection<MedicalRecord>(
      'medical_records',
      [{ field: 'patientId', operator: '==', value: targetUserId }],
      (data) => {
        setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetUserId, isDoctorView]);

  const handleAnalyze = async (record: MedicalRecord) => {
    if (!record.fileUrl) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Gemini 1.5 Flash can analyze images directly
      const result = await analyzeMedicalRecord(record.fileUrl);
      setAnalysisResult(result);
      toast.success("AI Analysis Complete");
    } catch (error) {
      toast.error("Analysis Failed: " + (error as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setAnalysisResult(null);
  };

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="AI Report Summary">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div className="flex items-center gap-4">
            {isDoctorView && (
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link to="/dashboard/doctor">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                {isDoctorView ? (
                  <span>Patient Insights: {patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : "Loading..."}</span>
                ) : (
                  "AI Report Insights"
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isDoctorView
                  ? "Analyze patient documentation with high-precision AI diagnostics"
                  : "Get instant, easy-to-understand summaries of your medical documents"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDoctorView && patientProfile && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
                <MedAvatar fallback={`${patientProfile.firstName} ${patientProfile.lastName}`} size="sm" />
                <div className="text-left">
                  <p className="text-xs font-semibold leading-none">{patientProfile.firstName} {patientProfile.lastName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" /> Patient Data Hub
                  </p>
                </div>
              </div>
            )}
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex gap-2 items-center">
              <Sparkles className="w-3 h-3" /> Multi-Model AI Hub
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">

          {/* Sidebar: Reports List */}
          <GlassCard className="lg:col-span-1 flex flex-col overflow-hidden border-border/50">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search records..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-background/50 border border-border/50 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <History className="w-3 h-3" /> Available Records
              </div>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading records...</div>
              ) : records.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No records found.</div>
              ) : (
                records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => handleSelectRecord(record)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${selectedRecord?.id === record.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <p className="font-medium text-sm truncate">{record.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] opacity-70 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {record.date}
                      </span>
                      <Badge variant="secondary" className={`text-[9px] px-1.5 h-4 ${selectedRecord?.id === record.id ? 'bg-white/20 text-white' : ''}`}>
                        {record.type}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>

          {/* Main Content: Summary View */}
          <GlassCard className="lg:col-span-2 overflow-y-auto border-border/50">
            <AnimatePresence mode="wait">
              {selectedRecord ? (
                <motion.div
                  key={selectedRecord.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 space-y-8"
                >
                  {/* Record Header */}
                  <div className="flex justify-between items-start border-b border-border/30 pb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRecord.title}</h2>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {selectedRecord.type}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Uploaded {selectedRecord.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" asChild>
                        <a href={selectedRecord.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" /> View File
                        </a>
                      </Button>
                      {!analysisResult && !analyzing && (
                        <Button
                          size="sm"
                          onClick={() => handleAnalyze(selectedRecord)}
                          className="rounded-xl bg-gradient-to-r from-primary to-accent text-white border-0"
                        >
                          <Sparkles className="w-4 h-4 mr-2" /> Generate AI Summary
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis View */}
                  {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-muted-foreground animate-pulse">Analyzing document...</p>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Summary Block - Plain Text Mode */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                          <MessageSquare className="w-5 h-5" /> AI Summary
                        </h3>
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 leading-relaxed text-foreground/90 whitespace-pre-wrap">
                          {analysisResult}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                      <Brain className="w-12 h-12 mb-4 opacity-20" />
                      <p>Click "Generate AI Summary" to analyze this document</p>
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <FileText className="w-16 h-16 opacity-10" />
                  <p>Select a medical record to analyze</p>
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
