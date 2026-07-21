// app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // 🔐 STEP 1: Read auth cookies directly
    const cookieStore = await cookies();
    
    // Supabase stores tokens in these specific cookie names
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing auth cookies' },
        { status: 401 }
      );
    }

    // 🔐 STEP 2: Create a fresh Supabase client FOR THIS REQUEST ONLY
    // We pass the cookies explicitly so this client is authenticated
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false, // Don't try to save session back to cookies in API route
          autoRefreshToken: false, // Handle token refresh manually if needed later
        },
        global: {
          headers: {
            // Manually inject the auth cookies into every request this client makes
            cookie: `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`,
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
      .select('id, title, start_time, end_time, location')
      .eq('workspace_id', workspaceId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);

    // 🤖 STEP 6: Build system prompt with meeting logic
    const systemInstruction = `
You are the AI Secretary for Nexus.
Current date: ${new Date().toLocaleDateString()}

WORKSPACE CONTEXT:
- Tasks: ${JSON.stringify(tasks || [])}
- Meetings: ${JSON.stringify(meetings || [])}

RULES:
1. If user asks to create a meeting *after* an existing one (e.g., "after the general assembly"), find that meeting in the list, then set the new meeting's:
   - startTime = original meeting's endTime
   - endTime = original meeting's endTime + 1 hour
   - location = same as original meeting
2. When confirming an action, output ONLY ONE JSON block at the very end, like:
\`\`\`json
{ "action": "create_meeting", "title": "...", "startTime": "...", "endTime": "...", "location": "..." }
\`\`\`
3. Never invent task IDs. For new items, omit ID.
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      systemInstruction 
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const responseText = result.response.text();

    // 💾 STEP 7: Persist conversation
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