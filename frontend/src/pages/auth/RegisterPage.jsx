import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import './RegisterPage.css';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const { confirmPassword, ...registerData } = data;
            const response = await api.post('/auth/register', registerData);
            setCredentials(response.data, response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <h1 className="register-title">AlertMatrix</h1>
                    <p className="register-subtitle">Create your account</p>
                </div>

                {error && (
                    <div className="error-container">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            {...register('email')}
                            placeholder="name@example.com"
                            className="form-input"
                        />
                        {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input
                            {...register('mobile')}
                            placeholder="+91 9876543210"
                            className="form-input"
                        />
                        {errors.mobile && <p className="error-message">{errors.mobile.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="form-input"
                        />
                        {errors.password && <p className="error-message">{errors.password.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            className="form-input"
                        />
                        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="register-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
