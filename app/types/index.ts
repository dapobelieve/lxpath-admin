export type ValidationCategory = 'relevance' | 'redundancy' | 'budget_mismatch';
export type ValidationSeverity = 'low' | 'medium' | 'high';
export type PathStatus = 'generating' | 'active' | 'completed' | 'paused' | 'failed';
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ValidationFlag {
  courseId: string;
  courseTitle: string;
  difficulty: CourseDifficulty;
  category: ValidationCategory;
  severity: ValidationSeverity;
  reason: string;
  suggestion: string;
}

export interface ValidationResult {
  score: number;
  isValid: boolean;
  overallAssessment: string;
  flags: ValidationFlag[];
  validatedAt: string;
  modelUsed: string;
}

export interface ValidationPathSummary {
  _id: string;
  pathName: string;
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
  selectedCareer?: string;
  selectionType?: string;
  careerPath?: string;
  totalCourses: number;
  completedCourses: number;
  overallProgress: number;
  status: PathStatus;
  generatedAt: string;
  createdAt: string;
  validationResult?: {
    score: number;
    isValid: boolean;
    flags: ValidationFlag[];
    validatedAt: string;
  };
}

export interface ValidationStats {
  totalPaths: number;
  pathsWithValidation: number;
  pathsWithoutValidation: number;
  averageScore: number;
  validCount: number;
  invalidCount: number;
  highSeverityFlagCount: number;
  flagBreakdownByCategory: Record<ValidationCategory, number>;
  flagBreakdownBySeverity: Record<ValidationSeverity, number>;
  scoreBuckets: Record<string, number>;
  pathsByStatus: Record<string, number>;
  recentFlags: Array<{
    pathId: string;
    pathName: string;
    flag: ValidationFlag;
    validatedAt: string;
  }>;
}

export interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPaths {
  data: ValidationPathSummary[];
  pageInfo: PageInfo;
}

export interface PathDetail {
  _id: string;
  pathName: string;
  selectedCareer?: string;
  selectionType?: string;
  careerPath?: string;
  careerPathBreakdown?: any;
  skillBreakdown?: any;
  totalCourses: number;
  completedCourses: number;
  overallProgress: number;
  status: PathStatus;
  budgetAmount?: number;
  budgetCurrency?: string;
  courses: {
    beginner: Array<{ courseId: string; title: string; difficulty: string; cost: string; provider: string; skillsLearned: string[] }>;
    intermediate: Array<{ courseId: string; title: string; difficulty: string; cost: string; provider: string; skillsLearned: string[] }>;
    advanced: Array<{ courseId: string; title: string; difficulty: string; cost: string; provider: string; skillsLearned: string[] }>;
  };
  validationResult?: ValidationResult;
  generatedAt: string;
  createdAt: string;
}

export interface RecentUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  isLearner: boolean;
  otpVerification: boolean;
  createdAt: string;
  lastLoginAt?: string;
  pathCount: number;
}

export interface RecentUsersData {
  totalUsers: number;
  learnerCount: number;
  signedUpToday: number;
  activeThisWeek: number;
  users: RecentUser[];
}

export interface UserDetail {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  isLearner: boolean;
  otpVerification: boolean;
  createdAt: string;
  lastLoginAt?: string;
  organization?: string;
}

export interface UserDetailData {
  user: UserDetail;
  pathCount: number;
  paths: ValidationPathSummary[];
}

export interface CourseSummary {
  _id: string;
  title: string;
  description?: string;
  duration?: string;
  cost?: string;
  link: string;
  provider?: string;
  providerId?: string;
  rating?: number;
  skillsLearned?: string[];
  level?: string;
  category?: string;
  institution?: string;
  reviewCount?: number;
  isVerified?: boolean;
  language?: string;
  priorityScore?: number;
  priorityTier?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseFilters {
  providers: string[];
  levels: string[];
}

export interface PaginatedCourses {
  data: CourseSummary[];
  pageInfo: PageInfo;
  filters: CourseFilters;
}
