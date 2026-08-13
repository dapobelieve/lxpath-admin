<script setup lang="ts">
import { ArrowLeft, Play, TriangleAlert } from '@lucide/vue';
import {
  actionVariant,
  formatDateTime,
  formatDurationMs,
  formatNumber,
  statusLabel,
} from '~/utils/formatters';

const route = useRoute();
const runId = route.params.id as string;

const { getIngestionRunDetail } = useAdminApi();

const TERMINAL_STATUSES = ['completed', 'completed_with_errors', 'quota_exhausted', 'failed', 'cancelled'];

const OUTCOME_FILTERS = [
  { label: 'All', action: '' },
  { label: 'Created', action: 'created' },
  { label: 'Updated', action: 'updated' },
  { label: 'Skipped', action: 'skipped' },
  { label: 'Failed', action: 'failed' },
];

const { data: run, loading, refresh, stop } = usePolling(() => getIngestionRunDetail(runId), 3000);

const activeOutcome = ref('');

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

const quotaPercent = computed(() => {
  if (!run.value || !run.value.quotaBudget) return 0;
  return Math.min(100, ((run.value.quotaBaseline + run.value.quotaUnitsUsed) / run.value.quotaBudget) * 100);
});

const outcomeTabs = computed(() =>
  OUTCOME_FILTERS.map((filter) => ({
    ...filter,
    count: filter.action
      ? (run.value?.queryResults ?? []).filter((result) => result.action === filter.action).length
      : run.value?.queryResults.length ?? 0,
  })),
);

const visibleResults = computed(() => {
  const results = run.value?.queryResults ?? [];
  return activeOutcome.value
    ? results.filter((result) => result.action === activeOutcome.value)
    : results;
});
</script>

