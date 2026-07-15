<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="YouTube Ingestion" @refresh="refreshAll" />

    <div class="p-6 space-y-6 overflow-auto">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="actionError" class="alert alert-error">
          <span>{{ actionError }}</span>
          <button class="btn btn-sm btn-ghost" @click="actionError = ''">Dismiss</button>
        </div>
      </transition>

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
            <Switch
              :model-value="ingestionEnabled"
              :disabled="togglingEnabled || stats === null"
              :class="ingestionEnabled ? 'bg-success' : 'bg-base-300'"
              class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              @update:model-value="toggleIngestion"
            >
              <span class="sr-only">Toggle continuous ingestion</span>
              <span
                :class="ingestionEnabled ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              />
            </Switch>
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
          <div class="stat-desc">
            <button class="link" @click="queriesOpen = true">
              {{ formatNumber(stats?.enabledQueries ?? 0) }} enabled queries
            </button>
          </div>
        </div>
      </div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="activeRun" class="card bg-base-200 shadow">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title">
                Active Run
                <span class="badge" :class="statusBadge(activeRun.status)">{{ statusLabel(activeRun.status) }}</span>
              </h2>
              <button class="btn btn-error btn-sm" :disabled="cancelling" @click="cancelOpen = true">
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
      </transition>

      <div class="flex items-center gap-3">
        <button
          class="btn btn-primary btn-sm"
          :disabled="!!activeRun || triggering || !ingestionEnabled"
          @click="runNowOpen = true"
        >
          <span v-if="triggering" class="loading loading-spinner loading-xs" />
          Run now
        </button>
        <span v-if="activeRun" class="text-sm opacity-60">A run is already in progress</span>
        <span v-else-if="!ingestionEnabled" class="text-sm opacity-60">Ingestion is switched off</span>
      </div>

      <div>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 class="text-lg font-semibold">Run History</h2>
          <div class="flex flex-wrap items-center gap-2">
            <IngestionFilterListbox
              v-model="statusFilter"
              label="Status"
              :options="statusOptions"
            />
            <IngestionFilterListbox
              v-model="triggerFilter"
              label="Trigger"
              :options="triggerOptions"
            />
          </div>
        </div>

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
                  <td colspan="11" class="text-center opacity-60 py-8">
                    {{ hasRunFilters ? 'No runs match these filters' : 'No ingestion runs yet — click "Run now" to start one' }}
                  </td>
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

    <IngestionRunNowDialog
      :open="runNowOpen"
      :enabled-queries="stats?.enabledQueries ?? 0"
      :quota-used-today="stats?.quotaUsedToday ?? 0"
      :quota-budget="stats?.quotaBudget ?? 0"
      :loading="triggering"
      @start="runNow"
      @close="runNowOpen = false"
    />

    <IngestionConfirmDialog
      :open="cancelOpen"
      title="Cancel this run?"
      message="Pending queries will be removed and the run will be marked cancelled. Courses already created stay in the catalog."
      confirm-label="Cancel run"
      cancel-label="Keep running"
      :loading="cancelling"
      @confirm="cancelActiveRun"
      @close="cancelOpen = false"
    />

    <IngestionQueriesDialog :open="queriesOpen" @close="queriesOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue';
import { formatDateTime, formatNumber, statusBadge, statusLabel } from '~/utils/formatters';

const { getIngestionStats, getIngestionRuns, triggerIngestionRun, cancelIngestionRun, updateIngestionSettings } = useAdminApi();

const currentPage = ref(1);
const triggering = ref(false);
const cancelling = ref(false);
const togglingEnabled = ref(false);
const actionError = ref('');
const runNowOpen = ref(false);
const cancelOpen = ref(false);
const queriesOpen = ref(false);
const statusFilter = ref('');
const triggerFilter = ref('');

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Running', value: 'running' },
  { label: 'Completed', value: 'completed' },
  { label: 'Completed with errors', value: 'completed_with_errors' },
  { label: 'Quota exhausted', value: 'quota_exhausted' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const triggerOptions = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Manual', value: 'manual' },
];

const { data: stats, refresh: refreshStats } = usePolling(getIngestionStats, 5000);

const { data: runsData, pending, error, refresh } = useAsyncData(
  'ingestion-runs',
  () =>
    getIngestionRuns({
      page: currentPage.value,
      limit: 20,
      status: statusFilter.value || undefined,
      trigger: triggerFilter.value || undefined,
    }),
  { default: () => null, watch: [currentPage] },
);

const activeRun = computed(() => stats.value?.activeRun ?? null);
const ingestionEnabled = computed(() => stats.value?.ingestionEnabled !== false);
const hasRunFilters = computed(() => Boolean(statusFilter.value || triggerFilter.value));

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

watch([statusFilter, triggerFilter], () => {
  currentPage.value = 1;
  refresh();
});

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

async function runNow(queryLimit?: number) {
  actionError.value = '';
  triggering.value = true;
  try {
    await triggerIngestionRun(queryLimit);
    runNowOpen.value = false;
    await refreshStats();
  } catch (e: any) {
    actionError.value = e?.data?.message || e?.message || 'Failed to queue ingestion run';
    runNowOpen.value = false;
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
    cancelOpen.value = false;
    await refreshStats();
    await refresh();
  } catch (e: any) {
    actionError.value = e?.data?.message || e?.message || 'Failed to cancel ingestion run';
    cancelOpen.value = false;
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
