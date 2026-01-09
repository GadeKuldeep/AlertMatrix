import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, XCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ScanReportDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
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

    if (loading) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading Report...</div>;
    if (!scan) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Report not found</div>;

    // --- Helpers for Dynamic Content ---
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

    // Enrich findings with static advice if missing from backend
    const enrichedFindings = scan.findings.map((f: any) => {
        let advice = {
            why: "This vulnerability exposes your users to potential attacks.",
            rec: "Remediate this issue according to standard security practices."
        };
        if (f.title.includes('SSL')) {
            advice.why = "Expired or invalid certificates break trust, expose users to man-in-the-middle attacks, and negatively impact SEO.";
            advice.rec = "Renew the SSL certificate immediately and configure automatic renewal.";
        } else if (f.title.includes('Headers')) {
            advice.why = "Missing headers increase exposure to clickjacking and XSS attacks.";
            advice.rec = "Configure the web server to include recommended HTTP security headers.";
        } else if (f.title.includes('Port') || f.title.includes('HTTP')) {
            advice.why = "Unencrypted communication allows attackers to intercept sensitive data.";
            advice.rec = "Close unnecessary ports and enforce HTTPS.";
        }
        return { ...f, ...advice };
    });

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* 1. Report Header */}
            <header className="bg-card border-b border-border p-8 print:p-0">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <Button variant="outline" size="sm" onClick={() => navigate('/reports')} className="print:hidden mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <div className="text-right hidden md:block">
                            <h1 className="text-2xl font-bold text-foreground">Domain Security Scan Report</h1>
                            <p className="text-sm text-muted-foreground">Confidential & Proprietary</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-border py-1">
                                <span className="font-semibold text-muted-foreground">Target Domain:</span>
                                <span className="font-mono">{scan.domain?.domain}</span>
                            </div>
                            <div className="flex justify-between border-b border-border py-1">
                                <span className="font-semibold text-muted-foreground">Scan ID:</span>
                                <span>{scan._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between border-b border-border py-1">
                                <span className="font-semibold text-muted-foreground">Scan Date:</span>
                                <span>{new Date(scan.startedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b border-border py-1">
                                <span className="font-semibold text-muted-foreground">Scan Type:</span>
                                <span>Automated Non-Intrusive</span>
                            </div>
                        </div>

                        <div className="bg-background p-6 rounded-lg border border-border shadow-sm flex flex-col items-center justify-center">
                            <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-sm mb-2">Overall Status</h3>
                            <div className={`text-3xl font-bold flex items-center gap-2 ${getStatusColor(scan.riskScore)}`}>
                                {scan.riskScore > 70 ? <XCircle className="w-8 h-8" /> :
                                    scan.riskScore > 30 ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                                {getStatusText(scan.riskScore)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-8 space-y-12">

                {/* 2. Executive Summary */}
                <section>
                    <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-6">2. Executive Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card p-6 rounded-lg border border-border text-center">
                            <div className="text-sm text-muted-foreground mb-2">Overall Risk Score</div>
                            <div className={`text-6xl font-black ${getStatusColor(scan.riskScore)}`}>
                                {scan.riskScore}<span className="text-2xl text-gray-400 font-normal">/100</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <h3 className="font-semibold mb-4">Summary of Findings</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-card text-muted-foreground">
                                    <tr>
                                        <th className="p-2">Severity</th>
                                        <th className="p-2">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-2 text-red-600 font-bold">Critical</td>
                                        <td className="p-2 font-mono">{countSeverity('critical')}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-2 text-orange-500 font-bold">High</td>
                                        <td className="p-2 font-mono">{countSeverity('high')}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-2 text-yellow-600 font-bold">Medium</td>
                                        <td className="p-2 font-mono">{countSeverity('medium')}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-2 text-blue-500 font-bold">Low</td>
                                        <td className="p-2 font-mono">{countSeverity('low')}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="mt-4 p-4 bg-primary/10 border-l-4 border-primary text-primary text-sm">
                                <strong>Plain-English Summary:</strong> <br />
                                {scan.riskScore === 0 ?
                                    "The domain is operational and passed all basic security checks. No immediate action is required, but continuous monitoring is recommended." :
                                    "The domain is operational but has security misconfigurations that could be exploited. Immediate attention is recommended for the highlighted high-risk items."}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Scope */}
                <section>
                    <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-6">3. Scan Scope & Methodology</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold mb-2">Scope of Scan</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                <li>Website availability monitoring</li>
                                <li>SSL/TLS certificate validation</li>
                                <li>Open common port detection (80, 443, 8080, 8443)</li>
                                <li>HTTP security header analysis</li>
                                <li>Basic server misconfiguration checks</li>
                            </ul>
                        </div>
                        <div className="bg-card p-4 rounded text-sm text-muted-foreground">
                            <h4 className="font-bold mb-2">Important Notes</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>No exploitation was performed</li>
                                <li>No credentials were used</li>
                                <li>No intrusive or destructive testing was conducted</li>
                                <li>This scan reflects the domain’s condition at the time of testing</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 4. Infrastructure Overview */}
                <section>
                    <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-6">4. Domain & Infrastructure Overview</h2>
                    <table className="w-full text-sm border border-border">
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 bg-card font-semibold w-1/3">Domain Name</td>
                                <td className="p-3">{scan.domain?.domain}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 bg-card font-semibold">SSL Status</td>
                                <td className="p-3">
                                    {scan.rawResult?.ssl?.valid ?
                                        <span className="text-green-600 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Valid</span> :
                                        <span className="text-red-600 font-bold flex items-center gap-2"><XCircle className="w-4 h-4" /> Invalid</span>
                                    }
                                </td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 bg-card font-semibold">Open Ports</td>
                                <td className="p-3 font-mono">
                                    {scan.rawResult?.open_ports?.length ? scan.rawResult.open_ports.join(', ') : 'None detected'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* 6. Detailed Findings */}
                <section>
                    <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-6">6. Detailed Findings</h2>

                    {enrichedFindings.length === 0 ? (
                        <p className="text-muted-foreground italic">No security findings were detected during this scan.</p>
                    ) : (
                        <div className="space-y-8">
                            {enrichedFindings.map((finding: any, idx: number) => (
                                <div key={idx} className="border border-border rounded-lg overflow-hidden">
                                    <div className={`p-4 border-b border-border flex justify-between items-center ${finding.severity === 'critical' ? 'bg-red-900/20' :
                                        finding.severity === 'high' ? 'bg-primary/20' : 'bg-yellow-900/20'
                                        }`}>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {finding.severity === 'critical' ? <span className="text-red-600">🔴</span> :
                                                finding.severity === 'high' ? <span className="text-orange-500">🟠</span> :
                                                    <span className="text-yellow-600">🟡</span>}
                                            Finding #{idx + 1}: {finding.title}
                                        </h3>
                                        <span className="uppercase font-bold text-xs tracking-wider border border-gray-400 px-2 py-1 rounded bg-background">
                                            {finding.severity}
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                                            <div><strong>Affected Component:</strong> Web Server / Configuration</div>
                                            <div><strong>Detected On:</strong> {new Date(scan.completedAt).toLocaleDateString()}</div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">Description</h4>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{finding.description}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">Why This Matters</h4>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{finding.why}</p>
                                        </div>

                                        <div className="bg-card p-4 border-l-4 border-green-500">
                                            <h4 className="font-bold text-primary-foreground mb-1">Recommendation</h4>
                                            <p className="text-green-400 text-sm">{finding.rec}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 10. Disclaimer */}
                <section className="bg-card p-8 border-t-2 border-border mt-12 text-sm text-muted-foreground text-justify">
                    <h4 className="font-bold text-muted-foreground mb-2 uppercase flex items-center gap-2"><Shield className="w-4 h-4" /> Disclaimer</h4>
                    <p>
                        This report is based on an automated, non-intrusive security scan conducted by AlertMatrix.
                        It does not guarantee the absence of all security vulnerabilities. Findings represent a point-in-time assessment.
                        AlertMatrix is not liable for any damages or losses resulting from the use or misuse of this information.
                    </p>
                </section>

                {/* 11. Contact */}
                <footer className="text-center pt-8 border-t border-border">
                    <p className="font-semibold text-foreground">AlertMatrix Security</p>
                    <p className="text-sm text-primary">support@alertmatrix.in | alertmatrix.in</p>
                </footer>
            </main>
        </div>
    );
}
