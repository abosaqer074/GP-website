import React, { useState, useEffect } from 'react';
import { Shield, Search, Lock, AlertTriangle, CheckCircle, Smartphone, Mail, Activity, Globe, ChevronRight, Zap, Info } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // حالة جديدة لتقييم كلمة المرور
  const [passwordMetrics, setPasswordMetrics] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    score: 0
  });

  // دالة فحص قوة كلمة المرور
  const validatePassword = (pwd) => {
    const metrics = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    
    const score = Object.values(metrics).filter(Boolean).length;
    setPasswordMetrics({ ...metrics, score });
  };

  // مراقبة المدخلات لتحديث التقييم فورياً
  useEffect(() => {
    if (activeTab === 'password') {
      validatePassword(query);
    }
  }, [query, activeTab]);

  const sha1 = async (str) => {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
    return Array.from(new Uint8Array(hash))
      .map(v => v.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      if (activeTab === 'phone') {
        await fetchPhoneApi(query);
      } else if (activeTab === 'email') {
        await checkEmailBreach(query);
      } else if (activeTab === 'password') {
        await checkPasswordPwned(query);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkEmailBreach = async (email) => {
    try {
      const response = await fetch(`https://api.xposedornot.com/v1/check-email/${email.trim()}`);
      if (response.status === 200) {
        const data = await response.json();
        setResult({
          breached: true,
          isEmail: true,
          breachCount: data.breaches[0].length,
          breaches: data.breaches[0].slice(0, 4),
          message: 'This email has been found in data breaches!'
        });
      } else if (response.status === 404) {
        setResult({ breached: false });
      } else { throw new Error(); }
    } catch (err) { setError('Email scan failed.'); }
  };

  const checkPasswordPwned = async (password) => {
    try {
      const hash = await sha1(password);
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();
      const lines = data.split('\n');
      const match = lines.find(line => line.startsWith(suffix));

      if (match) {
        const count = match.split(':')[1];
        setResult({
          breached: true,
          isPassword: true,
          count: parseInt(count).toLocaleString()
        });
      } else {
        setResult({ breached: false });
      }
    } catch (err) { setError('Password check failed.'); }
  };

  const fetchPhoneApi = async (phone) => {
    const apiKey = '0beeb7b839610063148318bab4c3a329';
    try {
      const response = await fetch(`http://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}`);
      const data = await response.json();
      if (data.valid) {
        setResult({
          breached: true,
          isPhone: true,
          country: data.country_name,
          carrier: data.carrier
        });
      } else { setResult({ breached: false }); }
    } catch (err) { setError('Phone API service unavailable.'); }
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#05050A]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Comprehensive<span className="text-indigo-400">Search Engine</span></span>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Security <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence.</span>
          </h1>
        </div>

        {/* Search Box */}
        <div className="w-full relative z-10">
          <div className="relative bg-[#0F121C]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl">
            
            <div className="grid grid-cols-3 gap-2 p-2 bg-[#05050A]/50 rounded-2xl mb-6">
              {[
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'phone', label: 'Phone', icon: Smartphone },
                { id: 'password', label: 'Password', icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(null); setQuery(''); setError(''); }}
                  className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id ? 'bg-[#1E2330] text-white shadow-lg ring-1 ring-white/10' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="px-6 pb-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="relative flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                    <input
                      type={activeTab === 'password' ? 'text' : 'text'} // غيرته لـ text لسهولة رؤية النصائح، يمكن إرجاعه لـ password
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Enter ${activeTab} to scan...`}
                      className="w-full h-14 pl-14 pr-4 bg-[#05050A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !query}
                    className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'Scan Now'}
                  </button>
                </div>

                {/* --- قسم نصائح كلمة المرور الجديد --- */}
                {activeTab === 'password' && query.length > 0 && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Security Strength</span>
                      <span className={`text-xs font-bold ${passwordMetrics.score <= 2 ? 'text-red-400' : passwordMetrics.score <= 4 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {passwordMetrics.score <= 2 ? 'WEAK' : passwordMetrics.score <= 4 ? 'MEDIUM' : 'STRONG'}
                      </span>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${passwordMetrics.score <= 2 ? 'bg-red-500' : passwordMetrics.score <= 4 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(passwordMetrics.score / 5) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Requirement label="8+ Characters" met={passwordMetrics.length} />
                      <Requirement label="Upper Case" met={passwordMetrics.upper} />
                      <Requirement label="Lower Case" met={passwordMetrics.lower} />
                      <Requirement label="Numbers" met={passwordMetrics.number} />
                      <Requirement label="Special Symbol" met={passwordMetrics.special} />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4">
            {result.breached ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-grow w-full">
                    <h3 className="text-2xl font-bold mb-4">Breach Detected!</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.isEmail && (
                        <>
                          <InfoBox label="Leaks Found" value={result.breachCount} color="text-red-400" />
                          <InfoBox label="Exposure" value="HIGH" color="text-red-500" />
                        </>
                      )}
                      {result.isPassword && (
                        <>
                          <InfoBox label="Total Leaks" value={result.count} color="text-red-400" />
                          <InfoBox label="Action" value="Change Immediately" color="text-red-500" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 flex items-center gap-6">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div>
                  <h3 className="text-2xl font-bold">Safe & Secure</h3>
                  <p className="text-emerald-200/60">This {activeTab} hasn't appeared in any known public leaks.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="mt-6 text-red-400 text-center">{error}</div>}
      </main>
    </div>
  );
};

// مكون صغير لمتطلبات كلمة المرور
const Requirement = ({ label, met }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${met ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-white/10'}`}>
      {met && <CheckCircle className="w-3 h-3 text-emerald-400" />}
    </div>
    <span className={`text-[11px] font-medium ${met ? 'text-emerald-300' : 'text-white/30'}`}>{label}</span>
  </div>
);

const InfoBox = ({ label, value, color = "text-white" }) => (
  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
    <p className="text-xs text-white/40 uppercase mb-1">{label}</p>
    <p className={`text-lg font-medium truncate ${color}`}>{value || 'N/A'}</p>
  </div>
);

export default App;