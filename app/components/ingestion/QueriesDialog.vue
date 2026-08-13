<script setup lang="ts">
import { ChevronDown } from '@lucide/vue';
import { actionVariant, formatDate } from '~/utils/formatters';
import type { IngestionQuery } from '~/types';

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{ (e: 'close'): void }>();

const { getIngestionQueries } = useAdminApi();

const queries = ref<IngestionQuery[] | null>(null);
const pending = ref(false);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen || queries.value) return;
    pending.value = true;
    try {
      queries.value = await getIngestionQueries();
    } catch {
      queries.value = [];
    } finally {
      pending.value = false;
    }
  },
);

const grouped = computed(() => {
  const groups = new Map<string, { career: string; relevance: string; queries: IngestionQuery[] }>();
  for (const query of queries.value ?? []) {
    const group = groups.get(query.career) ?? {
      career: query.career,
      relevance: query.careerRelevance ?? '',
      queries: [],
    };
    group.queries.push(query);
    groups.set(query.career, group);
  }
  return Array.from(groups.values());
});

function neverRunCount(group: { queries: IngestionQuery[] }): number {
  return group.queries.filter((query) => !query.lastRunAt).length;
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          Topic coverage
          <Badge v-if="queries" variant="muted">{{ queries.length }}</Badge>
        </DialogTitle>
        <DialogDescription>
          Every ingested topic with its latest outcome — what ingestion has covered, and what it hasn't.
        </DialogDescription>
      </DialogHeader>

      <div v-if="pending" class="space-y-2 py-4">
        <Skeleton v-for="n in 5" :key="n" class="h-12 w-full rounded-xl" />
      </div>

      <div v-else-if="grouped.length" class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
        <Collapsible v-for="group in grouped" :key="group.career" class="group/collapsible">
          <CollapsibleTrigger
            class="flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
          >
            <div class="min-w-0">
              <div class="truncate text-sm font-medium">{{ group.career }}</div>
              <div class="truncate text-xs text-muted-foreground">{{ group.relevance }}</div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Badge v-if="neverRunCount(group)" variant="warning">
                {{ neverRunCount(group) }} never run
              </Badge>
              <Badge variant="muted">{{ group.queries.length }}</Badge>
              <ChevronDown
                class="size-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180"
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div
              class="overflow-x-auto px-1 py-2 [&_th]:h-9 [&_th]:px-3 [&_th]:text-xs [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:px-3 [&_td]:py-2"
            >
              <Table>
                <TableHeader>
                  <TableRow class="hover:bg-transparent">
                    <TableHead>Level</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Last run</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Course found</TableHead>
                    <TableHead class="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="query in group.queries" :key="query._id">
                    <TableCell>
                      <Badge variant="muted" class="capitalize">{{ query.level }}</Badge>
                    </TableCell>
                    <TableCell class="font-mono text-xs">{{ query.query }}</TableCell>
                    <TableCell class="text-xs text-muted-foreground tabular-nums">
                      <span v-if="query.lastRunAt">{{ formatDate(query.lastRunAt) }}</span>
                      <Badge v-else variant="warning">never</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        v-if="query.lastAction"
                        :variant="actionVariant(query.lastAction)"
                        :title="query.lastError || ''"
                      >
                        {{ query.lastAction }}
                      </Badge>
                      <span v-else class="text-xs text-muted-foreground/50">—</span>
                    </TableCell>
                    <TableCell class="max-w-48">
                      <NuxtLink
                        v-if="query.lastCourseId"
                        :to="`/courses/${query.lastCourseId}`"
                        class="line-clamp-1 text-xs text-primary hover:underline"
                      >
                        {{ query.lastCourseTitle || 'View course' }}
                      </NuxtLink>
                      <span v-else class="text-xs text-muted-foreground/50">—</span>
                    </TableCell>
                    <TableCell class="text-right">
                      <Badge :variant="query.enabled ? 'success' : 'muted'">
                        {{ query.enabled ? 'on' : 'off' }}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <AppEmptyState v-else title="No topics configured" description="Nothing has been queued for ingestion." />
    </DialogContent>
  </Dialog>
</template>
