<template>
  <TransitionRoot :show="open" as="template">
    <Dialog class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-base-200/80 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="card bg-base-100 border border-base-300 shadow-xl w-full max-w-3xl">
            <div class="card-body">
              <DialogTitle class="card-title text-xl">Ingest topics</DialogTitle>
              <DialogDescription class="text-sm opacity-70">
                Enter the topics or course names to ingest — one per line. Each topic pulls the
                best YouTube video, tags skills with AI, and publishes it straight into the
                course catalog.
              </DialogDescription>

              <textarea
                v-model="customText"
                rows="8"
                class="textarea textarea-bordered w-full font-mono text-sm mt-3"
                placeholder="react native full course&#10;prompt engineering for beginners&#10;kubernetes networking deep dive"
              />

              <div class="flex flex-wrap items-center gap-4 mt-1">
                <span class="text-sm opacity-70">
                  {{ topics.length }} topic{{ topics.length === 1 ? '' : 's' }} (max 50)
                  · ~{{ formatNumber(estimatedUnits) }} quota units
                </span>
                <label class="flex items-center gap-2 text-sm opacity-80">
                  Level
                  <select v-model="level" class="select select-bordered select-sm">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>

              <div class="text-xs opacity-60 mt-2 space-y-1">
                <p>
                  Quota today: {{ formatNumber(quotaUsedToday) }} / {{ formatNumber(quotaBudget) }} units used.
                  Topics beyond the budget are skipped, not failed.
                </p>
                <p>Tip: phrases like “full course” or “tutorial” find better long-form results.</p>
              </div>

              <div class="card-actions justify-end mt-4">
                <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
                <button class="btn btn-primary" :disabled="loading || topics.length === 0" @click="start">
                  <span v-if="loading" class="loading loading-spinner loading-xs" />
                  Ingest {{ topics.length || '' }} topic{{ topics.length === 1 ? '' : 's' }}
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';
import { formatNumber } from '~/utils/formatters';
import type { TriggerRunPayload } from '~/types';

const props = withDefaults(
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

const customText = ref('');
const level = ref<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

const UNITS_PER_QUERY = 101;
const MAX_TOPICS = 50;

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
