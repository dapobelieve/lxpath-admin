<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-lg">Strength Breakdown</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-semibold mb-2 opacity-70">By Category</h4>
          <div class="space-y-2">
            <div v-for="(count, cat) in byCategory" :key="cat" class="flex items-center justify-between">
              <span class="badge badge-sm" :class="highlightCategoryBadge(cat as string)">{{ highlightCategoryLabel(cat as string) }}</span>
              <span class="font-bold">{{ count }}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold mb-2 opacity-70">Per Path</h4>
          <div class="stat p-0">
            <div class="stat-value text-success">{{ averagePerPath }}</div>
            <div class="stat-desc">Avg strengths per validated path</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HighlightCategory } from '~/types';
import { highlightCategoryLabel } from '~/utils/formatters';

defineProps<{
  byCategory: Record<HighlightCategory, number>;
  averagePerPath: number;
}>();

function highlightCategoryBadge(cat: string): string {
  switch (cat) {
    case 'career_alignment': return 'badge-success';
    case 'skill_gap_filled': return 'badge-primary';
    case 'progression': return 'badge-secondary';
    case 'value': return 'badge-accent';
    default: return 'badge-ghost';
  }
}
</script>
