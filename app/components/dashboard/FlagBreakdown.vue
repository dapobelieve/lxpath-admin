<script setup lang="ts">
import type { ValidationCategory, ValidationSeverity } from '~/types';
import { categoryLabel, severityVariant } from '~/utils/formatters';

const props = defineProps<{
  byCategory: Record<ValidationCategory, number>;
  bySeverity: Record<ValidationSeverity, number>;
}>();

const CATEGORY_BARS: Record<string, string> = {
  relevance: 'bg-chart-1',
  redundancy: 'bg-chart-2',
  budget_mismatch: 'bg-chart-3',
};

const categories = computed(() => {
  const entries = Object.entries(props.byCategory ?? {});
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return entries.map(([key, count]) => ({
    key,
    label: categoryLabel(key),
    count,
    color: CATEGORY_BARS[key] ?? 'bg-muted-foreground',
    width: `${Math.max(2, (count / max) * 100)}%`,
  }));
});

const severities = computed(() =>
  Object.entries(props.bySeverity ?? {}).map(([key, count]) => ({ key, count })),
);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Flag breakdown</CardTitle>
      <CardDescription>What validation is catching most often</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6 sm:grid-cols-2">
      <div class="space-y-3">
        <h4 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">By category</h4>
        <div v-for="item in categories" :key="item.key" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span>{{ item.label }}</span>
            <span class="font-semibold tabular-nums">{{ item.count }}</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div :class="['h-full rounded-full', item.color]" :style="{ width: item.width }" />
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">By severity</h4>
        <div
          v-for="item in severities"
          :key="item.key"
          class="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
        >
          <Badge :variant="severityVariant(item.key)" class="capitalize">{{ item.key }}</Badge>
          <span class="text-sm font-semibold tabular-nums">{{ item.count }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
