<script setup lang="ts">
import { Activity, BookOpen, Gauge, Library, Loader2, Play, SquarePlay } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { formatDateTime, formatNumber, statusLabel } from '~/utils/formatters';
import type { TriggerRunPayload } from '~/types';

const {
  getIngestionStats,
  getIngestionRuns,
  triggerIngestionRun,
  cancelIngestionRun,
  updateIngestionSettings,
} = useAdminApi();

const icons = { BookOpen, Activity, Gauge, SquarePlay, Library };

const currentPage = ref(1);
const triggering = ref(false);
const cancelling = ref(false);
const togglingEnabled = ref(false);
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
  if (used >= budget) return 'text-destructive';
  if (used >= budget * 0.8) return 'text-warning';
  return 'text-success';
});

watch(() => activeRun.value?._id, () => refresh());

watch([statusFilter, triggerFilter], () => {
  currentPage.value = 1;
  refresh();
});

function reportError(e: any, fallback: string) {
  toast.error(e?.data?.message || e?.message || fallback);
}

async function toggleIngestion() {
  togglingEnabled.value = true;
  try {
    const next = !ingestionEnabled.value;
    await updateIngestionSettings({ ingestionEnabled: next });
    await refreshStats();
    toast.success(next ? 'Continuous ingestion switched on' : 'Continuous ingestion paused');
  } catch (e: any) {
    reportError(e, 'Failed to update ingestion settings');
  } finally {
    togglingEnabled.value = false;
  }
}

async function runNow(payload: TriggerRunPayload) {
  triggering.value = true;
  try {
    await triggerIngestionRun(payload);
    runNowOpen.value = false;
    await refreshStats();
    toast.success(`Queued ${payload.customQueries.length} topics for ingestion`);
  } catch (e: any) {
    runNowOpen.value = false;
    reportError(e, 'Failed to queue ingestion run');
  } finally {
    triggering.value = false;
  }
}

