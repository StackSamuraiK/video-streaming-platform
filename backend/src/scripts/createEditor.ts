import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { hashPassword } from '../utils/auth';

dotenv.config();

const createEditor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        const existingEditor = await User.findOne({ email: 'editor@example.com' });
        if (existingEditor) {
            console.log('Editor user already exists');
            console.log('Email: editor@example.com');
            console.log('Password: (unchanged)');
            process.exit(0);
        }

        const passwordHash = await hashPassword('editor123');

        const editor = new User({
            username: 'editor',
            email: 'editor@example.com',
            passwordHash,
            role: 'editor',
        });

        await editor.save();

        console.log('Editor user created successfully');
        console.log('Email: editor@example.com');
        console.log('Password: editor123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating editor user:', error);
        process.exit(1);
    }
};

createEditor();
