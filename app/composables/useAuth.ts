export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AdminUser;
  };
}

interface ProfileResponse {
  data: { user: AdminUser };
}

const TOKEN_COOKIE = 'lxpath_admin_token';

export function useAuth() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  const token = useCookie<string | null>(TOKEN_COOKIE, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: !import.meta.dev,
  });

  const user = useState<AdminUser | null>('admin-user', () => null);

  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(email: string, password: string): Promise<void> {
    const response = await $fetch<AuthResponse>(
      `${baseUrl}/api/v1/auth/admin/sign-in`,
      { method: 'POST', body: { email, password } },
    );

    token.value = response.data.accessToken;
    user.value = response.data.user;
  }

  async function fetchProfile(): Promise<AdminUser | null> {
    if (!token.value) return null;

    try {
      const response = await $fetch<ProfileResponse>(
        `${baseUrl}/api/v1/auth/admin/me`,
        { headers: { Authorization: `Bearer ${token.value}` } },
      );
      user.value = response.data.user;
      return user.value;
    } catch {
      token.value = null;
      user.value = null;
      return null;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    navigateTo('/login');
  }

  return { token, user, isAuthenticated, login, logout, fetchProfile };
}
