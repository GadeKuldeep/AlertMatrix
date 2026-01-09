import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Globe, FileText, LogOut } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
                        <Globe className="w-5 h-5 text-primary" />
                        Domains
                    </Link>
                    <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-md transition-colors">
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
            <main className="flex-1 bg-background">
                <header className="h-16 border-b border-border flex items-center justify-between px-8 md:px-12 bg-card/50 backdrop-blur-sm">
                    <h2 className="text-lg font-medium text-foreground">Dashboard Overview</h2>
                    <div className="md:hidden">
                        {/* Mobile Menu Trigger would go here */}
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe className="w-24 h-24 text-primary" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Domains</h3>
                            <div className="mt-2 text-3xl font-bold text-foreground">1</div>
                            <div className="mt-2 flex items-center text-xs text-primary">
                                <span className="bg-primary/10 px-2 py-0.5 rounded-full">Starter Plan</span>
                                <span className="ml-2 text-muted-foreground">1 / 1 Used</span>
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-24 h-24 text-primary" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Last Scan</h3>
                            <div className="mt-2 text-3xl font-bold text-foreground">98%</div>
                            <div className="mt-2 text-xs text-primary">
                                Low Risk
                            </div>
                        </div>

                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LayoutDashboard className="w-24 h-24 text-primary" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
                            <div className="mt-2 text-3xl font-bold text-foreground">Operational</div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                All scanners active
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card rounded-xl border border-border p-6">
                            <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link to="/domains" className="block w-full">
                                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-border hover:bg-accent hover:text-foreground">
                                        <div className="bg-primary/20 p-2 rounded-lg mr-4">
                                            <Globe className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Manage Domains</div>
                                            <div className="text-xs text-muted-foreground">Add or verify your domains</div>
                                        </div>
                                    </Button>
                                </Link>
                                <Link to="/reports" className="block w-full">
                                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-border hover:bg-accent hover:text-foreground">
                                        <div className="bg-primary/20 p-2 rounded-lg mr-4">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium">View Reports</div>
                                            <div className="text-xs text-muted-foreground">Check security scan results</div>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p>Recent Activity Chart Placeholder</p>
                                <span className="text-xs opacity-50">(Coming in Phase 4)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
