import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { User } from '../../types';
import { LogOut, Calendar, ShieldBan, RefreshCcw, Search, Crown, Activity, Zap, AlertTriangle, Terminal, Wrench, Copy, Check } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
    const { logout, getAllUsers, addSubscription, terminateUser, user: currentUser, promoteSelf } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRealtime, setIsRealtime] = useState(false);
    
    // Debug States
    const [fetchError, setFetchError] = useState<any>(null);
    const [showDebug, setShowDebug] = useState(false);
    const [dbRole, setDbRole] = useState<string>('unknown');
    const [copied, setCopied] = useState(false);

    const refreshData = async (isAuto = false) => {
        if (!isAuto) setLoading(true);
        setFetchError(null);
        try {
            const all = await getAllUsers();
            setUsers(all); 
            // Also fetch raw role for debug
            const { data } = await supabase.from('profiles').select('role').eq('id', currentUser?.id).single();
            if (data) setDbRole(data.role);
        } catch (e: any) {
            console.error("Failed to load users", e);
            setFetchError(e);
        } finally {
            if (!isAuto) setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();

        const channel = supabase
            .channel('admin-dashboard')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                (payload) => {
                    console.log('Real-time update:', payload);
                    refreshData(true);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsRealtime(true);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Auto-expand debug if critical recursion error is found
    useEffect(() => {
        if (fetchError?.code === '42P17' || (fetchError?.message || '').includes('infinite recursion')) {
            setShowDebug(true);
        }
    }, [fetchError]);

    const handleAdd = async (id: string, type: 'month' | 'year') => {
        if (!confirm(`Add 1 ${type} to this user?`)) return;
        setLoading(true);
        try { await addSubscription(id, type); } catch (e: any) { alert(e.message); }
    };

    const handleTerminate = async (id: string) => {
        if (confirm('Are you sure you want to terminate this user? They will lose access immediately.')) {
            setLoading(true);
            try { await terminateUser(id); } catch (e: any) { alert(e.message); }
        }
    };
    
    const handleRepairPermissions = async () => {
        setLoading(true);
        try {
            await promoteSelf();
            alert("Success! Admin role forced. Trying to fetch users again...");
            await refreshData();
        } catch (e: any) {
            alert(`Repair Failed: ${e.message || JSON.stringify(e)}.\n\nYou likely need to run the SQL fix code.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopySQL = () => {
        const sql = `-- 1. Create a secure function to bypass RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Policy for Admins (Uses the function to avoid recursion)
drop policy if exists "Admins view all" on profiles;
create policy "Admins view all" on profiles for select
to authenticated
using ( is_admin() OR auth.uid() = id );

drop policy if exists "Admins update all" on profiles;
create policy "Admins update all" on profiles for update
to authenticated
using ( is_admin() OR auth.uid() = id );

-- 4. Policy for Users (Self Service)
drop policy if exists "Users view own" on profiles;
create policy "Users view own" on profiles for select
to authenticated
using ( auth.uid() = id );

drop policy if exists "Users insert own" on profiles;
create policy "Users insert own" on profiles for insert
to authenticated
with check ( auth.uid() = id );

drop policy if exists "Users update own" on profiles;
create policy "Users update own" on profiles for update
to authenticated
using ( auth.uid() = id );

-- 5. Force Admin (Run this once)
update profiles
set role = 'admin'
where email = '${currentUser?.email}';`;

        navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredUsers = users.filter(u => 
        (u.agencyName?.toLowerCase() || '').includes(filter.toLowerCase()) || 
        (u.email?.toLowerCase() || '').includes(filter.toLowerCase()) ||
        (u.name?.toLowerCase() || '').includes(filter.toLowerCase())
    );

    const getStatusColor = (status: string, expiry?: string) => {
        if (status === 'inactive') return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (status === 'pending') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        if (expiry && new Date(expiry) < new Date()) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    };

    return (
        <div className="min-h-screen bg-primary text-slate-200 p-4">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-800 rounded-lg flex items-center justify-center shadow-lg">
                            <Crown className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                Pixel Admin Panel
                                {isRealtime && (
                                    <span className="text-[10px] px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-800 rounded-full flex items-center gap-1">
                                        <Zap size={10} className="fill-current" /> Live
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-slate-400 font-mono">AUTHORIZED PERSONNEL ONLY</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4"/>
                            <input 
                                type="text" 
                                placeholder="Search Agency, Name or Email..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-secondary border border-surfaceElevated rounded-lg text-sm focus:border-pixel outline-none w-64 text-white"
                            />
                        </div>
                        <button onClick={() => refreshData(false)} className="p-2 bg-surface hover:bg-surfaceElevated rounded-lg border border-surfaceElevated text-slate-400 hover:text-white" disabled={loading}>
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={logout} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/40 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-900/30">
                            <LogOut className="w-4 h-4"/> Logout
                        </button>
                    </div>
                </div>

                {/* DIAGNOSTICS & ERROR PANEL */}
                {(fetchError || users.length === 0) && (
                    <div className="mb-6 p-4 bg-red-900/10 border border-red-500/30 rounded-xl animate-fade-in-down">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-200">Connection Diagnostics</h3>
                                <p className="text-sm text-red-300 mb-2">
                                    {fetchError 
                                        ? `Database Error: ${fetchError.message} (Code: ${fetchError.code})` 
                                        : "Successfully connected, but 0 agencies returned. This typically means Row-Level Security (RLS) is hiding the data."}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-black/20 p-4 rounded-lg text-xs font-mono">
                                    <div>
                                        <div className="text-slate-400">Current User Email:</div>
                                        <div className="text-white">{currentUser?.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Database Role:</div>
                                        <div className={dbRole === 'admin' ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                            {dbRole.toUpperCase()} {dbRole !== 'admin' && '(MUST BE ADMIN)'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <button 
                                        onClick={handleRepairPermissions}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                                    >
                                        <Wrench size={14} /> Repair Admin Permissions
                                    </button>
                                    <button 
                                        onClick={() => setShowDebug(!showDebug)}
                                        className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-2"
                                    >
                                        <Terminal size={14} /> {showDebug ? 'Hide SQL Fix' : 'Show SQL Fix'}
                                    </button>
                                </div>

                                {showDebug && (
                                    <div className="mt-4 p-4 bg-black rounded-lg border border-slate-700 animate-fade-in relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-slate-400 font-bold text-sm">⚠️ CRITICAL: Run this in Supabase SQL Editor to fix Permissions:</p>
                                            <button 
                                                onClick={handleCopySQL}
                                                className="px-3 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs font-bold flex items-center gap-2 transition-all"
                                            >
                                                {copied ? <Check size={14}/> : <Copy size={14}/>}
                                                {copied ? 'Copied!' : 'Copy SQL'}
                                            </button>
                                        </div>
                                        <code className="block text-green-400 whitespace-pre-wrap select-all font-mono text-xs p-3 bg-gray-900 rounded border border-green-900/30">
{`-- 1. Create a secure function to bypass RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Policy for Admins (Uses the function to avoid recursion)
drop policy if exists "Admins view all" on profiles;
create policy "Admins view all" on profiles for select
to authenticated
using ( is_admin() OR auth.uid() = id );

drop policy if exists "Admins update all" on profiles;
create policy "Admins update all" on profiles for update
to authenticated
using ( is_admin() OR auth.uid() = id );

-- 4. Policy for Users (Self Service)
drop policy if exists "Users view own" on profiles;
create policy "Users view own" on profiles for select
to authenticated
using ( auth.uid() = id );

drop policy if exists "Users insert own" on profiles;
create policy "Users insert own" on profiles for insert
to authenticated
with check ( auth.uid() = id );

drop policy if exists "Users update own" on profiles;
create policy "Users update own" on profiles for update
to authenticated
using ( auth.uid() = id );

-- 5. Force Admin (Run this once)
update profiles
set role = 'admin'
where email = '${currentUser?.email}';`}
                                        </code>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* EXCEL GRID */}
                <div className="bg-white text-black rounded-xl shadow-xl overflow-hidden border border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-r border-gray-300 w-12 text-center">#</th>
                                    <th className="p-4 border-b border-r border-gray-300">Agency Details</th>
                                    <th className="p-4 border-b border-r border-gray-300">Contact Info</th>
                                    <th className="p-4 border-b border-r border-gray-300 w-32 text-center">Activity</th>
                                    <th className="p-4 border-b border-r border-gray-300 w-32 text-center">Status</th>
                                    <th className="p-4 border-b border-r border-gray-300 w-40 text-center">Expiry Date</th>
                                    <th className="p-4 border-b border-gray-300 text-center">Manage Subscription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-gray-400">
                                            {loading ? 'Loading database...' : '0 Agencies Found (Check Diagnostics Panel above)'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u, i) => (
                                        <tr key={u.id} className={`hover:bg-blue-50 transition-colors border-b border-gray-200 group ${u.id === currentUser?.id ? 'bg-yellow-50' : ''}`}>
                                            <td className="p-3 border-r border-gray-200 font-mono text-xs text-gray-400 text-center">{i + 1}</td>
                                            <td className="p-3 border-r border-gray-200">
                                                <div className="font-bold text-blue-900 text-base">{u.agencyName} {u.id === currentUser?.id && '(You)'}</div>
                                                <div className="text-xs text-gray-500 font-mono">Joined: {new Date(u.joinedDate).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-3 border-r border-gray-200">
                                                <div className="font-semibold text-gray-700">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                                <div className="text-xs text-gray-500 font-mono">{u.phone}</div>
                                            </td>
                                            <td className="p-3 border-r border-gray-200 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-lg text-gray-800">{u.cvGeneratedCount || 0}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">CVs Created</span>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-200 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(u.subscriptionStatus, u.subscriptionExpiry)} inline-flex items-center gap-1`}>
                                                    {u.subscriptionStatus === 'active' ? <Activity size={10}/> : <ShieldBan size={10}/>}
                                                    {u.subscriptionStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 border-r border-gray-200 font-mono text-sm text-center font-medium">
                                                {u.subscriptionExpiry ? (
                                                    <div className={new Date(u.subscriptionExpiry) < new Date() ? 'text-red-500 font-bold' : 'text-green-600'}>
                                                        {new Date(u.subscriptionExpiry).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleAdd(u.id, 'month')}
                                                        className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-200 text-xs font-bold flex items-center gap-1 transition-colors"
                                                        title="Add 1 Month"
                                                    >
                                                        <Calendar className="w-3 h-3"/> +1M
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAdd(u.id, 'year')}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded hover:bg-blue-200 text-xs font-bold flex items-center gap-1 transition-colors"
                                                        title="Add 1 Year"
                                                    >
                                                        <Calendar className="w-3 h-3"/> +1Y
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTerminate(u.id)}
                                                        className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 text-xs font-bold transition-colors ml-2"
                                                        title="Terminate / Deactivate"
                                                    >
                                                        <ShieldBan className="w-3 h-3"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t border-gray-200">
                        Showing {filteredUsers.length} agencies. • Admin Dashboard v1.3 • {isRealtime ? '🟢 Live Updates' : '⚪ Polling Mode'}
                    </div>
                </div>
            </div>
        </div>
    );
};