import type { ValidationStats, PaginatedPaths, PathDetail, RecentUser, RecentUsersData, UserDetailData, ValidationPathSummary, PageInfo, PaginatedCourses, CourseSummary, CourseFilters, CourseDetail, IngestionStats, IngestionRunSummary, IngestionRunDetail, IngestionQuery, IngestionSettings, PaginatedRuns, TriggerRunPayload } from '~/types';

interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
  code: number;
}

interface PaginatedResponse {
  data: ValidationPathSummary[];
  pageInfo: PageInfo;
  status: string;
  message: string;
  code: number;
}

interface PaginatedCoursesResponse {
  data: CourseSummary[];
  pageInfo: PageInfo;
  filters: CourseFilters;
  status: string;
  message: string;
  code: number;
}

interface PaginatedRunsResponse {
  data: IngestionRunSummary[];
  pageInfo: PageInfo;
  status: string;
  message: string;
  code: number;
}

export function useAdminApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  async function getValidationStats(): Promise<ValidationStats> {
    const response = await $fetch<ApiResponse<{ stats: ValidationStats }>>(
      `${baseUrl}/api/admin/validation/stats`,
    );
    return response.data.stats;
  }

  async function getValidationPaths(params: {
    page?: number;
    limit?: number;
    isValid?: boolean;
    status?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  } = {}): Promise<PaginatedPaths> {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.isValid !== undefined) query.isValid = String(params.isValid);
    if (params.status) query.status = params.status;
    if (params.q) query.q = params.q;
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortOrder) query.sortOrder = params.sortOrder;
    if (params.userId) query.userId = params.userId;

    const response = await $fetch<PaginatedResponse>(
      `${baseUrl}/api/admin/validation/paths`,
      { params: query },
    );
    return {
      data: response.data,
      pageInfo: response.pageInfo,
    };
  }

  async function getValidationPathDetail(pathId: string): Promise<PathDetail | null> {
    try {
      const response = await $fetch<ApiResponse<{ path: PathDetail }>>(
        `${baseUrl}/api/admin/validation/paths/${pathId}`,
      );
      return response.data.path;
    } catch {
      return null;
    }
  }

  async function getRecentUsers(): Promise<RecentUsersData> {
    const response = await $fetch<ApiResponse<{ users: RecentUsersData }>>(
      `${baseUrl}/api/admin/users/recent`,
    );
    return response.data.users;
  }

  async function getUsersExport(): Promise<RecentUser[]> {
    const response = await $fetch<ApiResponse<{ users: RecentUser[] }>>(
      `${baseUrl}/api/admin/users/export`,
    );
    return response.data.users;
  }

  async function getUserDetail(userId: string): Promise<UserDetailData | null> {
    try {
      const response = await $fetch<ApiResponse<UserDetailData>>(
        `${baseUrl}/api/admin/users/${userId}`,
      );
      return response.data;
    } catch {
      return null;
    }
  }

  async function getCourses(params: {
    page?: number;
    limit?: number;
    q?: string;
    provider?: string;
    level?: string;
    category?: string;
    source?: string;
    isVerified?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedCourses> {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.q) query.q = params.q;
    if (params.provider) query.provider = params.provider;
    if (params.level) query.level = params.level;
    if (params.category) query.category = params.category;
    if (params.source) query.source = params.source;
    if (params.isVerified !== undefined) query.isVerified = String(params.isVerified);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortOrder) query.sortOrder = params.sortOrder;

    const response = await $fetch<PaginatedCoursesResponse>(
      `${baseUrl}/api/admin/courses`,
      { params: query },
    );
    return {
      data: response.data,
      pageInfo: response.pageInfo,
      filters: response.filters,
    };
  }

  async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
    try {
      const response = await $fetch<ApiResponse<{ course: CourseDetail }>>(
        `${baseUrl}/api/admin/courses/${courseId}`,
      );
      return response.data.course;
    } catch {
      return null;
    }
  }

  async function getIngestionStats(): Promise<IngestionStats> {
    const response = await $fetch<ApiResponse<{ stats: IngestionStats }>>(
      `${baseUrl}/api/admin/youtube-ingestion/stats`,
    );
    return response.data.stats;
  }

  async function getIngestionRuns(params: {
    page?: number;
    limit?: number;
    status?: string;
    trigger?: string;
  } = {}): Promise<PaginatedRuns> {
    const query: Record<string, string> = {};
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    if (params.status) query.status = params.status;
    if (params.trigger) query.trigger = params.trigger;

    const response = await $fetch<PaginatedRunsResponse>(
      `${baseUrl}/api/admin/youtube-ingestion/runs`,
      { params: query },
    );
    return {
      data: response.data,
      pageInfo: response.pageInfo,
    };
  }

  async function getIngestionRunDetail(runId: string): Promise<IngestionRunDetail | null> {
    try {
      const response = await $fetch<ApiResponse<{ run: IngestionRunDetail }>>(
        `${baseUrl}/api/admin/youtube-ingestion/runs/${runId}`,
      );
      return response.data.run;
    } catch {
      return null;
    }
  }

  async function triggerIngestionRun(payload: TriggerRunPayload = {}): Promise<{ queued: boolean }> {
    const response = await $fetch<ApiResponse<{ queued: boolean }>>(
      `${baseUrl}/api/admin/youtube-ingestion/runs`,
      { method: 'POST', body: payload },
    );
    return response.data;
  }

  async function cancelIngestionRun(runId: string): Promise<{ cancelled: boolean }> {
    const response = await $fetch<ApiResponse<{ cancelled: boolean }>>(
      `${baseUrl}/api/admin/youtube-ingestion/runs/${runId}/cancel`,
      { method: 'POST' },
    );
    return response.data;
  }

  async function getIngestionSettings(): Promise<IngestionSettings> {
    const response = await $fetch<ApiResponse<{ settings: IngestionSettings }>>(
      `${baseUrl}/api/admin/youtube-ingestion/settings`,
    );
    return response.data.settings;
  }

  async function updateIngestionSettings(
    update: Partial<IngestionSettings>,
  ): Promise<IngestionSettings> {
    const response = await $fetch<ApiResponse<{ settings: IngestionSettings }>>(
      `${baseUrl}/api/admin/youtube-ingestion/settings`,
      { method: 'PATCH', body: update },
    );
    return response.data.settings;
  }

  async function getIngestionQueries(): Promise<IngestionQuery[]> {
    const response = await $fetch<ApiResponse<{ queries: IngestionQuery[] }>>(
      `${baseUrl}/api/admin/youtube-ingestion/queries`,
    );
    return response.data.queries;
  }

  return {
    getValidationStats,
    getValidationPaths,
    getValidationPathDetail,
    getRecentUsers,
    getUsersExport,
    getUserDetail,
    getCourses,
    getCourseDetail,
    getIngestionStats,
    getIngestionRuns,
    getIngestionRunDetail,
    triggerIngestionRun,
    cancelIngestionRun,
    getIngestionSettings,
    updateIngestionSettings,
    getIngestionQueries,
  };
}
