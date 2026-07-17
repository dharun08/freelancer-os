'use strict';
'use client';

import React, { useState, useTransition } from 'react';
import { updateProfileSettingsAction, updatePreferencesAction } from '@/app/actions/settings';
import { User, Settings, Loader2, Save, BadgeCheck, CheckCircle2 } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  companyName: string | null;
  logoUrl: string | null;
  currency: string;
  timeZone: string;
  dateFormat: string;
}

interface SettingsClientProps {
  user: UserData;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  // Banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileSettingsAction(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Profile details successfully updated!');
      }
    });
  };

  const handleUpdatePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updatePreferencesAction(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('System preferences successfully updated!');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Side navigation tabs */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-2xl p-3 shadow-sm flex flex-row lg:flex-col gap-1 overflow-x-auto">
          <button
            onClick={() => {
              setSuccessMsg('');
              setErrorMsg('');
              setActiveTab('profile');
            }}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Account Profile</span>
          </button>
          
          <button
            onClick={() => {
              setSuccessMsg('');
              setErrorMsg('');
              setActiveTab('preferences');
            }}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'preferences'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Regional Preferences</span>
          </button>
        </div>
      </div>

      {/* Main settings panel */}
      <div className="lg:col-span-3 space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-sm text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm text-red-800 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {/* PROFILE SETTINGS FORM */}
        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-bold text-lg">Account Profile</h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Update your freelancer bio identity details and company attributes.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={user.name}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[10px] text-muted-foreground lowercase">(Read-only)</span>
                  </label>
                  <input
                    type="email"
                    readOnly
                    defaultValue={user.email}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-muted-foreground focus:outline-none cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    defaultValue={user.companyName || ''}
                    placeholder="e.g. Alex Johnson Consulting"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Brand Logo Image URL
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    defaultValue={user.logoUrl || ''}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/60">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 disabled:opacity-60 transition-all shadow-md shadow-primary/10 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REGIONAL PREFERENCES FORM */}
        {activeTab === 'preferences' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-bold text-lg">Regional Preferences</h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Set up local currency symbols, timezone offsets, and date format strings.
              </p>
            </div>

            <form onSubmit={handleUpdatePreferences} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Currency Symbol
                  </label>
                  <select
                    name="currency"
                    defaultValue={user.currency}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Time Zone
                  </label>
                  <select
                    name="timeZone"
                    defaultValue={user.timeZone}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="UTC">UTC (GMT+00:00)</option>
                    <option value="EST">EST (GMT-05:00)</option>
                    <option value="PST">PST (GMT-08:00)</option>
                    <option value="IST">IST (GMT+05:30)</option>
                    <option value="GMT">GMT (GMT+00:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Date Format
                  </label>
                  <select
                    name="dateFormat"
                    defaultValue={user.dateFormat}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/60">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/95 disabled:opacity-60 transition-all shadow-md shadow-primary/10 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
