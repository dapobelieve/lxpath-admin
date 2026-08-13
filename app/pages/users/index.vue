<script setup lang="ts">
import { CircleCheck, CircleX, Clock, Download, UserPlus, Users } from '@lucide/vue';
import { toast } from 'vue-sonner';
import type { RecentUser } from '~/types';
import { formatDate, formatDateTime, formatNumber, initials } from '~/utils/formatters';
import { downloadCsv } from '~/utils/csv';

const { getRecentUsers, getUsersExport } = useAdminApi();

const icons = { Users, UserPlus, Clock };

const { data, pending, error, refresh } = useAsyncData(
  'recent-users',
  () => getRecentUsers(),
  { default: () => null },
);

const exporting = ref(false);

function userName(user: RecentUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email.split('@')[0] ?? user.email;
}

async function exportUsersCsv() {
  exporting.value = true;

  try {
    const users = await getUsersExport();

    const rows = users.map((user) => [
      userName(user),
      user.email,
      user.phone || '',
      user.isLearner ? 'Learner' : 'User',
      user.otpVerification ? 'Yes' : 'No',
      user.pathCount,
      formatDate(user.createdAt),
      user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never',
    ]);

    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `lxpath-users-${today}.csv`,
      ['Name', 'Email', 'Phone', 'Type', 'Verified', 'Paths', 'Joined', 'Last Login'],
      rows,
    );
    toast.success(`Exported ${formatNumber(users.length)} users`);
  } catch {
    toast.error('Export failed. Please try again.');
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <AppPage
    title="Users"
    description="Who is signing up and generating paths"
    :refreshing="pending"
    @refresh="refresh"
  >
    <template #actions>
      <Button variant="outline" size="sm" :disabled="exporting" @click="exportUsersCsv">
        <Download />
        <span class="hidden sm:inline">{{ exporting ? 'Exporting…' : 'Export CSV' }}</span>
      </Button>
    </template>

    <div class="grid gap-4 sm:grid-cols-3">
      <AppStatCard
        label="Total users"
        :value="data ? formatNumber(data.totalUsers) : 0"
        :hint="data ? `${formatNumber(data.learnerCount)} learners` : ''"
        :icon="icons.Users"
        :loading="pending && !data"
      />
      <AppStatCard
        label="New today"
        :value="data ? formatNumber(data.signedUpToday) : 0"
        hint="Signed up in the last 24h"
        :icon="icons.UserPlus"
        value-class="text-success"
        :loading="pending && !data"
      />
      <AppStatCard
        label="Active this week"
        :value="data ? formatNumber(data.activeThisWeek) : 0"
        hint="Logged in over the last 7 days"
        :icon="icons.Clock"
        value-class="text-info"
        :loading="pending && !data"
      />
    </div>

    <AppDataCard title="All users" :meta="data ? `${formatNumber(data.users.length)} shown` : 'Loading…'">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead class="text-right">Paths</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last login</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending && !data">
          <TableRow v-for="n in 8" :key="n" class="hover:bg-transparent">
            <TableCell colspan="7"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="data?.users.length">
          <TableRow v-for="user in data.users" :key="user._id">
            <TableCell>
              <NuxtLink :to="`/users/${user._id}`" class="flex items-center gap-2.5 group">
                <Avatar class="size-7">
                  <AvatarFallback class="text-[0.65rem] font-medium">
                    {{ initials(userName(user)) }}
                  </AvatarFallback>
                </Avatar>
                <span class="font-medium group-hover:text-primary group-hover:underline">
                  {{ userName(user) }}
                </span>
              </NuxtLink>
            </TableCell>
            <TableCell class="text-muted-foreground">{{ user.email }}</TableCell>
            <TableCell>
              <Badge :variant="user.isLearner ? 'accent' : 'muted'">
                {{ user.isLearner ? 'Learner' : 'User' }}
              </Badge>
            </TableCell>
            <TableCell>
              <CircleCheck v-if="user.otpVerification" class="size-4 text-success" />
              <CircleX v-else class="size-4 text-muted-foreground/50" />
            </TableCell>
            <TableCell class="text-right">
              <NuxtLink
                v-if="user.pathCount > 0"
                :to="`/paths?userId=${user._id}`"
                class="tabular-nums font-medium hover:text-primary hover:underline"
              >
                {{ user.pathCount }}
              </NuxtLink>
              <span v-else class="text-muted-foreground/50 tabular-nums">0</span>
            </TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ formatDate(user.createdAt) }}
            </TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never' }}
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else>
          <TableRow class="hover:bg-transparent">
            <TableCell colspan="7" class="p-0">
              <AppEmptyState title="No users yet" description="Nobody has signed up so far." />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </AppDataCard>

    <AppErrorState
      v-if="error && !pending"
      title="Failed to load users"
      :message="error.message"
      @retry="refresh"
    />
  </AppPage>
</template>
