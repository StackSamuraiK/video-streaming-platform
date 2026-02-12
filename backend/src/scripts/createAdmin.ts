import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { hashPassword } from '../utils/auth';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Email: admin@example.com');
            console.log('Password: (unchanged)');
            process.exit(0);
        }

        const passwordHash = await hashPassword('admin123');

        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            passwordHash,
            role: 'admin',
        });

        await admin.save();

        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
