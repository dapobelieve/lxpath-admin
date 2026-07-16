<template>
  <th
    scope="col"
    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-base-content/50"
    :aria-sort="ariaSort"
  >
    <button
      type="button"
      class="group inline-flex items-center gap-1 rounded transition-colors hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-base-100"
      :class="isActive ? 'text-base-content' : ''"
      @click="emit('sort', field)"
    >
      {{ label }}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 transition-opacity"
        :class="isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path v-if="isAscending" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </th>
</template>

<script setup lang="ts">
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
</script>
