import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #eee',
    paddingBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1pt solid #eee',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statsBox: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    border: '1pt solid #eee',
  },
  statsLabel: {
    fontSize: 8,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  table: {
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1pt solid #eee',
    paddingTop: 10,
  }
});

interface AnalyticsReportProps {
  stats: {
    growth: string;
    totalConsultations: number;
    completionRate: string;
    avgConsultationsPerDay: string;
  };
  departmentData: { name: string; share: number }[];
  date: string;
}

export const AnalyticsReportPDF = ({ stats, departmentData, date }: AnalyticsReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>NATIONAL HOSPITAL CHITTAGONG - GLOBAL ANALYTICS</Text>
        <Text style={styles.subtitle}>System Performance & Healthcare Metrics Report</Text>
      </View>

      <View style={styles.reportMeta}>
        <Text>Report Type: Multi-Node Global Sync</Text>
        <Text>Generated: {new Date(date).toLocaleString()}</Text>
      </View>

      <Text style={styles.sectionTitle}>KEY PERFORMANCE INDICATORS</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statsBox}>
          <Text style={styles.statsLabel}>GLOBAL GROWTH (30D)</Text>
          <Text style={styles.statsValue}>{stats.growth}</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsLabel}>TOTAL NETWORK CONSULTATIONS</Text>
          <Text style={styles.statsValue}>{stats.totalConsultations}</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsLabel}>SYSTEM-WIDE EFFICIENCY</Text>
          <Text style={styles.statsValue}>{stats.completionRate}</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsLabel}>AVG. DAILY LOAD</Text>
          <Text style={styles.statsValue}>{stats.avgConsultationsPerDay}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>DEPARTMENT PERFORMANCE SHARE</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Department / Specialization</Text>
          <Text style={styles.col2}>System Share (%)</Text>
        </View>
        {departmentData.map((dept, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{dept.name}</Text>
            <Text style={styles.col2}>{dept.share}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>Confidential Admin Report - National Hospital Chittagong Healthcare Management System</Text>
        <Text>This report contains system-wide metrics and performance data.</Text>
      </View>
    </Page>
  </Document>
);
