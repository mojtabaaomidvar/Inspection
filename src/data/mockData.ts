// src/data/mockData.ts

export interface ContactPerson {
  id: string;
  name: string;
  position: string;
  mobile: string;
  email: string;
  department: string;
}

export interface Client {
  id: string;
  type: "LEGAL" | "INDIVIDUAL";
  name_en: string;
  name_fa: string;
  national_id?: string;
  email?: string;
  phone?: string;
  contacts: number;
  contracts: number;
  logoColor: string;
  abbreviated_name?: string;
  company_type?: string;
  registration_no?: string;
  economic_code?: string;
  address_en?: string;
  address_fa?: string;
  departments?: string[];
  contactPersons?: ContactPerson[];
}

export interface Contract {
  id: string;
  contract_no: string; // شماره داخلی ICS (اتوماتیک)
  external_contract_no?: string; // شماره خارجی (اختیاری)
  client_id: string;
  client_name: string;
  contract_title: string;
  start_date: string; // تاریخ شمسی
  end_date: string; // تاریخ شمسی
  total_value: number;
  invoiced: number;
  currency: string;
  status: string;
  type: "CONTRACT" | "WORK_ORDER";
  tariffs: number;
  department: string; // برای تولید شماره داخلی منحصر به فرد
  description?: string;
  payment_terms?: string;
  notes?: string;
}

export interface TariffLine {
  id: string;
  contract_id: string;
  description: string;
  unit: string;
  rate: number;
  total_quantity: number;
  consumed_quantity: number;
}

export interface Inspector {
  id: string;
  name_en: string;
  name_fa: string;
  phone: string;
  email: string;
  location: string;
  rating: number;
  status: "AVAILABLE" | "BUSY" | "ON_LEAVE" | "INACTIVE";
  specialties: string[];
  certifications: number;
  activeJobs: number;
  completedJobs: number;
}

export interface Inspection {
  id: string;
  inspection_no: string;
  contract_id: string;
  contract_no: string;
  client_name: string;
  inspector_id?: string;
  inspector_name?: string;
  source: "EMAIL" | "LETTER" | "PHONE";
  reference_no: string;
  date_requested: string;
  date_assigned?: string;
  date_executed?: string;
  date_completed?: string;
  status: "REQUESTED" | "DOC_REVIEW" | "INSPECTOR_ASSIGNED" | "EXECUTING" | "NCR_ISSUED" | "COMPLETED";
  has_ncr: boolean;
  location: string;
  discipline: string;
}

export interface NCR {
  id: string;
  ncr_no: string;
  inspection_id: string;
  inspection_no: string;
  client_name: string;
  description: string;
  severity: "MINOR" | "MAJOR" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  date_raised: string;
  date_closed?: string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  inspection_id: string;
  inspection_no: string;
  contract_no: string;
  client_name: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED";
  issued_date: string;
  due_date: string;
  paid_date?: string;
}

