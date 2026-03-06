import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { z, ZodError } from 'zod';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};


const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(10),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});




export const registerUser = async (req, res) => {
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
                termsAccepted: user.termsAccepted,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessage = error.issues.map((e) => e.message).join(', ');
            res.status(400).json({ message: errorMessage });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};




export const loginUser = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                mobile: user.mobile,
                subscriptionPlan: user.subscriptionPlan,
                termsAccepted: user.termsAccepted,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessage = error.issues.map((e) => e.message).join(', ');
            res.status(400).json({ message: errorMessage });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const acceptTerms = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.termsAccepted = true;
        await user.save();

        res.json({
            message: 'Terms accepted successfully',
            termsAccepted: user.termsAccepted,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
