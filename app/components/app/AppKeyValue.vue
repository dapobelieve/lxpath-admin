<script setup lang="ts">
defineProps<{
  label: string;
  value?: string | number | null;
}>();
</script>

<template>
  <div class="flex items-baseline justify-between gap-4 py-1.5 text-sm">
    <span class="shrink-0 text-muted-foreground">{{ label }}</span>
    <span class="min-w-0 text-right font-medium">
      <slot>{{ value ?? '—' }}</slot>
    </span>
  </div>
</template>
