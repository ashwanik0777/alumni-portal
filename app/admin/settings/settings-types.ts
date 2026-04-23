export type AdminSettingsState = {
  institutionName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  locale: string;
  defaultLanding: "overview" | "requests" | "scholarships" | "analytics";
  allowRoleEdits: boolean;
  allowSelfRoleUpgrade: boolean;
  requireAdminApprovalForRoleChange: boolean;
  maxAdminSeats: string;
  memberAutoApproveTrusted: boolean;
  scholarshipApprovalSteps: "one-step" | "two-step" | "three-step";
  requestEscalationHours: string;
  requireRejectionReason: boolean;
  sendApprovalEmails: boolean;
  sendDailyDigest: boolean;
  sendCriticalAlerts: boolean;
  sendSmsForHighPriority: boolean;
  mfaRequiredForAdmins: boolean;
  forcePasswordRotationDays: string;
  sessionTimeoutMinutes: string;
  allowSingleSessionOnly: boolean;
  ipWhitelistEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetentionDays: string;
  autoArchiveResolvedRequests: boolean;
  archiveAfterDays: string;
  apiRateLimitPerMinute: string;
  enableWebhookEvents: boolean;
  enableSlackIntegration: boolean;
  enableEmailProvider: boolean;
  maintenanceMode: boolean;
};

export type SettingsStats = {
  access: { totalAdmins: number; totalMembers: number; pendingMembers: number; rejectedMembers: number };
  workflow: { memberVerificationRate: number; scholarshipReviewRate: number; applicationCompletionRate: number; programActiveRate: number };
  data: { totalRecords: number; tablesCount: number; lastUpdated: string };
};

export const defaultSettings: AdminSettingsState = {
  institutionName: "JNV Alumni Portal",
  supportEmail: "admin@jnvportal.in",
  supportPhone: "+91-90000-12345",
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  defaultLanding: "overview",
  allowRoleEdits: true,
  allowSelfRoleUpgrade: false,
  requireAdminApprovalForRoleChange: true,
  maxAdminSeats: "15",
  memberAutoApproveTrusted: false,
  scholarshipApprovalSteps: "two-step",
  requestEscalationHours: "12",
  requireRejectionReason: true,
  sendApprovalEmails: true,
  sendDailyDigest: true,
  sendCriticalAlerts: true,
  sendSmsForHighPriority: false,
  mfaRequiredForAdmins: true,
  forcePasswordRotationDays: "90",
  sessionTimeoutMinutes: "45",
  allowSingleSessionOnly: false,
  ipWhitelistEnabled: false,
  backupFrequency: "daily",
  backupRetentionDays: "30",
  autoArchiveResolvedRequests: true,
  archiveAfterDays: "14",
  apiRateLimitPerMinute: "600",
  enableWebhookEvents: true,
  enableSlackIntegration: false,
  enableEmailProvider: true,
  maintenanceMode: false,
};
