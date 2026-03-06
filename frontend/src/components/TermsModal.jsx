import React from 'react';
import './TermsModal.css';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const TermsModal = () => {
    const { user, token, setCredentials } = useAuthStore();

    if (!user || user.termsAccepted) return null;

    const handleAccept = async () => {
        try {
            const response = await api.post('/auth/accept-terms');

            if (response.status === 200) {
                setCredentials({ ...user, termsAccepted: true }, token);
            }
        } catch (error) {
            console.error('Error accepting terms:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Terms & License Agreement</h2>
                </div>
                <div className="terms-text">
                    <p>Welcome to AlertMatrix. Please review and accept our terms and license agreement to continue using our services.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By clicking "Accept and Continue", you agree to be bound by these terms, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

                    <h3>2. Use License</h3>
                    <p>Permission is granted to temporarily use AlertMatrix for personal or commercial security scanning purposes only. This is the grant of a license, not a transfer of title.</p>

                    <h3>3. Disclaimer</h3>
                    <p>The materials on AlertMatrix are provided on an 'as is' basis. AlertMatrix makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                    <h3>4. Ethical Use</h3>
                    <p>You agree to use AlertMatrix only for assets you own or have explicit permission to scan. Unauthorized scanning of third-party infrastructure is strictly prohibited and May lead to account termination and legal action.</p>

                    <h3>5. Data Privacy</h3>
                    <p>We value your privacy and the security of your data. By using our service, you acknowledge our processing of your information as described in our Privacy Policy.</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-accept" onClick={handleAccept}>
                        Accept and Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
