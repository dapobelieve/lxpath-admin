<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-lg">Recent Flags</h3>
      <div v-if="!flags || flags.length === 0" class="text-sm opacity-70">No flags found</div>
      <div v-else class="space-y-3">
        <div v-for="item in flags" :key="item.pathId + item.flag.courseId" class="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
          <span class="badge badge-sm mt-1" :class="severityBadge(item.flag.severity)">{{ item.flag.severity }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <NuxtLink :to="`/paths/${item.pathId}`" class="link link-hover text-sm font-semibold truncate">{{ item.pathName }}</NuxtLink>
              <span class="badge badge-sm badge-outline">{{ categoryLabel(item.flag.category) }}</span>
            </div>
            <p class="text-sm opacity-80 mt-1">{{ item.flag.courseTitle }}</p>
            <p class="text-xs opacity-60 mt-1">{{ item.flag.reason }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationStats } from '~/types';
import { severityBadge, categoryLabel } from '~/utils/formatters';

defineProps<{ flags?: ValidationStats['recentFlags'] }>();
</script>
