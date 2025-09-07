export interface Installment {
  amount: number;
  dueDate: Date;
}

export interface ProjectDetails {
  title: string;
  description: string;
  subject: string;
  deadline: Date;
}

export interface AgreementFormData {
  projectDetails: ProjectDetails;
  installments: Installment[];
}

export interface Agreement extends AgreementFormData {
  _id: string;
  student: string;
  writer: string;
  status: 'pending' | 'active' | 'completed' | 'disputed';
  progress: number;
  totalAmount: number;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgreementNotification {
  agreementId: string;
  orderId: string;
  title: string;
  studentName: string;
  totalAmount: number;
  createdAt: Date;
} 