<script setup lang="ts">
import { CircleCheck, Route, Star, TriangleAlert } from '@lucide/vue';
import type { ValidationStats } from '~/types';
import { formatNumber, scoreColor } from '~/utils/formatters';

defineProps<{ stats: ValidationStats }>();

const icons = { Route, Star, CircleCheck, TriangleAlert };
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <AppStatCard
      label="Total paths"
      :value="formatNumber(stats.totalPaths)"
      :hint="`${formatNumber(stats.pathsWithValidation)} validated`"
      :icon="icons.Route"
    />
    <AppStatCard
      label="Average score"
      :value="stats.averageScore"
      hint="Across validated paths"
      :icon="icons.Star"
      :value-class="scoreColor(stats.averageScore)"
    />
    <AppStatCard
      label="Valid paths"
      :value="formatNumber(stats.validCount)"
      :hint="`${formatNumber(stats.invalidCount)} with issues`"
      :icon="icons.CircleCheck"
      value-class="text-success"
    />
    <AppStatCard
      label="High severity"
      :value="formatNumber(stats.highSeverityFlagCount)"
      hint="Flags needing attention"
      :icon="icons.TriangleAlert"
      :value-class="stats.highSeverityFlagCount > 0 ? 'text-destructive' : ''"
    />
  </div>
</template>
