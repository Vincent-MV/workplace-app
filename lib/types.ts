export type WorkspaceType = "school" | "ministry" | "work" | "personal";
export type TaskStatus = "todo" | "in_progress" | "done" | "missed";
export type TaskPriority = "low" | "medium" | "high";
export type ImportanceLevel = "low" | "medium" | "high" | "critical";
export type MessageRole = "user" | "assistant";

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  type: WorkspaceType;
  color: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  confirmed: boolean;
  created_at: string;
  workspace?: Workspace;
}

export interface Meeting {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  agenda: string | null;
  scheduled_at: string;
  duration_mins: number;
  location: string | null;
  created_at: string;
  workspace?: Workspace;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  streak_count: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
}

export interface Note {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  workspace?: Workspace;
}

export interface Lesson {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  content: string | null;
  importance: ImportanceLevel;
  created_at: string;
  workspace?: Workspace;
  lesson_tags?: LessonTag[];
}

export interface LessonTag {
  id: string;
  lesson_id: string;
  tag_name: string;
}

export interface Podcast {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  duration_secs: number;
  play_position: number;
  uploaded_at: string;
}

export interface AiTool {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category: string;
  description: string | null;
  created_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string | null;
  created_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}
