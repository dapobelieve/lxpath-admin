<template>
  <div class="flex flex-col h-full">
    <LayoutHeader :title="pageTitle" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="data">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <div class="flex flex-wrap gap-6">
              <div class="flex-1 min-w-[200px]">
                <h2 class="text-xl font-bold mb-3">{{ userName }}</h2>
                <div class="space-y-1 text-sm">
                  <div><span class="opacity-60">Email:</span> {{ data.user.email }}</div>
                  <div v-if="data.user.phone"><span class="opacity-60">Phone:</span> {{ data.user.phone }}</div>
                  <div>
                    <span class="opacity-60">Type:</span>
                    <span class="badge badge-sm ml-1" :class="data.user.isLearner ? 'badge-primary' : 'badge-ghost'">
                      {{ data.user.isLearner ? 'Learner' : 'User' }}
                    </span>
                  </div>
                  <div>
                    <span class="opacity-60">Verified:</span>
                    <span v-if="data.user.otpVerification" class="text-success ml-1">&#10003;</span>
                    <span v-else class="text-error ml-1">&#10007;</span>
                  </div>
                  <div><span class="opacity-60">Joined:</span> {{ formatDate(data.user.createdAt) }}</div>
                  <div><span class="opacity-60">Last Login:</span> {{ data.user.lastLoginAt ? formatDateTime(data.user.lastLoginAt) : 'Never' }}</div>
                </div>
              </div>
              <div class="stats stats-vertical sm:stats-horizontal shadow">
                <div class="stat">
                  <div class="stat-title">Learning Paths</div>
                  <div class="stat-value text-primary">{{ data.pathCount }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-lg">Learning Paths ({{ data.paths.length }})</h3>
            <div v-if="data.paths.length === 0" class="py-8 text-center opacity-60">
              No learning paths found for this user.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Path Name</th>
                    <th>Career</th>
                    <th>Status</th>
                    <th>Courses</th>
                    <th>Progress</th>
                    <th>Score</th>
                    <th>Valid</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="path in data.paths" :key="path._id">
                    <td class="max-w-xs truncate font-medium">{{ path.pathName }}</td>
                    <td class="max-w-xs truncate">{{ path.selectedCareer || '—' }}</td>
                    <td><span class="badge badge-sm" :class="statusBadge(path.status)">{{ path.status }}</span></td>
                    <td>{{ path.totalCourses }}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <progress class="progress w-20" :class="progressColor(path.overallProgress)" :value="path.overallProgress" max="100" />
                        <span class="text-xs">{{ path.overallProgress }}%</span>
                      </div>
                    </td>
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
                    <td class="text-xs opacity-70">{{ formatDate(path.createdAt) }}</td>
                    <td>
                      <NuxtLink :to="`/paths/${path._id}`" class="btn btn-xs btn-ghost">View</NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="alert alert-error">
        <span>Failed to load user: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatDateTime, statusBadge, scoreColor } from '~/utils/formatters';

const route = useRoute();
const userId = route.params.id as string;

const { getUserDetail } = useAdminApi();

const { data, pending, error, refresh } = useAsyncData(
  `user-detail-${userId}`,
  () => getUserDetail(userId),
  { default: () => null },
);

const userName = computed(() => {
  if (!data.value) return '';
  const u = data.value.user;
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
});

const pageTitle = computed(() => {
  if (!data.value) return 'User Detail';
  return userName.value;
});

function progressColor(progress: number): string {
  if (progress >= 80) return 'progress-success';
  if (progress >= 40) return 'progress-info';
  return 'progress-warning';
}
</script>
