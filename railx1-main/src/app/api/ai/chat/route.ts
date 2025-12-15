export const dynamic = 'force-dynamic';

/**
 * THE RAIL EXCHANGE™ — AI Chat Support API
 * 
 * Provides AI-powered responses to customer support questions.
 * Uses OpenAI GPT to answer questions about the platform.
 * Includes escalation to human support via email.
 * 
 * SECURITY CONTROLS (Section 6):
 * - Rate limiting to prevent abuse
 * - Prompt injection detection
 * - Input sanitization
 * - Output validation
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sendEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { 
  detectPromptInjection, 
  wrapUserContent, 
  buildHardenedSystemPrompt,
  validateAIOutput 
} from '@/lib/ai-safety';
import { sanitizeString } from '@/lib/sanitize';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful customer support assistant for The Rail Exchange™, an online marketplace for buying and selling railroad equipment, locomotives, and rolling stock. You also help connect buyers with verified railroad contractors and companies.

Key information about The Rail Exchange:

MARKETPLACE:
- Buyers can browse and purchase railroad equipment including locomotives, railcars, track materials, and parts
- Sellers can list equipment with photos and detailed specifications
- All listings include seller contact information for direct negotiation

VERIFICATION (NOT a subscription - no tiers):
- Buyer Verification: $1 one-time identity verification to contact sellers and submit inquiries
- Seller Verification: $29/year to publish equipment listings on the marketplace

PROFESSIONAL SERVICES (for contractors AND companies):
- Annual Plan: $2,500/year (best value - saves $500 vs 6-month option)
- 6-Month Plan: $1,500/6 months ($3,000 total if renewed twice per year)
- Includes: Directory listing, map visibility, analytics dashboard, verification badge, service inquiries

IMPORTANT: There are NO monthly subscriptions. NO seller tiers (no Basic/Plus/Pro). Professional Services is the only paid product for contractors/companies.

ADD-ONS FOR LISTINGS:
- Elite Placement ($199): 30-day top placement with marketing (only visibility tier - no Premium/Featured)
- AI Enhancement ($19): AI-optimized description
- Spec Sheet ($39): Professional spec sheet generation

BILLING MANAGEMENT:
- To manage billing, users should go to Dashboard > Settings > Billing, or use this link: /dashboard/billing
- Users can manage their verification, update payment methods, and view receipts through the billing portal
- Verification renewals are annual (sellers) or one-time (buyers)
- If someone wants to cancel Professional Services, explain it will end access at the end of the billing period

SUPPORT:
- Email: support@therailexchange.com
- Contact form available on the website
- Response time: Usually within 24 hours for email

ESCALATION:
- If a user asks to speak to a human, wants to report a serious issue, or you cannot help them, tell them you will escalate to human support
- Serious issues include: billing disputes, account problems, harassment reports, or anything requiring human judgment

Be helpful, professional, and concise. If you don't know something specific, suggest they contact support@therailexchange.com or use the contact form. Don't make up information about specific listings or prices that weren't provided.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Check if the conversation needs human escalation
function needsEscalation(messages: ChatMessage[]): boolean {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
  
  const escalationTriggers = [
    'speak to human',
    'talk to human',
    'real person',
    'human support',
    'talk to someone',
    'speak to someone',
    'human agent',
    'customer service',
    'supervisor',
    'manager',
    'escalate',
    'complaint',
    'sue',
    'lawyer',
    'legal',
    'refund',
    'billing issue',
    'charged incorrectly',
    'unauthorized charge',
    'harassment',
    'report user',
    'scam',
    'fraud',
  ];
  
  return escalationTriggers.some(trigger => lastUserMessage.includes(trigger));
}

// Send escalation email to support
async function sendEscalationEmail(messages: ChatMessage[], reason: string) {
  const transcript = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');
  
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@therailexchange.com';
  
  try {
    await sendEmail(supportEmail, {
      subject: `[ESCALATION] AI Chat Support Request`,
      text: `A user has requested human support or reported an issue that requires attention.

ESCALATION REASON: ${reason}

CHAT TRANSCRIPT:
================
${transcript}
================

Please follow up with this user as soon as possible.

Sent automatically from The Rail Exchange AI Support System`,
      html: `
        <h2 style="color: #0A1A2F; margin-bottom: 16px;">AI Chat Escalation</h2>
        <p style="color: #475569;"><strong>Reason:</strong> ${reason}</p>
        <h3 style="color: #0A1A2F; margin-top: 24px;">Chat Transcript:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-size: 13px; color: #333;">
${transcript}
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Sent automatically from The Rail Exchange AI Support System
        </p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send escalation email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting (Section 6)
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { messages, escalate } = body as { messages: ChatMessage[]; escalate?: boolean };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // SECURITY: Check for prompt injection in recent messages
    for (const msg of messages.filter(m => m.role === 'user').slice(-3)) {
      if (detectPromptInjection(msg.content)) {
        console.warn('AI prompt injection attempt detected');
        return NextResponse.json({
          message: "I can only help with questions about The Rail Exchange marketplace. Please ask about our services, listings, subscriptions, or contractor services.",
          blocked: true
        });
      }
    }

    // Check if user explicitly requested escalation or if auto-escalation is needed
    const shouldEscalate = escalate || needsEscalation(messages);
    
    if (shouldEscalate) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || 'User requested support';
      const escalationSent = await sendEscalationEmail(messages, lastUserMessage.substring(0, 100));
      
      if (escalationSent) {
        return NextResponse.json({ 
          message: "I've escalated your request to our human support team. They will review your conversation and get back to you within 24 hours at the email associated with your account. Is there anything else I can help you with in the meantime?",
          escalated: true 
        });
      }
    }

    // Limit conversation history to last 10 messages to manage context
    const recentMessages = messages.slice(-10);

    // SECURITY: Wrap user content and use hardened system prompt
    const hardenedSystemPrompt = buildHardenedSystemPrompt(SYSTEM_PROMPT);
    const hardenedMessages = recentMessages.map(m => ({
      role: m.role,
      content: m.role === 'user' ? wrapUserContent(sanitizeString(m.content || '', { maxLength: 2000 }) || '') : m.content
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: hardenedSystemPrompt },
        ...hardenedMessages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    let assistantMessage = response.choices[0]?.message?.content || 
      "I apologize, but I couldn't generate a response. Please try again or contact support@therailexchange.com.";

    // SECURITY: Validate AI output for dangerous patterns
    const outputValidation = validateAIOutput(assistantMessage);
    if (!outputValidation.safe) {
      console.warn(`AI output validation failed: ${outputValidation.issues.join(', ')}`);
      assistantMessage = "I can help you with questions about The Rail Exchange marketplace. Please ask about our services, listings, or contractor directory.";
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
