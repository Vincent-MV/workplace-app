import type { Workspace, Task, Meeting, Habit, HabitLog } from "@/lib/types";

const TODAY = new Date();
const todayISO = TODAY.toISOString().split("T")[0];

function daysFromNow(n: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const MOCK_USER_ID = "demo-user";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-school",
    user_id: MOCK_USER_ID,
    name: "School",
    type: "school",
    color: "#6366f1",
    icon: "GraduationCap",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "ws-ministry",
    user_id: MOCK_USER_ID,
    name: "Altar Servers",
    type: "ministry",
    color: "#f59e0b",
    icon: "Church",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    workspace_id: "ws-school",
    user_id: MOCK_USER_ID,
    title: "Submit Philosophy paper draft",
    description: "Upload to Canvas by midnight",
    status: "todo",
    priority: "high",
    due_date: todayISO,
    confirmed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "t2",
    workspace_id: "ws-school",
    user_id: MOCK_USER_ID,
    title: "Study for Theology midterm",
    description: "Chapters 5–9, focus on sacraments",
    status: "in_progress",
    priority: "high",
    due_date: todayISO,
    confirmed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "t3",
    workspace_id: "ws-ministry",
    user_id: MOCK_USER_ID,
    title: "Prepare Sunday Mass schedule",
    description: "Assign servers for 8am and 10:30am Mass",
    status: "todo",
    priority: "medium",
    due_date: todayISO,
    confirmed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "t4",
    workspace_id: "ws-school",
    user_id: MOCK_USER_ID,
    title: "Review lab report feedback",
    description: "Prof. Garcia left comments in portal",
    status: "done",
    priority: "low",
    due_date: todayISO,
    confirmed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "t5",
    workspace_id: "ws-ministry",
    user_id: MOCK_USER_ID,
    title: "Send training reminder to new servers",
    description: "WhatsApp group — Saturday 9am",
    status: "todo",
    priority: "medium",
    due_date: todayISO,
    confirmed: false,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "m1",
    workspace_id: "ws-ministry",
    user_id: MOCK_USER_ID,
    title: "Altar Servers Officer Meeting",
    agenda: "Discuss Holy Week assignments and new member orientation",
    scheduled_at: daysFromNow(1),
    duration_mins: 60,
    location: "Parish Hall Room 3",
    created_at: new Date().toISOString(),
  },
  {
    id: "m2",
    workspace_id: "ws-school",
    user_id: MOCK_USER_ID,
    title: "Study Group — Theology",
    agenda: "Review sacraments chapter and past exam questions",
    scheduled_at: daysFromNow(2),
    duration_mins: 90,
    location: "Library Room 204",
    created_at: new Date().toISOString(),
  },
  {
    id: "m3",
    workspace_id: "ws-school",
    user_id: MOCK_USER_ID,
    title: "Advising Appointment",
    agenda: "Course selection for next semester",
    scheduled_at: daysFromNow(4),
    duration_mins: 30,
    location: "Registrar Office",
    created_at: new Date().toISOString(),
  },
  {
    id: "m4",
    workspace_id: "ws-ministry",
    user_id: MOCK_USER_ID,
    title: "New Server Training",
    agenda: "Liturgical movements, vestments, and procession order",
    scheduled_at: daysFromNow(5),
    duration_mins: 120,
    location: "Sacristy",
    created_at: new Date().toISOString(),
  },
];

export const MOCK_HABITS: Habit[] = [
  {
    id: "h1",
    user_id: MOCK_USER_ID,
    name: "Morning prayer",
    description: "Lauds or rosary before breakfast",
    streak_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: "h2",
    user_id: MOCK_USER_ID,
    name: "Read for 30 min",
    description: "Textbook, scripture, or spiritual reading",
    streak_count: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: "h3",
    user_id: MOCK_USER_ID,
    name: "Review class notes",
    description: "Re-read today's lecture notes",
    streak_count: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "h4",
    user_id: MOCK_USER_ID,
    name: "Evening reflection",
    description: "Examine conscience, plan tomorrow",
    streak_count: 9,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_HABIT_LOGS: HabitLog[] = [
  {
    id: "hl1",
    habit_id: "h1",
    log_date: todayISO,
    completed: true,
  },
];
