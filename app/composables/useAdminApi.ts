import type { ValidationStats, PaginatedPaths, PathDetail, RecentUsersData, UserDetailData, ValidationPathSummary, PageInfo } from '~/types';

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

  return {
    getValidationStats,
    getValidationPaths,
    getValidationPathDetail,
    getRecentUsers,
    getUserDetail,
  };
}
