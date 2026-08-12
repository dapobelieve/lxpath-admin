<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Course Review" @refresh="refreshAll" />

    <div class="p-6 space-y-4 overflow-auto">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="actionMessage" class="alert" :class="actionError ? 'alert-error' : 'alert-success'">
          <span>{{ actionMessage }}</span>
          <button class="btn btn-sm btn-ghost" @click="actionMessage = ''">Dismiss</button>
        </div>
      </transition>

      <div class="stats stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-title">Awaiting Scoring</div>
          <div class="stat-value text-lg">{{ formatNumber(summary?.pending ?? 0) }}</div>
          <div class="stat-desc">
            <span v-if="summary?.stalled" class="text-warning">{{ summary.stalled }} stalled</span>
            <span v-else>Scored automatically</span>
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Shortlisted</div>
          <div class="stat-value text-lg text-primary">{{ formatNumber(summary?.shortlisted ?? 0) }}</div>
          <div class="stat-desc">Waiting for your approval</div>
        </div>
        <div class="stat">
          <div class="stat-title">In Course Pool</div>
          <div class="stat-value text-lg text-success">{{ formatNumber(summary?.approved ?? 0) }}</div>
          <div class="stat-desc">Used by path generation</div>
        </div>
        <div class="stat">
          <div class="stat-title">Rejected</div>
          <div class="stat-value text-lg">{{ formatNumber(summary?.rejected ?? 0) }}</div>
          <div class="stat-desc">Below quality bar</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search title..."
            aria-label="Search shortlisted courses"
            class="input input-bordered input-sm w-72"
            @keyup.enter="applyFilters"
          />
        </div>

        <UiFilterListbox v-model="statusFilter" label="Status" :options="statusOptions" />
        <UiFilterListbox v-model="careerFilter" label="Career" :options="careerOptions" />
        <UiFilterListbox v-model="minScoreFilter" label="Min score" :options="scoreOptions" width-class="min-w-36" />

        <div class="ml-auto flex items-center gap-3">
          <button
            v-if="summary?.pending || summary?.stalled"
            class="btn btn-sm btn-ghost"
            :disabled="sweeping"
            @click="scoreNow"
          >
            <span v-if="sweeping" class="loading loading-spinner loading-xs" />
            Score now
          </button>
          <button class="btn btn-sm btn-ghost" @click="applyFilters">Apply</button>
        </div>
      </div>

      <div class="rounded-box border border-base-300 bg-base-100 overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 px-4 py-3">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-semibold">{{ statusLabel }}</h2>
            <span class="text-xs text-base-content/60">
              <template v-if="data">{{ data.pageInfo.total.toLocaleString() }} courses</template>
              <template v-else>Loading…</template>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span v-if="selectedIds.length" class="text-xs text-base-content/60">
              {{ selectedIds.length }} selected
            </span>
            <button
              class="btn btn-sm btn-ghost"
              :disabled="!selectedIds.length || submitting"
              @click="reject"
            >
              Reject
            </button>
            <button
              class="btn btn-sm btn-primary"
              :disabled="!selectedIds.length || submitting"
              @click="approve"
            >
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              Add to course pool
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-base-200/60">
                <th class="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    aria-label="Select all on page"
                    :checked="allSelected"
                    :indeterminate="someSelected"
                    @change="toggleAll"
                  />
                </th>
                <th :class="headerClass">Course</th>
                <th :class="headerClass">Career / Level</th>
                <th :class="headerClass">Score</th>
                <th :class="headerClass">Assessment</th>
                <th :class="headerClass">Added</th>
              </tr>
            </thead>

            <tbody v-if="pending" class="divide-y divide-base-200">
              <tr v-for="n in 8" :key="n">
                <td colspan="6" class="px-4 py-4">
                  <div class="h-4 w-full animate-pulse rounded bg-base-200" />
                </td>
              </tr>
            </tbody>

            <tbody v-else-if="rows.length" class="divide-y divide-base-200">
              <tr
                v-for="course in rows"
                :key="course._id"
                class="transition-colors hover:bg-base-200/50"
                :class="isSelected(course._id) ? 'bg-primary/5' : ''"
              >
                <td class="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    :aria-label="`Select ${course.title}`"
                    :checked="isSelected(course._id)"
                    @change="toggleOne(course._id)"
                  />
                </td>
                <td class="max-w-md px-4 py-3 align-top">
                  <a :href="course.link" target="_blank" rel="noopener" class="block truncate font-medium hover:text-primary">
                    {{ course.title }}
                  </a>
                  <div class="truncate text-xs text-base-content/50">
                    {{ course.institution || 'Unknown channel' }}
                    <span v-if="course.duration"> · {{ course.duration }}</span>
                    <span v-if="course.meta?.viewCount"> · {{ formatNumber(course.meta.viewCount) }} views</span>
                  </div>
                </td>
                <td class="px-4 py-3 align-top">
                  <div class="text-base-content/80">{{ course.category || '—' }}</div>
                  <span v-if="course.level" class="badge badge-sm badge-ghost mt-1 capitalize">{{ course.level }}</span>
                </td>
                <td class="px-4 py-3 align-top">
                  <span
                    v-if="course.qualityReview"
                    class="badge badge-lg font-semibold tabular-nums"
                    :class="scoreBadge(course.qualityReview.score)"
                  >
                    {{ course.qualityReview.score }}
                  </span>
                  <span v-else class="text-base-content/30">—</span>
                  <div v-if="course.qualityReview" class="mt-1 text-xs capitalize text-base-content/50">
                    {{ course.qualityReview.verdict }}
                  </div>
                </td>
                <td class="max-w-sm px-4 py-3 align-top">
                  <p v-if="course.qualityReview?.summary" class="text-xs text-base-content/70">
                    {{ course.qualityReview.summary }}
                  </p>
                  <ul v-if="course.qualityReview?.concerns?.length" class="mt-1 space-y-0.5">
                    <li
                      v-for="concern in course.qualityReview.concerns.slice(0, 2)"
                      :key="concern"
                      class="text-xs text-warning"
                    >
                      · {{ concern }}
                    </li>
                  </ul>
                </td>
                <td class="px-4 py-3 align-top text-xs tabular-nums text-base-content/60">
                  {{ formatDate(course.createdAt) }}
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="6" class="px-4 py-16">
                  <div class="mx-auto flex max-w-sm flex-col items-center text-center">
                    <h3 class="text-sm font-semibold">Nothing here yet</h3>
                    <p class="mt-1 text-sm text-base-content/60">
                      Ingested courses are scored automatically. Winners show up here for approval.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data && data.pageInfo.totalPages > 1" class="border-t border-base-200 px-4 py-3">
          <LayoutPagination
            :current-page="currentPage"
            :total-pages="data.pageInfo.totalPages"
            @update:page="goToPage"
          />
        </div>
      </div>

      <div v-if="error && !pending" class="alert alert-error">
        <span>Failed to load review queue: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refreshAll">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoursePoolStatus } from '~/types';
