import ssl
import socket
from datetime import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend

def get_certificate_details(domain: str, port: int = 443):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert_bin = ssock.getpeercert(binary_form=True)
                cipher = ssock.cipher()
                version = ssock.version()
                cert = x509.load_der_x509_certificate(cert_bin, default_backend())
                not_after = cert.not_valid_after
                days_to_expire = (not_after - datetime.now()).days
                subject = cert.subject.rfc4514_string()
                issuer = cert.issuer.rfc4514_string()
                return {
                    "valid": True,
                    "version": version,
                    "cipher": cipher,
                    "subject": subject,
                    "issuer": issuer,
                    "expiration_date": str(not_after),
                    "days_to_expire": days_to_expire,
                    "weak_cipher": "RC4" in cipher[0] or "MD5" in cipher[0]
                }
    except Exception as e:
        return {"valid": False, "error": str(e)}

def check_tls_versions(domain: str):
    results = {}
    versions = [ssl.PROTOCOL_TLSv1, ssl.PROTOCOL_TLSv1_1]
    for v in versions:
        try:
            pass
        except:
            pass
    return {"note": "Detailed localized TLS version scanning requires external tools or lower level socket manipulation."}

def perform_ssl_checks(domain: str):
    return {
        "certificate": get_certificate_details(domain),
        "tls_analysis": check_tls_versions(domain)
    }
