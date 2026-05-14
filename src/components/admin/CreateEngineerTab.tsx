import React, { useState } from "react";
import {
  UserCircle,
  MapPin,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Send,
  Briefcase
} from "lucide-react";

const CreateEngineerTab: React.FC = () => {
  const [formData, setFormData] = useState({
    entityType: "Engineer",
    name: "",
    siteLocation: "",
    description: "",
    labourType: "Mason",
    labourName: "",
    labourId: "",
    workCommencedOn: "",
    workTill: "",
    remarks: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Project registration details submitted successfully (Local State Only)");
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          Project Registration
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Initialize new site projects and assign workforce details with precision.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Section 1: Entity & Site Details ── */}
        <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Core Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Entity Type Select */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <UserCircle className="w-3.5 h-3.5" />
                Entity Type
              </label>
              <select
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-inner"
              >
                <option value="Engineer">Engineer</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <FileText className="w-3.5 h-3.5" />
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Site Location */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <MapPin className="w-3.5 h-3.5" />
                Site Location
              </label>
              <input
                type="text"
                name="siteLocation"
                placeholder="City, Area or Project Site"
                value={formData.siteLocation}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <FileText className="w-3.5 h-3.5" />
                Description
              </label>
              <input
                type="text"
                name="description"
                placeholder="Brief Project Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Labour Details ── */}
        <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Workforce Assignment</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Labour Details (Type) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Users className="w-3.5 h-3.5" />
                Labour Type
              </label>
              <select
                name="labourType"
                value={formData.labourType}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer shadow-inner"
              >
                <option value="Mason">Mason</option>
                <option value="Helper">Helper</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Labour Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <FileText className="w-3.5 h-3.5" />
                Labour Name
              </label>
              <input
                type="text"
                name="labourName"
                placeholder="Full Name of Primary Labour"
                value={formData.labourName}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Labour ID */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <FileText className="w-3.5 h-3.5" />
                Labour ID
              </label>
              <input
                type="text"
                name="labourId"
                placeholder="Enter Labour ID (e.g. W-101)"
                value={formData.labourId}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Work Commenced On */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Calendar className="w-3.5 h-3.5" />
                Work Commenced On
              </label>
              <input
                type="date"
                name="workCommencedOn"
                value={formData.workCommencedOn}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Till */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <Calendar className="w-3.5 h-3.5" />
                Work Till (Projected)
              </label>
              <input
                type="date"
                name="workTill"
                value={formData.workTill}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-8 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Remarks
            </label>
            <textarea
              name="remarks"
              rows={3}
              placeholder="Any specific instructions or notes..."
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner resize-none"
            />
          </div>
        </div>

        {/* ── Submit Button ── */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95 flex items-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEngineerTab;
