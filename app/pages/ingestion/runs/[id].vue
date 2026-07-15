<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Ingestion Run Detail" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="loading && !run" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else-if="!run" class="alert alert-error">
        <span>Ingestion run not found</span>
        <NuxtLink to="/ingestion" class="btn btn-sm">Back to Ingestion</NuxtLink>
      </div>

      <template v-else>
        <div class="flex items-center gap-3">
          <NuxtLink to="/ingestion" class="btn btn-sm btn-ghost">&larr; Back</NuxtLink>
          <span class="badge badge-lg" :class="statusBadge(run.status)">{{ statusLabel(run.status) }}</span>
          <span class="badge badge-outline capitalize">{{ run.trigger }}</span>
          <span v-if="run.quotaExhausted" class="badge badge-error badge-outline">quota exhausted</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="card bg-base-200 shadow">
            <div class="card-body">
              <h2 class="card-title text-base">Timing</h2>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between"><span class="opacity-60">Created</span><span>{{ formatDateTime(run.createdAt) }}</span></div>
                <div class="flex justify-between"><span class="opacity-60">Started</span><span>{{ run.startedAt ? formatDateTime(run.startedAt) : '—' }}</span></div>
                <div class="flex justify-between"><span class="opacity-60">Completed</span><span>{{ run.completedAt ? formatDateTime(run.completedAt) : '—' }}</span></div>
                <div class="flex justify-between"><span class="opacity-60">Duration</span><span>{{ runDuration }}</span></div>
              </div>
            </div>
          </div>

          <div class="card bg-base-200 shadow">
            <div class="card-body">
              <h2 class="card-title text-base">Progress</h2>
              <div class="flex items-center gap-6">
                <div class="radial-progress text-primary" :style="`--value:${progress}`" role="progressbar">
                  {{ progress }}%
                </div>
                <div class="space-y-1 text-sm">
                  <div><span class="text-success font-semibold">{{ run.createdCount }}</span> created</div>
                  <div><span class="text-info font-semibold">{{ run.updatedCount }}</span> updated</div>
                  <div><span class="opacity-70 font-semibold">{{ run.skippedCount }}</span> skipped</div>
                  <div><span class="text-error font-semibold">{{ run.failedCount }}</span> failed</div>
                </div>
              </div>
              <div class="text-sm opacity-70">{{ run.processedCount }} / {{ run.totalQueries }} queries processed</div>
            </div>
          </div>

          <div class="card bg-base-200 shadow">
            <div class="card-body">
              <h2 class="card-title text-base">Quota</h2>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between"><span class="opacity-60">Used this run</span><span>{{ formatNumber(run.quotaUnitsUsed) }} units</span></div>
                <div class="flex justify-between"><span class="opacity-60">Baseline (earlier today)</span><span>{{ formatNumber(run.quotaBaseline) }} units</span></div>
                <div class="flex justify-between"><span class="opacity-60">Budget</span><span>{{ formatNumber(run.quotaBudget) }} units</span></div>
              </div>
              <progress
                class="progress progress-primary"
                :value="run.quotaBaseline + run.quotaUnitsUsed"
                :max="run.quotaBudget"
              />
            </div>
          </div>
        </div>

        <div v-if="run.error" class="alert alert-warning">
          <span>{{ run.error }}</span>
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-3">Query Outcomes ({{ run.queryResults.length }})</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Career</th>
                  <th>Level</th>
                  <th>Search Query</th>
                  <th>Outcome</th>
                  <th>Course</th>
                  <th>Views</th>
                  <th>Tagged By</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in run.queryResults" :key="result.queryId">
                  <td class="max-w-40 truncate text-sm">{{ result.career }}</td>
                  <td><span class="badge badge-sm badge-ghost">{{ result.level }}</span></td>
                  <td class="max-w-56 truncate text-sm opacity-80">{{ result.query }}</td>
                  <td>
                    <span class="badge badge-sm" :class="actionBadge(result.action)">{{ result.action }}</span>
                    <div v-if="result.reason" class="text-xs opacity-60">{{ statusLabel(result.reason) }}</div>
                    <div v-if="result.error" class="text-xs text-error max-w-56 truncate" :title="result.error">{{ result.error }}</div>
                  </td>
                  <td class="max-w-64">
                    <NuxtLink
                      v-if="result.courseId"
                      :to="`/courses/${result.courseId}`"
                      class="link link-primary text-sm line-clamp-2"
                    >{{ result.courseTitle }}</NuxtLink>
                    <span v-else class="opacity-40">—</span>
                    <div v-if="result.channelTitle" class="text-xs opacity-60 truncate">{{ result.channelTitle }}</div>
                  </td>
                  <td class="text-sm">{{ result.viewCount ? formatNumber(result.viewCount) : '—' }}</td>
                  <td>
                    <span v-if="result.taggedBy" class="badge badge-xs" :class="result.taggedBy === 'llm' ? 'badge-info badge-outline' : 'badge-ghost'">
                      {{ result.taggedBy }}
                    </span>
                    <span v-else class="opacity-40">—</span>
                  </td>
                  <td class="text-xs opacity-70">{{ formatDurationMs(result.durationMs) }}</td>
                  <td>
                    <a
                      v-if="result.videoId"
                      :href="`https://www.youtube.com/watch?v=${result.videoId}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn btn-xs btn-ghost"
                    >&#9654; Watch</a>
                  </td>
                </tr>
                <tr v-if="run.queryResults.length === 0">
                  <td colspan="9" class="text-center opacity-60 py-8">No query results recorded yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { actionBadge, formatDateTime, formatDurationMs, formatNumber, statusBadge, statusLabel } from '~/utils/formatters';

const route = useRoute();
const runId = route.params.id as string;

const { getIngestionRunDetail } = useAdminApi();

const TERMINAL_STATUSES = ['completed', 'completed_with_errors', 'quota_exhausted', 'failed', 'cancelled'];

const { data: run, loading, refresh, stop } = usePolling(() => getIngestionRunDetail(runId), 3000);

watch([run, loading], ([currentRun, isLoading]) => {
  if (!isLoading && !currentRun) {
    stop();
    return;
  }
  if (currentRun && TERMINAL_STATUSES.includes(currentRun.status)) {
    stop();
  }
});

const progress = computed(() => {
  if (!run.value || run.value.totalQueries === 0) return 0;
  return Math.round((run.value.processedCount / run.value.totalQueries) * 100);
});

const runDuration = computed(() => {
  if (!run.value?.startedAt) return '—';
  const end = run.value.completedAt ? new Date(run.value.completedAt) : new Date();
  return formatDurationMs(end.getTime() - new Date(run.value.startedAt).getTime());
});
</script>
