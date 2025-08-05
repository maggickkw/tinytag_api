export interface RegisterVolunteerInput {
  // User credentials
  email: string;
  password: string;
  
  // Personal Information (Step 1)
  fullName: string;
  dateOfBirth: string; // ISO date string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  
  // Contact Information (Step 2)
  phoneNumber: string;
  address: string;
  country?: string;
  
  // Education Information (Step 3) - Optional
  school?: string;
  startYear?: number;
  endYear?: number;
  degree?: string;
  
  // Identification (Step 4) - Optional
  nationalId?: string;
  profilePhotoUrl?: string;
  idPhotoFrontUrl?: string;
  idPhotoBackUrl?: string;
}

export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  adminNotes?: string;
  rejectionReason?: string;
}