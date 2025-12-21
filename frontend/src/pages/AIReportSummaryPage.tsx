import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Sparkles, 
  Search, 
  Download, 
  Clock,
  ChevronRight,
  Brain,
  MessageSquare,
  History,
  AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function AIReportSummaryPage() {
  const { userProfile } = useAuth();
  const [selectedReport, setSelectedReport] = useState<number | null>(0);

  const mockReports = [
    {
      id: 1,
      title: "Full Blood Count Analysis",
      date: "Dec 18, 2025",
      type: "Lab Report",
      summary: "Your blood count results show normal ranges for hemoglobin and white blood cells. There's a slight elevation in LDL cholesterol which suggests monitoring your diet. Overall, the hematological profile is healthy.",
      keyInsights: [
        "Hemoglobin: 14.2 g/dL (Normal)",
        "LDL Cholesterol: 135 mg/dL (Slightly High)",
        "Vitamin B12: Optimal",
      ],
      recommendations: "Focus on increasing omega-3 fatty acids and maintaining regular exercise."
    },
    {
      id: 2,
      title: "Chest X-Ray Interpretation",
      date: "Dec 10, 2025",
      type: "Imaging",
      summary: "Clear lung fields bilaterally. No evidence of consolidation, effusion, or pneumothorax. Heart size and mediastinal contours are within normal limits. SONY skeletal structures are intact.",
      keyInsights: [
        "Clear Lungs",
        "Normal Heart Size",
        "No Abnormalities detected"
      ],
      recommendations: "No immediate action required. Routine follow-up as scheduled."
    }
  ];

  return (
    <DashboardLayout role={userProfile?.role || 'patient'} title="AI Report Summary">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              AI Report Insights
            </h1>
            <p className="text-muted-foreground mt-1">Get instant, easy-to-understand summaries of your medical documents.</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex gap-2 items-center">
            <Sparkles className="w-3 h-3" /> AI Powered
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          
          {/* Sidebar: Reports List */}
          <GlassCard className="lg:col-span-1 flex flex-col overflow-hidden border-border/50">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  placeholder="Search reports..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-background/50 border border-border/50 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <History className="w-3 h-3" /> Recent Reports
              </div>
              {mockReports.map((report, idx) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(idx)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedReport === idx 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="font-medium text-sm truncate">{report.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] opacity-70 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.date}
                    </span>
                    <Badge variant="secondary" className={`text-[9px] px-1.5 h-4 ${selectedReport === idx ? 'bg-white/20 text-white' : ''}`}>
                      {report.type}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-primary/5 mt-auto border-t border-primary/10">
              <Button variant="outline" className="w-full glass border-primary/20 text-primary hover:bg-primary/10">
                Upload New Report
              </Button>
            </div>
          </GlassCard>

          {/* Main Content: Summary View */}
          <GlassCard className="lg:col-span-2 overflow-y-auto border-border/50">
            <AnimatePresence mode="wait">
              {selectedReport !== null ? (
                <motion.div
                  key={selectedReport}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 space-y-8"
                >
                  {/* Report Title */}
                  <div className="flex justify-between items-start border-b border-border/30 pb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{mockReports[selectedReport].title}</h2>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {mockReports[selectedReport].type}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Analyzed on {mockReports[selectedReport].date}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="w-4 h-4 mr-2" /> Original File
                    </Button>
                  </div>

                  {/* Summary Block */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <MessageSquare className="w-5 h-5" /> AI Summary
                    </h3>
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 leading-relaxed text-foreground/90">
                      {mockReports[selectedReport].summary}
                    </div>
                  </div>

                  {/* Insights Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" /> Key Metrics
                      </h3>
                      <div className="space-y-2">
                        {mockReports[selectedReport].keyInsights.map((insight, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
                            <ChevronRight className="w-4 h-4 text-primary" />
                            {insight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" /> AI Recommendations
                      </h3>
                      <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 text-sm italic text-muted-foreground leading-relaxed">
                        "{mockReports[selectedReport].recommendations}"
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-6 border-t border-border/30 flex justify-end">
                    <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20">
                      Discuss with Doctor
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                   <FileText className="w-16 h-16 opacity-10" />
                   <p>Select a report to view its AI-powered summary</p>
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
