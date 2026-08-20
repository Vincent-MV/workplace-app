import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 1. Initialize OpenRouter (uses the OpenAI SDK format)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    // 🛡️ FIX 1: Check for the OPENROUTER key, not Groq!
    if (!process.env.OPENROUTER_API_KEY) {
  return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY in .env.local' }, { status: 500 });
  }

  // ADD THIS TEMPORARY LINE TO TEST:
  console.log("API Key Status:", process.env.OPENROUTER_API_KEY ? "FOUND (Length: " + process.env.OPENROUTER_API_KEY.length + ")" : "NOT FOUND");

    // 2. Authenticate User
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

    // 3. Fetch Today's Context
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

    // 4. Call OpenRouter for a Summary (YOUR EXCELLENT PROMPT)
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

    // 🛡️ FIX 2: Use the most stable, currently active free model
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    return NextResponse.json({ briefing: completion.choices[0].message.content });

  } catch (error: any) {
    // 🛡️ FIX 3: Log the exact message
    console.error('Briefing API Error:', error.message); 
    
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return NextResponse.json({ 
        error: 'rate_limit', 
        message: "AI is taking a quick break. Please try again in a few minutes." 
      }, { status: 429 });
    }

    return NextResponse.json({ error: error.message || 'Failed to generate briefing' }, { status: 500 });
  }
}