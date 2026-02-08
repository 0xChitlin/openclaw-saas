// Mock activity data for the dashboard
export interface ActivityItem {
  id: string;
  type: "email" | "calendar" | "support" | "data" | "system";
  action: string;
  detail: string;
  timestamp: string;
}

export function getRecentActivity(userId: string): ActivityItem[] {
  // Mock data — in production this would come from a database
  const now = Date.now();
  const hour = 3600000;

  const activities: ActivityItem[] = [
    {
      id: "act_001",
      type: "email",
      action: "Replied to email",
      detail: "Sent follow-up to john@client.com about Q1 report",
      timestamp: new Date(now - hour * 0.5).toISOString(),
    },
    {
      id: "act_002",
      type: "calendar",
      action: "Scheduled meeting",
      detail: "Team standup moved to 10:00 AM per Sarah's request",
      timestamp: new Date(now - hour * 1).toISOString(),
    },
    {
      id: "act_003",
      type: "support",
      action: "Resolved ticket #1847",
      detail: "Password reset for user mark@company.com",
      timestamp: new Date(now - hour * 2).toISOString(),
    },
    {
      id: "act_004",
      type: "email",
      action: "Drafted response",
      detail: "Prepared reply to vendor pricing inquiry — awaiting review",
      timestamp: new Date(now - hour * 3).toISOString(),
    },
    {
      id: "act_005",
      type: "data",
      action: "Updated CRM record",
      detail: "Added 3 new contacts from trade show list",
      timestamp: new Date(now - hour * 4).toISOString(),
    },
    {
      id: "act_006",
      type: "system",
      action: "Integration synced",
      detail: "Google Calendar sync completed — 12 events updated",
      timestamp: new Date(now - hour * 6).toISOString(),
    },
    {
      id: "act_007",
      type: "email",
      action: "Sorted inbox",
      detail: "Categorized 24 emails — 3 flagged as urgent",
      timestamp: new Date(now - hour * 8).toISOString(),
    },
    {
      id: "act_008",
      type: "support",
      action: "Auto-replied to inquiry",
      detail: "Sent pricing info to lead from contact form",
      timestamp: new Date(now - hour * 10).toISOString(),
    },
    {
      id: "act_009",
      type: "calendar",
      action: "Sent reminders",
      detail: "Meeting reminder sent to 5 attendees for 2 PM review",
      timestamp: new Date(now - hour * 12).toISOString(),
    },
    {
      id: "act_010",
      type: "data",
      action: "Generated report",
      detail: "Weekly activity summary prepared and saved to Drive",
      timestamp: new Date(now - hour * 24).toISOString(),
    },
  ];

  // In real app, filter by userId
  void userId;
  return activities;
}
