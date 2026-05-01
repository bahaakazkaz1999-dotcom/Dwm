export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  totalDonated?: {
    SYP: number;
    USD: number;
    count: number;
  };
}

export type CaseStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type Currency = 'SYP' | 'USD';

export interface Case {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  currency: Currency;
  status: CaseStatus;
  beneficiaryId: string;
  beneficiaryName: string;
  createdAt: any;
  evidence?: {
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }[];
}

export type DonationStatus = 'pending' | 'confirmed' | 'rejected';

export interface Donation {
  id: string;
  caseId: string;
  donorId: string;
  donorName: string;
  amount: number;
  currency: Currency;
  status: DonationStatus;
  paymentProof: string;
  createdAt: any;
}
