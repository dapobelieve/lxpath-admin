export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();

  if (to.path === '/login') {
    return isAuthenticated.value ? navigateTo('/') : undefined;
  }

  if (!isAuthenticated.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
});
