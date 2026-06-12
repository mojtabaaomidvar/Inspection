import moment from 'moment-jalaali';

// تبدیل تاریخ میلادی به شمسی
export const toJalaali = (date: string | Date): string => {
  return moment(date).format('jYYYY/jMM/jDD');
};

// تبدیل تاریخ شمسی به میلادی
export const toGregorian = (jalaaliDate: string): string => {
  return moment(jalaaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
};

// فرمت نمایشی تاریخ شمسی
export const formatJalaali = (date: string | Date): string => {
  return moment(date).format('jYYYY/jMM/jDD');
};

// بررسی معتبر بودن تاریخ شمسی
export const isValidJalaali = (date: string): boolean => {
  return moment(date, 'jYYYY/jMM/jDD', true).isValid();
};