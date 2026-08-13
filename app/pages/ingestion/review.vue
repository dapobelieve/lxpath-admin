<script setup lang="ts">
import { Clock, Loader2, Search, Sparkles, ThumbsUp, XCircle } from '@lucide/vue';
import { toast } from 'vue-sonner';
import type { CoursePoolStatus } from '~/types';
import { formatDate, formatNumber, scoreVariant } from '~/utils/formatters';

const {
  getReviewCourses,
  getReviewSummary,
  approveReviewCourses,
  rejectReviewCourses,
  sweepPendingCourses,
} = useAdminApi();

const icons = { Clock, Sparkles, ThumbsUp, XCircle };

const currentPage = ref(1);
const searchQuery = ref('');
const statusFilter = ref<CoursePoolStatus>('shortlisted');
const careerFilter = ref('');
const minScoreFilter = ref('');
const selectedIds = ref<string[]>([]);
const submitting = ref(false);
const sweeping = ref(false);

const statusOptions = [
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Awaiting scoring', value: 'pending' },
  { label: 'In course pool', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const scoreOptions = [
  { label: 'Any', value: '' },
  { label: '70+', value: '70' },
  { label: '80+', value: '80' },
  { label: '90+', value: '90' },
];

const { data, pending, error, refresh } = useAsyncData(
  'admin-course-review',
  () =>
    getReviewCourses({
      page: currentPage.value,
      limit: 20,
      status: statusFilter.value,
      career: careerFilter.value || undefined,
      minScore: minScoreFilter.value ? Number(minScoreFilter.value) : undefined,
      q: searchQuery.value || undefined,
    }),
  { watch: [currentPage] },
);

const { data: summary, refresh: refreshSummary } = useAsyncData(
  'admin-review-summary',
  () => getReviewSummary(),
);

const rows = computed(() => data.value?.data ?? []);

const careerOptions = computed(() => [
  { label: 'All careers', value: '' },
  ...(data.value?.filters.careers ?? []).map((career) => ({ label: career, value: career })),
]);

const statusLabel = computed(
  () => statusOptions.find((option) => option.value === statusFilter.value)?.label ?? 'Courses',
);

const allSelected = computed(
  () => rows.value.length > 0 && rows.value.every((course) => isSelected(course._id)),
);

const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value);

const selectAllState = computed<boolean | 'indeterminate'>(() => {
  if (allSelected.value) return true;
  return someSelected.value ? 'indeterminate' : false;
});

function isSelected(courseId: string): boolean {
  return selectedIds.value.includes(courseId);
}

function toggleOne(courseId: string) {
  selectedIds.value = isSelected(courseId)
    ? selectedIds.value.filter((id) => id !== courseId)
    : [...selectedIds.value, courseId];
}

function toggleAll() {
  selectedIds.value = allSelected.value ? [] : rows.value.map((course) => course._id);
}

function applyFilters() {
  currentPage.value = 1;
  selectedIds.value = [];
  refresh();
}

function goToPage(page: number) {
  currentPage.value = page;
  selectedIds.value = [];
}

async function refreshAll() {
  selectedIds.value = [];
  await Promise.all([refresh(), refreshSummary()]);
}

async function runDecision(
  action: (ids: string[]) => Promise<{ approved?: number; rejected?: number }>,
  verb: string,
) {
  submitting.value = true;

  try {
    const result = await action([...selectedIds.value]);
    const count = result.approved ?? result.rejected ?? 0;
    toast.success(`${count} course${count === 1 ? '' : 's'} ${verb}.`);
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.data?.message || `Failed to ${verb.replace(/ed$/, '')} courses`);
  } finally {
    submitting.value = false;
  }
}

async function scoreNow() {
  sweeping.value = true;

  try {
    const result = await sweepPendingCourses();
    toast.success(`${result.queued} course${result.queued === 1 ? '' : 's'} queued for scoring.`);
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to queue scoring');
  } finally {
    sweeping.value = false;
  }
}

function approve() {
  return runDecision(approveReviewCourses, 'added to the course pool');
}

function reject() {
  return runDecision(rejectReviewCourses, 'rejected');
}

watch([statusFilter, careerFilter, minScoreFilter], applyFilters);
</script>

