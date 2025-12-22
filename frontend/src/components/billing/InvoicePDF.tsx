import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Register fonts if needed, but standard ones are fine for now

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
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  patientBox: {
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 20,
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
  col1: { width: '60%' },
  col2: { width: '20%' },
  col3: { width: '20%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0066cc',
  },
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

interface InvoiceProps {
  bill: {
    id: string;
    patientName: string;
    patientId: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    doctorName?: string;
  };
}

export const InvoicePDF = ({ bill }: InvoiceProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>MEDIHUB AI</Text>
        <Text style={styles.subtitle}>Advanced Healthcare Management System</Text>
      </View>

      <View style={styles.invoiceInfo}>
        <View>
          <Text style={styles.sectionTitle}>INVOICE</Text>
          <Text>Invoice ID: {bill.id}</Text>
          <Text>Date: {new Date(bill.date).toLocaleDateString()}</Text>
          <Text>Status: {bill.status.toUpperCase()}</Text>
        </View>
        <View style={styles.patientBox}>
          <Text style={styles.sectionTitle}>BILL TO</Text>
          <Text>{bill.patientName}</Text>
          <Text>ID: {bill.patientId}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Type</Text>
          <Text style={styles.col3}>Amount (BDT)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>{bill.description}</Text>
          <Text style={styles.col2}>{bill.type.charAt(0).toUpperCase() + bill.type.slice(1)}</Text>
          <Text style={styles.col3}>{bill.amount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <View style={{ flex: 1 }}>
          {bill.doctorName && (
            <Text style={{ fontSize: 9, color: '#666', fontStyle: 'italic' }}>
              Prescribed by Dr. {bill.doctorName}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{bill.amount.toFixed(2)} BDT</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for choosing MediHub AI.</Text>
        <Text>This is a computer-generated invoice.</Text>
      </View>
    </Page>
  </Document>
);
