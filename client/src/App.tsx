import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc,
  getDoc // Added getDoc to fetch shared reports
} from 'firebase/firestore';
import { 
  ShieldCheck, 
  CheckCircle, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Code, 
  ArrowRight,
  Activity,
  Loader2,
  Globe,
  Menu,
  X,
  Zap,
  Heart,
  Layout as LayoutIcon,
  Mail,
  HelpCircle,
  AlertTriangle,
  Server,
  Check
} from 'lucide-react';

// --- CONFIGURATION ---

// 1. API URL (Points to your local Node.js server)
const API_URL = 'https://access-for-good.onrender.com/api';

// 2. FIREBASE CONFIG
// IMPORTANT: Paste your Firebase keys back in here!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  
};

// Initialize Firebase
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// --- Types ---
interface AuditIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  title: string;
  description: string;
  helpUrl: string;
  elements: string[]; 
  wcag?: string[];
  fixRecommendation: string;
  nonprofitExplanation: string; 
}

interface ScanResult {
  id: string;
  url: string;
  timestamp: string;
  lighthouseScore: number;
  violations: AuditIssue[];
  status: 'completed' | 'failed' | 'processing';
  error?: string;
}

// --- Shared Components ---

const Header = ({ onDemoClick }: { onDemoClick: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => window.location.href = '/'} // Fixed to safely route home
          >
            <div className="bg-teal-600 p-1.5 rounded-lg text-white group-hover:bg-teal-700 transition-colors">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Access for Good</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">Features</a>
            <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">How it Works</a>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={onDemoClick}
              className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
            >
              View Sample Data
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <Server className="h-3 w-3" />
              
            </div>
          </nav>

          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl absolute top-16 left-0 w-full z-40 animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-4 flex flex-col">
            <a href="/#features" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-600 p-2 hover:bg-slate-50 rounded-lg">Features</a>
            <a href="/#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-slate-600 p-2 hover:bg-slate-50 rounded-lg">How it Works</a>
            <button 
              onClick={() => { onDemoClick(); setIsMenuOpen(false); }}
              className="text-base font-medium text-teal-600 text-left p-2 hover:bg-teal-50 rounded-lg"
            >
              Load Demo Report
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// UPDATED FOOTER WITH YOUR BRANDING
const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-teal-500 p-1 rounded">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
          </div>
          <span className="text-lg font-bold">Access for Good</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
          Open source accessibility auditing for the modern web. Built to bridge the gap between WCAG compliance and human-friendly guidance.
        </p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-6">Product</h4>
        <ul className="space-y-3 text-sm">
          <li><a href="/" className="hover:text-teal-400 transition-colors">Live Audit</a></li>
          <li><a href="#" className="hover:text-teal-400 transition-colors">API Documentation</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-6">Resources</h4>
        <ul className="space-y-3 text-sm">
          <li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">WCAG 2.1 Checklist</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-6">Contact</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-teal-500" /> 
            <a href="mailto:mr.essapour173@gmail.com" className="hover:text-teal-400 transition-colors">
              mr.essapour173@gmail.com
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    {/* PERSONAL BRANDING BADGE */}
    <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
      <p>&copy; {new Date().getFullYear()} Access for Good. Open Source Initiative.</p>
      <div className="flex gap-2 items-center bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
        <Code className="h-4 w-4 text-teal-500" />
        <span className="font-medium text-slate-300">Engineered by Sayed Mudaber Essapour</span>
      </div>
    </div>
  </footer>
);

