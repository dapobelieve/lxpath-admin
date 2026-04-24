<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-lg">Flag Breakdown</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-semibold mb-2 opacity-70">By Category</h4>
          <div class="space-y-2">
            <div v-for="(count, cat) in byCategory" :key="cat" class="flex items-center justify-between">
              <span class="badge badge-sm" :class="categoryBadge(cat as string)">{{ categoryLabel(cat as string) }}</span>
              <span class="font-bold">{{ count }}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold mb-2 opacity-70">By Severity</h4>
          <div class="space-y-2">
            <div v-for="(count, sev) in bySeverity" :key="sev" class="flex items-center justify-between">
              <span class="badge badge-sm" :class="severityBadgeClass(sev as string)">{{ sev }}</span>
              <span class="font-bold">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationCategory, ValidationSeverity } from '~/types';
import { categoryLabel } from '~/utils/formatters';

defineProps<{
  byCategory: Record<ValidationCategory, number>;
  bySeverity: Record<ValidationSeverity, number>;
}>();

function categoryBadge(cat: string): string {
  switch (cat) {
    case 'relevance': return 'badge-primary';
    case 'redundancy': return 'badge-secondary';
    case 'budget_mismatch': return 'badge-accent';
    default: return 'badge-ghost';
  }
}

function severityBadgeClass(sev: string): string {
  switch (sev) {
    case 'high': return 'badge-error';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-info';
    default: return 'badge-ghost';
  }
}
</script>
