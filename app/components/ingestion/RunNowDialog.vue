<script setup lang="ts">
import { Loader2 } from '@lucide/vue';
import { formatNumber } from '~/utils/formatters';
import type { TriggerRunPayload } from '~/types';

withDefaults(
  defineProps<{
    open: boolean;
    quotaUsedToday: number;
    quotaBudget: number;
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  (e: 'start', payload: TriggerRunPayload): void;
  (e: 'close'): void;
}>();

const UNITS_PER_QUERY = 101;
const MAX_TOPICS = 50;

const customText = ref('');
const level = ref<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

const levelOptions = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
];

const topics = computed(() => {
  const seen = new Set<string>();
  return customText.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      const key = line.toLowerCase();
      if (line.length < 3 || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_TOPICS);
});

const estimatedUnits = computed(() => topics.value.length * UNITS_PER_QUERY);

function start() {
  emit('start', { customQueries: topics.value, level: level.value });
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Ingest topics</DialogTitle>
        <DialogDescription>
          One topic or course name per line. Each topic pulls the best YouTube video, tags skills
          with AI, and publishes it into the course catalog.
        </DialogDescription>
      </DialogHeader>

      <Textarea
        v-model="customText"
        :rows="8"
        class="font-mono text-sm"
        placeholder="react native full course&#10;prompt engineering for beginners&#10;kubernetes networking deep dive"
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground tabular-nums">
          {{ topics.length }} topic{{ topics.length === 1 ? '' : 's' }} (max {{ MAX_TOPICS }})
          · ~{{ formatNumber(estimatedUnits) }} quota units
        </p>
        <AppFilterSelect v-model="level" label="Level" :options="levelOptions" width-class="min-w-44" />
      </div>

      <div class="space-y-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          Quota today: {{ formatNumber(quotaUsedToday) }} / {{ formatNumber(quotaBudget) }} units used.
          Topics beyond the budget are skipped, not failed.
        </p>
        <p>Tip: phrases like “full course” or “tutorial” find better long-form results.</p>
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="emit('close')">Cancel</Button>
        <Button :disabled="loading || topics.length === 0" @click="start">
          <Loader2 v-if="loading" class="animate-spin" />
          Ingest {{ topics.length || '' }} topic{{ topics.length === 1 ? '' : 's' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
