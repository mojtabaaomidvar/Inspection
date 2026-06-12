import { contracts } from '../data/mockData';

// تولید شماره قرارداد داخلی بر اساس دپارتمان
export const generateInternalContractNo = (department: string, type: "CONTRACT" | "WORK_ORDER"): string => {
  const year = new Date().getFullYear();
  const prefix = type === "CONTRACT" ? "CTR" : "WO";
  const deptCode = department.replace(/\s+/g, '').toUpperCase().slice(0, 3);
  
  // شمارش قراردادهای موجود در این دپارتمان و نوع
  const count = contracts.filter(c => 
    c.department === department && 
    c.type === type &&
    c.contract_no.includes(`${year}`)
  ).length + 1;
  
  return `${prefix}-${deptCode}-${year}-${String(count).padStart(4, '0')}`;
};