import { formatDate } from '~/utils/formatters';

const {
  getReviewCourses,
  getReviewSummary,
  approveReviewCourses,
  rejectReviewCourses,
  sweepPendingCourses,
} = useAdminApi();

const headerClass = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-base-content/50';

const currentPage = ref(1);
const searchQuery = ref('');
const statusFilter = ref<CoursePoolStatus>('shortlisted');
const careerFilter = ref('');
const minScoreFilter = ref('');
const selectedIds = ref<string[]>([]);
const submitting = ref(false);
const sweeping = ref(false);
const actionMessage = ref('');
const actionError = ref(false);

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

const someSelected = computed(
  () => selectedIds.value.length > 0 && !allSelected.value,
);

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

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function scoreBadge(score: number): string {
  if (score >= 85) return 'badge-success';
  if (score >= 70) return 'badge-primary';
  if (score >= 40) return 'badge-warning';
  return 'badge-error';
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
  actionMessage.value = '';

  try {
    const result = await action([...selectedIds.value]);
    const count = result.approved ?? result.rejected ?? 0;
    actionError.value = false;
    actionMessage.value = `${count} course${count === 1 ? '' : 's'} ${verb}.`;
    await refreshAll();
  } catch (err: any) {
    actionError.value = true;
    actionMessage.value = err?.data?.message || `Failed to ${verb.replace(/ed$/, '')} courses`;
  } finally {
    submitting.value = false;
  }
}

async function scoreNow() {
  sweeping.value = true;

  try {
    const result = await sweepPendingCourses();
    actionError.value = false;
    actionMessage.value = `${result.queued} course${result.queued === 1 ? '' : 's'} queued for scoring.`;
    await refreshAll();
  } catch (err: any) {
    actionError.value = true;
    actionMessage.value = err?.data?.message || 'Failed to queue scoring';
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
</script>