// ============ CLIENTS ============
export const clients: Client[] = [
  {
    id: "c1", type: "LEGAL", name_en: "TotalEnergies Pars", name_fa: "توتال انرژي پارس",
    national_id: "10320876541", email: "ops@totalpars.com", phone: "+98 21 8877 6543",
    category: "OIL_GAS", contacts: 4, contracts: 3, logoColor: "from-red-500 to-orange-500",
    abbreviated_name: "TEP", company_type: "Private Joint Stock", registration_no: "123456",
    economic_code: "411111111111", address_en: "Tehran, Vanak, Mulla Sadra St., No. 45",
    address_fa: "تهران، ونک، خیابان ملاصدرا، پلاک ۴۵", departments: ["Unit A", "Unit B"],
    contactPersons: [
      { id: "cp1", name: "Ali Rezai", position: "Procurement Manager", mobile: "09121112233", email: "a.rezai@totalpars.com", department: "Unit A" },
      { id: "cp2", name: "Sara Mohammadi", position: "HSE Lead", mobile: "09124445566", email: "s.mohammadi@totalpars.com", department: "Unit A" },
      { id: "cp3", name: "Reza Hosseini", position: "Technical Director", mobile: "09127778899", email: "r.hosseini@totalpars.com", department: "Unit B" },
      { id: "cp4", name: "Maryam Karimi", position: "Contracts Officer", mobile: "09123334455", email: "m.karimi@totalpars.com", department: "Unit A" },
    ],
  },
  {
    id: "c2", type: "LEGAL", name_en: "Mapna Group", name_fa: "گروه مپنا",
    national_id: "10100987654", email: "procurement@mapna.com", phone: "+98 21 8866 1020",
    category: "POWER", contacts: 3, contracts: 2, logoColor: "from-blue-500 to-indigo-600",
    abbreviated_name: "MG", company_type: "Public Joint Stock", registration_no: "789012",
    economic_code: "411222222222", address_en: "Tehran, Karaj Special Road, Km 18",
    address_fa: "تهران، کیلومتر ۱۸ جاده مخصوص کرج", departments: ["Unit A"],
    contactPersons: [
      { id: "cp5", name: "Hossein Tavakoli", position: "Project Manager", mobile: "09125556677", email: "h.tavakoli@mapna.com", department: "Unit A" },
      { id: "cp6", name: "Nasim Karimi", position: "QA/QC Manager", mobile: "09128889900", email: "n.karimi@mapna.com", department: "Unit A" },
      { id: "cp7", name: "Farhad Ahmadi", position: "Site Engineer", mobile: "09121234567", email: "f.ahmadi@mapna.com", department: "Unit A" },
    ],
  },
  {
    id: "c3", type: "LEGAL", name_en: "Petro Iran Development", name_fa: "پترو ايران توسعه",
    national_id: "10840765432", email: "contracts@petroiran.com", phone: "+98 21 4433 2211",
    category: "OIL_GAS", contacts: 2, contracts: 2, logoColor: "from-amber-500 to-yellow-600",
    abbreviated_name: "PID", company_type: "Private Joint Stock", registration_no: "345678",
    economic_code: "411333333333", address_en: "Tehran, Sheikh Fazlollah Nouri Hwy, No. 120",
    address_fa: "تهران، بزرگراه شیخ فضل‌الله نوری، پلاک ۱۲۰", departments: ["Unit A", "Unit B"],
    contactPersons: [
      { id: "cp8", name: "Mohammad Jafari", position: "Operations Manager", mobile: "09129998877", email: "m.jafari@petroiran.com", department: "Unit A" },
      { id: "cp9", name: "Leila Sadeghi", position: "Finance Director", mobile: "09126665544", email: "l.sadeghi@petroiran.com", department: "Unit B" },
    ],
  },
  {
    id: "c4", type: "LEGAL", name_en: "Sunair Renewables", name_fa: "سان اير انرژي نو",
    national_id: "14050654321", email: "info@sunair.io", phone: "+98 21 2277 8899",
    category: "RENEWABLE", contacts: 2, contracts: 1, logoColor: "from-emerald-500 to-green-600",
    abbreviated_name: "SR", company_type: "Private Joint Stock", registration_no: "901234",
    economic_code: "411444444444", address_en: "Tehran, Valiasr St., Above Vanak Sq.",
    address_fa: "تهران، خیابان ولیعصر، بالاتر از میدان ونک", departments: ["Unit A"],
    contactPersons: [
      { id: "cp10", name: "Kian Rahimi", position: "CEO", mobile: "09121119999", email: "k.rahimi@sunair.io", department: "Unit A" },
      { id: "cp11", name: "Shiva Rostami", position: "Technical Lead", mobile: "09122223344", email: "s.rostami@sunair.io", department: "Unit A" },
    ],
  },
  {
    id: "c5", type: "LEGAL", name_en: "Kian Infra Engineering", name_fa: "كيان مهندسي",
    national_id: "10980543210", email: "office@kianinfra.com", phone: "+98 21 7788 9900",
    category: "INFRA", contacts: 2, contracts: 2, logoColor: "from-slate-500 to-zinc-700",
    abbreviated_name: "KIE", company_type: "Limited Liability", registration_no: "567890",
    economic_code: "411555555555", address_en: "Tehran, Resalat Hwy, East of Sadr",
    address_fa: "تهران، بزرگراه رسالت، شرق صدر", departments: ["Unit A", "Unit B"],
    contactPersons: [
      { id: "cp12", name: "Amir Hosseini", position: "Managing Director", mobile: "09123334455", email: "a.hosseini@kianinfra.com", department: "Unit A" },
      { id: "cp13", name: "Parisa Tehrani", position: "Project Coordinator", mobile: "09124445566", email: "p.tehrani@kianinfra.com", department: "Unit B" },
    ],
  },
  {
    id: "c6", type: "INDIVIDUAL", name_en: "Arash Mohammadi", name_fa: "آرش محمدي",
    national_id: "0012345678", email: "arash.m@privatemail.com", phone: "+98 912 345 6789",
    category: "OIL_GAS", contacts: 0, contracts: 1, logoColor: "from-violet-500 to-purple-600",
    address_en: "Isfahan, Mardavij, Street 15, No. 8", address_fa: "اصفهان، مرداویج، خیابان ۱۵، پلاک ۸",
    departments: ["Unit A"], contactPersons: [],
  },
  {
    id: "c7", type: "INDIVIDUAL", name_en: "Bahram Karimi", name_fa: "بهرام کریمی",
    national_id: "0098765432", email: "b.karimi@freelance.ir", phone: "+98 912 987 6543",
    category: "POWER", contacts: 0, contracts: 1, logoColor: "from-pink-500 to-rose-600",
    address_en: "Shiraz, Maaliabad, 15th St.", address_fa: "شیراز، معالی‌آباد، خیابان پانزدهم",
    departments: ["Unit A"], contactPersons: [],
  },
];

