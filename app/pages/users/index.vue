<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Recent Users" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="data">
        <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="stat-title">Total Users</div>
            <div class="stat-value text-primary">{{ data.totalUsers }}</div>
            <div class="stat-desc">{{ data.learnerCount }} learners</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div class="stat-title">New Today</div>
            <div class="stat-value text-success">{{ data.signedUpToday }}</div>
            <div class="stat-desc">Signed up today</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-title">Active This Week</div>
            <div class="stat-value text-info">{{ data.activeThisWeek }}</div>
            <div class="stat-desc">Logged in last 7 days</div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-lg">All Users ({{ data.users.length }})</h3>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Verified</th>
                    <th>Paths</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in data.users" :key="user._id">
                    <td>
                      <NuxtLink :to="`/users/${user._id}`" class="font-medium link link-hover">{{ userName(user) }}</NuxtLink>
                    </td>
                    <td class="text-sm">{{ user.email }}</td>
                    <td>
                      <span class="badge badge-sm" :class="user.isLearner ? 'badge-primary' : 'badge-ghost'">
                        {{ user.isLearner ? 'Learner' : 'User' }}
                      </span>
                    </td>
                    <td>
                      <span v-if="user.otpVerification" class="text-success text-sm">&#10003;</span>
                      <span v-else class="text-error text-sm">&#10007;</span>
                    </td>
                    <td>
                      <NuxtLink v-if="user.pathCount > 0" :to="`/paths?userId=${user._id}`" class="badge badge-sm badge-primary link">
                        {{ user.pathCount }}
                      </NuxtLink>
                      <span v-else class="opacity-40">0</span>
                    </td>
                    <td class="text-sm opacity-70">{{ formatDate(user.createdAt) }}</td>
                    <td class="text-sm opacity-70">{{ user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="alert alert-error">
        <span>Failed to load users: {{ error.message }}</span>
        <button class="btn btn-sm" @click="refresh">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecentUser } from '~/types';
import { formatDate, formatDateTime } from '~/utils/formatters';

const { getRecentUsers } = useAdminApi();

const { data, pending, error, refresh } = useAsyncData(
  'recent-users',
  () => getRecentUsers(),
  { default: () => null },
);

function userName(user: RecentUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email.split('@')[0];
}
</script>
