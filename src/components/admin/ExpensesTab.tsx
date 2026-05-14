import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Trash2, 
  Plus, 
  Printer, 
  Share2, 
  ChevronDown,
  Tag,
  Wallet,
  Receipt
} from "lucide-react";
import { generateProfessionalPDF, shareToWhatsApp } from "../../lib/pdfReportGenerator";

const EXPENSE_CATEGORIES = [
  "Petrol",
  "Food",
  "Tea/Refreshment",
  "Utensils",
  "Vehicle Maintenance",
  "Salary to Staff",
  "Salary to Labours",
  "Commission/Additional Expenses",
  "Other Expenses"
];

const LOCAL_STORAGE_KEY = "expense_bill_details_records";

const ExpensesTab: React.FC = () => {
  // Local state instead of backend
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    category: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    location: ""
  });

  const [isAdding, setIsAdding] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local expenses", e);
      }
    }
    setDataLoading(false);
  }, []);

  // Save to local storage whenever expenses change
  useEffect(() => {
    if (!dataLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, dataLoading]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.location) {
      return alert("Please fill in Category, Amount, and Location");
    }

    try {
      setIsAdding(true);
      const newRecord = {
        id: Date.now().toString(),
        date: formData.date,
        category: formData.category,
        amount: Number(formData.amount),
        location: formData.location,
        createdAt: new Date().toISOString()
      };
      
      setExpenses(prev => [...prev, newRecord]);
      
      setFormData(prev => ({
        ...prev,
        category: "",
        amount: "",
        location: ""
      }));
      alert("Expense record added locally");
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const generateReportData = () => {
    const tableBody = expenses.map((e, idx) => [
      idx + 1,
      new Date(e.date).toLocaleDateString("en-GB"),
      e.category,
      e.location || "N/A",
      `₹${e.amount.toLocaleString()}`
    ]);

    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      title: "Expense Bill Details",
      period: `Generated on: ${new Date().toLocaleDateString()}`,
      tableHead: [["No", "Date", "Expense Type", "Location", "Amount"]],
      tableBody,
      tableFooter: ["TOTAL", "", "", "", `₹${grandTotal.toLocaleString()}`]
    };
  };

  const handlePrint = () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("No records to print.");
    const doc = generateProfessionalPDF(data);
    doc.save(`Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleWhatsApp = async () => {
    const data = generateReportData();
    if (data.tableBody.length === 0) return alert("No records to share.");
    const doc = generateProfessionalPDF(data);
    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const summary = `*Expense Bill Details*\n*Date:* ${new Date().toLocaleDateString()}\n*Total Amount: ₹${grandTotal.toLocaleString()}*`;
    await shareToWhatsApp(doc, `Expense_Report`, summary);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            Bill Details
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Project and Operational Expense Tracking (Offline Mode)</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={handleWhatsApp} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-sm"><Share2 className="w-4 h-4" /> WhatsApp</button>
        </div>
      </div>

      {/* Horizontal Entry Form */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
        <form onSubmit={handleAddExpense} className="flex flex-col lg:flex-row items-end gap-6">
          {/* Expenses Dropdown */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Receipt className="w-3.5 h-3.5 text-rose-500" /> Expenses
            </label>
            <div className="relative group">
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner appearance-none cursor-pointer"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>
          </div>

          {/* Date */}
          <div className="w-full lg:w-48 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" /> Date
            </label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner cursor-pointer"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Amount */}
          <div className="w-full lg:w-48 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <Wallet className="w-3.5 h-3.5 text-rose-500" /> Amount (₹)
            </label>
            <input
              type="number"
              className="w-full bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/30 rounded-xl p-3.5 text-sm font-black text-rose-600 dark:text-rose-400 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all"
              value={formData.amount}
              onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {/* Location */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter Site/Area"
            />
          </div>

          {/* Add Button */}
          <button
            type="submit"
            disabled={isAdding}
            className="shrink-0 bg-rose-600 disabled:bg-rose-400 text-white h-14 w-14 lg:w-14 rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 active:scale-95 group"
          >
            <Plus className={`w-6 h-6 ${isAdding ? 'animate-spin' : 'group-hover:rotate-90'} transition-transform`} />
          </button>
        </form>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Expenditure</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Record Count</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{expenses.length} Entries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">No</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Category</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.slice().reverse().map((e, idx) => (
                <tr key={e.id!} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="p-6 text-[10px] font-black text-slate-400">{String(expenses.length - idx).padStart(2, "0")}</td>
                  <td className="p-6 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {new Date(e.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-6">
                    <span className="inline-flex bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-500/20">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {e.location || "General"}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <p className="font-black text-slate-900 dark:text-white">₹{e.amount.toLocaleString()}</p>
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="w-10 h-10 text-slate-200" />
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">No expense records found</p>
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

export default ExpensesTab;
