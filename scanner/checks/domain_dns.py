import whois
import dns.resolver
import dns.zone
import dns.query
import dns.flags
from datetime import datetime

def check_domain_whois(domain: str):
    try:
        w = whois.whois(domain)
        expiration_date = w.expiration_date
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]
        days_to_expire = None
        if expiration_date:
            days_to_expire = (expiration_date - datetime.now()).days

        return {
            "registrar": w.registrar,
            "creation_date":  str(w.creation_date),
            "expiration_date": str(expiration_date),
            "days_to_expire": days_to_expire,
            "emails": w.emails,
            "status": "ok"
        }
    except Exception as e:
        return {"error": str(e), "status": "failed"}

def check_dns_records(domain: str):
    records = {}
    for rtype in ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA']:
        try:
            answers = dns.resolver.resolve(domain, rtype)
            records[rtype] = [str(r) for r in answers]
        except Exception:
            records[rtype] = []
    return records

def check_dnssec(domain: str):
    try:
        answers = dns.resolver.resolve(domain, 'DNSKEY')
        return {"enabled": True, "details": f"Found {len(answers)} DNSKEY records"}
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        return {"enabled": False, "details": "No DNSKEY records found"}
    except Exception as e:
        return {"enabled": False, "error": str(e)}

def check_dangling_dns(domain: str):
    try:
        answers = dns.resolver.resolve(domain, 'CNAME')
        for r in answers:
            target = str(r.target)
            try:
                dns.resolver.resolve(target, 'A')
            except dns.resolver.NXDOMAIN:
                return {"status": "vulnerable", "details": f"CNAME {target} does not resolve"}
    except Exception:
        pass
    return {"status": "safe"}

def check_spf_dmarc(domain: str):
    txt_records = []
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        txt_records = [str(r) for r in answers]
    except Exception:
        pass

    spf = next((r for r in txt_records if "v=spf1" in r), None)
    dmarc = None
    try:
        dmarc_answers = dns.resolver.resolve(f"_dmarc.{domain}", 'TXT')
        dmarc_records = [str(r) for r in dmarc_answers]
        dmarc = next((r for r in dmarc_records if "v=DMARC1" in r), None)
    except Exception:
        pass

    return {
        "spf": {"present": bool(spf), "record": spf},
        "dmarc": {"present": bool(dmarc), "record": dmarc}
    }

def check_subdomains(domain: str):
    subdomains = ["www", "mail", "api", "dev", "test", "stage", "app", "blog", "shop", "admin"]
    found = []
    for sub in subdomains:
        fqdn = f"{sub}.{domain}"
        try:
            dns.resolver.resolve(fqdn, 'A')
            found.append(fqdn)
        except:
            pass
    return found

def perform_domain_dns_checks(domain: str):
    return {
        "whois": check_domain_whois(domain),
        "records": check_dns_records(domain),
        "dnssec": check_dnssec(domain),
        "dangling": check_dangling_dns(domain),
        "email_security": check_spf_dmarc(domain),
        "subdomains": check_subdomains(domain)
    }
