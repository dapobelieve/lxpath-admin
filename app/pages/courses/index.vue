<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Courses" @refresh="refresh" />

    <div class="p-6 space-y-4 overflow-auto">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search title, skills, description..."
            aria-label="Search courses"
            class="input input-bordered input-sm w-72 pl-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-base-100"
            @keyup.enter="applyFilters"
          />
        </div>

        <UiFilterListbox v-model="providerFilter" label="Provider" :options="providerOptions" />
        <UiFilterListbox v-model="levelFilter" label="Level" :options="levelOptions" />
        <UiFilterListbox v-model="sourceFilter" label="Source" :options="sourceOptions" />
        <UiFilterListbox v-model="verifiedFilter" label="Status" :options="verifiedOptions" width-class="min-w-36" />

        <div class="ml-auto flex items-center gap-3">
          <UiFilterListbox v-model="pageSize" label="Show" :options="pageSizeOptions" width-class="min-w-32" />
          <button class="btn btn-sm btn-primary" @click="applyFilters">Apply</button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="flex items-center gap-3">
        <CoursesFilterChips :chips="activeChips" @remove="removeChip" />
        <button class="btn btn-xs btn-ghost gap-1" @click="clearFilters">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear all
        </button>
      </div>

      <div class="rounded-box border border-base-300 bg-base-100 overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-base-200 px-4 py-3">
          <h2 class="text-sm font-semibold">All Courses</h2>
          <span class="text-xs text-base-content/60">
            <template v-if="data">
              {{ rangeStart.toLocaleString() }}–{{ rangeEnd.toLocaleString() }} of
              <span class="font-medium text-base-content/80">{{ data.pageInfo.total.toLocaleString() }}</span>
            </template>
            <template v-else>Loading…</template>
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-base-200/60">
                <CoursesSortHeader :sort="sortState" field="title" label="Course" @sort="toggleSort" />
                <th :class="headerClass">Provider</th>
                <th :class="headerClass">Level</th>
                <th :class="headerClass">Skills</th>
                <th :class="headerClass">Cost</th>
                <CoursesSortHeader :sort="sortState" field="rating" label="Rating" @sort="toggleSort" />
                <th :class="headerClass">Status</th>
                <CoursesSortHeader :sort="sortState" field="createdAt" label="Added" @sort="toggleSort" />
                <th :class="[headerClass, 'w-12']"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody v-if="pending" class="divide-y divide-base-200">
              <CoursesTableSkeleton :count="pageSize" />
            </tbody>

            <tbody v-else-if="rows.length" class="divide-y divide-base-200">
              <tr v-for="course in rows" :key="course._id" class="transition-colors hover:bg-base-200/50">
                <td class="max-w-md px-4 py-3">
                  <NuxtLink :to="`/courses/${course._id}`" class="block truncate font-medium text-base-content hover:text-primary">
                    {{ course.title }}
                  </NuxtLink>
                  <div v-if="course.institution" class="truncate text-xs text-base-content/50">{{ course.institution }}</div>
                </td>
                <td class="px-4 py-3 text-base-content/70">{{ course.provider || '—' }}</td>
                <td class="px-4 py-3">
                  <span v-if="course.level" class="badge badge-sm badge-ghost font-medium capitalize">{{ course.level }}</span>
                  <span v-else class="text-base-content/30">—</span>
                </td>
                <td class="max-w-xs px-4 py-3">
                  <div v-if="course.skillsLearned?.length" class="flex flex-wrap items-center gap-1">
                    <span
                      v-for="skill in course.skillsLearned.slice(0, 2)"
                      :key="skill"
                      class="inline-flex max-w-[9rem] truncate rounded-full bg-base-200 px-2 py-0.5 text-xs text-base-content/70"
                    >{{ skill }}</span>
                    <span
                      v-if="course.skillsLearned.length > 2"
                      class="inline-flex rounded-full bg-base-200 px-2 py-0.5 text-xs font-medium text-base-content/60"
                    >+{{ course.skillsLearned.length - 2 }}</span>
                  </div>
                  <span v-else class="text-base-content/30">—</span>
                </td>
                <td class="px-4 py-3 text-base-content/70">{{ course.cost || '—' }}</td>
                <td class="px-4 py-3">
                  <span v-if="course.rating" class="inline-flex items-center gap-1 tabular-nums">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                    </svg>
                    {{ course.rating.toFixed(1) }}
                  </span>
                  <span v-else class="text-base-content/30">—</span>
                </td>
                <td class="px-4 py-3">
                  <CoursesVerifiedBadge :verified="course.isVerified" />
                </td>
                <td class="px-4 py-3 text-xs text-base-content/60 tabular-nums">{{ formatDate(course.createdAt) }}</td>
                <td class="px-4 py-3 text-right">
                  <CoursesRowActions :course-id="course._id" :title="course.title" :link="course.link" />
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="9" class="px-4 py-16">
                  <div class="mx-auto flex max-w-sm flex-col items-center text-center">
                    <div class="mb-3 rounded-full bg-base-200 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold">No courses found</h3>
                    <p class="mt-1 text-sm text-base-content/60">
                      {{ hasActiveFilters ? 'No courses match your current filters.' : 'There are no courses in the catalog yet.' }}
                    </p>
                    <button v-if="hasActiveFilters" class="btn btn-sm btn-primary mt-4" @click="clearFilters">Clear filters</button>
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
        <span>Failed to load courses: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CourseSummary } from '~/types';
