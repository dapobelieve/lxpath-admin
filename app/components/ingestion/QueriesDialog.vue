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
          <DialogPanel class="card bg-base-100 shadow-xl w-full max-w-2xl">
            <div class="card-body max-h-[80vh]">
              <div class="flex items-center justify-between">
                <DialogTitle class="card-title text-lg">
                  Configured Queries
                  <span v-if="queries" class="badge badge-sm badge-ghost">{{ queries.length }}</span>
                </DialogTitle>
                <button class="btn btn-ghost btn-sm btn-circle" @click="$emit('close')">✕</button>
              </div>
              <DialogDescription class="text-sm opacity-70">
                The curated search set each run works through — grouped by career, staged from
                Beginner to Advanced.
              </DialogDescription>

              <div v-if="pending" class="flex justify-center py-10">
                <span class="loading loading-spinner loading-lg" />
              </div>

              <div v-else-if="grouped.length" class="overflow-y-auto mt-2 space-y-2 pr-1">
                <Disclosure
                  v-for="group in grouped"
                  :key="group.career"
                  v-slot="{ open: expanded }"
                >
                  <DisclosureButton
                    class="w-full flex items-center justify-between gap-2 rounded-xl border border-base-300 px-4 py-2.5 text-left hover:bg-base-200 transition-colors"
                  >
                    <div>
                      <div class="font-medium text-sm">{{ group.career }}</div>
                      <div class="text-xs opacity-60">{{ group.relevance }}</div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="badge badge-sm badge-ghost">{{ group.queries.length }}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transition-transform"
                        :class="expanded ? 'rotate-180' : ''"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </DisclosureButton>
                  <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                  >
                    <DisclosurePanel class="px-2 pb-1">
                      <table class="table table-sm">
                        <tbody>
                          <tr v-for="query in group.queries" :key="query._id">
                            <td class="w-28">
                              <span class="badge badge-sm badge-ghost">{{ query.level }}</span>
                            </td>
                            <td class="font-mono text-xs">{{ query.query }}</td>
                            <td class="text-xs opacity-60">{{ query.suitableFor }}</td>
                            <td class="w-16 text-right">
                              <span
                                class="badge badge-xs"
                                :class="query.enabled ? 'badge-success badge-outline' : 'badge-ghost'"
                              >{{ query.enabled ? 'on' : 'off' }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </DisclosurePanel>
                  </transition>
                </Disclosure>
              </div>

              <div v-else class="text-center opacity-60 py-8">No queries configured</div>
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
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';
import type { IngestionQuery } from '~/types';

const props = defineProps<{ open: boolean }>();

defineEmits<{ (e: 'close'): void }>();

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
</script>
