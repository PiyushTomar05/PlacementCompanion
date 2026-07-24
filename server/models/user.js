import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMongoConnected, readLocalDb, writeLocalDb } from '../config/db.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Password hashing before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

export const UserStore = {
  async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      return await MongoUser.findOne({ email: cleanEmail });
    }
    const db = readLocalDb();
    db.users = db.users || [];
    const found = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) return null;
    return {
      _id: found.id,
      id: found.id,
      name: found.name,
      email: found.email,
      password: found.password,
      async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, found.password);
      }
    };
  },

  async findById(id) {
    if (isMongoConnected) {
      return await MongoUser.findById(id).select('-password');
    }
    const db = readLocalDb();
    db.users = db.users || [];
    const found = db.users.find(u => u.id === id);
    if (!found) return null;
    return {
      _id: found.id,
      id: found.id,
      name: found.name,
      email: found.email,
      createdAt: found.createdAt
    };
  },

  async createUser({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected) {
      const user = new MongoUser({ name, email: cleanEmail, password });
      await user.save();
      return {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };
    }

    const db = readLocalDb();
    db.users = db.users || [];
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeLocalDb(db);

    return {
      _id: newUser.id,
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  }
};
