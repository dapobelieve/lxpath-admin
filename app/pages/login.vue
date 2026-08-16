<script setup lang="ts">
import { ShieldCheck, LoaderCircle } from '@lucide/vue';

definePageMeta({ layout: false });

useHead({ title: 'Sign in | lxpath Admin' });

const { login } = useAuth();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref('');
const pending = ref(false);

async function onSubmit() {
  error.value = '';
  pending.value = true;

  try {
    await login(email.value.trim(), password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await navigateTo(redirect);
  } catch (err: any) {
    error.value = err?.data?.message || 'Unable to sign in. Please try again.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30 px-4">
    <Card class="w-full max-w-sm">
      <CardHeader class="items-center text-center">
        <div class="mx-auto mb-2 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck class="size-5" />
        </div>
        <CardTitle class="text-xl">lxpath Admin</CardTitle>
        <CardDescription>Sign in to access the admin console</CardDescription>
      </CardHeader>

      <CardContent>
        <form class="grid gap-4" @submit.prevent="onSubmit">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="admin@lxpath.com"
              required
              :disabled="pending"
            />
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :disabled="pending"
            />
          </div>

          <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>

          <Button type="submit" class="w-full" :disabled="pending">
            <LoaderCircle v-if="pending" class="size-4 animate-spin" />
            {{ pending ? 'Signing in...' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
