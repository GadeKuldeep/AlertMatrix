import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// Validation Schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(10),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, mobile } = registerSchema.parse(req.body);

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user = await User.create({
            email,
            password,
            mobile,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                mobile: user.mobile,
                subscriptionPlan: user.subscriptionPlan,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const errorMessage = error.errors.map((e) => e.message).join(', ');
            res.status(400).json({ message: errorMessage });
        } else {
            res.status(500).json({ message: (error as Error).message });
        }
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });

        if (user && (await (user as any).matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                mobile: user.mobile,
                subscriptionPlan: user.subscriptionPlan,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const errorMessage = error.errors.map((e) => e.message).join(', ');
            res.status(400).json({ message: errorMessage });
        } else {
            res.status(500).json({ message: (error as Error).message });
        }
    }
};
