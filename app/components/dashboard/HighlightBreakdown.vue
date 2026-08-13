<script setup lang="ts">
import type { HighlightCategory } from '~/types';
import { highlightCategoryLabel } from '~/utils/formatters';

const props = defineProps<{
  byCategory: Record<HighlightCategory, number>;
  averagePerPath: number;
}>();

const CATEGORY_BARS: Record<string, string> = {
  career_alignment: 'bg-chart-4',
  skill_gap_filled: 'bg-chart-1',
  progression: 'bg-chart-2',
  value: 'bg-chart-3',
};

const categories = computed(() => {
  const entries = Object.entries(props.byCategory ?? {});
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return entries.map(([key, count]) => ({
    key,
    label: highlightCategoryLabel(key),
    count,
    color: CATEGORY_BARS[key] ?? 'bg-muted-foreground',
    width: `${Math.max(2, (count / max) * 100)}%`,
  }));
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Strength breakdown</CardTitle>
      <CardDescription>Why the validator rates these paths well</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6 sm:grid-cols-[1fr_auto]">
      <div class="space-y-3">
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

      <div class="flex flex-col justify-center rounded-lg border bg-muted/40 px-5 py-4 text-center">
        <span class="text-3xl font-semibold tabular-nums text-success">{{ averagePerPath }}</span>
        <span class="mt-1 max-w-28 text-xs text-muted-foreground">Avg strengths per validated path</span>
      </div>
    </CardContent>
  </Card>
</template>