// ============ CONTRACTS ============
export const contracts: Contract[] = [
  {
    id: "ct1",
    contract_no: "CTR-UNA-1404-0001",
    external_contract_no: "TE-2026-041",
    client_id: "c1",
    client_name: "TotalEnergies Pars",
    contract_title: "South Pars Phase 22 — TPI for Wellhead Platforms",
    start_date: "1404/10/25",
    end_date: "1405/10/24",
    total_value: 480000,
    invoiced: 187200,
    currency: "USD",
    status: "ACTIVE",
    type: "CONTRACT",
    tariffs: 4,
    department: "Unit A",
  },
  {
    id: "ct2",
    contract_no: "CTR-UNA-1404-0002",
    external_contract_no: "MP-MWS-22-19",
    client_id: "c2",
    client_name: "Mapna Group",
    contract_title: "Damavand Combined Cycle Power Plant — MWS Campaign",
    start_date: "1404/08/10",
    end_date: "1405/08/09",
    total_value: 280000,
    invoiced: 210500,
    currency: "USD",
    status: "ACTIVE",
    type: "CONTRACT",
    tariffs: 2,
    department: "Unit A",
  },
  {
    id: "ct3",
    contract_no: "WO-UNA-1404-0001",
    external_contract_no: "PID-WO-102",
    client_id: "c3",
    client_name: "Petro Iran Development",
    contract_title: "Offshore Pipeline Pre-commissioning — Ad-hoc WO",
    start_date: "1404/06/19",
    end_date: "1404/09/29",
    total_value: 62000,
    invoiced: 62000,
    currency: "USD",
    status: "CLOSED",
    type: "WORK_ORDER",
    tariffs: 3,
    department: "Unit A",
  },
  {
    id: "ct4",
    contract_no: "CTR-UNA-1404-0003",
    client_id: "c4",
    client_name: "Sunair Renewables",
    contract_title: "Kavir Solar Farm 120MW — Module & Inverter Review",
    start_date: "1404/12/11",
    end_date: "1405/09/24",
    total_value: 95000,
    invoiced: 18500,
    currency: "USD",
    status: "ACTIVE",
    type: "CONTRACT",
    tariffs: 4,
    department: "Unit A",
  },
  {
    id: "ct5",
    contract_no: "CTR-UNA-1405-0004",
    client_id: "c5",
    client_name: "Kian Infra Engineering",
    contract_title: "Tehran Metro Line 10 — Structural Steel TPI",
    start_date: "1405/02/20",
    end_date: "1406/02/19",
    total_value: 150000,
    invoiced: 0,
    currency: "USD",
    status: "PENDING",
    type: "CONTRACT",
    tariffs: 6,
    department: "Unit A",
  },
  {
    id: "ct6",
    contract_no: "WO-UNA-1405-0002",
    client_id: "c1",
    client_name: "TotalEnergies Pars",
    contract_title: "Wellhead Maintenance — WO Q2",
    start_date: "1404/12/11",
    end_date: "1405/07/08",
    total_value: 95000,
    invoiced: 32000,
    currency: "USD",
    status: "ACTIVE",
    type: "WORK_ORDER",
    tariffs: 4,
    department: "Unit A",
  },
];

