import { format } from "date-fns";
import * as jalaali from "jalaali-js";


export function formatCurrency(amount: number | string, currency: string = "USD"): string {	
  if (currency === "IRR") {
    return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(amount) + " ریال";
  }
  const sym = currency === "USD" ? "$" : "€";
  return sym + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(d: string): string {
  try {
    return format(new Date(d), "d MMM yyyy");
  } catch {
    return d;
  }
}

export function formatDateShort(d: string): string {
  try {
    return format(new Date(d), "dd MMM");
  } catch {
    return d;
  }
}

export function contractHealth(con: { end_date: string; total_value: number; invoiced: number }) {
  const endDate = new Date(con.end_date);
  const today = new Date("2026-05-28");
  const daysLeft = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const spent = con.total_value > 0 ? (con.invoiced / con.total_value) * 100 : 0;

  let timeTone: "emerald" | "amber" | "rose" = "emerald";
  if (daysLeft < 0) timeTone = "rose";
  else if (daysLeft < 60) timeTone = "amber";

  let budgetTone: "emerald" | "amber" | "rose" = "emerald";
  if (spent >= 100) budgetTone = "rose";
  else if (spent >= 80) budgetTone = "amber";

  return { daysLeft, spent, timeTone, budgetTone };
}

// ============ NEW: DATE CALCULATION HELPERS ============

/**
 * محاسبه روزهای باقی‌مانده تا پایان قرارداد
 */
export const calculateDaysLeft = (endDate: string): number => {
  if (!endDate) return 0;
  const [jy, jm, jd] = endDate.split('/').map(Number);
  const gDate = jalaali.toGregorian(jy, jm, jd);
  const endGregorian = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = endGregorian.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * محاسبه روزهای باقی‌مانده تا شروع قرارداد
 */
export const getDaysUntilStart = (startDate: string): number => {
  if (!startDate) return 0;
  const [jy, jm, jd] = startDate.split('/').map(Number);
  const gDate = jalaali.toGregorian(jy, jm, jd);
  const startGregorian = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = startGregorian.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * تشخیص اینکه قرارداد هنوز شروع نشده
 */
export const isContractNotStarted = (startDate: string): boolean => {
  if (!startDate) return false;
  const [jy, jm, jd] = startDate.split('/').map(Number);
  const gDate = jalaali.toGregorian(jy, jm, jd);
  const startGregorian = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return startGregorian.getTime() > today.getTime();
};

/**
 * محاسبه درصد روزهای سپری شده از قرارداد
 */
export const calculateDaysProgress = (contract: any): number => {
  if (!contract.start_date || !contract.end_date) return 0;
  const [startJy, startJm, startJd] = contract.start_date.split('/').map(Number);
  const [endJy, endJm, endJd] = contract.end_date.split('/').map(Number);
  const startG = jalaali.toGregorian(startJy, startJm, startJd);
  const endG = jalaali.toGregorian(endJy, endJm, endJd);
  const startDate = new Date(startG.gy, startG.gm - 1, startG.gd);
  const endDate = new Date(endG.gy, endG.gm - 1, endG.gd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (totalDays <= 0) return 0;
  if (daysPassed <= 0) return 0;
  if (daysPassed >= totalDays) return 100;
  return (daysPassed / totalDays) * 100;
};

/**
 * رنگ پروگرس بار بر اساس درصد روزهای گذشته
 */
export const getDaysProgressColor = (progress: number): string => {
  if (progress >= 90) return "bg-rose-500";
  if (progress >= 70) return "bg-amber-500";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
};