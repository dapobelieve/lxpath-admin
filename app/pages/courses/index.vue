<script setup lang="ts">
import { BookOpen, Search, Star, X } from '@lucide/vue';
import type { CourseSummary } from '~/types';
import { formatDate } from '~/utils/formatters';

const { getCourses } = useAdminApi();
const route = useRoute();

const icons = { BookOpen };

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

const providerOptions = computed(() => toOptions('All providers', data.value?.filters?.providers));
const levelOptions = computed(() => toOptions('All levels', data.value?.filters?.levels));
const sourceOptions = computed(() => toOptions('All sources', data.value?.filters?.sources));

function toOptions(allLabel: string, values?: string[]) {
  return [{ label: allLabel, value: '' }, ...(values ?? []).map((value) => ({ label: value, value }))];
}

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value || providerFilter.value || levelFilter.value || sourceFilter.value || verifiedFilter.value),
);

const verifiedLabel = computed(() => (verifiedFilter.value === 'true' ? 'Verified' : 'Unverified'));

const activeChips = computed(() => {
  const chips: { key: string; prefix: string; label: string }[] = [];
  if (searchQuery.value) chips.push({ key: 'search', prefix: 'Search', label: searchQuery.value });
  if (providerFilter.value) chips.push({ key: 'provider', prefix: 'Provider', label: providerFilter.value });
  if (levelFilter.value) chips.push({ key: 'level', prefix: 'Level', label: levelFilter.value });
  if (sourceFilter.value) chips.push({ key: 'source', prefix: 'Source', label: sourceFilter.value });
  if (verifiedFilter.value) chips.push({ key: 'verified', prefix: 'Status', label: verifiedLabel.value });
  return chips;
});

const rangeStart = computed(() => {
  if (!data.value || data.value.pageInfo.total === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const rangeEnd = computed(() => {
  if (!data.value) return 0;
  return Math.min(currentPage.value * pageSize.value, data.value.pageInfo.total);
});

const rangeLabel = computed(() => {
  if (!data.value) return 'Loading…';
  return `${rangeStart.value.toLocaleString()}–${rangeEnd.value.toLocaleString()} of ${data.value.pageInfo.total.toLocaleString()}`;
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

<template>
  <AppPage
    title="Courses"
    description="Everything in the lxpath course catalog"
    :refreshing="pending"
    @refresh="refresh"
  >
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search title, skills, description…"
          aria-label="Search courses"
          class="h-8 w-72 pl-8"
          @keyup.enter="applyFilters"
        />
      </div>

      <AppFilterSelect v-model="providerFilter" label="Provider" :options="providerOptions" />
      <AppFilterSelect v-model="levelFilter" label="Level" :options="levelOptions" />
      <AppFilterSelect v-model="sourceFilter" label="Source" :options="sourceOptions" />
      <AppFilterSelect v-model="verifiedFilter" label="Status" :options="verifiedOptions" width-class="min-w-36" />

      <div class="ml-auto flex items-center gap-2">
        <AppFilterSelect v-model="pageSize" label="Show" :options="pageSizeOptions" width-class="min-w-32" />
        <Button size="sm" @click="applyFilters">Apply</Button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
      <CoursesFilterChips :chips="activeChips" @remove="removeChip" />
      <Button variant="ghost" size="xs" @click="clearFilters">
        <X />
        Clear all
      </Button>
    </div>

    <AppDataCard title="All courses" :meta="rangeLabel">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <CoursesSortHeader :sort="sortState" field="title" label="Course" @sort="toggleSort" />
            <TableHead>Provider</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Cost</TableHead>
            <CoursesSortHeader :sort="sortState" field="rating" label="Rating" @sort="toggleSort" />
            <TableHead>Status</TableHead>
            <CoursesSortHeader :sort="sortState" field="createdAt" label="Added" @sort="toggleSort" />
            <TableHead class="w-12"><span class="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending">
          <CoursesTableSkeleton :count="pageSize" />
        </TableBody>

        <TableBody v-else-if="rows.length">
          <TableRow v-for="course in rows" :key="course._id">
            <TableCell class="max-w-[24rem]">
              <NuxtLink
                :to="`/courses/${course._id}`"
                class="block truncate font-medium hover:text-primary hover:underline"
              >
                {{ course.title }}
              </NuxtLink>
              <div v-if="course.institution" class="truncate text-xs text-muted-foreground">
                {{ course.institution }}
              </div>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ course.provider || '—' }}</TableCell>
            <TableCell>
              <Badge v-if="course.level" variant="muted" class="capitalize">{{ course.level }}</Badge>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell class="w-[16rem] min-w-[12rem] max-w-[16rem] whitespace-normal">
              <div v-if="course.skillsLearned?.length" class="flex flex-wrap items-center gap-1">
                <Badge
                  v-for="skill in course.skillsLearned.slice(0, 2)"
                  :key="skill"
                  variant="muted"
                  class="block max-w-[7rem] truncate"
                >
                  {{ skill }}
                </Badge>
                <Badge v-if="course.skillsLearned.length > 2" variant="outline">
                  +{{ course.skillsLearned.length - 2 }}
                </Badge>
              </div>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell class="text-muted-foreground tabular-nums">{{ course.cost || '—' }}</TableCell>
            <TableCell>
              <span v-if="course.rating" class="inline-flex items-center gap-1 tabular-nums">
                <Star class="size-3.5 fill-warning text-warning" />
                {{ course.rating.toFixed(1) }}
              </span>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell>
              <CoursesVerifiedBadge :verified="course.isVerified" />
            </TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ formatDate(course.createdAt) }}
            </TableCell>
            <TableCell class="text-right">
              <CoursesRowActions :course-id="course._id" :title="course.title" :link="course.link" />
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else>
          <TableRow class="hover:bg-transparent">
            <TableCell colspan="9" class="p-0">
              <AppEmptyState
                title="No courses found"
                :description="hasActiveFilters
                  ? 'No courses match your current filters.'
                  : 'There are no courses in the catalog yet.'"
                :icon="icons.BookOpen"
              >
                <Button v-if="hasActiveFilters" size="sm" @click="clearFilters">Clear filters</Button>
              </AppEmptyState>
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
      title="Failed to load courses"
      :message="error.message"
      @retry="refresh"
    />
  </AppPage>
</template>
