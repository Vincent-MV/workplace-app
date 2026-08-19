import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  try {
    // 🛡️ TROUBLESHOOTING FIX 1: Fail fast if key is missing
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY in .env.local' }, { status: 500 });
    }

    // 1. Authenticate User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 401 });

    // 2. Fetch Today's Context
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data: tasks } = await supabase.from('tasks')
      .select('title, due_date, status')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])
      .lte('due_date', today)
      .limit(5);

    const { data: meetings } = await supabase.from('meetings')
      .select('title, scheduled_at')
      .eq('user_id', user.id)
      .gte('scheduled_at', now)
      .order('scheduled_at')
      .limit(3);

    // 3. Call Groq for a Summary (YOUR EXCELLENT PROMPT)
    const prompt = `
      You are a strict but encouraging productivity assistant. Give me a short, actionable morning briefing based on this data.
      
      FORMATTING RULES:
      1. If there are OVERDUE tasks, start the briefing with "🚨 OVERDUE:" and put the task name in ALL CAPS.
      2. If there are high-priority tasks due today, use "⚠️ URGENT:" and bold the task name.
      3. Use clear bullet points (start each with •).
      4. Keep it under 150 words. Be direct.
      
      Tasks: ${JSON.stringify(tasks || [])}
      Meetings: ${JSON.stringify(meetings || [])}
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 200,
    });

    return NextResponse.json({ briefing: completion.choices[0].message.content });

  } catch (error: any) {
    // 🛡️ TROUBLESHOOTING FIX 2: Log the exact message, not the giant object
    console.error('Briefing API Error:', error.message); 
    
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json({ 
        error: 'rate_limit', 
        message: "AI is taking a quick break. Please try again in a few minutes." 
      }, { status: 429 });
    }

    // 🛡️ TROUBLESHOOTING FIX 3: Send the message to the browser
    return NextResponse.json({ error: error.message || 'Failed to generate briefing' }, { status: 500 });
  }
}