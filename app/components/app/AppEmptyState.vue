<script setup lang="ts">
import type { Component } from 'vue';
import { Inbox } from '@lucide/vue';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    icon?: Component;
  }>(),
  { icon: () => Inbox },
);
</script>

<template>
  <div class="mx-auto flex max-w-sm flex-col items-center px-4 py-16 text-center">
    <div class="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <component :is="icon" class="size-5" />
    </div>
    <h3 class="text-sm font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
