from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import asyncio
import socket
import ssl
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

app = FastAPI(title="AlertMatrix Scanner Service")
executor = ThreadPoolExecutor(max_workers=10)

class ScanRequest(BaseModel):
    domain: str
    scan_id: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "scanner-python"}

def perform_ssl_check(domain: str):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                return {"valid": True, "details": "Certificate found"}
    except Exception as e:
        return {"valid": False, "error": str(e)}

def perform_header_check(domain: str):
    try:
        url = f"https://{domain}"
        response = requests.get(url, timeout=5)
        security_headers = [
            "Strict-Transport-Security",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Content-Security-Policy"
        ]
        missing = [h for h in security_headers if h not in response.headers]
        return {"missing": missing, "headers": dict(response.headers)}
    except Exception as e:
        return {"error": str(e)}

def perform_port_check(domain: str):
    safe_ports = [80, 443, 8080, 8443] 
    open_ports = []
    
    for port in safe_ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((domain, port))
            if result == 0:
                open_ports.append(port)
            sock.close()
        except:
            pass
    
    return open_ports

@app.post("/scan")
async def perform_scan(request: ScanRequest):
    domain = request.domain
    print(f"Starting scan for {domain}")
    
    loop = asyncio.get_event_loop()
    
    # Run blocking checks in thread pool
    ssl_result, headers_result, ports_result = await asyncio.gather(
        loop.run_in_executor(executor, perform_ssl_check, domain),
        loop.run_in_executor(executor, perform_header_check, domain),
        loop.run_in_executor(executor, perform_port_check, domain)
    )
    
    # Calculate simple risk score
    risk_score = 0
    findings = []
    
    if not ssl_result.get("valid"):
        risk_score += 40
        findings.append({"severity": "critical", "title": "SSL Invalid", "description": "SSL Certificate is missing or invalid."})
        
    if headers_result.get("missing"):
        count = len(headers_result["missing"])
        risk_score += (count * 10)
        findings.append({"severity": "medium", "title": "Missing Security Headers", "description": f"Missing headers: {', '.join(headers_result['missing'])}"})

    if 80 in ports_result and 443 not in ports_result:
         risk_score += 20
         findings.append({"severity": "high", "title": "Insecure HTTP", "description": "Port 80 is open but 443 is closed."})

    risk_score = min(risk_score, 100)

    return {
        "domain": domain,
        "scan_id": request.scan_id,
        "risk_score": risk_score,
        "findings": findings,
        "details": {
            "ssl": ssl_result,
            "headers": headers_result,
            "open_ports": ports_result
        },
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