<template>
  <AppPage
    title="Course review"
    description="Approve LLM-scored courses into the generation pool"
    :refreshing="pending"
    @refresh="refreshAll"
  >
    <template #actions>
      <Button
        v-if="summary?.pending || summary?.stalled"
        variant="outline"
        size="sm"
        :disabled="sweeping"
        @click="scoreNow"
      >
        <Loader2 v-if="sweeping" class="animate-spin" />
        Score now
      </Button>
    </template>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AppStatCard
        label="Awaiting scoring"
        :value="formatNumber(summary?.pending ?? 0)"
        :icon="icons.Clock"
      >
        <template #hint>
          <span v-if="summary?.stalled" class="text-warning">{{ summary.stalled }} stalled</span>
          <span v-else>Scored automatically</span>
        </template>
      </AppStatCard>
      <AppStatCard
        label="Shortlisted"
        :value="formatNumber(summary?.shortlisted ?? 0)"
        hint="Waiting for your approval"
        :icon="icons.Sparkles"
        value-class="text-primary"
      />
      <AppStatCard
        label="In course pool"
        :value="formatNumber(summary?.approved ?? 0)"
        hint="Used by path generation"
        :icon="icons.ThumbsUp"
        value-class="text-success"
      />
      <AppStatCard
        label="Rejected"
        :value="formatNumber(summary?.rejected ?? 0)"
        hint="Below the quality bar"
        :icon="icons.XCircle"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search title…"
          aria-label="Search courses in review"
          class="h-8 w-72 pl-8"
          @keyup.enter="applyFilters"
        />
      </div>

      <AppFilterSelect v-model="statusFilter" label="Status" :options="statusOptions" />
      <AppFilterSelect v-model="careerFilter" label="Career" :options="careerOptions" />
      <AppFilterSelect v-model="minScoreFilter" label="Min score" :options="scoreOptions" width-class="min-w-36" />

      <Button size="sm" class="ml-auto" @click="applyFilters">Apply</Button>
    </div>

    <AppDataCard
      :title="statusLabel"
      :meta="data ? `${formatNumber(data.pageInfo.total)} courses` : 'Loading…'"
    >
      <template #actions>
        <span v-if="selectedIds.length" class="text-xs text-muted-foreground tabular-nums">
          {{ selectedIds.length }} selected
        </span>
        <Button variant="outline" size="sm" :disabled="!selectedIds.length || submitting" @click="reject">
          Reject
        </Button>
        <Button size="sm" :disabled="!selectedIds.length || submitting" @click="approve">
          <Loader2 v-if="submitting" class="animate-spin" />
          Add to course pool
        </Button>
      </template>

      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <TableHead class="w-10">
              <Checkbox
                :model-value="selectAllState"
                aria-label="Select all on page"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Career / level</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Assessment</TableHead>
            <TableHead>Added</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending">
          <TableRow v-for="n in 8" :key="n" class="hover:bg-transparent">
            <TableCell colspan="6"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="rows.length">
          <TableRow
            v-for="course in rows"
            :key="course._id"
            :data-state="isSelected(course._id) ? 'selected' : undefined"
          >
            <TableCell class="align-top">
              <Checkbox
                :model-value="isSelected(course._id)"
                :aria-label="`Select ${course.title}`"
                @update:model-value="toggleOne(course._id)"
              />
            </TableCell>
            <TableCell class="max-w-[24rem] align-top">
              <a
                :href="course.link"
                target="_blank"
                rel="noopener noreferrer"
                class="block truncate font-medium hover:text-primary hover:underline"
              >
                {{ course.title }}
              </a>
              <div class="truncate text-xs text-muted-foreground">
                {{ course.institution || 'Unknown channel' }}
                <span v-if="course.duration"> · {{ course.duration }}</span>
                <span v-if="course.meta?.viewCount"> · {{ formatNumber(course.meta.viewCount) }} views</span>
              </div>
            </TableCell>
            <TableCell class="align-top">
              <div class="text-sm">{{ course.category || '—' }}</div>
              <Badge v-if="course.level" variant="muted" class="mt-1 capitalize">{{ course.level }}</Badge>
            </TableCell>
            <TableCell class="align-top">
              <Badge
                v-if="course.qualityReview"
                :variant="scoreVariant(course.qualityReview.score)"
                class="text-sm font-semibold tabular-nums"
              >
                {{ course.qualityReview.score }}
              </Badge>
              <span v-else class="text-muted-foreground/50">—</span>
              <div v-if="course.qualityReview" class="mt-1 text-xs capitalize text-muted-foreground">
                {{ course.qualityReview.verdict }}
              </div>
            </TableCell>
            <TableCell class="min-w-[20rem] max-w-[28rem] whitespace-normal align-top">
              <p v-if="course.qualityReview?.summary" class="line-clamp-3 text-xs text-muted-foreground">
                {{ course.qualityReview.summary }}
              </p>
              <ul v-if="course.qualityReview?.concerns?.length" class="mt-1 space-y-0.5">
                <li
                  v-for="concern in course.qualityReview.concerns.slice(0, 2)"
                  :key="concern"
                  class="line-clamp-1 text-xs text-warning"
                  :title="concern"
                >
                  · {{ concern }}
                </li>
              </ul>
            </TableCell>
            <TableCell class="align-top text-xs text-muted-foreground tabular-nums">
              {{ formatDate(course.createdAt) }}
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else>
          <TableRow class="hover:bg-transparent">
            <TableCell colspan="6" class="p-0">
              <AppEmptyState
                title="Nothing here yet"
                description="Ingested courses are scored automatically. Winners show up here for approval."
                :icon="icons.Sparkles"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <template v-if="data && data.pageInfo.totalPages > 1" #footer>
        <AppPagination
          :current-page="currentPage"
          :total-pages="data.pageInfo.totalPages"
          @update:page="goToPage"
        />
      </template>
    </AppDataCard>

    <AppErrorState
      v-if="error && !pending"
      title="Failed to load review queue"
      :message="error.message"
      @retry="refreshAll"
    />
  </AppPage>
</template>
