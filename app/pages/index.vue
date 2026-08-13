<script setup lang="ts">
const { getValidationStats } = useAdminApi();

const { data, pending, error, refresh } = useAsyncData(
  'validation-stats',
  () => getValidationStats(),
  { default: () => null },
);
</script>

<template>
  <AppPage
    title="Validation dashboard"
    description="Quality of the learning paths lxpath is generating"
    :refreshing="pending"
    @refresh="refresh"
  >
    <template v-if="pending && !data">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="n in 4" :key="n" class="h-[104px] rounded-xl" />
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <Skeleton class="h-72 rounded-xl" />
        <Skeleton class="h-72 rounded-xl" />
      </div>
      <Skeleton class="h-64 rounded-xl" />
    </template>

    <template v-else-if="data">
      <DashboardStatsCards :stats="data" />

      <div class="grid gap-4 lg:grid-cols-2">
        <DashboardScoreChart :buckets="data.scoreBuckets" />
        <DashboardHighlightBreakdown
          :by-category="data.highlightBreakdownByCategory"
          :average-per-path="data.averageHighlightsPerPath"
        />
      </div>

      <DashboardFlagBreakdown
        :by-category="data.flagBreakdownByCategory"
        :by-severity="data.flagBreakdownBySeverity"
      />

      <DashboardRecentFlags :flags="data.recentFlags" />
    </template>

    <AppErrorState
      v-else-if="error"
      title="Failed to load dashboard"
      :message="error.message"
      @retry="refresh"
    />
  </AppPage>
</template>
