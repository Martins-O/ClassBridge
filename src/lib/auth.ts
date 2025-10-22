import {NextRequest} from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import {getUserIdFromRequest} from '@/lib/session';

export async function getCurrentUser(request: NextRequest) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return null;
    }

    return await User.findById(userId).select('-password');
  } catch {
    return null;
  }
}

export function getAuthHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
  };
}
