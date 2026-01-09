import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LayoutDashboard, Globe, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Scan {
  _id: string;
  domain: {
    domain: string;
    _id: string;
  };
  status: string;
  riskScore: number;
  startedAt: string;
  completedAt: string;
  findings: any[];
}

export default function Reports() {
  const { user, logout } = useAuthStore();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchScans = async () => {
    try {
      const domainsRes = await api.get('/domains');
      const domains = domainsRes.data;

      const allScans = [];
      for (const d of domains) {
        try {
          const sRes = await api.get(`/scans/${d._id}`);
          allScans.push(...sRes.data.map((s: any) => ({ ...s, domain: d })));
        } catch (e) {
          console.error(`Failed to fetch scans for ${d.domain}`, e);
        }
      }

      allScans.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      setScans(allScans);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 text-transparent bg-clip-text">
            AlertMatrix
          </h1>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
            <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
            Dashboard
          </Link>
          <Link to="/domains" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
            <Globe className="w-5 h-5 text-primary" />
            Domains
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-foreground bg-accent rounded-md transition-colors">
            <FileText className="w-5 h-5 text-primary" />
            Reports
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.subscriptionPlan} Plan</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background overflow-y-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 md:px-12 bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-foreground">Security Reports</h2>
        </header>

        <div className="p-8 md:p-12 max-w-6xl mx-auto">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-accent/50">
              <h3 className="font-medium text-muted-foreground">Recent Scans</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
            ) : scans.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No reports available. Start a scan from Domain Management.</div>
            ) : (
              <div className="divide-y divide-border">
                {scans.map((scan) => (
                  <div key={scan._id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${scan.status === 'completed' ? 'bg-green-900/20 text-primary' :
                        scan.status === 'failed' ? 'bg-red-900/20 text-red-400' : 'bg-primary/20 text-primary'
                        }`}>
                        {scan.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                          scan.status === 'failed' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="font-medium text-foreground">{scan.domain.domain}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(scan.startedAt).toLocaleDateString()} {new Date(scan.startedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Risk Score</div>
                        <div className={`text-xl font-bold ${(scan.riskScore || 0) > 70 ? 'text-red-500' :
                          (scan.riskScore || 0) > 30 ? 'text-yellow-500' : 'text-primary'
                          }`}>
                          {scan.riskScore ?? '-'} / 100
                        </div>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => navigate(`/reports/${scan._id}`)}>
                        <FileText className="w-4 h-4 mr-2" /> View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
