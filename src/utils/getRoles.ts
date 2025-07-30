// Helper function to get links by role

export type rolesType =
  | "doctor"
  | "nurse"
  | "social_worker"
  | "lab_scientist"
  | "patient"
  | "admin";

export const getMenuLinksForRole = (role: rolesType) => {
  // First define all role links separately
  const doctorLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "My Patients", path: "/patients", icon: "patients" },
    { name: "Appointments", path: "/appointments", icon: "calendar" },
    { name: "Medical Records", path: "/medical-records", icon: "folder" },
    { name: "Prescriptions", path: "/prescriptions", icon: "prescription" },
    { name: "Lab Results", path: "/lab-results", icon: "lab" },
    { name: "Referrals", path: "/referrals", icon: "referral" },
  ];

  const nurseLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Patient Vitals", path: "/vitals", icon: "vitals" },
    { name: "Medications", path: "/medications", icon: "medication" },
    { name: "Care Plans", path: "/care-plans", icon: "plan" },
    { name: "Patient Notes", path: "/notes", icon: "notes" },
    { name: "Schedule", path: "/nurse-schedule", icon: "calendar" },
  ];

  const socialWorkerLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Case Management", path: "/cases", icon: "cases" },
    { name: "Patient Resources", path: "/resources", icon: "resources" },
    { name: "Support Programs", path: "/programs", icon: "programs" },
    { name: "Discharge Planning", path: "/discharge", icon: "discharge" },
    { name: "Community Referrals", path: "/community", icon: "community" },
  ];

  const labScientistLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Test Orders", path: "/test-orders", icon: "orders" },
    { name: "Sample Management", path: "/samples", icon: "sample" },
    { name: "Test Results", path: "/results", icon: "results" },
    { name: "Equipment", path: "/equipment", icon: "equipment" },
    { name: "Inventory", path: "/inventory", icon: "inventory" },
  ];

  const patientLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "My Appointments", path: "/my-appointments", icon: "calendar" },
    { name: "My Prescriptions", path: "/my-prescriptions", icon: "prescription" },
    { name: "My Test Results", path: "/my-results", icon: "lab" },
    { name: "Medical History", path: "/my-history", icon: "folder" },
    { name: "Messages", path: "/messages", icon: "message" },
    { name: "Billing", path: "/my-billing", icon: "billing" },
  ];

  const adminLinks = [
    // Admin-specific links
    { name: "Admin Dashboard", path: "/admin-dashboard", icon: "dashboard" },
    { name: "User Management", path: "/user-management", icon: "users" },
    { name: "System Settings", path: "/settings", icon: "settings" },
    
    // Include all other links (filtering out duplicate dashboards)
    ...doctorLinks.filter(link => link.path !== "/dashboard"),
    ...nurseLinks.filter(link => link.path !== "/dashboard"),
    ...socialWorkerLinks.filter(link => link.path !== "/dashboard"),
    ...labScientistLinks.filter(link => link.path !== "/dashboard"),
    ...patientLinks.filter(link => link.path !== "/dashboard"),
  ];

  // Now combine into the links object
  const links = {
    doctor: doctorLinks,
    nurse: nurseLinks,
    social_worker: socialWorkerLinks,
    lab_scientist: labScientistLinks,
    patient: patientLinks,
    admin: adminLinks,
  };

  return links[role] || links.patient; // Default to patient links
};

