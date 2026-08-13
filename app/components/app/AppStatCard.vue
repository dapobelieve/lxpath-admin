<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    hint?: string;
    icon?: Component;
    valueClass?: string;
    loading?: boolean;
  }>(),
  { valueClass: '' },
);
</script>

<template>
  <Card class="gap-0 py-4">
    <CardContent class="px-4">
      <div class="flex items-start justify-between gap-3">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {{ label }}
        </p>
        <div
          v-if="icon"
          class="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        >
          <component :is="icon" class="size-3.5" />
        </div>
      </div>

      <Skeleton v-if="loading" class="mt-2 h-8 w-20" />
      <p v-else :class="['mt-1.5 text-2xl font-semibold tabular-nums tracking-tight', valueClass]">
        <slot name="value">{{ value }}</slot>
      </p>

      <div class="mt-1 text-xs text-muted-foreground">
        <slot name="hint">{{ hint }}</slot>
      </div>
    </CardContent>
  </Card>
</template>
