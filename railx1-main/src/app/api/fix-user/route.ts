import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// One-time fix endpoint - DELETE AFTER USE
export async function GET() {
  try {
    await connectDB();
    
    // Direct MongoDB update to bypass Mongoose validation
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'jennnull4@gmail.com' },
      { 
        $set: { contractorTier: null },
        $unset: { contractorTier: '' }  // Remove the field entirely
      }
    );
    
    // Also try unsetting it completely
    const result2 = await mongoose.connection.db.collection('users').updateOne(
      { email: 'jennnull4@gmail.com' },
      { $unset: { contractorTier: 1 } }
    );
    
    // Get the user to verify
    const user = await mongoose.connection.db.collection('users').findOne(
      { email: 'jennnull4@gmail.com' }
    );
    
    return NextResponse.json({
      success: true,
      message: 'User contractorTier fixed',
      updateResult: result,
      unsetResult: result2,
      user: user ? {
        email: user.email,
        role: user.role,
        contractorTier: user.contractorTier,
        hasContractorTier: 'contractorTier' in user
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
