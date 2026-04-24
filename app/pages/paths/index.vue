<template>
  <div class="flex flex-col h-full">
    <LayoutHeader :title="pageTitle" @refresh="refresh" />

    <div class="p-6 space-y-4 overflow-auto">
      <div v-if="userFilter" class="card bg-base-200 shadow-sm">
        <div class="card-body py-3 px-4 flex-row items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="font-medium">Filtered by user:</span>
          <NuxtLink v-if="userData" :to="`/users/${userFilter}`" class="link link-primary font-semibold">{{ userName }}</NuxtLink>
          <span v-else class="opacity-60">{{ userFilter }}</span>
          <NuxtLink to="/paths" class="btn btn-xs btn-ghost ml-auto">Clear filter</NuxtLink>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search paths..."
          class="input input-bordered input-sm w-64"
          @keyup.enter="applyFilters"
        />
        <select v-model="statusFilter" class="select select-bordered select-sm" @change="applyFilters">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="generating">Generating</option>
          <option value="paused">Paused</option>
          <option value="failed">Failed</option>
        </select>
        <select v-model="validFilter" class="select select-bordered select-sm" @change="applyFilters">
          <option value="">All</option>
          <option value="true">Valid Only</option>
          <option value="false">With Issues</option>
        </select>
        <button class="btn btn-sm btn-primary" @click="applyFilters">Filter</button>
      </div>

      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="data">
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Path Name</th>
                <th v-if="!userFilter">User</th>
                <th>Career</th>
                <th>Status</th>
                <th>Courses</th>
                <th>Score</th>
                <th>Valid</th>
                <th>Flags</th>
                <th>Validated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="path in data.data" :key="path._id">
                <td class="max-w-xs truncate font-medium">{{ path.pathName }}</td>
                <td v-if="!userFilter">
                  <NuxtLink v-if="path.userId" :to="`/users/${path.userId}`" class="link link-hover text-sm">
                    {{ path.userName || path.userEmail || path.userId }}
                  </NuxtLink>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td class="max-w-xs truncate">{{ path.selectedCareer || '—' }}</td>
                <td><span class="badge badge-sm" :class="statusBadge(path.status)">{{ path.status }}</span></td>
                <td>{{ path.totalCourses }}</td>
                <td>
                  <span v-if="path.validationResult" :class="scoreColor(path.validationResult.score)" class="font-bold">
                    {{ path.validationResult.score }}
                  </span>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td>
                  <span v-if="path.validationResult" class="badge badge-sm" :class="path.validationResult.isValid ? 'badge-success' : 'badge-error'">
                    {{ path.validationResult.isValid ? 'Yes' : 'No' }}
                  </span>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td>
                  <span v-if="path.validationResult">{{ path.validationResult.flags.length }}</span>
                  <span v-else class="opacity-40">—</span>
                </td>
                <td class="text-xs opacity-70">{{ path.validationResult ? formatDate(path.validationResult.validatedAt) : '—' }}</td>
                <td>
                  <NuxtLink :to="`/paths/${path._id}`" class="btn btn-xs btn-ghost">View</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data.pageInfo.totalPages > 1" class="flex justify-center">
          <div class="join">
            <button
              v-for="p in data.pageInfo.totalPages"
              :key="p"
              class="join-item btn btn-sm"
              :class="{ 'btn-active': p === currentPage }"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="alert alert-error">
        <span>Failed to load paths: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserDetail } from '~/types';
import { statusBadge, scoreColor, formatDate } from '~/utils/formatters';

const route = useRoute();
const router = useRouter();

const { getValidationPaths, getUserDetail } = useAdminApi();

const currentPage = ref(1);
const searchQuery = ref('');
const statusFilter = ref('');
const validFilter = ref('');
const userFilter = ref((route.query.userId as string) || '');
const userData = ref<UserDetail | null>(null);

if (userFilter.value) {
  getUserDetail(userFilter.value).then((result) => {
    if (result) userData.value = result.user;
  });
}

const pageTitle = computed(() => userFilter.value ? 'User Paths' : 'Learning Paths');

const userName = computed(() => {
  if (!userData.value) return '';
  const u = userData.value;
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const { data, pending, error, refresh } = useAsyncData(
  'validation-paths',
  () =>
    getValidationPaths({
      page: currentPage.value,
      limit: 20,
      q: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      isValid: validFilter.value ? validFilter.value === 'true' : undefined,
      userId: userFilter.value || undefined,
    }),
  { default: () => null, watch: [currentPage] },
);

function applyFilters() {
  currentPage.value = 1;
  refresh();
}

function goToPage(page: number) {
  currentPage.value = page;
}

watch(() => route.query.userId, (newUserId) => {
  userFilter.value = (newUserId as string) || '';
  if (userFilter.value) {
    getUserDetail(userFilter.value).then((result) => {
      if (result) userData.value = result.user;
    });
  } else {
    userData.value = null;
  }
  currentPage.value = 1;
  refresh();
});
</script>
