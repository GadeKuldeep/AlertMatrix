import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LayoutDashboard, Globe, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import './Reports.css';

export default function Reports() {
    const { user, logout } = useAuthStore();
    const [scans, setScans] = useState([]);
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
                    allScans.push(...sRes.data.map((s) => ({ ...s, domain: d })));
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
        <div className="reports-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h1 className="logo-text">
                        AlertMatrix
                    </h1>
                </div>
                <nav className="nav-menu">
                    <Link to="/dashboard" className="nav-item-inactive">
                        <LayoutDashboard className="nav-icon-inactive" />
                        Dashboard
                    </Link>
                    <Link to="/domains" className="nav-item-inactive">
                        <Globe className="nav-icon-inactive" />
                        Domains
                    </Link>
                    <Link to="/reports" className="nav-item-active">
                        <FileText className="nav-icon-active" />
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
                            <LogOut className="icon-md" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h2 className="page-title">Security Reports</h2>
                </header>

                <div className="content-wrapper">
                    <div className="reports-card">
                        <div className="list-header">
                            <h3 className="list-title">Recent Scans</h3>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading reports...</div>
                        ) : scans.length === 0 ? (
                            <div className="empty-state">No reports available. Start a scan from Domain Management.</div>
                        ) : (
                            <div className="reports-list">
                                {scans.map((scan) => (
                                    <div key={scan._id} className="report-item">
                                        <div className="report-main-info">
                                            <div className={`status-icon-wrapper ${scan.status === 'completed' ? 'status-completed' :
                                                scan.status === 'failed' ? 'status-failed' : 'status-pending'
                                                }`}>
                                                {scan.status === 'completed' ? <CheckCircle className="icon-md" /> :
                                                    scan.status === 'failed' ? <AlertTriangle className="icon-md" /> : <Clock className="icon-md" />}
                                            </div>

                                            <div className="domain-info">
                                                <div className="domain-name">{scan.domain.domain}</div>
                                                <div className="scan-date">
                                                    {new Date(scan.startedAt).toLocaleDateString()} {new Date(scan.startedAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="report-stats">
                                            <div className="risk-score-container">
                                                <div className="risk-label">Risk Score</div>
                                                <div className={`risk-value ${(scan.riskScore || 0) > 70 ? 'risk-high' :
                                                    (scan.riskScore || 0) > 30 ? 'risk-medium' : 'risk-low'
                                                    }`}>
                                                    {scan.riskScore ?? '-'} / 100
                                                </div>
                                            </div>

                                            <button onClick={() => navigate(`/reports/${scan._id}`)} className="view-button">
                                                <FileText className="icon-sm mr-2" /> View Report
                                            </button>
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
