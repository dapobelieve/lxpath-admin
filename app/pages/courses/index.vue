<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Courses" @refresh="refresh" />

    <div class="p-6 space-y-4 overflow-auto">
      <div class="flex flex-wrap gap-3 items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search title, skills, description..."
          class="input input-bordered input-sm w-72"
          @keyup.enter="applyFilters"
        />
        <select v-model="providerFilter" class="select select-bordered select-sm" @change="applyFilters">
          <option value="">All Providers</option>
          <option v-for="p in providers" :key="p" :value="p">{{ p }}</option>
        </select>
        <select v-model="levelFilter" class="select select-bordered select-sm" @change="applyFilters">
          <option value="">All Levels</option>
          <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
        </select>
        <select v-model="verifiedFilter" class="select select-bordered select-sm" @change="applyFilters">
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <select v-model="pageSize" class="select select-bordered select-sm" @change="applyFilters">
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
        </select>
        <button class="btn btn-sm btn-primary" @click="applyFilters">Filter</button>
        <button v-if="hasActiveFilters" class="btn btn-sm btn-ghost" @click="clearFilters">Clear</button>
      </div>

      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="data">
        <div class="text-sm opacity-70">
          Showing {{ rangeStart }}–{{ rangeEnd }} of {{ data.pageInfo.total.toLocaleString() }} courses
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th class="cursor-pointer" @click="toggleSort('title')">
                  Title <span class="opacity-50">{{ sortIndicator('title') }}</span>
                </th>
                <th>Provider</th>
                <th>Level</th>
                <th>Skills</th>
                <th>Cost</th>
                <th class="cursor-pointer" @click="toggleSort('rating')">
                  Rating <span class="opacity-50">{{ sortIndicator('rating') }}</span>
                </th>
                <th>Verified</th>
                <th class="cursor-pointer" @click="toggleSort('createdAt')">
                  Added <span class="opacity-50">{{ sortIndicator('createdAt') }}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in data.data" :key="course._id">
                <td class="max-w-md">
                  <div class="font-medium truncate">{{ course.title }}</div>
                  <div v-if="course.institution" class="text-xs opacity-60 truncate">{{ course.institution }}</div>
                </td>
                <td class="text-sm">{{ course.provider || '—' }}</td>
                <td>
                  <span v-if="course.level" class="badge badge-sm badge-ghost">{{ course.level }}</span>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td class="max-w-xs">
                  <div v-if="course.skillsLearned && course.skillsLearned.length" class="flex flex-wrap gap-1">
                    <span
                      v-for="skill in course.skillsLearned.slice(0, 3)"
                      :key="skill"
                      class="badge badge-xs badge-outline"
                    >{{ skill }}</span>
                    <span
                      v-if="course.skillsLearned.length > 3"
                      class="badge badge-xs"
                    >+{{ course.skillsLearned.length - 3 }}</span>
                  </div>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td class="text-sm">{{ course.cost || '—' }}</td>
                <td>
                  <span v-if="course.rating">{{ course.rating.toFixed(1) }}</span>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td>
                  <span v-if="course.isVerified" class="text-success text-sm">&#10003;</span>
                  <span v-else class="text-error text-sm">&#10007;</span>
                </td>
                <td class="text-xs opacity-70">{{ formatDate(course.createdAt) }}</td>
                <td>
                  <a
                    :href="course.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-xs btn-ghost"
                  >Open</a>
                </td>
              </tr>
              <tr v-if="data.data.length === 0">
                <td colspan="9" class="text-center opacity-60 py-8">No courses match your filters</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data.pageInfo.totalPages > 1" class="flex justify-center">
          <div class="join">
            <button
              class="join-item btn btn-sm"
              :disabled="currentPage === 1"
              @click="goToPage(1)"
            >&laquo;</button>
            <button
              class="join-item btn btn-sm"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >&lsaquo;</button>
            <button
              v-for="p in visiblePages"
              :key="p"
              class="join-item btn btn-sm"
              :class="{ 'btn-active': p === currentPage }"
              @click="goToPage(p)"
            >{{ p }}</button>
            <button
              class="join-item btn btn-sm"
              :disabled="currentPage === data.pageInfo.totalPages"
              @click="goToPage(currentPage + 1)"
            >&rsaquo;</button>
            <button
              class="join-item btn btn-sm"
              :disabled="currentPage === data.pageInfo.totalPages"
              @click="goToPage(data.pageInfo.totalPages)"
            >&raquo;</button>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="alert alert-error">
        <span>Failed to load courses: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters';

const { getCourses } = useAdminApi();

const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const providerFilter = ref('');
const levelFilter = ref('');
const verifiedFilter = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const { data, pending, error, refresh } = useAsyncData(
  'admin-courses',
  () =>
    getCourses({
      page: currentPage.value,
      limit: pageSize.value,
      q: searchQuery.value || undefined,
      provider: providerFilter.value || undefined,
      level: levelFilter.value || undefined,
      isVerified: verifiedFilter.value ? verifiedFilter.value === 'true' : undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    }),
  { default: () => null, watch: [currentPage, sortBy, sortOrder] },
);

const providers = computed(() => data.value?.filters.providers ?? []);
const levels = computed(() => data.value?.filters.levels ?? []);

const hasActiveFilters = computed(() =>
  Boolean(searchQuery.value || providerFilter.value || levelFilter.value || verifiedFilter.value),
);

const rangeStart = computed(() => {
  if (!data.value || data.value.pageInfo.total === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const rangeEnd = computed(() => {
  if (!data.value) return 0;
  return Math.min(currentPage.value * pageSize.value, data.value.pageInfo.total);
});

const visiblePages = computed(() => {
  if (!data.value) return [] as number[];
  const total = data.value.pageInfo.totalPages;
  const current = currentPage.value;
  const window = 2;
  const start = Math.max(1, current - window);
  const end = Math.min(total, current + window);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

function applyFilters() {
  currentPage.value = 1;
  refresh();
}

function clearFilters() {
  searchQuery.value = '';
  providerFilter.value = '';
  levelFilter.value = '';
  verifiedFilter.value = '';
  currentPage.value = 1;
  refresh();
}

function goToPage(page: number) {
  if (!data.value) return;
  if (page < 1 || page > data.value.pageInfo.totalPages) return;
  currentPage.value = page;
}

function toggleSort(field: string) {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'desc';
  }
}

function sortIndicator(field: string) {
  if (sortBy.value !== field) return '';
  return sortOrder.value === 'asc' ? '↑' : '↓';
}
</script>
