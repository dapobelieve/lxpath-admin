<script setup lang="ts">
import { ArrowLeft, CircleCheck, CircleX } from '@lucide/vue';
import { formatDate, formatDateTime, initials, scoreColor } from '~/utils/formatters';

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
  const user = data.value.user;
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
});

const pageTitle = computed(() => userName.value || 'User detail');

function progressColor(progress: number): string {
  if (progress >= 80) return 'bg-success';
  if (progress >= 40) return 'bg-info';
  return 'bg-warning';
}
</script>

<template>
  <AppPage
    :title="pageTitle"
    :description="data?.user.email"
    :refreshing="pending"
    @refresh="refresh"
  >
    <template #actions>
      <Button as-child variant="ghost" size="sm">
        <NuxtLink to="/users">
          <ArrowLeft />
          Back
        </NuxtLink>
      </Button>
    </template>

    <template v-if="pending && !data">
      <Skeleton class="h-40 rounded-xl" />
      <Skeleton class="h-72 rounded-xl" />
    </template>

    <template v-else-if="data">
      <Card>
        <CardContent class="flex flex-wrap items-start gap-6">
          <Avatar class="size-14">
            <AvatarFallback class="text-base font-medium">{{ initials(userName) }}</AvatarFallback>
          </Avatar>

          <div class="min-w-[220px] flex-1">
            <h2 class="text-lg font-semibold tracking-tight">{{ userName }}</h2>
            <div class="mt-3 divide-y">
              <AppKeyValue label="Email" :value="data.user.email" />
              <AppKeyValue v-if="data.user.phone" label="Phone" :value="data.user.phone" />
              <AppKeyValue label="Type">
                <Badge :variant="data.user.isLearner ? 'accent' : 'muted'">
                  {{ data.user.isLearner ? 'Learner' : 'User' }}
                </Badge>
              </AppKeyValue>
              <AppKeyValue label="Verified">
                <CircleCheck v-if="data.user.otpVerification" class="inline size-4 text-success" />
                <CircleX v-else class="inline size-4 text-muted-foreground/50" />
              </AppKeyValue>
              <AppKeyValue label="Joined" :value="formatDate(data.user.createdAt)" />
              <AppKeyValue
                label="Last login"
                :value="data.user.lastLoginAt ? formatDateTime(data.user.lastLoginAt) : 'Never'"
              />
            </div>
          </div>

          <div class="flex flex-col items-center justify-center rounded-lg border bg-muted/40 px-8 py-6">
            <span class="text-3xl font-semibold tabular-nums text-primary">{{ data.pathCount }}</span>
            <span class="mt-1 text-xs text-muted-foreground">Learning paths</span>
          </div>
        </CardContent>
      </Card>

      <AppDataCard title="Learning paths" :meta="`${data.paths.length} total`">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/40 hover:bg-muted/40">
              <TableHead>Path</TableHead>
              <TableHead>Career</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Courses</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Valid</TableHead>
              <TableHead>Created</TableHead>
              <TableHead class="w-16" />
            </TableRow>
          </TableHeader>

          <TableBody v-if="data.paths.length">
            <TableRow v-for="path in data.paths" :key="path._id">
              <TableCell class="max-w-xs truncate font-medium">{{ path.pathName }}</TableCell>
              <TableCell class="max-w-xs truncate text-muted-foreground">
                {{ path.selectedCareer || '—' }}
              </TableCell>
              <TableCell><AppStatusBadge :status="path.status" /></TableCell>
              <TableCell class="text-right tabular-nums">{{ path.totalCourses }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div
                      :class="['h-full rounded-full', progressColor(path.overallProgress)]"
                      :style="{ width: `${path.overallProgress}%` }"
                    />
                  </div>
                  <span class="text-xs tabular-nums text-muted-foreground">{{ path.overallProgress }}%</span>
                </div>
              </TableCell>
              <TableCell>
                <span
                  v-if="path.validationResult"
                  :class="['font-semibold tabular-nums', scoreColor(path.validationResult.score)]"
                >
                  {{ path.validationResult.score }}
                </span>
                <span v-else class="text-muted-foreground/50">—</span>
              </TableCell>
              <TableCell>
                <Badge
                  v-if="path.validationResult"
                  :variant="path.validationResult.isValid ? 'success' : 'destructive'"
                >
                  {{ path.validationResult.isValid ? 'Valid' : 'Issues' }}
                </Badge>
                <span v-else class="text-muted-foreground/50">—</span>
              </TableCell>
              <TableCell class="text-xs text-muted-foreground tabular-nums">
                {{ formatDate(path.createdAt) }}
              </TableCell>
              <TableCell class="text-right">
                <Button as-child variant="ghost" size="sm">
                  <NuxtLink :to="`/paths/${path._id}`">View</NuxtLink>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>

          <TableBody v-else>
            <TableRow class="hover:bg-transparent">
              <TableCell colspan="9" class="p-0">
                <AppEmptyState
                  title="No learning paths"
                  description="This user hasn't generated a path yet."
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </AppDataCard>
    </template>

    <AppErrorState
      v-else
      title="Failed to load user"
      :message="error?.message"
      @retry="refresh"
    />
  </AppPage>
</template>