import { formatDate } from '~/utils/formatters';

const { getCourses } = useAdminApi();
const route = useRoute();

const headerClass = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-base-content/50';

const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const providerFilter = ref('');
const levelFilter = ref('');
const sourceFilter = ref(typeof route.query.source === 'string' ? route.query.source : '');
const verifiedFilter = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const verifiedOptions = [
  { label: 'All', value: '' },
  { label: 'Verified', value: 'true' },
  { label: 'Unverified', value: 'false' },
];

const pageSizeOptions = [
  { label: '20 / page', value: 20 },
  { label: '50 / page', value: 50 },
  { label: '100 / page', value: 100 },
];

const { data, pending, error, refresh } = useAsyncData(
  'admin-courses',
  () =>
    getCourses({
      page: currentPage.value,
      limit: pageSize.value,
      q: searchQuery.value || undefined,
      provider: providerFilter.value || undefined,
      level: levelFilter.value || undefined,
      source: sourceFilter.value || undefined,
      isVerified: verifiedFilter.value ? verifiedFilter.value === 'true' : undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    }),
  { default: () => null, watch: [currentPage, sortBy, sortOrder] },
);

const rows = computed<CourseSummary[]>(() => data.value?.data ?? []);
const sortState = computed(() => ({ field: sortBy.value, order: sortOrder.value }));

const providerOptions = computed(() => toOptions('All Providers', data.value?.filters?.providers));
const levelOptions = computed(() => toOptions('All Levels', data.value?.filters?.levels));
const sourceOptions = computed(() => toOptions('All Sources', data.value?.filters?.sources));

function toOptions(allLabel: string, values?: string[]) {
  const base = [{ label: allLabel, value: '' }];
  for (const value of values ?? []) base.push({ label: value, value });
  return base;
}

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value || providerFilter.value || levelFilter.value || sourceFilter.value || verifiedFilter.value),
);

const activeChips = computed(() => {
  const chips: { key: string; prefix: string; label: string }[] = [];
  if (searchQuery.value) chips.push({ key: 'search', prefix: 'Search', label: searchQuery.value });
  if (providerFilter.value) chips.push({ key: 'provider', prefix: 'Provider', label: providerFilter.value });
  if (levelFilter.value) chips.push({ key: 'level', prefix: 'Level', label: levelFilter.value });
  if (sourceFilter.value) chips.push({ key: 'source', prefix: 'Source', label: sourceFilter.value });
  if (verifiedFilter.value) chips.push({ key: 'verified', prefix: 'Status', label: verifiedLabel.value });
  return chips;
});

const verifiedLabel = computed(() => (verifiedFilter.value === 'true' ? 'Verified' : 'Unverified'));

const rangeStart = computed(() => {
  if (!data.value || data.value.pageInfo.total === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const rangeEnd = computed(() => {
  if (!data.value) return 0;
  return Math.min(currentPage.value * pageSize.value, data.value.pageInfo.total);
});

const chipSetters: Record<string, () => void> = {
  search: () => { searchQuery.value = ''; },
  provider: () => { providerFilter.value = ''; },
  level: () => { levelFilter.value = ''; },
  source: () => { sourceFilter.value = ''; },
  verified: () => { verifiedFilter.value = ''; },
};

function removeChip(key: string) {
  chipSetters[key]?.();
  applyFilters();
}

function applyFilters() {
  currentPage.value = 1;
  refresh();
}

function clearFilters() {
  searchQuery.value = '';
  providerFilter.value = '';
  levelFilter.value = '';
  sourceFilter.value = '';
  verifiedFilter.value = '';
  applyFilters();
}

function goToPage(page: number) {
  if (!data.value) return;
  if (page < 1 || page > data.value.pageInfo.totalPages) return;
  currentPage.value = page;
}

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    return;
  }
  sortBy.value = field;
  sortOrder.value = 'desc';
}

watch([providerFilter, levelFilter, sourceFilter, verifiedFilter, pageSize], applyFilters);
</script>
