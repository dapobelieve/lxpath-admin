<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="YouTube Ingestion" @refresh="refreshAll" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="actionError" class="alert alert-error">
        <span>{{ actionError }}</span>
        <button class="btn btn-sm btn-ghost" @click="actionError = ''">Dismiss</button>
      </div>

      <div class="card bg-base-200 shadow">
        <div class="card-body py-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="card-title text-base">
                Continuous Ingestion
                <span class="badge badge-sm" :class="ingestionEnabled ? 'badge-success' : 'badge-error'">
                  {{ ingestionEnabled ? 'on' : 'off' }}
                </span>
              </h2>
              <p class="text-sm opacity-70">
                {{ ingestionEnabled
                  ? 'Scheduled and manual runs are active'
                  : 'Paused — scheduled and manual runs are blocked until switched back on' }}
              </p>
            </div>
            <input
              type="checkbox"
              class="toggle toggle-success"
              :checked="ingestionEnabled"
              :disabled="togglingEnabled || stats === null"
              @change="toggleIngestion"
            />
          </div>
        </div>
      </div>

      <div class="stats stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-title">Ingested Courses</div>
          <div class="stat-value text-primary">{{ formatNumber(stats?.ingestedCourses ?? 0) }}</div>
          <div class="stat-desc">
            <NuxtLink to="/courses?source=youtube-ingest" class="link">View in catalog</NuxtLink>
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Quota Used Today</div>
          <div class="stat-value" :class="quotaColor">{{ formatNumber(stats?.quotaUsedToday ?? 0) }}</div>
          <div class="stat-desc">of {{ formatNumber(stats?.quotaBudget ?? 0) }} units</div>
        </div>
        <div class="stat">
          <div class="stat-title">Last Run</div>
          <div class="stat-value text-lg">
            <span v-if="stats?.lastRun" class="badge badge-lg" :class="statusBadge(stats.lastRun.status)">
              {{ statusLabel(stats.lastRun.status) }}
            </span>
            <span v-else class="opacity-40">—</span>
          </div>
          <div class="stat-desc">{{ stats?.lastRun ? formatDateTime(stats.lastRun.createdAt) : 'No runs yet' }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Next Scheduled Run</div>
          <div class="stat-value text-lg">{{ stats?.nextRunAt ? formatDateTime(stats.nextRunAt) : '—' }}</div>
          <div class="stat-desc">{{ formatNumber(stats?.enabledQueries ?? 0) }} enabled queries</div>
        </div>
      </div>

      <div v-if="activeRun" class="card bg-base-200 shadow">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title">
              Active Run
              <span class="badge" :class="statusBadge(activeRun.status)">{{ statusLabel(activeRun.status) }}</span>
            </h2>
            <button class="btn btn-error btn-sm" :disabled="cancelling" @click="cancelActiveRun">
              <span v-if="cancelling" class="loading loading-spinner loading-xs" />
              Cancel
            </button>
          </div>
          <div class="flex items-center gap-8 mt-2">
            <div
              class="radial-progress text-primary"
              :style="`--value:${activeProgress}`"
              role="progressbar"
            >
              {{ activeProgress }}%
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
              <div>
                <div class="text-xs opacity-60">Processed</div>
                <div class="text-lg font-semibold">{{ activeRun.processedCount }} / {{ activeRun.totalQueries }}</div>
              </div>
              <div>
                <div class="text-xs opacity-60">Created</div>
                <div class="text-lg font-semibold text-success">{{ activeRun.createdCount }}</div>
              </div>
              <div>
                <div class="text-xs opacity-60">Updated</div>
                <div class="text-lg font-semibold text-info">{{ activeRun.updatedCount }}</div>
              </div>
              <div>
                <div class="text-xs opacity-60">Skipped</div>
                <div class="text-lg font-semibold opacity-70">{{ activeRun.skippedCount }}</div>
              </div>
              <div>
                <div class="text-xs opacity-60">Failed</div>
                <div class="text-lg font-semibold text-error">{{ activeRun.failedCount }}</div>
              </div>
            </div>
          </div>
          <div class="text-sm opacity-70 mt-2">
            Quota used this run: {{ formatNumber(activeRun.quotaUnitsUsed) }} units ·
            <NuxtLink :to="`/ingestion/runs/${activeRun._id}`" class="link">View details</NuxtLink>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn btn-primary btn-sm" :disabled="!!activeRun || triggering || !ingestionEnabled" @click="runNow">
          <span v-if="triggering" class="loading loading-spinner loading-xs" />
          Run now
        </button>
        <span v-if="activeRun" class="text-sm opacity-60">A run is already in progress</span>
        <span v-else-if="!ingestionEnabled" class="text-sm opacity-60">Ingestion is switched off</span>
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-3">Run History</h2>

        <div v-if="pending" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <template v-else-if="runsData">
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Trigger</th>
                  <th>Progress</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Skipped</th>
                  <th>Failed</th>
                  <th>Quota</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="run in runsData.data" :key="run._id">
                  <td>
                    <span class="badge badge-sm" :class="statusBadge(run.status)">{{ statusLabel(run.status) }}</span>
                  </td>
                  <td class="text-sm capitalize">{{ run.trigger }}</td>
                  <td class="text-sm">{{ run.processedCount }} / {{ run.totalQueries }}</td>
                  <td class="text-success">{{ run.createdCount }}</td>
                  <td class="text-info">{{ run.updatedCount }}</td>
                  <td class="opacity-70">{{ run.skippedCount }}</td>
                  <td :class="run.failedCount > 0 ? 'text-error' : 'opacity-40'">{{ run.failedCount }}</td>
                  <td class="text-sm">{{ formatNumber(run.quotaUnitsUsed) }}</td>
                  <td class="text-xs opacity-70">{{ run.startedAt ? formatDateTime(run.startedAt) : '—' }}</td>
                  <td class="text-xs opacity-70">{{ run.completedAt ? formatDateTime(run.completedAt) : '—' }}</td>
                  <td>
                    <NuxtLink :to="`/ingestion/runs/${run._id}`" class="btn btn-xs btn-ghost">Details</NuxtLink>
                  </td>
                </tr>
                <tr v-if="runsData.data.length === 0">
                  <td colspan="11" class="text-center opacity-60 py-8">No ingestion runs yet — click "Run now" to start one</td>
                </tr>
              </tbody>
            </table>
          </div>

          <LayoutPagination
            :current-page="currentPage"
            :total-pages="runsData.pageInfo.totalPages"
            @update:page="goToPage"
          />
        </template>

        <div v-else-if="error" class="alert alert-error">
          <span>Failed to load runs: {{ error.message }}</span>
          <button class="btn btn-sm" @click="refresh">Retry</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime, formatNumber, statusBadge, statusLabel } from '~/utils/formatters';