// ============ CONTRACT TARIFFS ============
export const contractTariffs: TariffLine[] = [
  { id: "t1", contract_id: "ct1", description: "Senior Inspector Man-Day", unit: "MAN_DAY", rate: 850, total_quantity: 200, consumed_quantity: 120 },
  { id: "t2", contract_id: "ct1", description: "Junior Inspector Man-Day", unit: "MAN_DAY", rate: 520, total_quantity: 150, consumed_quantity: 85 },
  { id: "t3", contract_id: "ct1", description: "Document Review — Standard", unit: "DOCUMENT", rate: 180, total_quantity: 50, consumed_quantity: 32 },
  { id: "t4", contract_id: "ct1", description: "Offshore Trip", unit: "TRIP", rate: 1250, total_quantity: 20, consumed_quantity: 8 },
  { id: "t5", contract_id: "ct2", description: "Marine Warranty Surveyor", unit: "MAN_DAY", rate: 950, total_quantity: 100, consumed_quantity: 78 },
  { id: "t6", contract_id: "ct2", description: "Load Test Witness", unit: "TRIP", rate: 2200, total_quantity: 15, consumed_quantity: 12 },
  { id: "t7", contract_id: "ct3", description: "Pipeline Inspection", unit: "LUMP_SUM", rate: 62000, total_quantity: 1, consumed_quantity: 1 },
  { id: "t8", contract_id: "ct3", description: "Report Generation", unit: "DOCUMENT", rate: 0, total_quantity: 1, consumed_quantity: 1 },
  { id: "t9", contract_id: "ct3", description: "Travel Expenses", unit: "TRIP", rate: 0, total_quantity: 3, consumed_quantity: 3 },
  { id: "t10", contract_id: "ct4", description: "Solar Module Inspector", unit: "MAN_DAY", rate: 650, total_quantity: 80, consumed_quantity: 20 },
  { id: "t11", contract_id: "ct4", description: "Inverter Testing", unit: "UNIT", rate: 450, total_quantity: 120, consumed_quantity: 25 },
  { id: "t12", contract_id: "ct4", description: "Site Visit", unit: "TRIP", rate: 800, total_quantity: 10, consumed_quantity: 3 },
  { id: "t13", contract_id: "ct4", description: "Final Report", unit: "DOCUMENT", rate: 1500, total_quantity: 1, consumed_quantity: 0 },
  { id: "t14", contract_id: "ct5", description: "Structural Inspector", unit: "MAN_DAY", rate: 750, total_quantity: 120, consumed_quantity: 0 },
  { id: "t15", contract_id: "ct5", description: "Welding Inspector", unit: "MAN_DAY", rate: 800, total_quantity: 80, consumed_quantity: 0 },
  { id: "t16", contract_id: "ct5", description: "NDT Technician", unit: "MAN_DAY", rate: 700, total_quantity: 60, consumed_quantity: 0 },
  { id: "t17", contract_id: "ct5", description: "Lab Testing", unit: "TEST", rate: 350, total_quantity: 200, consumed_quantity: 0 },
  { id: "t18", contract_id: "ct5", description: "Site Visit", unit: "TRIP", rate: 900, total_quantity: 15, consumed_quantity: 0 },
  { id: "t19", contract_id: "ct5", description: "Documentation", unit: "DOCUMENT", rate: 200, total_quantity: 50, consumed_quantity: 0 },
  { id: "t20", contract_id: "ct6", description: "Maintenance Inspector", unit: "MAN_DAY", rate: 780, total_quantity: 60, consumed_quantity: 25 },
  { id: "t21", contract_id: "ct6", description: "Scaffold Inspector", unit: "MAN_DAY", rate: 650, total_quantity: 40, consumed_quantity: 15 },
  { id: "t22", contract_id: "ct6", description: "Safety Audit", unit: "AUDIT", rate: 1200, total_quantity: 5, consumed_quantity: 2 },
  { id: "t23", contract_id: "ct6", description: "Travel", unit: "TRIP", rate: 1100, total_quantity: 10, consumed_quantity: 4 },
  { id: "t24", contract_id: "ct7", description: "UT Inspector", unit: "MAN_DAY", rate: 900, total_quantity: 100, consumed_quantity: 15 },
  { id: "t25", contract_id: "ct7", description: "RT Inspector", unit: "MAN_DAY", rate: 950, total_quantity: 80, consumed_quantity: 10 },
  { id: "t26", contract_id: "ct7", description: "MT Inspector", unit: "MAN_DAY", rate: 850, total_quantity: 60, consumed_quantity: 8 },
  { id: "t27", contract_id: "ct7", description: "PT Inspector", unit: "MAN_DAY", rate: 800, total_quantity: 50, consumed_quantity: 5 },
  { id: "t28", contract_id: "ct7", description: "Film Processing", unit: "FILM", rate: 150, total_quantity: 500, consumed_quantity: 50 },
  { id: "t29", contract_id: "ct7", description: "Report", unit: "DOCUMENT", rate: 300, total_quantity: 100, consumed_quantity: 10 },
  { id: "t30", contract_id: "ct8", description: "Turbine Specialist", unit: "MAN_DAY", rate: 1200, total_quantity: 50, consumed_quantity: 15 },
  { id: "t31", contract_id: "ct8", description: "Mechanical Inspector", unit: "MAN_DAY", rate: 850, total_quantity: 80, consumed_quantity: 25 },
  { id: "t32", contract_id: "ct8", description: "Vibration Analysis", unit: "TEST", rate: 2500, total_quantity: 10, consumed_quantity: 3 },
  { id: "t33", contract_id: "ct8", description: "Oil Analysis", unit: "TEST", rate: 800, total_quantity: 20, consumed_quantity: 5 },
  { id: "t34", contract_id: "ct8", description: "Final Report", unit: "DOCUMENT", rate: 3000, total_quantity: 1, consumed_quantity: 0 },
  { id: "t35", contract_id: "ct9", description: "Platform Inspector", unit: "MAN_DAY", rate: 1100, total_quantity: 100, consumed_quantity: 25 },
  { id: "t36", contract_id: "ct9", description: "Corrosion Specialist", unit: "MAN_DAY", rate: 1300, total_quantity: 60, consumed_quantity: 15 },
  { id: "t37", contract_id: "ct9", description: "Structural Engineer", unit: "MAN_DAY", rate: 1400, total_quantity: 40, consumed_quantity: 10 },
  { id: "t38", contract_id: "ct9", description: "Safety Officer", unit: "MAN_DAY", rate: 900, total_quantity: 80, consumed_quantity: 20 },
  { id: "t39", contract_id: "ct9", description: "Helicopter Transfer", unit: "TRIP", rate: 3500, total_quantity: 20, consumed_quantity: 5 },
  { id: "t40", contract_id: "ct9", description: "Boat Transfer", unit: "TRIP", rate: 1800, total_quantity: 30, consumed_quantity: 8 },
  { id: "t41", contract_id: "ct9", description: "Lab Testing", unit: "TEST", rate: 500, total_quantity: 100, consumed_quantity: 25 },
  { id: "t42", contract_id: "ct9", description: "Monthly Report", unit: "DOCUMENT", rate: 800, total_quantity: 12, consumed_quantity: 3 },
  { id: "t43", contract_id: "ct10", description: "Bridge Inspector", unit: "MAN_DAY", rate: 850, total_quantity: 40, consumed_quantity: 0 },
  { id: "t44", contract_id: "ct10", description: "Concrete Tester", unit: "TEST", rate: 400, total_quantity: 50, consumed_quantity: 0 },
  { id: "t45", contract_id: "ct10", description: "Final Report", unit: "DOCUMENT", rate: 2000, total_quantity: 1, consumed_quantity: 0 },
  { id: "t46", contract_id: "ct11", description: "Freelance Inspection", unit: "LUMP_SUM", rate: 8500, total_quantity: 1, consumed_quantity: 1 },
  { id: "t47", contract_id: "ct12", description: "Power Plant Audit", unit: "MAN_DAY", rate: 1000, total_quantity: 10, consumed_quantity: 0 },
  { id: "t48", contract_id: "ct12", description: "Audit Report", unit: "DOCUMENT", rate: 2000, total_quantity: 1, consumed_quantity: 0 },
];

