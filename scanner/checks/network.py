import socket

def check_open_ports(domain: str):
    # Common ports to check
    ports_to_check = [
        21, 22, 23, 25, 53, 80, 443, 445, 
        3306, 3389, 5432, 6379, 8080, 8443, 27017
    ]
    
    open_ports = []
    
    for port in ports_to_check:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5) # Fast timeout
            result = sock.connect_ex((domain, port))
            if result == 0:
                open_ports.append(port)
            sock.close()
        except:
            pass
            
    return open_ports

def perform_network_checks(domain: str):
    return {
        "open_ports": check_open_ports(domain)
    }