const { getIngestionStats, getIngestionRuns, triggerIngestionRun, cancelIngestionRun, updateIngestionSettings } = useAdminApi();

const currentPage = ref(1);
const triggering = ref(false);
const cancelling = ref(false);
const togglingEnabled = ref(false);
const actionError = ref('');

const { data: stats, refresh: refreshStats } = usePolling(getIngestionStats, 5000);

const { data: runsData, pending, error, refresh } = useAsyncData(
  'ingestion-runs',
  () => getIngestionRuns({ page: currentPage.value, limit: 20 }),
  { default: () => null, watch: [currentPage] },
);

const activeRun = computed(() => stats.value?.activeRun ?? null);
const ingestionEnabled = computed(() => stats.value?.ingestionEnabled !== false);

const activeProgress = computed(() => {
  if (!activeRun.value || activeRun.value.totalQueries === 0) return 0;
  return Math.round((activeRun.value.processedCount / activeRun.value.totalQueries) * 100);
});

const quotaColor = computed(() => {
  const used = stats.value?.quotaUsedToday ?? 0;
  const budget = stats.value?.quotaBudget ?? 1;
  if (used >= budget) return 'text-error';
  if (used >= budget * 0.8) return 'text-warning';
  return 'text-success';
});

watch(
  () => activeRun.value?._id,
  () => {
    refresh();
  },
);

async function toggleIngestion() {
  actionError.value = '';
  togglingEnabled.value = true;
  try {
    await updateIngestionSettings({ ingestionEnabled: !ingestionEnabled.value });
    await refreshStats();
  } catch (e: any) {
    actionError.value = e?.data?.message || e?.message || 'Failed to update ingestion settings';
  } finally {
    togglingEnabled.value = false;
  }
}

async function runNow() {
  actionError.value = '';
  triggering.value = true;
  try {
    await triggerIngestionRun();
    await refreshStats();
  } catch (e: any) {
    actionError.value = e?.data?.message || e?.message || 'Failed to queue ingestion run';
  } finally {
    triggering.value = false;
  }
}

async function cancelActiveRun() {
  if (!activeRun.value) return;
  actionError.value = '';
  cancelling.value = true;
  try {
    await cancelIngestionRun(activeRun.value._id);
    await refreshStats();
    await refresh();
  } catch (e: any) {
    actionError.value = e?.data?.message || e?.message || 'Failed to cancel ingestion run';
  } finally {
    cancelling.value = false;
  }
}

function goToPage(page: number) {
  if (!runsData.value) return;
  if (page < 1 || page > runsData.value.pageInfo.totalPages) return;
  currentPage.value = page;
}

function refreshAll() {
  refreshStats();
  refresh();
}
</script>
