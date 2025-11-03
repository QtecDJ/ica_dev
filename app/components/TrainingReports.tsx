"use client";

import { useState, useEffect } from "react";
import { 
  IconChartBar, 
  IconCalendar, 
  IconUsers, 
  IconDownload, 
  IconFileText,
  IconTrendingUp,
  IconPercentage
} from "@tabler/icons-react";

interface TrainingAttendance {
  member_id: number;
  member_name: string;
  team_name: string;
  total_trainings: number;
  attended: number;
  cancelled: number;
  attendance_rate: number;
}

interface MonthlyReport {
  month: string;
  year: number;
  total_trainings: number;
  total_members: number;
  attendances: TrainingAttendance[];
  overall_attendance_rate: number;
}

export default function TrainingReports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [yearlyReport, setYearlyReport] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const months = [
    { value: 1, label: "Januar" },
    { value: 2, label: "Februar" },
    { value: 3, label: "März" },
    { value: 4, label: "April" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Dezember" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (viewMode === 'monthly') {
      fetchMonthlyReport();
    } else {
      fetchYearlyReport();
    }
  }, [selectedYear, selectedMonth, viewMode]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/training-reports?year=${selectedYear}&month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyReport(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Monatsberichts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/training-reports?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setYearlyReport(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Jahresberichts:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        format
      });
      
      if (viewMode === 'monthly') {
        params.append('month', selectedMonth.toString());
      }

      const response = await fetch(`/api/admin/training-reports/download?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `training-report-${selectedYear}${viewMode === 'monthly' ? `-${selectedMonth.toString().padStart(2, '0')}` : ''}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Fehler beim Download:', error);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
            <IconChartBar className="w-8 h-8 text-purple-600 dark:text-purple-400" stroke={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Training Statistiken
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Detaillierte Berichte über Trainingsanwesenheit und -teilnahme
            </p>
          </div>
        </div>
        
        {/* Download Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => downloadReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 text-sm font-medium"
          >
            <IconDownload className="w-4 h-4" stroke={2} />
            Excel
          </button>
          <button
            onClick={() => downloadReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-medium"
          >
            <IconFileText className="w-4 h-4" stroke={2} />
            PDF
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <IconCalendar className="w-4 h-4 inline mr-2" stroke={2} />
              Monatlich
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'yearly'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <IconTrendingUp className="w-4 h-4 inline mr-2" stroke={2} />
              Jährlich
            </button>
          </div>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Month Selector (only for monthly view) */}
          {viewMode === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Lade Statistiken...</p>
        </div>
      )}

      {/* Monthly Report */}
      {!loading && viewMode === 'monthly' && monthlyReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <IconCalendar className="w-8 h-8 text-blue-600" stroke={2} />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Trainings</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{monthlyReport.total_trainings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <IconUsers className="w-8 h-8 text-green-600" stroke={2} />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Teilnehmer</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{monthlyReport.total_members}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <IconPercentage className="w-8 h-8 text-purple-600" stroke={2} />
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Anwesenheit</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {monthlyReport.overall_attendance_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <IconTrendingUp className="w-8 h-8 text-slate-600" stroke={2} />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Zeitraum</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Detaillierte Anwesenheit
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Mitglied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Trainings
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Teilgenommen
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Abgesagt
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Quote
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {monthlyReport.attendances.map((attendance) => (
                    <tr key={attendance.member_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {attendance.member_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {attendance.team_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {attendance.total_trainings}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-green-600">
                          {attendance.attended}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-red-600">
                          {attendance.cancelled}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAttendanceColor(attendance.attendance_rate)}`}>
                          {attendance.attendance_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Report */}
      {!loading && viewMode === 'yearly' && yearlyReport.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {yearlyReport.map((report) => (
              <div key={`${report.year}-${report.month}`} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {report.month} {report.year}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceColor(report.overall_attendance_rate)}`}>
                    {report.overall_attendance_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Trainings:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{report.total_trainings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Teilnehmer:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{report.total_members}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${report.overall_attendance_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && ((viewMode === 'monthly' && !monthlyReport) || (viewMode === 'yearly' && yearlyReport.length === 0)) && (
        <div className="text-center py-12">
          <IconChartBar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" stroke={1} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Keine Daten verfügbar
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Für den ausgewählten Zeitraum sind keine Trainingsdaten vorhanden.
          </p>
        </div>
      )}
    </div>
  );
}