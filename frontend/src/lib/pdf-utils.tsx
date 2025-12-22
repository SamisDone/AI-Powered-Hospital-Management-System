import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/billing/InvoicePDF";

interface BillInfo {
  id: string;
  patientName: string;
  patientId: string;
  type: "appointment" | "test";
  description: string;
  amount: number;
  date: string;
  status: "unpaid" | "paid";
  doctorName?: string;
}

export const generateBillPDF = async (bill: BillInfo) => {
  try {
    const blob = await pdf(<InvoicePDF bill={bill} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${bill.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
