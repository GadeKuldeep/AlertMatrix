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

// ... (keep interfaces and schema same)
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
                // If it doesn't have a protocol, add one for URL parsing
                const urlStr = val.match(/^https?:\/\//) ? val : `https://${val}`;
                const url = new URL(urlStr);
                return url.hostname;
            } catch {
                // Fallback to simple cleaning if URL parsing fails
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
        <div className="flex min-h-screen bg-gray-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                        AlertMatrix
                    </h1>
                </div>
                <nav className="mt-6 space-y-2 px-4">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-gray-400" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="flex items-center gap-3 px-4 py-3 text-white bg-gray-800 rounded-md transition-colors">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Domains
                    </Link>
                    <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Reports
                    </Link>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.subscriptionPlan} Plan</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-white">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-950 overflow-y-auto">
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 md:px-12 bg-gray-900/50 backdrop-blur-sm">
                    <h2 className="text-lg font-medium text-white">Domain Management</h2>
                </header>

                <div className="p-8 md:p-12 max-w-5xl mx-auto">
                    {/* Add Domain Form */}
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-white">Add New Domain</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-start">
                            <div className="flex-1">
                                <Input
                                    {...register('domain')}
                                    placeholder="example.com"
                                    className="bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-purple-500"
                                />
                                {errors.domain && <p className="text-xs text-red-400 mt-1">{errors.domain.message}</p>}
                            </div>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Add Domain
                            </Button>
                        </form>
                    </div>

                    {/* Domain List */}
                    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                            <h3 className="font-medium text-gray-300">Your Domains</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading domains...</div>
                        ) : domains.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No domains added yet.</div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {domains.map((domain) => (
                                    <div key={domain._id} className="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-medium text-white">{domain.domain}</span>
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
                                                <div className="mt-2 text-sm text-gray-400 bg-gray-950 p-2 rounded border border-gray-800 font-mono">
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
