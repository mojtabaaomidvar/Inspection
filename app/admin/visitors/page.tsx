'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  
  useEffect(() => {
    async function fetchVisitors() {
      const { data } = await supabase
        .from('visitors')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100);
      
      setVisitors(data || []);
    }
    
    fetchVisitors();
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">بازدیدکنندگان</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2">زمان</th>
            <th className="p-2">IP</th>
            <th className="p-2">کشور</th>
            <th className="p-2">شهر</th>
            <th className="p-2">مرورگر</th>
            <th className="p-2">OS</th>
            <th className="p-2">دستگاه</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((v: any) => (
            <tr key={v.id} className="border-t">
              <td className="p-2">{new Date(v.visited_at).toLocaleString('fa-IR')}</td>
              <td className="p-2">{v.ip}</td>
              <td className="p-2">{v.country}</td>
              <td className="p-2">{v.city}</td>
              <td className="p-2">{v.browser}</td>
              <td className="p-2">{v.os}</td>
              <td className="p-2">{v.device}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}