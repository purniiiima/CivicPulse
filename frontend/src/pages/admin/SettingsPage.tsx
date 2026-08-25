import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Database,
  Building,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { categories, showToast } = useApp();

  const [autoAssign, setAutoAssign] = useState(true);
  const [enableCitizenFeedback, setEnableCitizenFeedback] = useState(true);
  const [requirePhotoProof, setRequirePhotoProof] = useState(true);
  const [cityEmergencyContact, setCityEmergencyContact] = useState('311');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Settings Updated',
      message: 'Municipal system settings and SLA thresholds saved successfully.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
            Municipal Operations Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated dispatch logic, SLA thresholds, and municipal integration parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#102A43] hover:bg-[#0B1D30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#F4B942]" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Triage & Dispatch Automation */}
        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2C7A7B]" />
            <span>Automated Triage & Squad Dispatch Rules</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  Automated Field Squad Assignment
                </div>
                <div className="text-[11px] text-slate-500">
                  Automatically assign the nearest available technician based on problem category and GPS proximity.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-4 h-4 text-[#2C7A7B] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  Mandatory Photographic Resolution Proof
                </div>
                <div className="text-[11px] text-slate-500">
                  Field workers must upload after-repair photographic proof before tickets can transition to 'Resolved'.
                </div>
              </div>
              <input
                type="checkbox"
                checked={requirePhotoProof}
                onChange={(e) => setRequirePhotoProof(e.target.checked)}
                className="w-4 h-4 text-[#2C7A7B] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  Citizen 1-Click Verification Loop
                </div>
                <div className="text-[11px] text-slate-500">
                  Allow reporting citizen to rate and verify the repair before closing the ticket.
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableCitizenFeedback}
                onChange={(e) => setEnableCitizenFeedback(e.target.checked)}
                className="w-4 h-4 text-[#2C7A7B] rounded"
              />
            </div>
          </div>
        </div>

        {/* SLA Threshold Targets */}
        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#2C7A7B]" />
            <span>Category Resolution SLA Targets (Hours)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#102A43]">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.defaultDepartment}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    defaultValue={c.avgResolutionHours}
                    className="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold"
                  />
                  <span className="text-slate-500">hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & Database Information */}
        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2C7A7B]" />
            <span>CivicPulse Platform Health</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500 text-[10px]">API Latency</div>
              <div className="font-bold text-emerald-600 text-sm">24 ms</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500 text-[10px]">Active Node Cluster</div>
              <div className="font-bold text-[#102A43] text-sm">US-Central-1</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-slate-500 text-[10px]">Uptime SLA</div>
              <div className="font-bold text-emerald-600 text-sm">99.98%</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
