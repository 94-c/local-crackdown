export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  inviteCode: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  inbodyFrequencyDays: number;
  currentWeek: number;
  status: "PREPARING" | "ACTIVE" | "COMPLETED";
  goalTypes: GoalType[];
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  challengeId: string;
  member1: UserInfo;
  member2: UserInfo | null;
  createdAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: string;
  gender: string | null;
  birthDate: string | null;
  height: number | null;
}

export interface GoalType {
  id: string;
  name: string;
  unit: string;
  description: string | null;
  directionIsDecrease: boolean;
}

export interface InBodyRecord {
  id: string;
  weight: number;
  skeletalMuscleMass: number;
  bodyFatPercentage: number;
  bodyFatMass: number | null;
  recordDate: string;
  createdAt: string;
}

export interface UserGoal {
  id: string;
  goalType: GoalType;
  targetValue: number;
  startValue: number;
  createdAt: string;
}

export interface Achievement {
  goalTypeName: string;
  unit: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  achievementRate: number;
}

export interface MissionTemplate {
  id: string;
  name: string;
  description: string | null;
  unit: string;
}

export interface TeamMission {
  id: string;
  teamName: string;
  weekNumber: number;
  missionTemplateName: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  status: string;
  verifications: Verification[];
}

export interface Verification {
  id: string;
  userNickname: string;
  imageUrl: string | null;
  memo: string | null;
  verified: boolean;
  createdAt: string;
}

export interface WeeklyResult {
  teamName: string;
  teamScore: number;
  teamRank: number;
  isBottomTeam: boolean;
  members: { nickname: string; achievementRate: number }[];
}

export interface UserWeeklyResult {
  weekNumber: number;
  achievementRate: number;
  teamScore: number;
  teamRank: number;
  isBottomTeam: boolean;
}

// Sprint 5: 벌칙 미션 + 시즌 종료
export interface PenaltyMission {
  id: string;
  teamName: string;
  weekNumber: number;
  missionName: string;
  description: string | null;
  status: string;
  verifications: PenaltyVerification[];
}

export interface PenaltyVerification {
  id: string;
  userNickname: string;
  memo: string | null;
  imageUrl: string | null;
  approved: boolean;
  createdAt: string;
}

export interface FinalScoreResult {
  teamName: string;
  totalScore: number;
  finalRank: number;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: string;
  gender: string | null;
  birthDate: string | null;
  height: number | null;
}

export interface ChallengeInvite {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  inbodyFrequencyDays: number;
  status: string;
}

export interface Participant {
  id: string;
  userId: string;
  nickname: string;
  email: string;
  status: string;
  joinedAt: string;
  hasTeam: boolean;
  hasInbody: boolean;
  hasGoals: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

// Phase 2: Feed
export interface FeedEvent {
  id: string;
  userId: string;
  userNickname: string;
  userProfileImageUrl: string | null;
  eventType: "MISSION_VERIFICATION" | "PENALTY_VERIFICATION" | "INBODY_RECORD" | "WEEKLY_ACHIEVEMENT" | "USER_POST";
  referenceId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  cheerCount: number;
  cheeredByMe: boolean;
  createdAt: string;
}

export interface FeedPage {
  content: FeedEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface CheerToggleResult {
  cheered: boolean;
  cheerCount: number;
}
