<script setup lang="ts">
defineProps<{
  title: string;
  meta?: string;
}>();
</script>

<template>
  <Card class="gap-0 overflow-hidden py-0">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <div class="flex min-w-0 items-baseline gap-2">
        <h2 class="truncate text-sm font-semibold">{{ title }}</h2>
        <span v-if="meta || $slots.meta" class="text-xs text-muted-foreground tabular-nums">
          <slot name="meta">{{ meta }}</slot>
        </span>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div
      class="overflow-x-auto [&_thead_tr]:border-b [&_th]:h-10 [&_th]:px-4 [&_th]:text-xs [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:px-4 [&_td]:py-3 [&_tbody_tr:last-child]:border-0"
    >
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t px-4 py-3">
      <slot name="footer" />
    </div>
  </Card>
</template>
