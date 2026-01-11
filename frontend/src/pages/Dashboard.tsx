import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Globe, FileText, LogOut } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h1 className="logo-text">
                        AlertMatrix
                    </h1>
                </div>
                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-item">
                        <LayoutDashboard className="nav-icon" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="nav-item">
                        <Globe className="nav-icon" />
                        Domains
                    </Link>
                    <Link to="/reports" className="nav-item">
                        <FileText className="nav-icon" />
                        Reports
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-info">
                            <p className="user-email">{user?.email}</p>
                            <p className="user-plan">{user?.subscriptionPlan} Plan</p>
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            <LogOut className="icon-sm" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h2 className="page-title">Dashboard</h2>
                    <div className="md:hidden">
                        { }
                    </div>
                </header>

                <div className="content-wrapper">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-bg">
                                <Globe className="stat-icon-large" />
                            </div>
                            <h3 className="stat-label">Total Domains</h3>
                            <div className="stat-value">1</div>
                            <div className="stat-footer">
                                <span className="stat-badge">Starter Plan</span>
                                <span className="stat-detail">1 / 1 Used</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-bg">
                                <FileText className="stat-icon-large" />
                            </div>
                            <h3 className="stat-label">Last Scan</h3>
                            <div className="stat-value">98%</div>
                            <div className="stat-footer">
                                Low Risk
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-bg">
                                <LayoutDashboard className="stat-icon-large" />
                            </div>
                            <h3 className="stat-label">System Status</h3>
                            <div className="stat-value">Operational</div>
                            <div className="stat-footer">
                                All scanners active
                            </div>
                        </div>
                    </div>

                    <div className="actions-grid">
                        <div className="action-card">
                            <h3 className="card-title">Quick Actions</h3>
                            <div className="action-list">
                                <Link to="/domains" className="action-button-trigger">
                                    <button className="action-button">
                                        <div className="action-icon-wrapper">
                                            <Globe className="action-icon" />
                                        </div>
                                        <div>
                                            <div className="action-info-title">Manage Domains</div>
                                            <div className="action-info-desc">Add or verify your domains</div>
                                        </div>
                                    </button>
                                </Link>
                                <Link to="/reports" className="action-button-trigger">
                                    <button className="action-button">
                                        <div className="action-icon-wrapper">
                                            <FileText className="action-icon" />
                                        </div>
                                        <div>
                                            <div className="action-info-title">View Reports</div>
                                            <div className="action-info-desc">Check security scan results</div>
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="placeholder-card">
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