<template>
  <AppPage
    title="Ingestion run"
    :description="run ? `${statusLabel(run.status)} · ${run.trigger}` : undefined"
    :refreshing="loading"
    @refresh="refresh"
  >
    <template #actions>
      <Button as-child variant="ghost" size="sm">
        <NuxtLink to="/ingestion">
          <ArrowLeft />
          Back
        </NuxtLink>
      </Button>
    </template>

    <template v-if="loading && !run">
      <div class="grid gap-4 lg:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" class="h-48 rounded-xl" />
      </div>
      <Skeleton class="h-72 rounded-xl" />
    </template>

    <template v-else-if="run">
      <div class="flex flex-wrap items-center gap-2">
        <AppStatusBadge :status="run.status" />
        <Badge variant="outline" class="capitalize">{{ run.trigger }}</Badge>
        <Badge v-if="run.quotaExhausted" variant="destructive">quota exhausted</Badge>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Timing</CardTitle>
          </CardHeader>
          <CardContent class="divide-y">
            <AppKeyValue label="Created" :value="formatDateTime(run.createdAt)" />
            <AppKeyValue label="Started" :value="run.startedAt ? formatDateTime(run.startedAt) : '—'" />
            <AppKeyValue label="Completed" :value="run.completedAt ? formatDateTime(run.completedAt) : '—'" />
            <AppKeyValue label="Duration" :value="runDuration" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Progress</CardTitle>
            <CardDescription>
              {{ run.processedCount }} / {{ run.totalQueries }} queries processed
            </CardDescription>
          </CardHeader>
          <CardContent class="flex items-center gap-6">
            <AppProgressRing :value="progress" class="text-primary" />
            <div class="space-y-1 text-sm">
              <div><span class="font-semibold tabular-nums text-success">{{ run.createdCount }}</span> created</div>
              <div><span class="font-semibold tabular-nums text-info">{{ run.updatedCount }}</span> updated</div>
              <div>
                <span class="font-semibold tabular-nums text-muted-foreground">{{ run.skippedCount }}</span> skipped
              </div>
              <div>
                <span class="font-semibold tabular-nums text-destructive">{{ run.failedCount }}</span> failed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Quota</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="divide-y">
              <AppKeyValue label="Used this run" :value="`${formatNumber(run.quotaUnitsUsed)} units`" />
              <AppKeyValue label="Baseline (earlier today)" :value="`${formatNumber(run.quotaBaseline)} units`" />
              <AppKeyValue label="Budget" :value="`${formatNumber(run.quotaBudget)} units`" />
            </div>
            <Progress :model-value="quotaPercent" class="h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Alert v-if="run.error" variant="destructive" class="border-destructive/30 bg-destructive/5">
        <TriangleAlert />
        <AlertTitle>Run reported an error</AlertTitle>
        <AlertDescription>{{ run.error }}</AlertDescription>
      </Alert>

      <AppDataCard title="Query outcomes" :meta="`${formatNumber(run.queryResults.length)} queries`">
        <template #actions>
          <Tabs v-model="activeOutcome">
            <TabsList>
              <TabsTrigger v-for="tab in outcomeTabs" :key="tab.label" :value="tab.action">
                {{ tab.label }}
                <Badge variant="muted" class="ml-1.5">{{ tab.count }}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </template>

        <Table>
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead>Career</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Search query</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Course</TableHead>
              <TableHead class="text-right">Views</TableHead>
              <TableHead>Tagged by</TableHead>
              <TableHead>Length</TableHead>
              <TableHead class="w-24" />
            </TableRow>
          </TableHeader>

          <TableBody v-if="visibleResults.length">
            <TableRow v-for="result in visibleResults" :key="result.queryId">
              <TableCell class="max-w-40 truncate">{{ result.career }}</TableCell>
              <TableCell>
                <Badge variant="muted" class="capitalize">{{ result.level }}</Badge>
              </TableCell>
              <TableCell class="max-w-56 truncate font-mono text-xs text-muted-foreground">
                {{ result.query }}
              </TableCell>
              <TableCell>
                <Badge :variant="actionVariant(result.action)">{{ result.action }}</Badge>
                <div v-if="result.reason" class="mt-0.5 text-xs capitalize text-muted-foreground">
                  {{ statusLabel(result.reason) }}
                </div>
                <div
                  v-if="result.error"
                  class="mt-0.5 max-w-56 truncate text-xs text-destructive"
                  :title="result.error"
                >
                  {{ result.error }}
                </div>
              </TableCell>
              <TableCell class="w-[18rem] min-w-[14rem] max-w-[18rem] whitespace-normal">
                <NuxtLink
                  v-if="result.courseId"
                  :to="`/courses/${result.courseId}`"
                  class="line-clamp-2 text-sm hover:text-primary hover:underline"
                >
                  {{ result.courseTitle }}
                </NuxtLink>
                <span v-else class="text-muted-foreground/50">—</span>
                <div v-if="result.channelTitle" class="truncate text-xs text-muted-foreground">
                  {{ result.channelTitle }}
                </div>
              </TableCell>
              <TableCell class="text-right tabular-nums">
                {{ result.viewCount ? formatNumber(result.viewCount) : '—' }}
              </TableCell>
              <TableCell>
                <Badge v-if="result.taggedBy" :variant="result.taggedBy === 'llm' ? 'info' : 'muted'">
                  {{ result.taggedBy }}
                </Badge>
                <span v-else class="text-muted-foreground/50">—</span>
              </TableCell>
              <TableCell class="text-xs text-muted-foreground tabular-nums">
                {{ result.courseDuration || '—' }}
              </TableCell>
              <TableCell class="text-right">
                <Button v-if="result.videoId" as-child variant="ghost" size="sm">
                  <a
                    :href="`https://www.youtube.com/watch?v=${result.videoId}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play />
                    Watch
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>

          <TableBody v-else>
            <TableRow class="hover:bg-transparent">
              <TableCell colspan="9" class="p-0">
                <AppEmptyState
                  title="Nothing here"
                  :description="run.queryResults.length === 0
                    ? 'No query results recorded yet.'
                    : 'No outcomes in this category.'"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </AppDataCard>
    </template>

    <AppErrorState
      v-else
      title="Ingestion run not found"
      message="It may have been removed."
      @retry="refresh"
    />
  </AppPage>
</template>
