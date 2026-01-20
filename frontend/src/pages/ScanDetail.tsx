import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';
import './ScanDetail.css';

export default function ScanReportDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [scan, setScan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchScanDetail = async () => {
        try {
            const res = await api.get(`/scans/detail/${id}`);
            setScan(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchScanDetail();
    }, [id]);

    if (loading) return <div className="loading-state">Loading Report...</div>;
    if (!scan) return <div className="error-state">Report not found</div>;

    const getStatusColor = (score: number) => {
        if (score <= 30) return 'text-green-500';
        if (score <= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStatusText = (score: number) => {
        if (score <= 30) return 'Secure';
        if (score <= 70) return 'Attention Required';
        return 'High Risk';
    };

    const countSeverity = (severity: string) => scan.findings.filter((f: any) => f.severity === severity).length;

    const enrichedFindings = scan.findings.map((f: any) => {
        const advice = {
            why: "This vulnerability exposes your users to potential attacks and indicates a security misconfiguration.",
            rec: "Remediate this issue according to standard security practices."
        };
        const title = f.title.toUpperCase();

        if (title.includes('SSL') || title.includes('TLS')) {
            advice.why = "Valid certificates directly impact data privacy, user trust, and SEO. Invalid or expired certificates break encryption, expose users to man-in-the-middle attacks, and cause browser warnings that damage your brand.";
            advice.rec = "Renew the certificate immediately and configure automatic renewal to ensure continuous secure communication.";
        } else if (title.includes('HEADER')) {
            advice.why = "Security headers are your browser's first line of defense. Missing headers (like HSTS, CSP, or X-Frame-Options) leave users vulnerable to session hijacking, clickjacking, and cross-site scripting (XSS).";
            advice.rec = "Configure the web server to include recommended HTTP security headers to enforce strict browser-side security.";
        } else if (title.includes('PORT')) {
            advice.why = "Unexpectedly open ports are 'low-hanging fruit' for automated scans. They may expose administrative interfaces or internal services that should not be visible to the public internet.";
            advice.rec = "Close unnecessary ports and implement strict firewall rules to minimize your external attack surface.";
        } else if (title.includes('SPF') || title.includes('DKIM') || title.includes('DMARC') || title.includes('EMAIL')) {
            advice.why = "Missing email security records allow attackers to spoof your domain and send malicious emails in your name. This leads to brand damage, phishing attacks, and poor email deliverability.";
            advice.rec = "Implement valid SPF, DKIM, and DMARC records in your DNS settings to authenticate your outgoing mail.";
        } else if (title.includes('DNS') || title.includes('RECORDS')) {
            advice.why = "DNS misconfigurations can lead to service outages, subdomain takeover, or traffic interception. Proper DNS management is critical for site availability and routing integrity.";
            advice.rec = "Review your DNS zone file, remove stale records, and ensure nameserver configurations follow best practices.";
        } else if (title.includes('VERSION') || title.includes('SERVER')) {
            advice.why = "Revealing exact software versions or verbose error messages aids attackers during reconnaissance, allowing them to target specific known vulnerabilities in your infrastructure.";
            advice.rec = "Disable server signatures and configure custom error pages to prevent information leakage to potential attackers.";
        } else if (title.includes('AVAILABILITY') || title.includes('HTTP')) {
            advice.why = "Service availability is the most basic measure of business continuity. Unencrypted HTTP traffic or unexpected downtime leads to lost revenue and severe reputation damage.";
            advice.rec = "Ensure 24/7 monitoring is active and enforce HTTPS-only traffic for all web services.";
        }
        return { ...f, ...advice };
    });

    return (
        <div className="scan-report-page">
            <header className="report-header">
                <div className="header-container">
                    <div className="header-top">
                        <button onClick={() => navigate('/reports')} className="btn btn-outline back-button">
                            <ArrowLeft className="icon-sm mr-2" /> Back
                        </button>
                        <div className="header-meta">
                            <h1 className="header-title">Domain Security Scan Report</h1>
                            <p className="header-subtitle">Confidential & Proprietary</p>
                        </div>
                    </div>

                    <div className="header-grid">
                        <div className="meta-info-list">
                            <div className="meta-info-item">
                                <span className="meta-label">Target Domain:</span>
                                <span className="meta-value">{scan.domain?.domain}</span>
                            </div>
                            <div className="meta-info-item">
                                <span className="meta-label">Scan ID:</span>
                                <span>{scan._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="meta-info-item">
                                <span className="meta-label">Scan Date:</span>
                                <span>{new Date(scan.startedAt).toLocaleString()}</span>
                            </div>
                            <div className="meta-info-item">
                                <span className="meta-label">Scan Type:</span>
                                <span>Automated Non-Intrusive</span>
                            </div>
                        </div>

                        <div className="status-badge-card">
                            <h3 className="status-label">Overall Status</h3>
                            <div className={`status-value ${getStatusColor(scan.riskScore)}`}>
                                {scan.riskScore > 70 ? <XCircle className="icon-lg" /> :
                                    scan.riskScore > 30 ? <AlertTriangle className="icon-lg" /> : <CheckCircle className="icon-lg" />}
                                {getStatusText(scan.riskScore)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="report-main">
                <section>
                    <h2 className="section-title">2. Executive Summary</h2>
                    <div className="summary-grid">
                        <div className="risk-score-card">
                            <div className="risk-score-label">Overall Risk Score</div>
                            <div className={`risk-score-value ${getStatusColor(scan.riskScore)}`}>
                                {scan.riskScore}<span className="risk-score-total">/100</span>
                            </div>
                        </div>
                        <div className="summary-details">
                            <h3 className="findings-count-title">Summary of Findings</h3>
                            <table className="findings-table">
                                <thead className="table-head">
                                    <tr>
                                        <th className="table-cell">Severity</th>
                                        <th className="table-cell">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-row">
                                        <td className="table-cell severity-critical">Critical</td>
                                        <td className="table-cell meta-value">{countSeverity('critical')}</td>
                                    </tr>
                                    <tr className="table-row">
                                        <td className="table-cell severity-high">High</td>
                                        <td className="table-cell meta-value">{countSeverity('high')}</td>
                                    </tr>
                                    <tr className="table-row">
                                        <td className="table-cell severity-medium">Medium</td>
                                        <td className="table-cell meta-value">{countSeverity('medium')}</td>
                                    </tr>
                                    <tr className="table-row">
                                        <td className="table-cell severity-low">Low</td>
                                        <td className="table-cell meta-value">{countSeverity('low')}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="plain-summary-box">
                                <strong>Plain-English Summary:</strong> <br />
                                {scan.riskScore === 0 ?
                                    "The domain is operational and passed all basic security checks. No immediate action is required, but continuous monitoring is recommended." :
                                    "The domain is operational but has security misconfigurations that could be exploited. Immediate attention is recommended for the highlighted high-risk items."}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="section-title">3. Scan Scope & Methodology</h2>
                    <div className="scope-grid">
                        <div>
                            <h4 className="scope-list-title">Scope of Scan</h4>
                            <ul className="scope-list">
                                <li>Website availability monitoring</li>
                                <li>SSL/TLS certificate validation</li>
                                <li>Open common port detection (80, 443, 8080, 8443)</li>
                                <li>HTTP security header analysis</li>
                                <li>Basic server misconfiguration checks</li>
                            </ul>
                        </div>
                        <div className="notes-box">
                            <h4 className="scope-list-title">Important Notes</h4>
                            <ul className="scope-list">
                                <li>No exploitation was performed</li>
                                <li>No credentials were used</li>
                                <li>No intrusive or destructive testing was conducted</li>
                                <li>This scan reflects the domain’s condition at the time of testing</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="section-title">4. Domain & Infrastructure Overview</h2>
                    <table className="infrastructure-table">
                        <tbody>
                            <tr className="table-row">
                                <td className="infra-label-cell">Domain Name</td>
                                <td className="infra-value-cell">{scan.domain?.domain}</td>
                            </tr>
                            <tr className="table-row">
                                <td className="infra-label-cell">SSL Status</td>
                                <td className="infra-value-cell">
                                    {scan.rawResult?.ssl?.valid ?
                                        <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle className="icon-sm" /> Valid</span> :
                                        <span className="text-red-600 font-bold flex items-center gap-2"><XCircle className="icon-sm" /> Invalid</span>
                                    }
                                </td>
                            </tr>
                            <tr className="table-row">
                                <td className="infra-label-cell">Open Ports</td>
                                <td className="infra-value-cell meta-value">
                                    {scan.rawResult?.open_ports?.length ? scan.rawResult.open_ports.join(', ') : 'None detected'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="why-matters-detailed-section">
                    <h2 className="section-title">5. Why Each Component of this Scan Matters</h2>
                    <div className="why-matters-text">
                        <p className="intro-text">
                            Based on a comprehensive analysis of cybersecurity principles, threat landscapes, and operational best practices,
                            this scan serves as a <strong>foundational security and operational health assessment</strong>.
                            It identifies critical, often overlooked weaknesses that are the most common causes of outages and breaches.
                        </p>

                        <div className="why-grid">
                            <div className="why-card">
                                <h3>1. Website Availability Monitoring</h3>
                                <p><strong>Significance:</strong> This is the most basic measure of your <strong>business continuity and reputation</strong>. If your website or web service is down, you are losing revenue and damaging customer trust. Reliability is as crucial as security.</p>
                            </div>

                            <div className="why-card">
                                <h3>2. SSL/TLS Certificate Validation</h3>
                                <p><strong>Significance:</strong> Directly impacts <strong>data privacy and SEO</strong>. Valid certificates ensure data is encrypted and prevent browsers from warning users away with "Not Secure" alerts, which cause immediate abandonment.</p>
                            </div>

                            <div className="why-card">
                                <h3>3. Open Common Port Detection</h3>
                                <p><strong>Significance:</strong> Identifies <strong>exposure and misconfiguration</strong>. Unexpectedly open ports (like 8080/8443) are low-hanging fruit for attackers, often revealing internal management panels or administrative interfaces.</p>
                            </div>

                            <div className="why-card">
                                <h3>4. HTTP Security Header Analysis</h3>
                                <p><strong>Significance:</strong> These are your <strong>browser's first line of defense</strong>. They are critical for client-side security, protecting against clickjacking, cross-site scripting (XSS), and MIME-sniffing attacks.</p>
                            </div>

                            <div className="why-card">
                                <h3>5. Basic Server Misconfiguration Checks</h3>
                                <p><strong>Significance:</strong> Look for <strong>information leakage</strong>. Revealing exact software versions or verbose error messages aids attackers during reconnaissance, allowing them to target specific known vulnerabilities.</p>
                            </div>
                        </div>

                        <div className="conclusion-box-light">
                            <p>
                                <strong>Conclusion:</strong> Getting the fundamentals right eliminates a massive portion of the risk you face.
                                This proactive assessment creates a clear, actionable checklist to harden your system *before* a malicious actor finds these weaknesses.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="section-title">6. Detailed Findings</h2>

                    {enrichedFindings.length === 0 ? (
                        <p className="text-muted-foreground text-italic">No security findings were detected during this scan.</p>
                    ) : (
                        <div className="findings-list">
                            {enrichedFindings.map((finding: any, idx: number) => (
                                <div key={idx} className="finding-card">
                                    <div className={`finding-header ${finding.severity === 'critical' ? 'bg-red-900/20' :
                                        finding.severity === 'high' ? 'bg-primary/20' : 'bg-yellow-900/20'
                                        }`}>
                                        <h3 className="finding-title">
                                            {finding.severity === 'critical' ? <span className="severity-icon-critical">🔴</span> :
                                                finding.severity === 'high' ? <span className="severity-icon-high">🟠</span> :
                                                    <span className="severity-icon-medium">🟡</span>}
                                            Finding #{idx + 1}: {finding.title}
                                        </h3>
                                        <span className="finding-severity-badge">
                                            {finding.severity}
                                        </span>
                                    </div>
                                    <div className="finding-body">
                                        <div className="finding-meta-grid">
                                            <div><strong>Affected Component:</strong> Web Server / Configuration</div>
                                            <div><strong>Detected On:</strong> {new Date(scan.completedAt).toLocaleDateString()}</div>
                                        </div>

                                        <div>
                                            <h4 className="finding-section-title">Description</h4>
                                            <p className="finding-text">{finding.description}</p>
                                        </div>

                                        <div>
                                            <h4 className="finding-section-title">Why This Matters</h4>
                                            <p className="finding-text">{finding.why}</p>
                                        </div>

                                        <div className="recommendation-box">
                                            <h4 className="recommendation-title">Recommendation</h4>
                                            <p className="recommendation-text">{finding.rec}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="disclaimer-section">
                    <h4 className="disclaimer-title"><Shield className="icon-sm mr-2" /> Disclaimer</h4>
                    <p>
                        This report is based on an automated, non-intrusive security scan conducted by AlertMatrix.
                        It does not guarantee the absence of all security vulnerabilities. Findings represent a point-in-time assessment.
                        AlertMatrix is not liable for any damages or losses resulting from the use or misuse of this information.
                    </p>
                </section>

                <footer className="report-footer">
                    <p className="footer-company">AlertMatrix Security</p>
                    <p className="footer-contact">support@alertmatrix.in | alertmatrix.in</p>
                </footer>
            </main>
        </div >
    );
}
