<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Validation Dashboard" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="data">
        <DashboardStatsCards :stats="data" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardScoreChart :buckets="data.scoreBuckets" />
          <DashboardFlagBreakdown :by-category="data.flagBreakdownByCategory" :by-severity="data.flagBreakdownBySeverity" />
        </div>

        <DashboardRecentFlags :flags="data.recentFlags" />
      </template>

      <div v-else-if="error" class="alert alert-error">
        <span>Failed to load stats: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getValidationStats } = useAdminApi();

const { data, pending, error, refresh } = useAsyncData(
  'validation-stats',
  () => getValidationStats(),
  { default: () => null },
);
</script>
