export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  currentWeek: number;
  status: "PREPARING" | "ACTIVE" | "COMPLETED";
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
