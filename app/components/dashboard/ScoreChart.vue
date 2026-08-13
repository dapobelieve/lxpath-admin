<script setup lang="ts">
const props = defineProps<{ buckets: Record<string, number> }>();

const BAR_COLORS: Record<string, string> = {
  '90-100': 'bg-chart-4',
  '70-89': 'bg-chart-2',
  '50-69': 'bg-chart-3',
  '0-49': 'bg-chart-5',
};

const bars = computed(() => {
  const entries = Object.entries(props.buckets ?? {});
  const max = Math.max(...entries.map(([, count]) => count), 1);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return entries.map(([label, count]) => ({
    label,
    count,
    color: BAR_COLORS[label] ?? 'bg-muted-foreground',
    height: `${Math.max(2, (count / max) * 100)}%`,
    share: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Score distribution</CardTitle>
      <CardDescription>Validated paths grouped by score band</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex h-44 items-end gap-3">
        <div v-for="bar in bars" :key="bar.label" class="flex h-full flex-1 flex-col items-center gap-2">
          <span class="text-sm font-semibold tabular-nums">{{ bar.count }}</span>
          <div class="flex w-full flex-1 items-end">
            <div
              :class="['w-full rounded-md transition-[height] duration-500 ease-out', bar.color]"
              :style="{ height: bar.height }"
            />
          </div>
          <div class="text-center">
            <div class="text-xs font-medium tabular-nums">{{ bar.label }}</div>
            <div class="text-xs text-muted-foreground tabular-nums">{{ bar.share }}%</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
