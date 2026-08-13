<script setup lang="ts">
import { RefreshCw } from '@lucide/vue';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    refreshing?: boolean;
    refreshable?: boolean;
  }>(),
  { refreshing: false, refreshable: true },
);

defineEmits<{ (e: 'refresh'): void }>();
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <header
      class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6"
    >
      <SidebarTrigger class="-ml-1.5" />
      <Separator orientation="vertical" class="mr-1 !h-5" />

      <div class="min-w-0">
        <h1 class="truncate text-sm font-semibold tracking-tight">{{ title }}</h1>
        <p v-if="description" class="truncate text-xs text-muted-foreground">{{ description }}</p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
        <Button
          v-if="refreshable"
          variant="outline"
          size="sm"
          :disabled="refreshing"
          @click="$emit('refresh')"
        >
          <RefreshCw :class="['size-3.5', refreshing && 'animate-spin']" />
          <span class="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-4 md:p-6">
      <slot />
    </main>
  </div>
</template>
