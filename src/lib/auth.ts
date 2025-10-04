import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function getCurrentUser(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.cookies.get('userId')?.value;
    if (!userId) {
      return null;
    }

    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function getAuthHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
  };
}