// ============ INSPECTORS ============
export const inspectors: Inspector[] = [
  { id: "i1", name_en: "Reza Ahmadi", name_fa: "رضا احمدي", phone: "+98 912 111 2233", email: "r.ahmadi@ics.io", location: "Tehran", rating: 4.9, status: "AVAILABLE", specialties: ["Welding", "NDT", "Pressure Vessels"], certifications: 7, activeJobs: 0, completedJobs: 142 },
  { id: "i2", name_en: "Nasim Karimi", name_fa: "نسیم کریمی", phone: "+98 912 444 5566", email: "n.karimi@ics.io", location: "Bushehr", rating: 4.8, status: "BUSY", specialties: ["Piping", "ASME B31.3", "Coating"], certifications: 6, activeJobs: 3, completedJobs: 98 },
  { id: "i3", name_en: "Hossein Tavakoli", name_fa: "حسین توکلی", phone: "+98 912 777 8899", email: "h.tavakoli@ics.io", location: "Assaluyeh", rating: 4.7, status: "BUSY", specialties: ["Marine Warranty", "Offshore", "Lifting"], certifications: 9, activeJobs: 2, completedJobs: 76 },
  { id: "i4", name_en: "Shiva Rostami", name_fa: "شیوا رستمی", phone: "+98 912 222 3344", email: "s.rostami@ics.io", location: "Tehran", rating: 4.9, status: "AVAILABLE", specialties: ["Electrical", "Instrumentation", "Hazardous Area"], certifications: 5, activeJobs: 0, completedJobs: 54 },
  { id: "i5", name_en: "Mehdi Farahani", name_fa: "مهدی فراهانی", phone: "+98 912 555 6677", email: "m.farahani@ics.io", location: "Ahvaz", rating: 4.6, status: "ON_LEAVE", specialties: ["Civil", "Structural", "Concrete"], certifications: 4, activeJobs: 0, completedJobs: 61 },
  { id: "i6", name_en: "Parisa Hosseini", name_fa: "پریسا حسینی", phone: "+98 912 888 9900", email: "p.hosseini@ics.io", location: "Isfahan", rating: 4.8, status: "AVAILABLE", specialties: ["QA/QC", "ISO 9001", "Auditing"], certifications: 8, activeJobs: 1, completedJobs: 110 },
];

