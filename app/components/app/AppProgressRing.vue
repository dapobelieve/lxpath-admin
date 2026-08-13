<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    size?: number;
    stroke?: number;
  }>(),
  { size: 72, stroke: 6 },
);

const radius = computed(() => (props.size - props.stroke) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => {
  const clamped = Math.min(Math.max(props.value, 0), 100);
  return circumference.value * (1 - clamped / 100);
});
</script>

<template>
  <div
    class="relative shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-valuenow="Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <svg :width="size" :height="size" class="-rotate-90">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        class="stroke-muted"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="stroke-current transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
      <slot>{{ Math.round(value) }}%</slot>
    </div>
  </div>
</template>
