/**
 * DEBUG ENDPOINT - Remove after fixing auth issue
 * Tests the exact auth flow to identify where it's failing
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const results: Record<string, unknown> = {
      step: 'start',
      timestamp: new Date().toISOString(),
    };
    
    // Step 1: Connect to DB
    results.step = 'connecting';
    await connectDB();
    results.dbConnected = true;
    
    // Step 2: Find user by email
    results.step = 'findingUser';
    const user = await User.findByEmail(email);
    results.userFound = !!user;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        results,
      });
    }
    
    results.userId = user._id.toString();
    results.userEmail = user.email;
    results.isActive = user.isActive;
    results.isAdmin = user.isAdmin;
    results.role = user.role;
    results.hasPassword = !!user.password;
    results.passwordLength = user.password ? user.password.length : 0;
    results.passwordPrefix = user.password ? user.password.substring(0, 7) : 'none';
    
    // Step 3: Check if isActive
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'User is not active',
        results,
      });
    }
    
    // Step 4: Compare password
    results.step = 'comparingPassword';
    const isValid = await user.comparePassword(password);
    results.passwordValid = isValid;
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Password invalid',
        results,
      });
    }
    
    // Success!
    results.step = 'complete';
    return NextResponse.json({
      success: true,
      message: 'Auth flow would succeed',
      results,
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

// Also allow GET to check if endpoint is alive
export async function GET() {
  return NextResponse.json({ 
    status: 'debug-auth endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
