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
                        <LayoutDashboard className="w-5 h-5 text-blue-400" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Domains
                    </Link>
                    <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                        <FileText className="w-5 h-5 text-green-400" />
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
            <main className="flex-1 bg-gray-950">
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 md:px-12 bg-gray-900/50 backdrop-blur-sm">
                    <h2 className="text-lg font-medium text-white">Dashboard Overview</h2>
                    <div className="md:hidden">
                        {/* Mobile Menu Trigger would go here */}
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe className="w-24 h-24 text-blue-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-400">Total Domains</h3>
                            <div className="mt-2 text-3xl font-bold text-white">1</div>
                            <div className="mt-2 flex items-center text-xs text-blue-400">
                                <span className="bg-blue-400/10 px-2 py-0.5 rounded-full">Starter Plan</span>
                                <span className="ml-2 text-gray-500">1 / 1 Used</span>
                            </div>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText className="w-24 h-24 text-green-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-400">Last Scan</h3>
                            <div className="mt-2 text-3xl font-bold text-white">98%</div>
                            <div className="mt-2 text-xs text-green-400">
                                Low Risk
                            </div>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LayoutDashboard className="w-24 h-24 text-purple-500" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-400">System Status</h3>
                            <div className="mt-2 text-3xl font-bold text-white">Operational</div>
                            <div className="mt-2 text-xs text-gray-500">
                                All scanners active
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link to="/domains" className="block w-full">
                                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-gray-700 hover:bg-gray-800 hover:text-white">
                                        <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                                            <Globe className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Manage Domains</div>
                                            <div className="text-xs text-gray-400">Add or verify your domains</div>
                                        </div>
                                    </Button>
                                </Link>
                                <Link to="/reports" className="block w-full">
                                    <Button variant="outline" className="w-full justify-start text-left h-auto p-4 border-gray-700 hover:bg-gray-800 hover:text-white">
                                        <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                                            <FileText className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium">View Reports</div>
                                            <div className="text-xs text-gray-400">Check security scan results</div>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex items-center justify-center text-gray-500">
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
