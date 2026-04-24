<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-lg">Score Distribution</h3>
      <div class="flex gap-4 items-end h-40">
        <div v-for="(count, label) in buckets" :key="label" class="flex flex-col items-center flex-1">
          <span class="text-sm font-bold mb-1">{{ count }}</span>
          <div
            class="w-full rounded-t"
            :class="bucketColor(label)"
            :style="{ height: barHeight(count) + 'px' }"
          />
          <span class="text-xs mt-1 opacity-70">{{ label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ buckets: Record<string, number> }>();

function bucketColor(label: string): string {
  switch (label) {
    case '90-100': return 'bg-success';
    case '70-89': return 'bg-info';
    case '50-69': return 'bg-warning';
    case '0-49': return 'bg-error';
    default: return 'bg-base-300';
  }
}

function barHeight(count: number): number {
  const max = Math.max(...Object.values(props.buckets), 1);
  return Math.max(4, (count / max) * 120);
}
</script>
