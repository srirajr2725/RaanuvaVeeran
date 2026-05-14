import React, { useState } from "react";
import { 
  Calculator, 
  UserCircle, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Hash,
  TrendingUp,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  ChevronDown
} from "lucide-react";
import { useEngineerData } from "../../hooks/useEngineerData";

const AdvanceTab: React.FC = () => {
  const { workerCategories, sites, advances, addAdvance, deleteAdvance, refreshData } = useEngineerData();

  const [formData, setFormData] = useState({
    idNo: "",
    category: "",
    name: "",
    siteName: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    status: "Pending" as "Settled" | "Pending"
  });

  const [isAdding, setIsAdding] = useState(false);

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.siteName) {
      return alert("Please fill in Name, Site, and Amount");
    }

    try {
      setIsAdding(true);
      // We store the extra metadata (Category, Name, Status) in the remarks field as JSON
      await addAdvance({
        date: formData.date,
        workerId: formData.idNo || "N/A",
        siteId: formData.siteName,
        amount: Number(formData.amount),
        remarks: JSON.stringify({
          category: formData.category,
          name: formData.name,
          status: formData.status
        })
      });
      
      setFormData(prev => ({
        ...prev,
        idNo: "",
        category: "",
        name: "",
        amount: "",
        status: "Pending"
      }));
      await refreshData();
      alert("Bill record added successfully");
    } catch (err) {
      console.error(err);
      alert("Error adding bill record");
    } finally {
      setIsAdding(false);
    }
  };

  const parseRemarks = (remarks: string) => {
    try {
      if (remarks && remarks.startsWith('{')) {
        return JSON.parse(remarks);
      }
    } catch (e) {
      // Fallback for old records
    }
    return { category: "General", name: "Unknown", status: "Pending" };
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            Bill Details
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Comprehensive bill and advance tracking system</p>
        </div>
        
        <div className="bg-indigo-50 dark:bg-indigo-500/10 px-6 py-3 rounded-2xl flex items-center gap-4 border border-indigo-100 dark:border-indigo-500/20">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Bill Value</p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹ {advances.reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Add New Bill Record</h3>
        </div>

        <form onSubmit={handleAddBill} className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ID No */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Hash className="w-3.5 h-3.5" /> Labour ID
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                value={formData.idNo}
                onChange={e => setFormData(prev => ({ ...prev, idNo: e.target.value }))}
                placeholder="Enter Labour ID"
              />
            </div>

            {/* Labour Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Briefcase className="w-3.5 h-3.5" /> Labour Category
              </label>
              <div className="relative group">
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
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <UserCircle className="w-3.5 h-3.5" /> Name
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
              />
            </div>

            {/* Site */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <MapPin className="w-3.5 h-3.5" /> Site Location
              </label>
              <div className="relative group">
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner appearance-none cursor-pointer"
                  value={formData.siteName}
                  onChange={e => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                >
                  <option value="">Select Site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.name}>{site.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner cursor-pointer"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <TrendingUp className="w-3.5 h-3.5" /> Amount (₹)
              </label>
              <input
                type="number"
                className="w-full bg-white dark:bg-slate-800 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3.5 text-sm font-black text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                value={formData.amount}
                onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Present State */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Clock className="w-3.5 h-3.5" /> Present State
              </label>
              <div className="relative group">
                <select
                  className={`w-full border-none rounded-xl p-4 text-sm font-black transition-all shadow-inner appearance-none cursor-pointer ${formData.status === 'Settled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as "Settled" | "Pending" }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="Settled">Settled</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isAdding}
              className="group relative bg-indigo-600 disabled:bg-indigo-400 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95 flex items-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Plus className={`w-4 h-4 ${isAdding ? 'animate-spin' : 'group-hover:rotate-90'} transition-transform`} />
              {isAdding ? "Adding Record..." : "Create Bill Record"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-indigo-500" /> Recent Bill Records
          </h3>
          <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {advances.length} Entries
          </span>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Labour ID & Name</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {advances.slice().reverse().map((a) => {
                const meta = parseRemarks(a.remarks || "");
                return (
                  <tr key={a.id!} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {meta.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{meta.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{a.workerId || 'No ID'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {meta.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {a.siteId || 'Unknown'}
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-tighter italic">
                        {new Date(a.date).toLocaleDateString("en-GB")}
                      </p>
                    </td>
                    <td className="p-6 text-right">
                      <p className="font-black text-slate-800 dark:text-white text-sm">₹{(a.amount || 0).toLocaleString()}</p>
                    </td>
                    <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${meta.status === 'Settled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {meta.status === 'Settled' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {meta.status}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => deleteAdvance(a.id!)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {advances.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Briefcase className="w-10 h-10 text-slate-200" />
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">No bill records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvanceTab;
