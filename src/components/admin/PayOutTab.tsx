import React, { useState, useEffect } from "react";
import {
  Calculator,
  UserCircle,
  MapPin,
  Briefcase,
  Calendar,
  ChevronRight,
  PlusCircle,
  FileText,
  Send,
  Printer,
  Share2,
  TrendingUp,
  Trash2,
  Plus,
  Hash,
  Filter
} from "lucide-react";
import { generateProfessionalPDF, shareToWhatsApp } from "../../lib/pdfReportGenerator";
import { useEngineerData } from "../../hooks/useEngineerData";

interface DutyRecord {
  labourId: string;
  category: string;
  engineerName: string;
  siteName: string;
  labourName: string;
  days: number[]; // 7 days
  totalDuties: number;
  ratePerDuty: number;
  totalAmount: number;
  startDate: string; // Added to track week
}

const PayOutTab: React.FC = () => {
  const { workerCategories, payouts, addPayout, addAdvance, refreshData, loading: dataLoading } = useEngineerData();
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date();
    // Default to last Sunday
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  });
  const [weekEndDate, setWeekEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 6);
    return d.toISOString().split('T')[0];
  });
  const [entryStartDate, setEntryStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<DutyRecord>({
    labourId: "",
    category: "",
    engineerName: "",
    siteName: "",
    labourName: "",
    days: [0, 0, 0, 0, 0, 0, 0],
    totalDuties: 0,
    ratePerDuty: 0,
    totalAmount: 0,
    startDate: entryStartDate
  });

  const [billRecords, setBillRecords] = useState<DutyRecord[]>([]);

  // Auto-fetch existing payouts for the selected date range
  useEffect(() => {
    if (payouts && weekStartDate && weekEndDate) {
      const existing = payouts
        .filter(p => p.date && p.date >= weekStartDate && p.date <= weekEndDate)
        .map(p => {
          let days = [0, 0, 0, 0, 0, 0, 0];
          try {
            if (p.remarks && p.remarks.startsWith('[')) {
              days = JSON.parse(p.remarks);
            }
          } catch (e) {
            console.error("Failed to parse days from payout remarks", e);
          }

          return {
            labourId: String(p.worker || ""),
            category: p.category || "General",
            engineerName: p.person_name || "N/A",
            siteName: p.site || "N/A",
            labourName: p.person_name || "N/A",
            days: days,
            totalDuties: Number(p.total_duty || 0),
            ratePerDuty: Number(p.new_amount || 0),
            totalAmount: Number(p.new_total_wages || 0),
            startDate: p.date || weekStartDate
          };
        });
      setBillRecords(existing);
    }
  }, [weekStartDate, weekEndDate, payouts]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, startDate: entryStartDate }));
  }, [entryStartDate]);

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
    const totalD = formData.days.reduce((a, b) => a + b, 0);
    setFormData(prev => ({
      ...prev,
      totalDuties: totalD,
      totalAmount: totalD * prev.ratePerDuty
    }));
  }, [formData.days, formData.ratePerDuty]);

  const handleDayChange = (index: number, value: string) => {
    const val = parseFloat(value) || 0;
    const newDays = [...formData.days];
    newDays[index] = val;
    setFormData(prev => ({ ...prev, days: newDays }));
  };

  const handleAddRecord = () => {
    if (!formData.labourName || !formData.category) {
      return alert("Please enter Labour Name and Category");
    }
    // Check if record already exists locally to avoid duplicates if just editing
    const exists = billRecords.some(r => r.labourName === formData.labourName && r.labourId === formData.labourId && r.startDate === formData.startDate);
    if (exists) {
      if (!window.confirm("A record for this labour already exists for this week. Add anyway?")) return;
    }

    setBillRecords(prev => [...prev, { ...formData }]);
    // Reset labour specific fields but keep Engineer, Site, and entryStartDate
    setFormData(prev => ({
      ...prev,
      labourId: "",
      labourName: "",
      category: "",
      days: [0, 0, 0, 0, 0, 0, 0],
      totalDuties: 0,
      ratePerDuty: 0,
      totalAmount: 0
    }));
  };

  const handleSaveBill = async () => {
    if (billRecords.length === 0) return alert("No records to save.");

    try {
      setIsSaving(true);
      const promises = billRecords.map(async (record) => {
        const payoutPayload = {
          person_name: record.labourName,
          site: record.siteName,
          worker: record.labourId,
          category: record.category,
          total_duty: record.totalDuties,
          rate: record.ratePerDuty,
          new_total_wages: record.totalAmount,
          date: record.startDate || entryStartDate,
          remarks: JSON.stringify(record.days)
        };

        const advancePayload = {
          date: record.startDate || entryStartDate,
          workerId: record.labourId || "N/A",
          siteId: record.siteName,
          amount: record.totalAmount,
          remarks: JSON.stringify({
            category: record.category,
            name: record.labourName,
            status: "Pending"
          })
        };

        await addPayout(payoutPayload);
        await addAdvance(advancePayload);
      });

      await Promise.all(promises);
      await refreshData();
      alert("Weekly Bill Records saved successfully to the database.");
    } catch (e) {
      console.error(e);
      alert("Failed to save some records. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeRecord = (index: number) => {
    setBillRecords(prev => prev.filter((_, i) => i !== index));
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
      ...record.days,
      record.totalDuties,
      `₹${record.ratePerDuty}`,
      `₹${record.totalAmount.toLocaleString()}`
    ]);

    const grandTotal = billRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const engineer = billRecords[0]?.engineerName || formData.engineerName || "N/A";
    const site = billRecords[0]?.siteName || formData.siteName || "N/A";

    const dayHeaders = filterWeekLabels.map(l => `${l.label} ${l.date}`);

    return {
      title: "Workforce Weekly Bill Details",
      engineer,
      site,
      period: `Period: ${weekStartDate} to ${weekEndDate}`,
      tableHead: [["Labour Name", "Role", ...dayHeaders, "Total", "Rate", "Amount"]],
      tableBody,
      tableFooter: ["GRAND TOTAL", "", "", "", "", "", "", "", "", "", "", `₹${grandTotal.toLocaleString()}`]
    };
  };

  const handlePrint = () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("Please add at least one labour record first.");
    const doc = generateProfessionalPDF(data);
    doc.save(`Bill_${data.site}_${weekStartDate}_to_${weekEndDate}.pdf`);
  };

  const handleWhatsApp = async () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("Please add at least one labour record first.");
    const doc = generateProfessionalPDF(data);
    const grandTotal = billRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const summary = `*Bill Details - ${data.site}*\n*Period:* ${weekStartDate} to ${weekEndDate}\n*Engineer:* ${data.engineer}\n*Grand Total: ₹${grandTotal.toLocaleString()}*`;
    await shareToWhatsApp(doc, `Bill_${data.site}`, summary);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              Site Bill
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Workforce Settlement Report</p>
          </div>

          <div className="h-12 w-px bg-slate-100 dark:bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <Filter className="w-3 h-3" /> View From
              </label>
              <input
                type="date"
                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner cursor-pointer"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
              />
            </div>
            <div className="pt-4">
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <Filter className="w-3 h-3" /> To
              </label>
              <input
                type="date"
                className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner cursor-pointer"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={handleWhatsApp} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-sm"><Share2 className="w-4 h-4" /> WhatsApp</button>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Engineer Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <UserCircle className="w-3.5 h-3.5" /> Engineer / Contractor
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              value={formData.engineerName}
              onChange={e => setFormData(prev => ({ ...prev, engineerName: e.target.value }))}
              placeholder="Enter Name"
            />
          </div>

          {/* Site Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5" /> Bill Site
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              value={formData.siteName}
              onChange={e => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
              placeholder="Enter Site"
            />
          </div>

          {/* Labour ID */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Hash className="w-3.5 h-3.5" /> Labour ID
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              value={formData.labourId}
              onChange={e => setFormData(prev => ({ ...prev, labourId: e.target.value }))}
              placeholder="Labour (ID)"
            />
          </div>

          {/* Labour Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Briefcase className="w-3.5 h-3.5" /> Category
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner appearance-none cursor-pointer"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select Category</option>
              <option value="Mason">Mason</option>
              <option value="Helper">Helper</option>
              {workerCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Labour Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Briefcase className="w-3.5 h-3.5" /> Labour Name
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              value={formData.labourName}
              onChange={e => setFormData(prev => ({ ...prev, labourName: e.target.value }))}
              placeholder="Enter Full Name"
            />
          </div>

          {/* Rate */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <TrendingUp className="w-3.5 h-3.5" /> Rate per Duty (₹)
            </label>
            <input
              type="number"
              className="w-full bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3.5 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none"
              value={formData.ratePerDuty || ""}
              onChange={e => setFormData(prev => ({ ...prev, ratePerDuty: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 800"
            />
          </div>
        </div>

        {/* Duty Log */}
        <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-3xl p-6 mb-8 border border-slate-100/50 dark:border-slate-800/50">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-6 ml-1">
            <Calendar className="w-3.5 h-3.5" /> 7-Day Duty Log ({entryStartDate})
          </label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {formData.days.map((day, idx) => (
              <div key={idx} className="space-y-2 text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  {entryWeekLabels[idx].label}
                  <span className="block text-indigo-500 text-[10px]">{entryWeekLabels[idx].date}</span>
                </span>
                <input
                  type="number"
                  step="0.5"
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-xl p-3 text-center text-sm font-black text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                  value={day || ""}
                  onChange={e => handleDayChange(idx, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-4">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 rounded-xl border border-slate-100/50 dark:border-slate-700/30">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Duties</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{formData.totalDuties}</span>
            </div>
            <div className="bg-indigo-600 px-6 py-4 rounded-xl shadow-lg shadow-indigo-600/20">
              <span className="block text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Estimated Amount</span>
              <span className="text-lg font-black text-white">₹ {formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleAddRecord}
            className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add to Bill
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {(dataLoading || isSaving) && (
        <div className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
              {isSaving ? "Saving Records..." : "Fetching Data..."}
            </p>
          </div>
        </div>
      )}

      {/* Bill Records Table */}
      {billRecords.length > 0 && (
        <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Current Bill Summary 
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
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duty Log (Sun-Sat)</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billRecords.map((record, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
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
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-1.5 mb-1">
                          {filterWeekLabels.map((dayLabel, i) => (
                            <span key={i} className="w-6 text-center text-[8px] font-black text-slate-400 uppercase tracking-tighter">{dayLabel.label.charAt(0)}</span>
                          ))}
                        </div>
                        <div className="flex justify-center gap-1.5">
                          {record.days.map((d, i) => (
                            <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black ${d > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="font-black text-slate-800 dark:text-white text-sm">{record.totalDuties}</span>
                    </td>
                    <td className="p-6 text-right">
                      <p className="font-black text-slate-800 dark:text-white text-sm">₹{record.totalAmount.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-emerald-500 uppercase">@ ₹{record.ratePerDuty}</p>
                    </td>
                    <td className="p-6 text-center">
                      <button
                        onClick={() => removeRecord(idx)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-indigo-600">
                  <td colSpan={3} className="p-6">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Grand Settlement Total</span>
                  </td>
                  <td className="p-6 text-right">
                    <span className="text-xl font-black text-white">₹ {billRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}</span>
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
            {isSaving ? "Saving to Cloud..." : "Finalize & Save Bill Details"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PayOutTab;