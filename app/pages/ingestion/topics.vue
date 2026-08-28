<script setup lang="ts">
import { Loader2, Pencil, Play, Plus, Search, Trash2 } from '@lucide/vue';
import { toast } from 'vue-sonner';
import type { IngestionQuery, IngestionLevel, TopicPayload } from '~/types';
import { actionVariant, formatDate, formatNumber } from '~/utils/formatters';

const {
  getIngestionTopics,
  getIngestionTopicCareers,
  createIngestionTopic,
  updateIngestionTopic,
  deleteIngestionTopics,
  toggleIngestionTopics,
  triggerIngestionRun,
} = useAdminApi();

const PAGE_SIZE = 50;

const currentPage = ref(1);
const searchQuery = ref('');
const careerFilter = ref('');
const levelFilter = ref<IngestionLevel | ''>('');
const statusFilter = ref('');
const selectedIds = ref<string[]>([]);
const submitting = ref(false);

const formOpen = ref(false);
const editing = ref<IngestionQuery | null>(null);
const deleteOpen = ref(false);

const levelOptions = [
  { label: 'All levels', value: '' },
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

const statusOptions = [
  { label: 'All topics', value: '' },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Never run', value: 'never-run' },
];

const enabledParam = computed(() => {
  if (statusFilter.value === 'enabled') return true;
  if (statusFilter.value === 'disabled') return false;
  return undefined;
});

const { data, pending, error, refresh } = useAsyncData(
  'admin-ingestion-topics',
  () =>
    getIngestionTopics({
      page: currentPage.value,
      limit: PAGE_SIZE,
      search: searchQuery.value || undefined,
      career: careerFilter.value || undefined,
      level: levelFilter.value || undefined,
      enabled: enabledParam.value,
      neverRun: statusFilter.value === 'never-run' || undefined,
    }),
  { watch: [currentPage] },
);

const { data: careers, refresh: refreshCareers } = useAsyncData(
  'admin-ingestion-topic-careers',
  () => getIngestionTopicCareers(),
);

const rows = computed(() => data.value?.data ?? []);

const careerOptions = computed(() => [
  { label: 'All careers', value: '' },
  ...(careers.value ?? []).map((career) => ({ label: career, value: career })),
]);

const allSelected = computed(
  () => rows.value.length > 0 && rows.value.every((topic) => isSelected(topic._id)),
);

const selectAllState = computed<boolean | 'indeterminate'>(() => {
  if (allSelected.value) return true;
  return selectedIds.value.length > 0 ? 'indeterminate' : false;
});

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id);
}

function toggleOne(id: string) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id];
}

function toggleAll() {
  selectedIds.value = allSelected.value ? [] : rows.value.map((topic) => topic._id);
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
  await Promise.all([refresh(), refreshCareers()]);
}

function openCreate() {
  editing.value = null;
  formOpen.value = true;
}

function openEdit(topic: IngestionQuery) {
  editing.value = topic;
  formOpen.value = true;
}

async function saveTopic(payload: TopicPayload) {
  submitting.value = true;

  try {
    if (editing.value) {
      await updateIngestionTopic(editing.value._id, payload);
      toast.success('Topic updated.');
    } else {
      await createIngestionTopic(payload);
      toast.success('Topic added.');
    }
    formOpen.value = false;
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to save topic');
  } finally {
    submitting.value = false;
  }
}

async function confirmDelete() {
  submitting.value = true;

  try {
    const result = await deleteIngestionTopics([...selectedIds.value]);
    toast.success(`${result.deleted} topic${result.deleted === 1 ? '' : 's'} deleted.`);
    deleteOpen.value = false;
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to delete topics');
  } finally {
    submitting.value = false;
  }
}

async function setEnabled(enabled: boolean) {
  submitting.value = true;

  try {
    const result = await toggleIngestionTopics([...selectedIds.value], enabled);
    toast.success(
      `${result.updated} topic${result.updated === 1 ? '' : 's'} ${enabled ? 'enabled' : 'disabled'}.`,
    );
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to update topics');
  } finally {
    submitting.value = false;
  }
}

async function toggleRow(topic: IngestionQuery, enabled: boolean) {
  try {
    await updateIngestionTopic(topic._id, { enabled });
    await refresh();
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to update topic');
  }
}

async function runSelected() {
  submitting.value = true;

  try {
    const levels = Array.from(
      new Set(
        rows.value
          .filter((topic) => isSelected(topic._id))
          .map((topic) => topic.level as IngestionLevel),
      ),
    );

    await triggerIngestionRun({ topicIds: [...selectedIds.value], levels });
    toast.success(`Run queued for ${selectedIds.value.length} topics.`);
    selectedIds.value = [];
  } catch (err: any) {
    toast.error(err?.data?.message || 'Failed to queue run');
  } finally {
    submitting.value = false;
  }
}

watch([careerFilter, levelFilter, statusFilter], applyFilters);
</script>

