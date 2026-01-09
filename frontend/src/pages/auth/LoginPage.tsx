import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-xl border border-border">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">AlertMatrix</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to your account</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-500/50 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <Input
                            {...register('email')}
                            placeholder="name@example.com"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                        <Input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primary/80">
                        Register for free
                    </Link>
                </div>
            </div>
        </div>
    );
}
