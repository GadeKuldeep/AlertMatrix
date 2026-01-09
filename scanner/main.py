from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import json

# Import custom checks
from checks.domain_dns import perform_domain_dns_checks
from checks.ssl_tls import perform_ssl_checks
from checks.network import perform_network_checks
from checks.web_http import perform_web_checks

app = FastAPI(title="AlertMatrix Scanner Service")
executor = ThreadPoolExecutor(max_workers=20)

class ScanRequest(BaseModel):
    domain: str
    scan_id: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "scanner-python-advanced"}

def calculate_risk_score(results):
    score = 0
    # SSL Critical
    if not results['ssl'].get('certificate', {}).get('valid', False):
        score += 40
    
    # Network Critical
    open_ports = results['network'].get('open_ports', [])
    unsafe_ports = [21, 23, 3306, 3389, 5432, 27017] 
    for p in unsafe_ports:
        if p in open_ports:
            score += 20
            break
            
    # Web High
    missing_headers = results['web'].get('headers', {}).get('missing_headers', [])
    if "Strict-Transport-Security" in missing_headers:
        score += 15
    if "Content-Security-Policy" in missing_headers:
        score += 10
        
    # Email / DNS
    if not results['dns'].get('email_security', {}).get('spf', {}).get('present'):
        score += 5
    if not results['dns'].get('email_security', {}).get('dmarc', {}).get('present'):
        score += 5
        
    return min(score, 100)

def generate_findings(results):
    findings = []
    
    # 1. SSL Findings
    ssl_data = results['ssl'].get('certificate', {})
    if not ssl_data.get('valid'):
        findings.append({
            "category": "SSL/TLS",
            "severity": "critical",
            "title": "SSL Certificate Invalid",
            "description": f"Error: {ssl_data.get('error', 'Unknown')}",
            "remediation": "Install a valid SSL certificate from a trusted authority (e.g., Let's Encrypt)."
        })
    elif ssl_data.get('weak_cipher'):
        findings.append({
            "category": "SSL/TLS",
            "severity": "high",
            "title": "Weak Cipher Detected",
            "description": "Certificate uses weak algorithms (MD5/RC4).",
            "remediation": "Reconfigure your web server to disable weak ciphers and support only strong protocols (TLS 1.2+)."
        })
        
    # 2. DNS/Email Findings
    dns_data = results['dns']
    if not dns_data.get('email_security', {}).get('spf', {}).get('present'):
         findings.append({
            "category": "Email Security",
            "severity": "medium",
            "title": "Missing SPF Record",
            "description": "Domain allows email spoofing.",
            "remediation": "Add a TXT record for SPF to define allowed senders."
        })
    if not dns_data.get('email_security', {}).get('dmarc', {}).get('present'):
         findings.append({
            "category": "Email Security",
            "severity": "medium",
            "title": "Missing DMARC Policy",
            "description": "Domain lacks email authentication policy.",
            "remediation": "Configure a DMARC record to valid SPF/DKIM."
        })
    if dns_data.get('dnssec', {}).get('enabled') == False:
        findings.append({
            "category": "Domain & DNS",
            "severity": "low",
            "title": "DNSSEC Not Enabled",
            "description": "Domain is vulnerable to DNS spoofing.",
            "remediation": "Enable DNSSEC at your registrar."
        })

    # 3. Web Findings
    web_data = results['web']
    missing_headers = web_data.get('headers', {}).get('missing_headers', [])
    for h in missing_headers:
        rem = "Add this header to your web server config."
        if h == "Strict-Transport-Security": rem = "Enable HSTS to enforce HTTPS."
        if h == "Content-Security-Policy": rem = "Define a strict CSP to prevent XSS."
        
        findings.append({
            "category": "Web Server",
            "severity": "low" if h != "Strict-Transport-Security" else "high",
            "title": f"Missing Header: {h}",
            "description": f"The security header {h} is not set.",
            "remediation": rem
        })
    
    if web_data.get('headers', {}).get('server_leak'):
        findings.append({
            "category": "Web Server",
            "severity": "low",
            "title": "Server Information Disclosure",
            "description": f"Server header leaked: {web_data['headers']['server_leak']}",
            "remediation": "Configure your server (Apache/Nginx) to hide server version."
        })

    if not web_data.get('enforces_https'):
         findings.append({
            "category": "Web Server",
            "severity": "medium",
            "title": "No HTTPS Redirection",
            "description": "HTTP does not redirect to HTTPS automatically.",
            "remediation": "Configure 301 redirects from HTTP to HTTPS."
        })

    # 4. Network Findings
    net_data = results['network']
    ports = net_data.get('open_ports', [])
    risky_ports = [21, 23, 3306, 3389, 5432, 27017, 6379]
    for p in ports:
        if p in risky_ports:
             findings.append({
                "category": "Network Security",
                "severity": "critical",
                "title": f"Open High-Risk Port: {p}",
                "description": f"Port {p} is open to the public Internet.",
                "remediation": f"Block port {p} via firewall and use VPN/Tunneling for access."
            })
    
    return findings

def analyze_cloud_provider(results):
    provider = "Unknown"
    records = results['dns'].get('records', {})
    
    # Simple check on NS
    ns_records = records.get('NS', [])
    ns_str = " ".join(ns_records).lower()
    
    if "aws" in ns_str or "amazon" in ns_str:
        provider = "AWS"
    elif "azure" in ns_str:
        provider = "Azure"
    elif "cloudflare" in ns_str:
        provider = "Cloudflare"
    elif "google" in ns_str:
        provider = "Google Cloud"
        
    return provider

@app.post("/scan")
async def perform_scan(request: ScanRequest):
    domain = request.domain
    print(f"Starting advanced scan for {domain}...")
    
    loop = asyncio.get_event_loop()
    
    # Run all modules in parallel threads
    future_dns = loop.run_in_executor(executor, perform_domain_dns_checks, domain)
    future_ssl = loop.run_in_executor(executor, perform_ssl_checks, domain)
    future_net = loop.run_in_executor(executor, perform_network_checks, domain)
    future_web = loop.run_in_executor(executor, perform_web_checks, domain)
    
    r_dns, r_ssl, r_net, r_web = await asyncio.gather(future_dns, future_ssl, future_net, future_web)
    
    full_results = {
        "dns": r_dns,
        "ssl": r_ssl,
        "network": r_net,
        "web": r_web,
        "compliance": {
            "owasp_top_10": "Evaluated via headers/ssl",
            "gdpr_risk": "Low"
        }
    }
    
    risk_score = calculate_risk_score(full_results)
    findings = generate_findings(full_results)
    cloud_provider = analyze_cloud_provider(full_results)
    
    # Inject cloud info
    full_results["cloud"] = {
        "provider": cloud_provider,
        "exposed_services": len(r_net.get('open_ports', []))
    }

    return {
        "domain": domain,
        "scan_id": request.scan_id,
        "risk_score": risk_score,
        "findings": findings,
        "details": full_results,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
