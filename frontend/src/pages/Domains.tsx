import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle, XCircle, Trash2, RefreshCw, LayoutDashboard, Globe, FileText, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


interface Domain {
    _id: string;
    domain: string;
    isVerified: boolean;
    verificationToken: string;
    riskScore?: number;
}

const domainSchema = z.object({
    domain: z.string()
        .transform((val) => {
            try {
                const urlStr = val.match(/^https?:\/\//) ? val : `https://${val}`;
                const url = new URL(urlStr);
                return url.hostname;
            } catch {
                return val.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0];
            }
        })
        .pipe(z.string().min(3, 'Domain is required').regex(/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, 'Invalid domain format')),
});

type DomainFormData = z.infer<typeof domainSchema>;

export default function Domains() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DomainFormData>({
        resolver: zodResolver(domainSchema),
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchDomains = async () => {
        try {
            const res = await api.get('/domains');
            setDomains(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const onSubmit = async (data: DomainFormData) => {
        try {
            await api.post('/domains', data);
            reset();
            fetchDomains();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add domain');
        }
    };

    const handleVerify = async (id: string) => {
        try {
            await api.post(`/domains/${id}/verify`);
            fetchDomains();
            await api.post(`/domains/${id}/verify`);
            fetchDomains();
            alert('Domain verified successfully! You can now start the test.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Verification failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/domains/${id}`);
            fetchDomains();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleScan = async (id: string) => {
        try {
            if (!confirm('Start a new security scan for this domain?')) return;
            await api.post('/scans', { domainId: id });
            alert('Scan started successfully! Check Reports page for details.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Scan failed to start');
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {}
            <aside className="w-64 border-r border-border bg-card hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 text-transparent bg-clip-text">
                        AlertMatrix
                    </h1>
                </div>
                <nav className="mt-6 space-y-2 px-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="flex items-center gap-3 px-4 py-3 text-foreground bg-accent rounded-md transition-colors">
                        <Globe className="w-5 h-5 text-primary" />
                        Domains
                    </Link>
                    <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
                        <FileText className="w-5 h-5 text-muted-foreground" />
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

            {}
            <main className="flex-1 bg-background overflow-y-auto">
                <header className="h-16 border-b border-border flex items-center justify-between px-8 md:px-12 bg-card/50 backdrop-blur-sm">
                    <h2 className="text-lg font-medium text-foreground">Domain Management</h2>
                </header>

                <div className="p-8 md:p-12 max-w-5xl mx-auto">
                    {}
                    <div className="bg-card p-6 rounded-lg border border-border mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Domain</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-start">
                            <div className="flex-1">
                                <Input
                                    {...register('domain')}
                                    placeholder="example.com"
                                    className="bg-background border-border text-foreground placeholder:text-gray-600 focus:border-primary"
                                />
                                {errors.domain && <p className="text-xs text-red-400 mt-1">{errors.domain.message}</p>}
                            </div>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-foreground">
                                <Plus className="w-4 h-4 mr-2" /> Add Domain
                            </Button>
                        </form>
                    </div>

                    {}
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <div className="p-4 border-b border-border bg-accent/50">
                            <h3 className="font-medium text-muted-foreground">Your Domains</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading domains...</div>
                        ) : domains.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No domains added yet.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {domains.map((domain) => (
                                    <div key={domain._id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-medium text-foreground">{domain.domain}</span>
                                                {domain.isVerified ? (
                                                    <span className="flex items-center text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-xs text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded-full border border-yellow-900">
                                                        <XCircle className="w-3 h-3 mr-1" /> Unverified
                                                    </span>
                                                )}
                                            </div>
                                            {!domain.isVerified && (
                                                <div className="mt-2 text-sm text-muted-foreground bg-background p-2 rounded border border-border font-mono">
                                                    TXT Record: <span className="text-yellow-500 select-all">{domain.verificationToken}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {domain.isVerified && (
                                                <Button variant="secondary" size="sm" onClick={() => handleScan(domain._id)} className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 border border-blue-600/20">
                                                    Start Security Test
                                                </Button>
                                            )}
                                            {!domain.isVerified && (
                                                <Button variant="secondary" size="sm" onClick={() => handleVerify(domain._id)} className="bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20 hover:text-yellow-300 border border-yellow-600/20">
                                                    Verify DNS
                                                </Button>
                                            )}
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(domain._id)}>
                                                <Trash2 className="w-4 h-4" />
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
