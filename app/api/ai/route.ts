// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Groq with your API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // 🔐 STEP 1: Read the token from the Authorization header (This worked last time!)
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 🔐 STEP 2: Create a Supabase client authenticated with this specific token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 🔍 STEP 3: Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return NextResponse.json({ error: 'Unauthorized - Invalid session' }, { status: 401 });
    }

    // 📥 STEP 4: Parse request body
    const body = await req.json();
    const { conversationId, messages, workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // 🧠 STEP 5: Fetch workspace context
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, due_date, status')
      .eq('workspace_id', workspaceId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true })
      .limit(10);

      const { data: meetings } = await supabase
      .from('meetings')
      .select('id, title, scheduled_at, duration_mins, location') // ✅ CORRECT COLUMNS
      .eq('workspace_id', workspaceId)
      .gte('scheduled_at', new Date().toISOString()) // ✅ CORRECT COLUMN
      .order('scheduled_at', { ascending: true }) // ✅ CORRECT COLUMN
      .limit(10);

    // 🤖 STEP 6: Build system prompt for Qwen/Llama via Groq
     const systemInstruction = `
        You are the AI Secretary for Nexus. You are AUTONOMOUS and PROACTIVE.
        Current date: ${new Date().toLocaleDateString()}

        WORKSPACE CONTEXT:
        - Tasks: ${JSON.stringify(tasks || [])}
        - Meetings: ${JSON.stringify(meetings || [])}

        CRITICAL RULES:
        1. NEVER ask the user for more details. Calculate the dates and times yourself.
        2. If the user says "Sunday", calculate the exact date for the upcoming Sunday based on the Current Date.
        3. You MUST output exact ISO 8601 timestamps for startTime and endTime (e.g., "2026-07-26T15:00:00.000Z").
        4. FORMATTING RULE: You may explain your reasoning briefly, but your response MUST end with the JSON block. Do not write any text after the JSON block.

        When you have a plan, output ONLY ONE JSON block at the very end to execute the action immediately. 

        Example of correct behavior:
        User: "Create a meeting after the general assembly at 3pm on Sunday for 1 hour at Church of Daraga"
        You: "I will create the General Assembly for Sunday at 3:00 PM, and the follow-up meeting at 4:00 PM.
        \`\`\`json
        { "action": "create_meeting", "title": "General Assembly", "startTime": "2026-07-26T15:00:00.000Z", "endTime": "2026-07-26T16:00:00.000Z", "location": "Church of Daraga" }
        \`\`\`"
        `;
    // Format messages for Groq's chat completion API
    const groqMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map((m: any) => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }))
    ];

    // 🚀 STEP 7: Call Groq API (Using Qwen 2.5 32B, which is free and incredibly fast on Groq)
   const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile', // ✅ Current, stable, free, and highly capable
      temperature: 0.2, // Low temperature ensures it follows your JSON rules strictly
      max_tokens: 1024,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || 'No response from AI';

    // 💾 STEP 8: Persist conversation to Supabase
    let convId = conversationId;
    if (!convId) {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({ user_id: user.id, workspace_id: workspaceId, title: 'Secretary Chat' })
        .select()
        .single();
      convId = newConv?.id;
    }

    if (convId) {
      await supabase.from('ai_messages').insert([
        { conversation_id: convId, role: 'user', content: messages[messages.length - 1].content },
        { conversation_id: convId, role: 'model', content: responseText },
      ]);
    }

    return NextResponse.json({ response: responseText, conversationId: convId });

  } catch (err) {
    console.error('AI API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}