<template>
  <AppPage
    title="Ingestion topics"
    description="The searches the daily YouTube ingestion runs"
    :refreshing="pending"
    @refresh="refreshAll"
  >
    <template #actions>
      <Button size="sm" @click="openCreate">
        <Plus class="size-3.5" />
        Add topic
      </Button>
    </template>

    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-56 flex-1">
        <Search class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search topics or careers…"
          class="h-8 pl-8"
          @keyup.enter="applyFilters"
        />
      </div>

      <AppFilterSelect v-model="careerFilter" label="Career" :options="careerOptions" />
      <AppFilterSelect v-model="levelFilter" label="Level" :options="levelOptions" width-class="min-w-40" />
      <AppFilterSelect v-model="statusFilter" label="Status" :options="statusOptions" width-class="min-w-40" />

      <Button size="sm" class="ml-auto" @click="applyFilters">Apply</Button>
    </div>

    <AppErrorState v-if="error" :message="error.message" @retry="refreshAll" />

    <AppDataCard
      v-else
      title="Topic library"
      :meta="data ? `${formatNumber(data.pageInfo.total)} topics` : 'Loading…'"
    >
      <template #actions>
        <span v-if="selectedIds.length" class="text-xs text-muted-foreground tabular-nums">
          {{ selectedIds.length }} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!selectedIds.length || submitting"
          @click="setEnabled(true)"
        >
          Enable
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!selectedIds.length || submitting"
          @click="setEnabled(false)"
        >
          Disable
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!selectedIds.length || submitting"
          @click="runSelected"
        >
          <Play class="size-3.5" />
          Run
        </Button>
        <Button
          variant="destructive"
          size="sm"
          :disabled="!selectedIds.length || submitting"
          @click="deleteOpen = true"
        >
          <Loader2 v-if="submitting" class="animate-spin" />
          Delete
        </Button>
      </template>

      <Table>
        <TableHeader>
          <TableRow class="bg-muted/40 hover:bg-muted/40">
            <TableHead class="w-10">
              <Checkbox
                :model-value="selectAllState"
                aria-label="Select all on page"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <TableHead>Career</TableHead>
            <TableHead>Search query</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Last run</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead class="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody v-if="pending">
          <TableRow v-for="n in 10" :key="n" class="hover:bg-transparent">
            <TableCell colspan="8"><Skeleton class="h-4 w-full" /></TableCell>
          </TableRow>
        </TableBody>

        <TableBody v-else-if="rows.length">
          <TableRow
            v-for="topic in rows"
            :key="topic._id"
            :data-state="isSelected(topic._id) ? 'selected' : undefined"
          >
            <TableCell class="align-top">
              <Checkbox
                :model-value="isSelected(topic._id)"
                :aria-label="`Select ${topic.query}`"
                @update:model-value="toggleOne(topic._id)"
              />
            </TableCell>
            <TableCell class="max-w-64 align-top">
              <div class="truncate text-sm font-medium">{{ topic.career }}</div>
              <div class="truncate text-xs text-muted-foreground">
                {{ topic.careerRelevance || '—' }}
              </div>
            </TableCell>
            <TableCell class="max-w-72 align-top">
              <div class="truncate font-mono text-xs">{{ topic.query }}</div>
              <div v-if="topic.suitableFor" class="truncate text-xs text-muted-foreground">
                {{ topic.suitableFor }}
              </div>
            </TableCell>
            <TableCell class="align-top">
              <Badge variant="muted" class="capitalize">{{ topic.level }}</Badge>
            </TableCell>
            <TableCell class="align-top text-xs text-muted-foreground tabular-nums">
              <span v-if="topic.lastRunAt">{{ formatDate(topic.lastRunAt) }}</span>
              <Badge v-else variant="warning">never</Badge>
            </TableCell>
            <TableCell class="align-top">
              <Badge
                v-if="topic.lastAction"
                :variant="actionVariant(topic.lastAction)"
                :title="topic.lastError || ''"
              >
                {{ topic.lastAction }}
              </Badge>
              <span v-else class="text-xs text-muted-foreground/50">—</span>
              <NuxtLink
                v-if="topic.lastCourseId"
                :to="`/courses/${topic.lastCourseId}`"
                class="mt-1 line-clamp-1 text-xs text-primary hover:underline"
              >
                {{ topic.lastCourseTitle || 'View course' }}
              </NuxtLink>
            </TableCell>
            <TableCell class="align-top">
              <Switch
                :model-value="topic.enabled"
                :aria-label="`Toggle ${topic.query}`"
                @update:model-value="(value) => toggleRow(topic, value)"
              />
            </TableCell>
            <TableCell class="align-top text-right">
              <Button variant="ghost" size="icon-sm" aria-label="Edit topic" @click="openEdit(topic)">
                <Pencil class="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete topic"
                @click="selectedIds = [topic._id]; deleteOpen = true"
              >
                <Trash2 class="size-3.5 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <AppEmptyState
        v-if="!pending && !rows.length"
        title="No topics match these filters"
        description="Add a topic or widen the filters to see the library."
      />
    </AppDataCard>

    <AppPagination
      v-if="data"
      :current-page="data.pageInfo.page"
      :total-pages="data.pageInfo.totalPages"
      @update:page="goToPage"
    />

    <IngestionTopicFormDialog
      :open="formOpen"
      :topic="editing"
      :careers="careers ?? []"
      :loading="submitting"
      @save="saveTopic"
      @close="formOpen = false"
    />

    <IngestionConfirmDialog
      :open="deleteOpen"
      title="Delete topics"
      :message="`${selectedIds.length} topic${selectedIds.length === 1 ? '' : 's'} will stop being ingested. Past runs and any courses already published are kept.`"
      confirm-label="Delete"
      :loading="submitting"
      @confirm="confirmDelete"
      @close="deleteOpen = false"
    />
  </AppPage>
</template>
