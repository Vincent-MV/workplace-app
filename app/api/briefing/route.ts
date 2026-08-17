// app/api/briefing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate User (Same pattern as your AI chat)
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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now = new Date().toISOString();

    // Get today's tasks and upcoming meetings
    const { data: tasks } = await supabase.from('tasks')
      .select('title, due_date, status')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])
      .lte('due_date', today) // Tasks due today or overdue
      .limit(5);

    const { data: meetings } = await supabase.from('meetings')
      .select('title, scheduled_at')
      .eq('user_id', user.id)
      .gte('scheduled_at', now)
      .order('scheduled_at')
      .limit(3);

    // 3. Call Groq for a Summary
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
       model: 'llama3-70b-8192',
      temperature: 0.5,
      max_tokens: 200,
    });

    return NextResponse.json({ briefing: completion.choices[0].message.content });

  } catch (error: any) {
    // 🛡️ LAYER 2 DEFENSE: Catch Rate Limits specifically
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json({ 
        error: 'rate_limit', 
        message: "AI is taking a quick break. Please try again in a few minutes." 
      }, { status: 429 });
    }

    console.error('Briefing API Error:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}