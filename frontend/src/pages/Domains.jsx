import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { Plus, CheckCircle, XCircle, Trash2, Globe, FileText, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Domains.css';


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


export default function Domains() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
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

    const onSubmit = async (data) => {
        try {
            await api.post('/domains', data);
            reset();
            fetchDomains();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add domain');
        }
    };

    const handleVerify = async (id) => {
        try {
            await api.post(`/domains/${id}/verify`);
            fetchDomains();
            alert('Domain verified successfully! You can now start the test.');
        } catch (error) {
            alert(error.response?.data?.message || 'Verification failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/domains/${id}`);
            fetchDomains();
        } catch (error) {
            alert(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleScan = async (id) => {
        try {
            if (!confirm('Start a new security scan for this domain?')) return;
            await api.post('/scans', { domainId: id });
            alert('Scan started successfully! Check Reports page for details.');
        } catch (error) {
            alert(error.response?.data?.message || 'Scan failed to start');
        }
    };

    return (
        <div className="domains-layout">
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
                    <Link to="/domains" className="nav-item-active">
                        <Globe className="nav-icon-active" />
                        Domains
                    </Link>
                    <Link to="/reports" className="nav-item-inactive">
                        <FileText className="nav-icon-inactive" />
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
                    <h2 className="page-title">Domain Management</h2>
                </header>

                <div className="content-wrapper">
                    <div className="add-domain-card">
                        <h2 className="card-title">Add New Domain</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="add-domain-form">
                            <div className="input-container">
                                <input
                                    {...register('domain')}
                                    placeholder="example.com"
                                    className="form-input"
                                />
                                {errors.domain && <p className="error-message">{errors.domain.message}</p>}
                            </div>
                            <button type="submit" className="add-button">
                                <Plus className="icon-sm mr-2" /> Add Domain
                            </button>
                        </form>
                    </div>

                    <div className="domain-list-container">
                        <div className="list-header">
                            <h3 className="list-title">Your Domains</h3>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading domains...</div>
                        ) : domains.length === 0 ? (
                            <div className="empty-state">No domains added yet.</div>
                        ) : (
                            <div className="domain-list">
                                {domains.map((domain) => (
                                    <div key={domain._id} className="domain-item">
                                        <div>
                                            <div className="domain-info-row">
                                                <span className="domain-name">{domain.domain}</span>
                                                {domain.isVerified ? (
                                                    <span className="verified-badge">
                                                        <CheckCircle className="icon-xs mr-1" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="unverified-badge">
                                                        <XCircle className="icon-xs mr-1" /> Unverified
                                                    </span>
                                                )}
                                            </div>
                                            {!domain.isVerified && (
                                                <div className="verification-box">
                                                    TXT Record: <span className="token-value">{domain.verificationToken}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="action-buttons">
                                            {domain.isVerified && (
                                                <button onClick={() => handleScan(domain._id)} className="test-button">
                                                    Start Security Test
                                                </button>
                                            )}
                                            {!domain.isVerified && (
                                                <button onClick={() => handleVerify(domain._id)} className="verify-button">
                                                    Verify DNS
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(domain._id)} className="btn btn-destructive" style={{ padding: '0.25rem 0.5rem' }}>
                                                <Trash2 className="icon-sm" />
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
