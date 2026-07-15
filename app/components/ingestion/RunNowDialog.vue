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
        <div class="fixed inset-0 bg-black/50" aria-hidden="true" />
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
          <DialogPanel class="card bg-base-100 shadow-xl w-full max-w-lg">
            <div class="card-body">
              <DialogTitle class="card-title text-lg">Start an ingestion run</DialogTitle>
              <DialogDescription class="text-sm opacity-70">
                Pulls the best YouTube video per query, tags skills with AI, and publishes
                straight into the course catalog.
              </DialogDescription>

              <RadioGroup v-model="mode" class="space-y-2 mt-3">
                <RadioGroupOption v-slot="{ checked }" value="full" as="template">
                  <div
                    class="border rounded-xl p-3 cursor-pointer transition-colors"
                    :class="checked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-base-300 hover:border-base-content/30'"
                  >
                    <div class="flex items-center justify-between">
                      <RadioGroupLabel class="font-medium">Full run</RadioGroupLabel>
                      <span class="badge badge-sm badge-outline">~{{ formatNumber(fullRunUnits) }} units</span>
                    </div>
                    <RadioGroupDescription class="text-xs opacity-70 mt-1">
                      All {{ enabledQueries }} enabled queries across every career and level.
                    </RadioGroupDescription>
                  </div>
                </RadioGroupOption>

                <RadioGroupOption v-slot="{ checked }" value="smoke" as="template">
                  <div
                    class="border rounded-xl p-3 cursor-pointer transition-colors"
                    :class="checked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-base-300 hover:border-base-content/30'"
                  >
                    <div class="flex items-center justify-between">
                      <RadioGroupLabel class="font-medium">Smoke test</RadioGroupLabel>
                      <span class="badge badge-sm badge-outline">~{{ formatNumber(smokeUnits) }} units</span>
                    </div>
                    <RadioGroupDescription class="text-xs opacity-70 mt-1">
                      Only the first few queries — cheap way to verify the pipeline.
                    </RadioGroupDescription>
                    <div v-if="checked" class="flex items-center gap-2 mt-2" @click.stop>
                      <span class="text-xs opacity-70">Query limit</span>
                      <input
                        v-model.number="queryLimit"
                        type="number"
                        min="1"
                        max="100"
                        class="input input-bordered input-xs w-20"
                      />
                    </div>
                  </div>
                </RadioGroupOption>
              </RadioGroup>

              <div class="text-xs opacity-60 mt-2">
                Quota today: {{ formatNumber(quotaUsedToday) }} / {{ formatNumber(quotaBudget) }} units used.
                Queries beyond the budget are skipped, not failed.
              </div>

              <div class="card-actions justify-end mt-4">
                <button class="btn btn-ghost btn-sm" @click="$emit('close')">Cancel</button>
                <button class="btn btn-primary btn-sm" :disabled="loading || !valid" @click="start">
                  <span v-if="loading" class="loading loading-spinner loading-xs" />
                  Start run
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
  RadioGroup,
  RadioGroupOption,
  RadioGroupLabel,
  RadioGroupDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';
import { formatNumber } from '~/utils/formatters';

const props = withDefaults(
  defineProps<{
    open: boolean;
    enabledQueries: number;
    quotaUsedToday: number;
    quotaBudget: number;
    loading?: boolean;
  }>(),
  { loading: false },
);

const emit = defineEmits<{
  (e: 'start', queryLimit?: number): void;
  (e: 'close'): void;
}>();

const mode = ref<'full' | 'smoke'>('full');
const queryLimit = ref(3);

const UNITS_PER_QUERY = 101;

const fullRunUnits = computed(() => props.enabledQueries * UNITS_PER_QUERY);
const smokeUnits = computed(() => Math.max(1, queryLimit.value || 1) * UNITS_PER_QUERY);
const valid = computed(
  () => mode.value === 'full' || (queryLimit.value >= 1 && queryLimit.value <= 100),
);

function start() {
  emit('start', mode.value === 'smoke' ? queryLimit.value : undefined);
}
</script>
