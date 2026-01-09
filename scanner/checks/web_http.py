import requests

def check_security_headers(domain: str):
    try:
        url = f"https://{domain}"
        response = requests.get(url, timeout=5, verify=False)
        headers = response.headers
        missing = []
        required = {
            "Strict-Transport-Security": "HSTS",
            "X-Frame-Options": "Clickjacking Protection",
            "X-Content-Type-Options": "MIME Sniffing Protection",
            "Content-Security-Policy": "XSS Protection",
            "Referrer-Policy": "Information Leakage Protection",
            "Permissions-Policy": "feature access"
        }
        present = {}
        for header, desc in required.items():
            if header in headers:
                present[header] = headers[header]
            else:
                missing.append(header)
        server_header = headers.get("Server", None)
        x_powered_by = headers.get("X-Powered-By", None)
        return {
            "present_headers": present,
            "missing_headers": missing,
            "server_leak": server_header,
            "tech_stack_leak": x_powered_by
        }
    except Exception as e:
        return {"error": str(e)}

def check_https_redirect(domain: str):
    try:
        url = f"http://{domain}"
        response = requests.get(url, timeout=5, allow_redirects=True, verify=False)
        if response.url.startswith("https://"):
            return True
        return False
    except:
        return False

def check_methods(domain: str):
    try:
        url = f"https://{domain}"
        response = requests.options(url, timeout=5, verify=False)
        allowed = response.headers.get("Allow", "Unknown")
        return allowed
    except:
        return "Unknown"

def perform_web_checks(domain: str):
    return {
        "headers": check_security_headers(domain),
        "enforces_https": check_https_redirect(domain),
        "allowed_methods": check_methods(domain)
    }
