<script setup lang="ts">
import { Loader2 } from '@lucide/vue';
import type { IngestionQuery, IngestionLevel, TopicPayload } from '~/types';

const props = withDefaults(
  defineProps<{
    open: boolean;
    topic?: IngestionQuery | null;
    careers?: string[];
    loading?: boolean;
  }>(),
  { topic: null, careers: () => [], loading: false },
);

const emit = defineEmits<{
  (e: 'save', payload: TopicPayload): void;
  (e: 'close'): void;
}>();

const LEVELS: IngestionLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const levelOptions = LEVELS.map((level) => ({ label: level, value: level }));

const career = ref('');
const careerRelevance = ref('');
const level = ref<IngestionLevel>('Beginner');
const query = ref('');
const suitableFor = ref('');
const enabled = ref(true);

const isEditing = computed(() => Boolean(props.topic));

const careerSuggestions = computed(() =>
  props.careers.filter((name) => name.toLowerCase() !== career.value.trim().toLowerCase()),
);

const errors = computed(() => ({
  career: career.value.trim().length < 2 ? 'Career must be at least 2 characters' : '',
  query: query.value.trim().length < 3 ? 'Search query must be at least 3 characters' : '',
}));

const isValid = computed(() => !errors.value.career && !errors.value.query);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    career.value = props.topic?.career ?? '';
    careerRelevance.value = props.topic?.careerRelevance ?? '';
    level.value = (props.topic?.level as IngestionLevel) ?? 'Beginner';
    query.value = props.topic?.query ?? '';
    suitableFor.value = props.topic?.suitableFor ?? '';
    enabled.value = props.topic?.enabled ?? true;
  },
  { immediate: true },
);

function save() {
  if (!isValid.value) return;

  emit('save', {
    career: career.value.trim(),
    careerRelevance: careerRelevance.value.trim(),
    level: level.value,
    query: query.value.trim(),
    suitableFor: suitableFor.value.trim(),
    enabled: enabled.value,
  });
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? 'Edit topic' : 'Add topic' }}</DialogTitle>
        <DialogDescription>
          A topic is one YouTube search the daily ingestion runs. Career and level are combined with
          a level modifier to build the actual search.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label for="topic-career">Career</Label>
          <Input
            id="topic-career"
            v-model="career"
            list="topic-career-options"
            placeholder="Data Analyst"
            autocomplete="off"
          />
          <datalist id="topic-career-options">
            <option v-for="name in careerSuggestions" :key="name" :value="name" />
          </datalist>
          <p v-if="errors.career" class="text-xs text-destructive">{{ errors.career }}</p>
        </div>

        <div class="space-y-1.5">
          <Label for="topic-relevance">Why this career needs it</Label>
          <Input
            id="topic-relevance"
            v-model="careerRelevance"
            placeholder="SQL, Excel and BI tools are the daily analyst toolkit"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-[1fr_11rem]">
          <div class="space-y-1.5">
            <Label for="topic-query">YouTube search query</Label>
            <Input
              id="topic-query"
              v-model="query"
              class="font-mono text-sm"
              placeholder="sql for data analysis full course"
            />
            <p v-if="errors.query" class="text-xs text-destructive">{{ errors.query }}</p>
          </div>

          <div class="space-y-1.5">
            <Label>Level</Label>
            <AppFilterSelect v-model="level" label="Level" :options="levelOptions" width-class="w-full" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="topic-suitable">Who it suits</Label>
          <Input
            id="topic-suitable"
            v-model="suitableFor"
            placeholder="Beginners learning to query data"
          />
        </div>

        <div class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p class="text-sm font-medium">Enabled</p>
            <p class="text-xs text-muted-foreground">
              Disabled topics stay in the library but are skipped by every run.
            </p>
          </div>
          <Switch v-model="enabled" aria-label="Topic enabled" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="emit('close')">Cancel</Button>
        <Button :disabled="loading || !isValid" @click="save">
          <Loader2 v-if="loading" class="animate-spin" />
          {{ isEditing ? 'Save changes' : 'Add topic' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
