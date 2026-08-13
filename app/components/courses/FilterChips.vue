<script setup lang="ts">
import { X } from '@lucide/vue';

interface Chip {
  key: string;
  prefix: string;
  label: string;
}

defineProps<{ chips: Chip[] }>();

const emit = defineEmits<{ (e: 'remove', key: string): void }>();
</script>

<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-2">
    <span class="text-xs uppercase tracking-wide text-muted-foreground">Active</span>
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="inline-flex max-w-56 items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="`Remove filter ${chip.label}`"
      @click="emit('remove', chip.key)"
    >
      <span class="opacity-70">{{ chip.prefix }}</span>
      <span class="truncate">{{ chip.label }}</span>
      <X class="size-3 shrink-0" />
    </button>
  </div>
</template>