async function cancelActiveRun() {
  if (!activeRun.value) return;
  cancelling.value = true;
  try {
    await cancelIngestionRun(activeRun.value._id);
    cancelOpen.value = false;
    await Promise.all([refreshStats(), refresh()]);
    toast.success('Ingestion run cancelled');
  } catch (e: any) {
    cancelOpen.value = false;
    reportError(e, 'Failed to cancel ingestion run');
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

<template>
  <AppPage
    title="YouTube ingestion"
    description="Pull long-form YouTube courses into the catalog"
    :refreshing="pending"
    @refresh="refreshAll"
  >
    <template #actions>
      <Button
        size="sm"
        :disabled="!!activeRun || triggering || !ingestionEnabled"
        @click="runNowOpen = true"
      >
        <Loader2 v-if="triggering" class="animate-spin" />
        <Play v-else />
        Ingest topics
      </Button>
    </template>

    <Card class="gap-0 py-0">
      <div class="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold">Continuous ingestion</h2>
            <Badge :variant="ingestionEnabled ? 'success' : 'destructive'">
              {{ ingestionEnabled ? 'on' : 'off' }}
            </Badge>
          </div>
          <p class="mt-0.5 text-sm text-muted-foreground">
            {{ ingestionEnabled
              ? 'Admins can ingest topics into the course catalog.'
              : 'Paused — topic ingestion is blocked until switched back on.' }}
          </p>
        </div>

        <Switch
          :model-value="ingestionEnabled"
          :disabled="togglingEnabled || stats === null"
          aria-label="Toggle continuous ingestion"
          @update:model-value="toggleIngestion"
        />
      </div>
    </Card>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AppStatCard
        label="Ingested courses"
        :value="formatNumber(stats?.ingestedCourses ?? 0)"
        :icon="icons.BookOpen"
      >
        <template #hint>
          <NuxtLink to="/courses?source=youtube-ingest" class="hover:text-primary hover:underline">
            View in catalog
          </NuxtLink>
        </template>
      </AppStatCard>

      <AppStatCard
        label="Awaiting review"
        :value="formatNumber(stats?.review?.shortlisted ?? 0)"
        :icon="icons.Library"
      >
        <template #hint>
          <NuxtLink to="/ingestion/review" class="hover:text-primary hover:underline">
            Review shortlist
          </NuxtLink>
          <span v-if="stats?.review?.pending"> · {{ stats.review.pending }} scoring</span>
        </template>
      </AppStatCard>

      <AppStatCard
        label="Quota used today"
        :value="formatNumber(stats?.quotaUsedToday ?? 0)"
        :hint="`of ${formatNumber(stats?.quotaBudget ?? 0)} units`"
        :icon="icons.Gauge"
        :value-class="quotaColor"
      />

      <AppStatCard
        label="Last run"
        :value="stats?.lastRun ? statusLabel(stats.lastRun.status) : '—'"
        :icon="icons.Activity"
      >
        <template #value>
          <AppStatusBadge v-if="stats?.lastRun" :status="stats.lastRun.status" class="text-sm" />
          <span v-else class="text-muted-foreground/50">—</span>
        </template>
        <template #hint>
          {{ stats?.lastRun ? formatDateTime(stats.lastRun.createdAt) : 'No runs yet' }}
        </template>
      </AppStatCard>

      <AppStatCard
        label="Topic library"
        :value="formatNumber(stats?.enabledQueries ?? 0)"
        :icon="icons.SquarePlay"
      >
        <template #hint>
          <button type="button" class="hover:text-primary hover:underline" @click="queriesOpen = true">
            View coverage
          </button>
          <span v-if="stats?.queriesNeverRun" class="text-warning">
            · {{ stats.queriesNeverRun }} never run
          </span>
        </template>
      </AppStatCard>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <Card v-if="activeRun" class="border-primary/30">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            Active run
            <AppStatusBadge :status="activeRun.status" />
          </CardTitle>
          <CardDescription>
            Quota used this run: {{ formatNumber(activeRun.quotaUnitsUsed) }} units ·
            <NuxtLink :to="`/ingestion/runs/${activeRun._id}`" class="text-primary hover:underline">
              View details
            </NuxtLink>
          </CardDescription>
          <CardAction>
            <Button variant="destructive" size="sm" :disabled="cancelling" @click="cancelOpen = true">
              <Loader2 v-if="cancelling" class="animate-spin" />
              Cancel run
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent class="flex flex-wrap items-center gap-8">
          <AppProgressRing :value="activeProgress" class="text-primary" />

          <div class="grid flex-1 grid-cols-2 gap-4 md:grid-cols-5">
            <div>
              <div class="text-xs text-muted-foreground">Processed</div>
              <div class="text-lg font-semibold tabular-nums">
                {{ activeRun.processedCount }} / {{ activeRun.totalQueries }}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Created</div>
              <div class="text-lg font-semibold tabular-nums text-success">{{ activeRun.createdCount }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Updated</div>
              <div class="text-lg font-semibold tabular-nums text-info">{{ activeRun.updatedCount }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Skipped</div>
              <div class="text-lg font-semibold tabular-nums text-muted-foreground">
                {{ activeRun.skippedCount }}
              </div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Failed</div>
              <div class="text-lg font-semibold tabular-nums text-destructive">
                {{ activeRun.failedCount }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Transition>

    <p v-if="!ingestionEnabled" class="text-sm text-muted-foreground">
      Ingestion is switched off — turn it back on to queue new topics.
    </p>

    <AppDataCard
      title="Run history"
      :meta="runsData ? `${formatNumber(runsData.pageInfo.total)} runs` : 'Loading…'"
    >
      <template #actions>
        <AppFilterSelect v-model="statusFilter" label="Status" :options="statusOptions" />
        <AppFilterSelect v-model="triggerFilter" label="Trigger" :options="triggerOptions" width-class="min-w-36" />
      </template>

      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <TableHead>Status</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead class="text-right">Created</TableHead>
            <TableHead class="text-right">Updated</TableHead>
            <TableHead class="text-right">Skipped</TableHead>
            <TableHead class="text-right">Failed</TableHead>
            <TableHead class="text-right">Quota</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead class="w-16" />
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending">
          <TableRow v-for="n in 6" :key="n" class="hover:bg-transparent">
            <TableCell colspan="11"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="runsData?.data.length">
          <TableRow v-for="run in runsData.data" :key="run._id">
            <TableCell><AppStatusBadge :status="run.status" /></TableCell>
            <TableCell class="capitalize text-muted-foreground">{{ run.trigger }}</TableCell>
            <TableCell class="tabular-nums">{{ run.processedCount }} / {{ run.totalQueries }}</TableCell>
            <TableCell class="text-right tabular-nums text-success">{{ run.createdCount }}</TableCell>
            <TableCell class="text-right tabular-nums text-info">{{ run.updatedCount }}</TableCell>
            <TableCell class="text-right tabular-nums text-muted-foreground">{{ run.skippedCount }}</TableCell>
            <TableCell
              :class="['text-right tabular-nums', run.failedCount > 0 ? 'text-destructive' : 'text-muted-foreground/50']"
            >
              {{ run.failedCount }}
            </TableCell>
            <TableCell class="text-right tabular-nums">{{ formatNumber(run.quotaUnitsUsed) }}</TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ run.startedAt ? formatDateTime(run.startedAt) : '—' }}
            </TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ run.completedAt ? formatDateTime(run.completedAt) : '—' }}
            </TableCell>
            <TableCell class="text-right">
              <Button as-child variant="ghost" size="sm">
                <NuxtLink :to="`/ingestion/runs/${run._id}`">Details</NuxtLink>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else>
          <TableRow class="hover:bg-transparent">
            <TableCell colspan="11" class="p-0">
              <AppEmptyState
                title="No ingestion runs"
                :description="hasRunFilters
                  ? 'No runs match these filters.'
                  : 'Nothing has been ingested yet — start with “Ingest topics”.'"
                :icon="icons.SquarePlay"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <template v-if="runsData && runsData.pageInfo.totalPages > 1" #footer>
        <AppPagination
          :current-page="currentPage"
          :total-pages="runsData.pageInfo.totalPages"
          @update:page="goToPage"
        />
      </template>
    </AppDataCard>

    <AppErrorState
      v-if="error && !pending"
      title="Failed to load runs"
      :message="error.message"
      @retry="refresh"
    />

    <IngestionRunNowDialog
      :open="runNowOpen"
      :quota-used-today="stats?.quotaUsedToday ?? 0"
      :quota-budget="stats?.quotaBudget ?? 0"
      :loading="triggering"
      @start="runNow"
      @close="runNowOpen = false"
    />

    <IngestionConfirmDialog
      :open="cancelOpen"
      title="Cancel this run?"
      message="Pending queries will be removed and the run marked cancelled. Courses already created stay in the catalog."
      confirm-label="Cancel run"
      cancel-label="Keep running"
      :loading="cancelling"
      @confirm="cancelActiveRun"
      @close="cancelOpen = false"
    />

    <IngestionQueriesDialog :open="queriesOpen" @close="queriesOpen = false" />
  </AppPage>
</template>
