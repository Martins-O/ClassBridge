import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function ImportExportPage() {
  const userRole = useAuthStore((state) => state.user?.role);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: string; errors?: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleImport = async (type: 'students' | 'classes', file: File) => {
    setIsImporting(type);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(`/import/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult({ success: data.message, errors: data.results?.errors });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Import failed');
    } finally {
      setIsImporting(null);
    }
  };

  const handleExport = async (type: 'students' | 'classes' | 'grades') => {
    setIsExporting(type);
    setError('');
    try {
      const response = await api.get(`/export/${type}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Export failed');
    } finally {
      setIsExporting(null);
    }
  };

  const isSchoolAdmin = userRole === 'school_admin' || userRole === 'system_admin';

  if (!isSchoolAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2">Only administrators can access import/export features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Import & Export</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Bulk data operations for students, classes, and grades.</p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{result.success}</span>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="text-xs text-amber-700 space-y-1">
              <p className="font-bold">Errors:</p>
              <ul className="list-disc pl-4">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Export Data</span>
          </div>
          <div className="p-6 space-y-3">
            {[
              { type: 'students' as const, label: 'Students', desc: 'Export all student records' },
              { type: 'classes' as const, label: 'Classes', desc: 'Export class listings' },
              { type: 'grades' as const, label: 'Grades', desc: 'Export all grade records' },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => handleExport(item.type)}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                {isExporting === item.type ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Import Data</span>
          </div>
          <div className="p-6 space-y-4">
            {[
              { type: 'students' as const, label: 'Students', desc: 'Import students from CSV' },
              { type: 'classes' as const, label: 'Classes', desc: 'Import classes from CSV' },
            ].map(item => (
              <div key={item.type}>
                <p className="font-semibold text-slate-900 mb-1">{item.label}</p>
                <p className="text-xs text-slate-500 mb-3">{item.desc}</p>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    {isImporting === item.type ? 'Processing...' : 'Upload CSV file'}
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImport(item.type, file);
                    }}
                    disabled={isImporting !== null}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportExportPage;
