import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import './LoginPage.css';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', data);
            setCredentials(response.data, response.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">AlertMatrix</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                {error && (
                    <div className="error-container">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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
                        <label className="form-label">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="form-input"
                        />
                        {errors.password && <p className="error-message">{errors.password.message}</p>}
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="register-link">
                        Register for free
                    </Link>
                </div>
            </div>
        </div>
    );
}
