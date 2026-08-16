export default defineNuxtPlugin(async () => {
  const { token, user, fetchProfile } = useAuth();

  if (token.value && !user.value) {
    await fetchProfile();
  }
});