// ============ INSPECTIONS ============
export const inspections: Inspection[] = [
  { id: "in1", inspection_no: "INS-2026-0184", contract_id: "ct1", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", inspector_id: "i2", inspector_name: "Nasim Karimi", source: "EMAIL", reference_no: "TP-IR-2026-0441", date_requested: "2026-05-22", date_assigned: "2026-05-23", status: "EXECUTING", has_ncr: false, location: "South Pars, Platform SPD-22", discipline: "Piping" },
  { id: "in2", inspection_no: "INS-2026-0185", contract_id: "ct1", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", source: "EMAIL", reference_no: "TP-IR-2026-0442", date_requested: "2026-05-25", status: "DOC_REVIEW", has_ncr: false, location: "South Pars, Onshore Fabrication Yard", discipline: "Welding" },
  { id: "in3", inspection_no: "INS-2026-0186", contract_id: "ct2", contract_no: "CTR-2026-0039", client_name: "Mapna Group", inspector_id: "i3", inspector_name: "Hossein Tavakoli", source: "LETTER", reference_no: "MP-MWS-22-19", date_requested: "2026-05-18", date_assigned: "2026-05-19", date_executed: "2026-05-26", status: "NCR_ISSUED", has_ncr: true, location: "Damavand Power Plant, Unit 4", discipline: "Marine Warranty" },
  { id: "in4", inspection_no: "INS-2026-0187", contract_id: "ct2", contract_no: "CTR-2026-0039", client_name: "Mapna Group", source: "PHONE", reference_no: "MP-22-IR-221", date_requested: "2026-05-28", status: "REQUESTED", has_ncr: false, location: "Damavand Site", discipline: "Mechanical" },
  { id: "in5", inspection_no: "INS-2026-0188", contract_id: "ct4", contract_no: "CTR-2026-0047", client_name: "Sunair Renewables", inspector_id: "i4", inspector_name: "Shiva Rostami", source: "EMAIL", reference_no: "SA-IR-0018", date_requested: "2026-05-12", date_assigned: "2026-05-13", date_executed: "2026-05-20", date_completed: "2026-05-24", status: "COMPLETED", has_ncr: false, location: "Kavir Solar Farm, Sector B", discipline: "Electrical" },
  { id: "in6", inspection_no: "INS-2026-0189", contract_id: "ct4", contract_no: "CTR-2026-0047", client_name: "Sunair Renewables", inspector_id: "i6", inspector_name: "Parisa Hosseini", source: "EMAIL", reference_no: "SA-IR-0019", date_requested: "2026-05-20", date_assigned: "2026-05-21", status: "INSPECTOR_ASSIGNED", has_ncr: false, location: "Kavir Solar Farm, Inverter Station", discipline: "QA/QC" },
  { id: "in7", inspection_no: "INS-2026-0190", contract_id: "ct1", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", inspector_id: "i1", inspector_name: "Reza Ahmadi", source: "EMAIL", reference_no: "TP-IR-2026-0440", date_requested: "2026-05-10", date_assigned: "2026-05-11", date_executed: "2026-05-17", date_completed: "2026-05-22", status: "COMPLETED", has_ncr: true, location: "South Pars, Platform SPD-21", discipline: "NDT" },
];

// ============ NCRs ============
export const ncrs: NCR[] = [
  { id: "ncr1", ncr_no: "NCR-2026-0012", inspection_id: "in3", inspection_no: "INS-2026-0186", client_name: "Mapna Group", description: "Coating thickness below specification on Unit 4 piping", severity: "MAJOR", status: "OPEN", date_raised: "2026-05-26" },
  { id: "ncr2", ncr_no: "NCR-2026-0011", inspection_id: "in7", inspection_no: "INS-2026-0190", client_name: "TotalEnergies Pars", description: "Weld defect detected in RT inspection", severity: "CRITICAL", status: "IN_PROGRESS", date_raised: "2026-05-17" },
  { id: "ncr3", ncr_no: "NCR-2026-0010", inspection_id: "in15", inspection_no: "INS-2026-0175", client_name: "Petro Iran Development", description: "Missing documentation for pressure test", severity: "MINOR", status: "CLOSED", date_raised: "2026-05-05", date_closed: "2026-05-12" },
];

// ============ INVOICES ============
export const invoices: Invoice[] = [
  { id: "inv1", invoice_no: "INV-2026-0088", inspection_id: "in5", inspection_no: "INS-2026-0188", contract_no: "CTR-2026-0047", client_name: "Sunair Renewables", amount: 12500, tax_amount: 1125, total_amount: 13625, currency: "USD", status: "PAID", issued_date: "2026-05-25", due_date: "2026-06-24", paid_date: "2026-06-02" },
  { id: "inv2", invoice_no: "INV-2026-0089", inspection_id: "in7", inspection_no: "INS-2026-0190", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", amount: 18700, tax_amount: 1683, total_amount: 20383, currency: "USD", status: "ISSUED", issued_date: "2026-05-23", due_date: "2026-06-22" },
  { id: "inv3", invoice_no: "INV-2026-0090", inspection_id: "in1", inspection_no: "INS-2026-0184", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", amount: 8400, tax_amount: 756, total_amount: 9156, currency: "USD", status: "DRAFT", issued_date: "2026-05-28", due_date: "2026-06-27" },
  { id: "inv4", invoice_no: "INV-2026-0085", inspection_id: "in3", inspection_no: "INS-2026-0186", contract_no: "CTR-2026-0039", client_name: "Mapna Group", amount: 22000, tax_amount: 1980, total_amount: 23980, currency: "USD", status: "OVERDUE", issued_date: "2026-04-10", due_date: "2026-05-10" },
  { id: "inv5", invoice_no: "INV-2026-0091", inspection_id: "in2", inspection_no: "INS-2026-0185", contract_no: "CTR-2026-0041", client_name: "TotalEnergies Pars", amount: 5600, tax_amount: 504, total_amount: 6104, currency: "USD", status: "DRAFT", issued_date: "2026-05-29", due_date: "2026-06-28" },
];

// ============ CHARTS DATA ============
export const inspectionsByDiscipline = [
  { name: "Piping", value: 28, color: "#6366f1" },
  { name: "Welding", value: 22, color: "#8b5cf6" },
  { name: "NDT", value: 17, color: "#ec4899" },
  { name: "Electrical", value: 12, color: "#f59e0b" },
  { name: "Marine Warranty", value: 9, color: "#10b981" },
  { name: "Civil/Structural", value: 7, color: "#06b6d4" },
  { name: "QA/QC", value: 5, color: "#64748b" },
];

export const inspectionsByMonth = [
  { month: "Dec", inspections: 34, revenue: 128 },
  { month: "Jan", inspections: 41, revenue: 156 },
  { month: "Feb", inspections: 38, revenue: 142 },
  { month: "Mar", inspections: 52, revenue: 198 },
  { month: "Apr", inspections: 47, revenue: 176 },
  { month: "May", inspections: 61, revenue: 238 },
];

export const inspectorPerformance = [
  { name: "R. Ahmadi", completed: 142, ncrIssued: 8 },
  { name: "N. Karimi", completed: 98, ncrIssued: 14 },
  { name: "P. Hosseini", completed: 110, ncrIssued: 5 },
  { name: "H. Tavakoli", completed: 76, ncrIssued: 22 },
  { name: "M. Farahani", completed: 61, ncrIssued: 3 },
  { name: "S. Rostami", completed: 54, ncrIssued: 6 },
];