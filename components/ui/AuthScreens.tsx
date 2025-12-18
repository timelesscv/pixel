
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, ShieldAlert, LogIn, UserPlus, Smartphone } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', agencyName: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(formData);
        alert("Registration Successful! You can now sign in.");
        setIsRegister(false);
      } else {
        await login(formData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accentKuwait/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accentSaudi/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="bg-surface p-8 rounded-3xl border border-surfaceElevated shadow-2xl w-full max-w-md relative z-10 animate-fade-in-down">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pixel to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-3xl font-bold text-white">P</span>
            </div>
          <h1 className="text-3xl font-bold text-white mb-2">{isRegister ? 'Join the Network' : 'Agency Portal'}</h1>
          <p className="text-slate-400">Professional CV Generation Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input 
                type="text" placeholder="Agency Name" required
                className="w-full p-4 bg-secondary rounded-xl border border-surfaceElevated text-white focus:border-accentAll outline-none transition-all"
                value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})}
              />
              <input 
                type="text" placeholder="Your Full Name" required
                className="w-full p-4 bg-secondary rounded-xl border border-surfaceElevated text-white focus:border-accentAll outline-none transition-all"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
               <input 
                type="tel" placeholder="Phone Number" required
                className="w-full p-4 bg-secondary rounded-xl border border-surfaceElevated text-white focus:border-accentAll outline-none transition-all"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </>
          )}
          <input 
            type="email" placeholder="Email Address" required
            className="w-full p-4 bg-secondary rounded-xl border border-surfaceElevated text-white focus:border-accentAll outline-none transition-all"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-4 bg-secondary rounded-xl border border-surfaceElevated text-white focus:border-accentAll outline-none transition-all"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</div>}

          <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-accentAll to-orange-600 rounded-xl font-bold text-white shadow-lg hover:shadow-accentAll/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Processing...' : (isRegister ? <><UserPlus size={20}/> Create Account</> : <><LogIn size={20}/> Sign In</>)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-slate-400 hover:text-white underline">
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SubscriptionLock: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary">
      <div className="bg-surface p-8 rounded-3xl max-w-3xl border border-surfaceElevated shadow-2xl w-full">
        <div className="text-center mb-10">
            <ShieldAlert className="w-16 h-16 text-accentSaudi mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Required</h1>
            <p className="text-slate-400">Access to the CV Generator requires an active agency subscription.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-secondary p-6 rounded-2xl border-2 border-surfaceElevated hover:border-accentKuwait transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accentKuwait text-black text-xs font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
                <div className="text-3xl font-bold text-accentKuwait mb-4">2,500 ETB</div>
                <ul className="text-slate-400 space-y-2 text-sm">
                    <li>✓ Unlimited CV Generation</li>
                    <li>✓ AI Passport Scan</li>
                    <li>✓ 24/7 Support</li>
                </ul>
            </div>
            <div className="bg-secondary p-6 rounded-2xl border-2 border-surfaceElevated hover:border-accentAll transition-all cursor-pointer group">
                <h3 className="text-xl font-bold text-white mb-2">Yearly</h3>
                <div className="text-3xl font-bold text-accentAll mb-4">25,000 ETB</div>
                <ul className="text-slate-400 space-y-2 text-sm">
                    <li>✓ Save 5,000 ETB</li>
                    <li>✓ Priority AI Processing</li>
                    <li>✓ Dedicated Account Manager</li>
                </ul>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* CBE */}
            <div className="bg-surfaceElevated p-6 rounded-2xl">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5"/> CBE Transfer
                </h4>
                <div className="space-y-4 text-sm text-slate-300">
                    <div>
                        <p className="text-slate-500 text-xs">Account Number</p>
                        <p className="font-mono font-bold text-white text-lg tracking-wider">1000708477878</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Account Name</p>
                        <p className="font-bold text-white">Nathan Asrat Biyazen</p>
                    </div>
                </div>
            </div>

            {/* TeleBirr */}
            <div className="bg-surfaceElevated p-6 rounded-2xl border border-yellow-500/20">
                <h4 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5"/> TeleBirr
                </h4>
                <div className="space-y-4 text-sm text-slate-300">
                    <div>
                        <p className="text-slate-500 text-xs">Mobile Number</p>
                        <p className="font-mono font-bold text-white text-lg tracking-wider">0952119072</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Account Name</p>
                        <p className="font-bold text-white">Tsigemariam / Nathan</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-xl text-center">
            <p className="text-blue-200 text-sm font-bold mb-2">After payment, please contact admin with your receipt.</p>
            <p className="text-white font-mono bg-black/30 p-2 rounded">
                 Agency ID: {user?.id.split('-')[0].toUpperCase()}
            </p>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs text-slate-400 hover:text-white underline">
               Refresh Status
            </button>
        </div>
      </div>
    </div>
  );
};
