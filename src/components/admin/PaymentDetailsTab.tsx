import React, { useState, useEffect } from "react";
import { 
  UserCircle, 
  MapPin, 
  Layers, 
  Users, 
  Calculator, 
  CreditCard, 
  ArrowRightCircle, 
  Save, 
  Clock,
  Printer,
  Share2,
  Trash2,
  TrendingUp,
  History,
  Calendar,
  ChevronRight,
  Filter,
  Plus,
  Send,
  Hash,
  Briefcase
} from "lucide-react";
import { generateProfessionalPDF, shareToWhatsApp } from "../../lib/pdfReportGenerator";
import { useEngineerData } from "../../hooks/useEngineerData";

interface PaymentRecord {
  id?: string;
  labourId: string;
  engineerName: string;
  site: string;
  category: string;
  labourName: string;
  rate: number;
  days: number[]; // 7 days
  totalDuties: number;
  totalAmount: number;
  advance: number;
  netPayment: number;
  startDate: string;
}

const PaymentDetailsTab: React.FC = () => {
  const { workerCategories, addPayout, addAdvance, refreshData, loading: dataLoading, payouts } = useEngineerData();
  
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Default to last Sunday
    return d.toISOString().split('T')[0];
  });
  
  const [weekEndDate, setWeekEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 6);
    return d.toISOString().split('T')[0];
  });

  const [entryStartDate, setEntryStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<PaymentRecord>({
    labourId: "",
    engineerName: "",
    site: "",
    category: "Mason",
    labourName: "",
    rate: 0,
    days: [0, 0, 0, 0, 0, 0, 0],
    totalDuties: 0,
    totalAmount: 0,
    advance: 0,
    netPayment: 0,
    startDate: entryStartDate
  });

  const [billRecords, setBillRecords] = useState<PaymentRecord[]>([]);

  // Auto-update entry start date when week start changes
  useEffect(() => {
    if (weekStartDate) {
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setWeekEndDate(end.toISOString().split('T')[0]);
      setEntryStartDate(weekStartDate);
    }
  }, [weekStartDate]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, startDate: entryStartDate }));
  }, [entryStartDate]);

  // Automatic calculations for the form
  useEffect(() => {
    const totalD = formData.days.reduce((a, b) => a + b, 0);
    const totalA = totalD * Number(formData.rate);
    const net = totalA - Number(formData.advance);
    
    setFormData(prev => ({
      ...prev,
      totalDuties: totalD,
      totalAmount: totalA,
      netPayment: net
    }));
  }, [formData.days, formData.rate, formData.advance]);

  const handleDayChange = (index: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newDays = [...formData.days];
    newDays[index] = val;
    setFormData(prev => ({ ...prev, days: newDays }));
  };

  const handleAddRecord = () => {
    if (!formData.labourName || !formData.site) return alert("Please fill in essential details.");
    
    setBillRecords(prev => [...prev, { 
      ...formData, 
      id: Math.random().toString(36).substr(2, 9) 
    }]);
    
    // Reset labour specific fields but keep Engineer, Site, and entryStartDate
    setFormData(prev => ({
      ...prev,
      labourId: "",
      labourName: "",
      days: [0, 0, 0, 0, 0, 0, 0],
      totalDuties: 0,
      totalAmount: 0,
      advance: 0,
      netPayment: 0
    }));
  };

  const handleSaveBill = async () => {
    if (billRecords.length === 0) return alert("No records to save.");

    try {
      setIsSaving(true);
      const promises = billRecords.map(async (record) => {
        const payoutPayload = {
          person_name: record.labourName,
          site: record.site,
          worker: record.labourId,
          category: record.category,
          total_duty: record.totalDuties,
          rate: record.rate,
          new_total_wages: record.totalAmount,
          date: record.startDate || entryStartDate,
          remarks: JSON.stringify(record.days)
        };

        const advancePayload = {
          date: record.startDate || entryStartDate,
          workerId: record.labourId || "N/A",
          siteId: record.site,
          amount: record.advance,
          remarks: JSON.stringify({
            category: record.category,
            name: record.labourName,
            status: "Settled",
            type: "Payout Deduction"
          })
        };

        await addPayout(payoutPayload);
        if (record.advance > 0) {
          await addAdvance(advancePayload);
        }
      });

      await Promise.all(promises);
      await refreshData();
      setBillRecords([]);
      alert("All Payment Records saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save some records. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeRecord = (id: string) => {
    setBillRecords(prev => prev.filter(r => r.id !== id));
  };

  const getWeekLabels = (start: string) => {
    const dates = [];
    const date = new Date(start);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      dates.push({
        label: dayNames[d.getDay()],
        date: `${d.getDate()}/${d.getMonth() + 1}`
      });
    }
    return dates;
  };

  const filterWeekLabels = getWeekLabels(weekStartDate);
  const entryWeekLabels = getWeekLabels(entryStartDate);

  const generateReportData = () => {
    const tableBody = billRecords.map(record => [
      record.labourName,
      record.category,
      record.totalDuties,
      `₹${record.rate}`,
      `₹${record.totalAmount.toLocaleString()}`,
      `₹${record.advance.toLocaleString()}`,
      `₹${record.netPayment.toLocaleString()}`
    ]);

    const grandTotal = billRecords.reduce((sum, r) => sum + r.netPayment, 0);
    
    return {
      title: "Workforce Payment Settlement Sheet",
      engineer: billRecords[0]?.engineerName || formData.engineerName || "N/A",
      site: billRecords[0]?.site || formData.site || "N/A",
      period: `Period: ${weekStartDate} to ${weekEndDate}`,
      tableHead: [["Labour Name", "Role", "Duties", "Rate", "Gross", "Advance", "Net Payment"]],
      tableBody,
      tableFooter: ["GRAND TOTAL", "", "", "", "", "", `₹${grandTotal.toLocaleString()}`]
    };
  };

  const handlePrint = () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("Please add at least one record first.");
    const doc = generateProfessionalPDF(data);
    doc.save(`Payment_Sheet_${data.site}_${weekStartDate}.pdf`);
  };

  const handleWhatsApp = async () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("Please add at least one record first.");
    const doc = generateProfessionalPDF(data);
    const grandTotal = billRecords.reduce((sum, r) => sum + r.netPayment, 0);
    const summary = `*Payment Settlement - ${data.site}*\n*Period:* ${weekStartDate} to ${weekEndDate}\n*Total Net: ₹${grandTotal.toLocaleString()}*`;
    await shareToWhatsApp(doc, `Payment_Settlement_${data.site}`, summary);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-0 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-20">
      {/* ── Page Title Section ── */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl shadow-indigo-600/30 ring-8 ring-indigo-50 dark:ring-indigo-900/10">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              Pay Out <span className="text-indigo-600">Details</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Resource Compensation & Settlement Engine
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1 px-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <Filter className="w-3 h-3" /> From
              </label>
              <input
                type="date"
                className="bg-transparent border-none p-0 text-xs font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
              />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div className="space-y-1 px-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <Filter className="w-3 h-3" /> To
              </label>
              <input
                type="date"
                className="bg-transparent border-none p-0 text-xs font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"><Share2 className="w-4 h-4" /> WhatsApp</button>
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[3rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Entry Details</h3>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-2">
              <Calendar className="w-3 h-3 text-indigo-500" /> Week Starting:
            </label>
            <input 
              type="date" 
              className="bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
              value={entryStartDate}
              onChange={(e) => setEntryStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <UserCircle className="w-3.5 h-3.5" /> Engineer / Contractor
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              value={formData.engineerName}
              onChange={e => setFormData(prev => ({ ...prev, engineerName: e.target.value }))}
              placeholder="Enter Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5" /> Site Location
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              value={formData.site}
              onChange={e => setFormData(prev => ({ ...prev, site: e.target.value }))}
              placeholder="Enter Site"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Hash className="w-3.5 h-3.5" /> Labour ID
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              value={formData.labourId}
              onChange={e => setFormData(prev => ({ ...prev, labourId: e.target.value }))}
              placeholder="Labour (ID)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Briefcase className="w-3.5 h-3.5" /> Category
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner appearance-none cursor-pointer"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="Mason">Mason</option>
              <option value="Helper">Helper</option>
              <option value="Operator">Operator</option>
              <option value="Supervisor">Supervisor</option>
              {workerCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Users className="w-3.5 h-3.5" /> Labour Name
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              value={formData.labourName}
              onChange={e => setFormData(prev => ({ ...prev, labourName: e.target.value }))}
              placeholder="Enter Full Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Calculator className="w-3.5 h-3.5" /> Rate per Duty (₹)
            </label>
            <input
              type="number"
              className="w-full bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-sm font-black text-indigo-600 dark:text-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none shadow-sm"
              value={formData.rate || ""}
              onChange={e => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 800"
            />
          </div>
        </div>

        {/* Duty Log */}
        <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl p-8 mb-10 border border-slate-100/50 dark:border-slate-800/50">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-8 ml-1">
            <Calendar className="w-3.5 h-3.5" /> 7-Day Duty Log ({entryStartDate})
          </label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {formData.days.map((day, idx) => (
              <div key={idx} className="space-y-3 text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  {entryWeekLabels[idx].label}
                  <span className="block text-indigo-500 text-[10px] mt-0.5">{entryWeekLabels[idx].date}</span>
                </span>
                <input
                  type="number"
                  step="0.5"
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-4 text-center text-sm font-black text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                  value={day || ""}
                  onChange={e => handleDayChange(idx, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Financial Calculation Bar */}
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl text-center border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
             <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Duties</span>
             <span className="text-xl font-black text-slate-900 dark:text-white">{formData.totalDuties}</span>
           </div>

           <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl text-center border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
             <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Amount</span>
             <span className="text-xl font-black text-slate-900 dark:text-white">₹ {formData.totalAmount.toLocaleString()}</span>
           </div>

           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center justify-center gap-2">
               <ArrowRightCircle className="w-3 h-3" /> Deduct Advance
             </label>
             <input
               type="number"
               className="w-full bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/20 rounded-3xl p-5 text-center text-sm font-black text-rose-600 shadow-xl shadow-rose-500/5 focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
               value={formData.advance || ""}
               onChange={e => setFormData(prev => ({ ...prev, advance: parseFloat(e.target.value) || 0 }))}
               placeholder="₹ 0.00"
             />
           </div>

           <div className="bg-indigo-600 p-6 rounded-3xl text-center shadow-2xl shadow-indigo-600/30 ring-4 ring-indigo-50 dark:ring-indigo-900/10 flex flex-col justify-center">
             <span className="block text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Net Payable</span>
             <span className="text-2xl font-black text-white">₹ {formData.netPayment.toLocaleString()}</span>
           </div>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleAddRecord}
            className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-16 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center gap-4 overflow-hidden"
          >
            <Plus className="w-4 h-4" />
            Add to Bill List
          </button>
        </div>
      </div>

      {/* Bill Records Table */}
      {billRecords.length > 0 && (
        <div className="bg-white dark:bg-slate-900/60 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Bill Summary 
              <span className="text-[10px] text-indigo-400 ml-2">({new Date(weekStartDate).toLocaleDateString('en-GB')} - {new Date(weekEndDate).toLocaleDateString('en-GB')})</span>
            </h3>
            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
              {billRecords.length} {billRecords.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Labour Detail</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duty Log</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right text-rose-500">Advance</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right text-indigo-600">Net Payment</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billRecords.map((record) => (
                  <tr key={record.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {record.category.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{record.labourName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{record.category} • {record.labourId || 'No ID'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-1">
                        {record.days.map((d, i) => (
                          <div key={i} className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black ${d > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {d}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <p className="font-black text-slate-800 dark:text-white text-sm">₹{record.totalAmount.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{record.totalDuties} Duties @ ₹{record.rate}</p>
                    </td>
                    <td className="p-6 text-right font-black text-rose-600 text-sm">₹{record.advance.toLocaleString()}</td>
                    <td className="p-6 text-right font-black text-indigo-600 text-sm">₹{record.netPayment.toLocaleString()}</td>
                    <td className="p-6 text-center">
                      <button onClick={() => removeRecord(record.id!)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-600">
                  <td colSpan={4} className="p-6">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Total Settlement Amount</span>
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-xl font-black text-white">₹ {billRecords.reduce((sum, r) => sum + r.netPayment, 0).toLocaleString()}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {billRecords.length > 0 && (
        <div className="flex justify-center">
          <button
            disabled={isSaving}
            onClick={handleSaveBill}
            className="group relative bg-indigo-600 disabled:bg-indigo-400 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95 flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Send className={`w-4 h-4 ${isSaving ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1'} transition-transform`} />
            {isSaving ? "Saving Settlements..." : "Finalize & Save All Payments"}
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {(dataLoading || isSaving) && (
        <div className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
              {isSaving ? "Syncing Data..." : "Loading Workspace..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailsTab;
