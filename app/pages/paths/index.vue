<script setup lang="ts">
import { Search, User, X } from '@lucide/vue';
import type { UserDetail } from '~/types';
import { formatDate, formatNumber, scoreColor } from '~/utils/formatters';

const route = useRoute();
const { getValidationPaths, getUserDetail } = useAdminApi();

const icons = { User };

const currentPage = ref(1);
const searchQuery = ref('');
const statusFilter = ref('');
const validFilter = ref('');
const userFilter = ref((route.query.userId as string) || '');
const userData = ref<UserDetail | null>(null);

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Generating', value: 'generating' },
  { label: 'Paused', value: 'paused' },
  { label: 'Failed', value: 'failed' },
];

const validOptions = [
  { label: 'All', value: '' },
  { label: 'Valid only', value: 'true' },
  { label: 'With issues', value: 'false' },
];

if (userFilter.value) {
  loadUser(userFilter.value);
}

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

const pageTitle = computed(() => (userFilter.value ? 'User paths' : 'Learning paths'));

const userName = computed(() => {
  if (!userData.value) return '';
  const user = userData.value;
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
});

const rows = computed(() => data.value?.data ?? []);

const totalLabel = computed(() =>
  data.value ? `${formatNumber(data.value.pageInfo.total)} paths` : 'Loading…',
);

function loadUser(userId: string) {
  getUserDetail(userId).then((result) => {
    userData.value = result?.user ?? null;
  });
}

function applyFilters() {
  currentPage.value = 1;
  refresh();
}

function goToPage(page: number) {
  currentPage.value = page;
}

watch([statusFilter, validFilter], applyFilters);

watch(
  () => route.query.userId,
  (newUserId) => {
    userFilter.value = (newUserId as string) || '';
    if (userFilter.value) loadUser(userFilter.value);
    else userData.value = null;
    applyFilters();
  },
);
</script>

<template>
  <AppPage
    :title="pageTitle"
    description="Every generated path with its validation outcome"
    :refreshing="pending"
    @refresh="refresh"
  >
    <Card v-if="userFilter" class="gap-0 border-primary/30 bg-primary/5 py-0">
      <div class="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
        <component :is="icons.User" class="size-4 text-primary" />
        <span class="text-muted-foreground">Filtered by user</span>
        <NuxtLink
          v-if="userData"
          :to="`/users/${userFilter}`"
          class="font-medium hover:text-primary hover:underline"
        >
          {{ userName }}
        </NuxtLink>
        <span v-else class="font-mono text-xs text-muted-foreground">{{ userFilter }}</span>
        <Button as-child variant="ghost" size="sm" class="ml-auto">
          <NuxtLink to="/paths">
            <X />
            Clear filter
          </NuxtLink>
        </Button>
      </div>
    </Card>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search paths…"
          aria-label="Search paths"
          class="h-8 w-64 pl-8"
          @keyup.enter="applyFilters"
        />
      </div>

      <AppFilterSelect v-model="statusFilter" label="Status" :options="statusOptions" />
      <AppFilterSelect v-model="validFilter" label="Validation" :options="validOptions" width-class="min-w-36" />

      <Button size="sm" class="ml-auto" @click="applyFilters">Apply</Button>
    </div>

    <AppDataCard title="Paths" :meta="totalLabel">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <TableHead>Path</TableHead>
            <TableHead v-if="!userFilter">User</TableHead>
            <TableHead>Career</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Courses</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Valid</TableHead>
            <TableHead class="text-right">Strengths</TableHead>
            <TableHead class="text-right">Flags</TableHead>
            <TableHead>Validated</TableHead>
            <TableHead class="w-16" />
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending">
          <TableRow v-for="n in 8" :key="n">
            <TableCell :colspan="userFilter ? 10 : 11">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="rows.length">
          <TableRow v-for="path in rows" :key="path._id">
            <TableCell class="max-w-[20rem]">
              <NuxtLink
                :to="`/paths/${path._id}`"
                class="block truncate font-medium hover:text-primary hover:underline"
              >
                {{ path.pathName }}
              </NuxtLink>
            </TableCell>
            <TableCell v-if="!userFilter" class="max-w-[12rem]">
              <NuxtLink
                v-if="path.userId"
                :to="`/users/${path.userId}`"
                class="block truncate text-muted-foreground hover:text-primary hover:underline"
              >
                {{ path.userName || path.userEmail || path.userId }}
              </NuxtLink>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell class="max-w-[14rem] truncate text-muted-foreground">
              {{ path.selectedCareer || '—' }}
            </TableCell>
            <TableCell>
              <AppStatusBadge :status="path.status" />
            </TableCell>
            <TableCell class="text-right tabular-nums">{{ path.totalCourses }}</TableCell>
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
            <TableCell class="text-right tabular-nums">
              <span v-if="path.validationResult?.highlights?.length" class="font-medium text-success">
                {{ path.validationResult.highlights.length }}
              </span>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell class="text-right tabular-nums">
              <span v-if="path.validationResult">{{ path.validationResult.flags.length }}</span>
              <span v-else class="text-muted-foreground/50">—</span>
            </TableCell>
            <TableCell class="text-xs text-muted-foreground tabular-nums">
              {{ path.validationResult ? formatDate(path.validationResult.validatedAt) : '—' }}
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
            <TableCell :colspan="userFilter ? 10 : 11" class="p-0">
              <AppEmptyState
                title="No paths found"
                description="No learning paths match the current filters."
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
      title="Failed to load paths"
      :message="error.message"
      @retry="refresh"
    />
  </AppPage>
</template>
