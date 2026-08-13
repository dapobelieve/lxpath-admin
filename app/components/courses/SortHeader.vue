<script setup lang="ts">
import { ChevronDown, ChevronUp, ChevronsUpDown } from '@lucide/vue';

const props = defineProps<{
  sort: { field: string; order: 'asc' | 'desc' };
  field: string;
  label: string;
}>();

const emit = defineEmits<{ (e: 'sort', field: string): void }>();

const isActive = computed(() => props.sort.field === props.field);
const isAscending = computed(() => isActive.value && props.sort.order === 'asc');
const ariaSort = computed(() => {
  if (!isActive.value) return 'none';
  return props.sort.order === 'asc' ? 'ascending' : 'descending';
});
const icon = computed(() => {
  if (!isActive.value) return ChevronsUpDown;
  return isAscending.value ? ChevronUp : ChevronDown;
});
</script>

<template>
  <TableHead :aria-sort="ariaSort">
    <button
      type="button"
      :class="[
        'group inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'text-foreground' : '',
      ]"
      @click="emit('sort', field)"
    >
      {{ label }}
      <component
        :is="icon"
        :class="['size-3 transition-opacity', isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']"
      />
    </button>
  </TableHead>
</template>
