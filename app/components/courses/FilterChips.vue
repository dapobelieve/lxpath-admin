<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-2">
    <span class="text-xs uppercase tracking-wide text-base-content/50">Active</span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-base-100"
      :aria-label="`Remove filter ${chip.label}`"
      @click="emit('remove', chip.key)"
    >
      <span class="opacity-60">{{ chip.prefix }}</span>
      <span class="truncate max-w-[10rem]">{{ chip.label }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Chip {
  key: string;
  prefix: string;
  label: string;
}

defineProps<{ chips: Chip[] }>();

const emit = defineEmits<{ (e: 'remove', key: string): void }>();
</script>
