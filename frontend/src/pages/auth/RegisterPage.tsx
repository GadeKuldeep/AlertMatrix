import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setError('');
        try {
            const { confirmPassword, ...registerData } = data;
            const response = await api.post('/auth/register', registerData);
            setCredentials(response.data, response.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-500">AlertMatrix</h1>
                    <p className="mt-2 text-gray-400">Create your account</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-500/50 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <Input
                            {...register('email')}
                            placeholder="name@example.com"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Mobile Number</label>
                        <Input
                            {...register('mobile')}
                            placeholder="+91 9876543210"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                        {errors.mobile && <p className="text-xs text-red-400">{errors.mobile.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <Input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                        <Input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