const ImpactBadge = ({ impact }: { impact: string }) => {
  const styles = {
    critical: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100',
    serious: 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-100',
    moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100',
    minor: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${styles[impact as keyof typeof styles] || styles.minor} uppercase tracking-wider`}>
      {impact}
    </span>
  );
};

// --- Landing Page Component ---

const LandingPage = ({ 
  urlInput, 
  setUrlInput, 
  handleScan, 
  handleDemoScan,
  inputError
}: { 
  urlInput: string, 
  setUrlInput: (s: string) => void, 
  handleScan: () => void,
  handleDemoScan: () => void,
  inputError: boolean
}) => {
  const features = [
    {
      icon: <Eye className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
      title: "Plain Language Reports",
      desc: "No technical jargon. We explain why an issue matters and how it affects real people using your site."
    },
    {
      icon: <Code className="h-6 w-6 text-teal-600" />,
      bg: "bg-teal-50",
      title: "Developer-Ready Code",
      desc: "Toggle to 'Developer View' to get exact CSS selectors, WCAG references, and copy-paste fix templates."
    },
    {
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-50",
      title: "Prioritized Impact",
      desc: "We rank issues by severity. Know exactly what to fix first (like keyboard traps) to make the biggest impact."
    }
  ];

  const steps = [
    { step: "01", title: "Enter your URL", desc: "Paste your homepage link. We support any public-facing website." },
    { step: "02", title: "AI Analysis", desc: "Our engine checks contrast, tags, and navigation paths against WCAG 2.1 standards." },
    { step: "03", title: "Get Your Fix List", desc: "Receive a prioritized to-do list you can send directly to your web developer." }
  ];

  const faqItems = [
    { q: "Is this tool completely free?", a: "Yes. Access for Good is an open-source initiative designed to help nonprofits improve their web presence without expensive consultant fees." },
    { q: "Does this guarantee legal compliance?", a: "No. Automated tools can only detect about 30-50% of accessibility issues. This tool helps you catch the low-hanging fruit, but a manual audit is required for full legal compliance." },
    { q: "Can I scan pages behind a login?", a: "Currently, we only support public-facing URLs. We prioritize scanning homepages, donation pages, and public content." },
    { q: "What standards do you check against?", a: "We test against WCAG 2.1 Level AA, which is the industry standard for most accessibility laws worldwide." }
  ];

  return (
    <div className="animate-in fade-in duration-500 bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50/[0.6]">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-teal-200 to-blue-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-700">Trusted by 500+ Nonprofits</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Accessibility for everyone, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">automated for good.</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            The first professional accessibility auditor designed for humans, not just developers. Get plain-language fixes to help your nonprofit reach everyone.
          </p>

          <div className={`max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-300 flex flex-col sm:flex-row gap-2 relative z-20 ${inputError ? 'border-red-400 ring-2 ring-red-100 shake-animation' : 'border-slate-200 hover:border-teal-200'}`}>
            <div className="flex-1 relative group">
              <Globe className={`absolute left-4 top-3.5 h-5 w-5 transition-colors ${inputError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-teal-500'}`} />
              <input
                type="text"
                placeholder="Enter your website URL (e.g., nonprofit.org)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 h-full text-lg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                aria-label="Website URL input"
                aria-invalid={inputError}
              />
            </div>
            <button 
              onClick={() => handleScan()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              Run Scan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {inputError && (
            <p className="mt-3 text-red-500 text-sm font-medium animate-in slide-in-from-top-1">Please enter a valid website URL to continue.</p>
          )}
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-slate-500">
             <button onClick={handleDemoScan} className="flex items-center gap-2 hover:text-teal-600 transition-colors font-medium">
               <LayoutIcon className="h-4 w-4" /> View Sample Report
             </button>
             <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></span>
             <span className="flex items-center gap-2">
               <CheckCircle className="h-4 w-4 text-green-500" /> Free Forever for Nonprofits
             </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Why automated audits matter</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Manual accessibility testing is expensive and slow. We give you 80% of the value in 30 seconds, allowing your team to fix critical blockers immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">Simple steps to a better web</h2>
              <div className="space-y-10">
                {steps.map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-4xl font-black text-slate-200 group-hover:text-teal-200 transition-colors">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group perspective-1000">
               <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-2xl rotate-3 opacity-20 transform translate-y-4 translate-x-4 transition-transform group-hover:translate-x-6 group-hover:rotate-6"></div>
               <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10 transition-transform hover:-translate-y-2">
                  <div className="space-y-6">
                     <div className="flex gap-3 items-center mb-6 border-b border-slate-100 pb-4">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                     <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse delay-75"></div>
                     <div className="h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-slate-300" />
                        <span className="text-slate-400 text-sm font-medium">Visual Audit Preview</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Common questions about automated accessibility testing.</p>
          </div>
          <div className="space-y-6">
            {faqItems.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors cursor-default border border-transparent hover:border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-teal-600 mt-1 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-slate-600 ml-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'results' | 'error'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [report, setReport] = useState<ScanResult | null>(null);
  const [viewMode, setViewMode] = useState<'nonprofit' | 'developer'>('nonprofit');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [shareLink, setShareLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Initialize Auth
  useEffect(() => {
    if (auth) {
      const initAuth = async () => {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.log("Auth skipped (no config or error)");
        }
      };
      initAuth();
      return onAuthStateChanged(auth, setUser);
    }
  }, []);

  // 2. ROUTING LOGIC: Listen for "Shared Links" in the URL
  useEffect(() => {
    const path = window.location.pathname;
    
    // Check if the user went to http://localhost:5173/report/XYZ123
    if (path.startsWith('/report/')) {
      const reportId = path.split('/report/')[1];
      if (!reportId) return;

      setScanStatus('scanning');
      setScanStep('Loading shared report from database...');
      setScanProgress(50);

      const fetchSharedReport = async () => {
        try {
          if (db) {
            // Pull it from Firebase!
            const docRef = doc(db, 'scans', reportId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setReport(docSnap.data() as ScanResult);
              setScanStatus('results');
              setScanProgress(100);
              return;
            }
          }
          
          // If it fails or isn't in DB, fallback to backend memory (if still alive)
          const res = await fetch(`${API_URL}/report/${reportId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setReport(data as ScanResult);
              setScanStatus('results');
              setScanProgress(100);
              return;
            }
          }
          
          throw new Error("Report not found");
        } catch (err) {
          setScanStatus('error');
          setErrorMessage("This shared report could not be found. It may have expired or the link is incorrect.");
        }
      };

      fetchSharedReport();
    }
  }, [db]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput || !urlInput.includes('.') || urlInput.length < 4) {
      setInputError(true);
      setTimeout(() => setInputError(false), 2000);
      return;
    }
    setInputError(false);

    let formattedUrl = urlInput;
    if (!formattedUrl.startsWith('http')) formattedUrl = `https://${formattedUrl}`;

    // Clear URL bar if they were looking at an old report
    if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
    }

    setScanStatus('scanning');
    setScanProgress(5);
    setScanStep('Connecting to analysis server...');

    try {
      // Start Scan
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      }).catch((err) => {
        throw new Error('Connection Failed');
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      
      const { scanId } = await res.json();
      setScanProgress(20);
      setScanStep('Analysis engine started...');

      // Poll for Results
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_URL}/report/${scanId}`);
          if (statusRes.ok) {
            const data = (await statusRes.json()) as ScanResult;
            
            if (data.status === 'completed') {
              clearInterval(pollInterval);
              setReport(data);
              setScanStatus('results');
              setScanProgress(100);
              
              // Save to Database so "Share" works
              if (user && db) {
                try {
                  const docRef = doc(collection(db, 'scans'));
                  await setDoc(docRef, { ...data, userId: user.uid, createdAt: new Date() });
                  setShareLink(docRef.id);
                } catch(e) { console.error("Save failed", e); }
              }
            } else if (data.status === 'failed') {
              clearInterval(pollInterval);
              setScanStatus('error');
              setErrorMessage(data.error || 'The scan failed on the server.');
            } else {
              setScanStep('Analyzing accessibility tree...');
              setScanProgress(prev => Math.min(prev + 5, 90));
            }
          }
        } catch (pollErr) {
          console.error(pollErr);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setScanStatus('error');
      setErrorMessage('Could not connect to the Backend API. Make sure your local server is running on port 3000.');
    }
  };

  const loadDemoData = () => {
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/');
    
    const mockReport: ScanResult = {
        id: "demo-123",
        url: "https://example-nonprofit.org",
        timestamp: new Date().toISOString(),
        lighthouseScore: 72,
        status: "completed",
        violations: [
          {
            id: 'image-alt',
            impact: 'critical',
            title: 'Images must have alternate text',
            description: 'Ensure that the img element has an alt attribute or a role of none or presentation.',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
            elements: ['img.hero-banner', 'div.footer > img.logo'],
            wcag: ['1.1.1'],
            fixRecommendation: '<img src="..." alt="Descriptive text here" />',
            nonprofitExplanation: 'Screen readers cannot describe images to blind users without "Alt Text".'
          },
          {
            id: 'contrast',
            impact: 'serious',
            title: 'Elements must have sufficient color contrast',
            description: 'Ensure that the contrast ratio between foreground and background colors is at least 4.5:1.',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
            elements: ['button.donate-btn'],
            wcag: ['1.4.3'],
            fixRecommendation: 'Change color to #333333.',
            nonprofitExplanation: 'Text is too light to read for users with low vision.'
          }
        ]
    };
    setReport(mockReport);
    setScanStatus('results');
  };

  const downloadJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `access-audit-${report.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyShareLink = () => {
    if (!shareLink) {
        alert("This report hasn't been saved to the database yet. Try running a new scan!");
        return;
    }
    const link = `${window.location.origin}/report/${shareLink}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleIssue = (id: string) => {
    const newSet = new Set(expandedIssues);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIssues(newSet);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header onDemoClick={loadDemoData} />

      <main className="pt-16">
        
        {scanStatus === 'idle' && (
          <LandingPage 
            urlInput={urlInput} 
            setUrlInput={setUrlInput} 
            handleScan={handleScan}
            handleDemoScan={loadDemoData}
            inputError={inputError}
          />
        )}

        {scanStatus === 'error' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
             <div className="bg-red-50 border border-red-200 p-8 rounded-2xl max-w-lg text-center shadow-lg animate-in zoom-in duration-300">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h3>
                <p className="text-red-700 mb-6">{errorMessage}</p>

                <div className="flex gap-4 justify-center">
                  <button onClick={() => { window.history.pushState({}, '', '/'); setScanStatus('idle'); }} className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">Go Back</button>
                  <button onClick={loadDemoData} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm">Load Demo Data Instead</button>
                </div>
             </div>
          </div>
        )}

        {scanStatus === 'scanning' && (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                 <Loader2 className="relative h-16 w-16 text-teal-600 animate-spin mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">{scanStep}</h2>
              <p className="text-slate-500 mb-8 font-medium">Please wait a few seconds...</p>
              
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-teal-500 h-3 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {scanStatus === 'results' && report && (
          <div className="bg-slate-50 min-h-screen pb-20 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-40 print-hide">
              <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
                      <button onClick={() => { window.history.pushState({}, '', '/'); setScanStatus('idle'); }} className="hover:text-teal-600 transition-colors flex items-center gap-1">
                         <ChevronDown className="rotate-90 h-3 w-3" /> Back to Scanner
                      </button>
                      <span className="text-slate-300">|</span>
                      <span>Scan ID: {report.id}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 truncate max-w-2xl">{report.url}</h1>
                    <div className="flex gap-2">
                       <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-teal-500">
                         <Download className="h-4 w-4" /> PDF
                       </button>
                       <button onClick={downloadJSON} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm focus:ring-2 focus:ring-teal-500">
                         <Code className="h-4 w-4" /> JSON
                       </button>
                       <button 
                         onClick={copyShareLink} 
                         className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border rounded-lg transition-all shadow-sm ${copiedLink ? 'bg-green-50 text-green-700 border-green-200' : 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100'}`}
                       >
                         {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                         {copiedLink ? 'Copied Link!' : 'Share'}
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-700">Audit Score</p>
                      <p className="text-xs text-slate-500">Automated Checks</p>
                    </div>
                    <div className="relative">
                       <svg className="w-16 h-16 transform -rotate-90">
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * report.lighthouseScore) / 100} className={`${report.lighthouseScore > 80 ? 'text-green-500' : 'text-orange-500'} transition-all duration-1000 ease-out`} />
                       </svg>
                       <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-slate-800">{report.lighthouseScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="flex justify-center mb-8 print-hide">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
                  <button
                    onClick={() => setViewMode('nonprofit')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      viewMode === 'nonprofit' 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Nonprofit View
                  </button>
                  <button
                    onClick={() => setViewMode('developer')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                      viewMode === 'developer' 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    Developer View
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                 {report.violations.sort((a,b) => {
                     const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
                     return order[a.impact] - order[b.impact];
                  }).map((issue) => (
                    <div key={issue.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:border-teal-200 transition-colors">
                      <div 
                        onClick={() => toggleIssue(issue.id)}
                        className="p-6 cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <ImpactBadge impact={issue.impact} />
                            {viewMode === 'developer' && issue.wcag && (
                               <span className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                 WCAG {issue.wcag.join(', ')}
                               </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                             {viewMode === 'nonprofit' ? issue.nonprofitExplanation.split('.')[0] : issue.title}
                          </h4>
                          <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                            {viewMode === 'nonprofit' ? issue.nonprofitExplanation : issue.description}
                          </p>
                        </div>
                        <div className="text-slate-300 group-hover:text-teal-500 transition-colors print-hide">
                          {expandedIssues.has(issue.id) ? <ChevronUp /> : <ChevronDown />}
                        </div>
                      </div>

                      {/* On print, we force this section to always show */}
                      <div className={`${expandedIssues.has(issue.id) ? 'block' : 'hidden'} print:block px-6 pb-6 pt-0 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200`}>
                        <div className="mt-6 grid md:grid-cols-2 gap-8">
                          <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Activity className="h-3 w-3" /> {viewMode === 'nonprofit' ? 'The Impact' : 'Technical Description'}
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed mb-6">
                              {viewMode === 'nonprofit' ? issue.nonprofitExplanation : issue.description}
                            </p>
                            
                            {viewMode === 'developer' && (
                              <>
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Code className="h-3 w-3" /> Failing Selectors
                                </h5>
                                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                                  {issue.elements.map((el, i) => (
                                    <div key={i} className="text-xs font-mono text-teal-400 mb-1 border-b border-slate-800 last:border-0 pb-1 last:pb-0">
                                      {el}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          <div>
                             <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                               <CheckCircle className="h-3 w-3" /> {viewMode === 'nonprofit' ? 'Recommended Fix' : 'Code Solution'}
                             </h5>
                             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                               {viewMode === 'nonprofit' ? (
                                 <div className="text-sm text-slate-700">
                                   <p className="mb-3 font-medium">Forward this to your web team:</p>
                                   <ul className="space-y-2">
                                     <li className="flex gap-2">
                                       <span className="text-teal-500 font-bold">•</span>
                                       Identify the specific elements causing this issue.
                                     </li>
                                     <li className="flex gap-2">
                                       <span className="text-teal-500 font-bold">•</span>
                                       Apply standard HTML/CSS fixes to resolve the barrier.
                                     </li>
                                   </ul>
                                 </div>
                               ) : (
                                 <pre className="text-xs font-mono text-teal-800 bg-teal-50/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap border border-teal-100/50">
                                   {issue.fixRecommendation}
                                 </pre>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}