-- =====================================================
-- ENABLE RLS ON ALL TABLES WITH PROPER POLICIES
-- =====================================================

-- 1. USERS TABLE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for new users" ON users;
CREATE POLICY "Enable insert for new users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- 2. WORKSPACES TABLE
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own workspaces" ON workspaces;
CREATE POLICY "Users can read own workspaces"
  ON workspaces
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own workspaces" ON workspaces;
CREATE POLICY "Users can create own workspaces"
  ON workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;
CREATE POLICY "Users can update own workspaces"
  ON workspaces
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces;
CREATE POLICY "Users can delete own workspaces"
  ON workspaces
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TASKS TABLE
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
CREATE POLICY "Users can create own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. MEETINGS TABLE
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own meetings" ON meetings;
CREATE POLICY "Users can read own meetings"
  ON meetings
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own meetings" ON meetings;
CREATE POLICY "Users can create own meetings"
  ON meetings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
CREATE POLICY "Users can update own meetings"
  ON meetings
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;
CREATE POLICY "Users can delete own meetings"
  ON meetings
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. HABITS TABLE
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own habits" ON habits;
CREATE POLICY "Users can read own habits"
  ON habits
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own habits" ON habits;
CREATE POLICY "Users can create own habits"
  ON habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits"
  ON habits
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits"
  ON habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. HABIT_LOGS TABLE
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own habit logs" ON habit_logs;
CREATE POLICY "Users can read own habit logs"
  ON habit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own habit logs" ON habit_logs;
CREATE POLICY "Users can create own habit logs"
  ON habit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own habit logs" ON habit_logs;
CREATE POLICY "Users can update own habit logs"
  ON habit_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

-- 7. NOTES TABLE
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notes" ON notes;
CREATE POLICY "Users can read own notes"
  ON notes
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own notes" ON notes;
CREATE POLICY "Users can create own notes"
  ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
  ON notes
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
  ON notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. LESSONS TABLE
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own lessons" ON lessons;
CREATE POLICY "Users can read own lessons"
  ON lessons
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own lessons" ON lessons;
CREATE POLICY "Users can create own lessons"
  ON lessons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lessons" ON lessons;
CREATE POLICY "Users can update own lessons"
  ON lessons
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lessons" ON lessons;
CREATE POLICY "Users can delete own lessons"
  ON lessons
  FOR DELETE
  USING (auth.uid() = user_id);

-- 9. LESSON_TAGS TABLE
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own lesson tags" ON lesson_tags;
CREATE POLICY "Users can read own lesson tags"
  ON lesson_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_tags.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own lesson tags" ON lesson_tags;
CREATE POLICY "Users can create own lesson tags"
  ON lesson_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_tags.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own lesson tags" ON lesson_tags;
CREATE POLICY "Users can delete own lesson tags"
  ON lesson_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_tags.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- 10. AI_TOOLS TABLE
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ai tools" ON ai_tools;
CREATE POLICY "Users can read own ai tools"
  ON ai_tools
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own ai tools" ON ai_tools;
CREATE POLICY "Users can create own ai tools"
  ON ai_tools
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai tools" ON ai_tools;
CREATE POLICY "Users can update own ai tools"
  ON ai_tools
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ai tools" ON ai_tools;
CREATE POLICY "Users can delete own ai tools"
  ON ai_tools
  FOR DELETE
  USING (auth.uid() = user_id);

-- 11. AI_CONVERSATIONS TABLE
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own conversations" ON ai_conversations;
CREATE POLICY "Users can read own conversations"
  ON ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own conversations" ON ai_conversations;
CREATE POLICY "Users can create own conversations"
  ON ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
CREATE POLICY "Users can update own conversations"
  ON ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON ai_conversations;
CREATE POLICY "Users can delete own conversations"
  ON ai_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 12. AI_MESSAGES TABLE
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own messages" ON ai_messages;
CREATE POLICY "Users can read own messages"
  ON ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = ai_messages.conversation_id 
      AND ai_conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own messages" ON ai_messages;
CREATE POLICY "Users can create own messages"
  ON ai_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations 
      WHERE ai_conversations.id = ai_messages.conversation_id 
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;