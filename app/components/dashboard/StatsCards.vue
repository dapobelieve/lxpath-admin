<template>
  <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
    <div class="stat">
      <div class="stat-figure text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div class="stat-title">Total Paths</div>
      <div class="stat-value text-primary">{{ stats.totalPaths }}</div>
      <div class="stat-desc">{{ stats.pathsWithValidation }} validated</div>
    </div>

    <div class="stat">
      <div class="stat-figure" :class="scoreColor(stats.averageScore)">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.04.588 1.483l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.573-.33-1.483.588-1.483h4.915a1 1 0 00.95-.69l1.519-4.674z" />
        </svg>
      </div>
      <div class="stat-title">Avg Score</div>
      <div class="stat-value" :class="scoreColor(stats.averageScore)">{{ stats.averageScore }}</div>
      <div class="stat-desc">Across validated paths</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="stat-title">Valid Paths</div>
      <div class="stat-value text-success">{{ stats.validCount }}</div>
      <div class="stat-desc">{{ stats.invalidCount }} with issues</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="stat-title">High Severity</div>
      <div class="stat-value text-error">{{ stats.highSeverityFlagCount }}</div>
      <div class="stat-desc">Flags needing attention</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationStats } from '~/types';
import { scoreColor } from '~/utils/formatters';

defineProps<{ stats: ValidationStats }>();
</script>
