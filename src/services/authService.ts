
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../generated/prisma';
import type { StringValue } from 'ms';

const prisma = new PrismaClient();

interface TokenPayload {
  userId: string;
  role: string;
}


export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = ({ userId, role }: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as Secret;
  const rawExpiry = process.env.JWT_EXPIRES_IN || '7d';

  const expiresIn: SignOptions['expiresIn'] = /^\d+$/.test(rawExpiry)
    ? parseInt(rawExpiry, 10) // interpret as seconds
    : rawExpiry as StringValue; // interpret as string (e.g., '7d', '24h')

  const payload = { userId, role };
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secret, options);
};


export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
};

export const createUser = async (userData: { email: string; password: string; role?: string }) => {
  const hashedPassword = await hashPassword(userData.password);

  return await prisma.user.create({
    data: {
        email: userData.email,
      password: hashedPassword,
      role: userData.role as UserRole,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      volunteerProfile: {
        include: {
          application: true
        }
      }
    }
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      volunteerProfile: {
        include: {
          application: true
        }
      }
    }
  });
};
