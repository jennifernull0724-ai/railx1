/**
 * DEBUG ENDPOINT - Remove after fixing auth issue
 * Tests the EXACT auth flow from authorize() to identify where it's failing
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const results: Record<string, unknown> = {
      step: 'start',
      timestamp: new Date().toISOString(),
      inputEmail: email,
      normalizedEmail: email?.toLowerCase(),
    };
    
    // Step 1: Connect to DB
    results.step = 'connecting';
    await connectDB();
    results.dbConnected = true;
    
    // Step 2: Find user EXACTLY like authorize() does - with .lean()
    results.step = 'findingUser_lean';
    const userLean = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean();
    results.userLeanFound = !!userLean;
    
    if (userLean) {
      results.userLean = {
        id: userLean._id?.toString(),
        email: userLean.email,
        isActive: userLean.isActive,
        isAdmin: userLean.isAdmin,
        role: userLean.role,
        hasPassword: !!userLean.password,
        passwordLength: userLean.password?.length || 0,
        passwordPrefix: userLean.password?.substring(0, 7) || 'none',
      };
    }
    
    // Step 3: Also test without .lean() for comparison
    results.step = 'findingUser_noLean';
    const userDoc = await User.findOne({ email: email.toLowerCase() })
      .select('+password');
    results.userDocFound = !!userDoc;
    
    if (userDoc) {
      results.userDoc = {
        id: userDoc._id?.toString(),
        email: userDoc.email,
        isActive: userDoc.isActive,
        isAdmin: userDoc.isAdmin,
        role: userDoc.role,
        hasPassword: !!userDoc.password,
        passwordLength: userDoc.password?.length || 0,
      };
    }
    
    // Step 4: Test bcrypt comparison BOTH ways
    if (userLean?.password && password) {
      results.step = 'bcryptCompare';
      const isValidDirect = await bcrypt.compare(password, userLean.password);
      results.bcryptDirectValid = isValidDirect;
    }
    
    if (userDoc?.comparePassword) {
      results.step = 'comparePassword';
      const isValidMethod = await userDoc.comparePassword(password);
      results.comparePasswordValid = isValidMethod;
    }
    
    // Step 5: Check what authorize() would return
    results.step = 'simulateAuthorize';
    if (!userLean) {
      results.authorizeWouldReturn = 'null (user not found)';
    } else if (!userLean.isActive) {
      results.authorizeWouldReturn = 'null (user inactive)';
    } else if (!userLean.password) {
      results.authorizeWouldReturn = 'null (no password)';
    } else {
      const isValid = await bcrypt.compare(password, userLean.password);
      if (!isValid) {
        results.authorizeWouldReturn = 'null (password invalid)';
      } else {
        results.authorizeWouldReturn = 'SUCCESS - user object';
        results.wouldReturnUser = {
          id: userLean._id?.toString(),
          email: userLean.email,
          name: userLean.name || 'User',
          isAdmin: userLean.isAdmin === true || userLean.role === 'admin',
        };
      }
    }
    
    results.step = 'complete';
    return NextResponse.json({
      success: results.authorizeWouldReturn === 'SUCCESS - user object',
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
