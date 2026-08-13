<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}>();

const emit = defineEmits<{ 'update:page': [page: number] }>();

const pageItems = computed<(number | '…')[]>(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const siblings = props.siblingCount ?? 1;

  const totalToShow = siblings * 2 + 5;
  if (total <= totalToShow) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const items: (number | '…')[] = [1];

  if (showLeftDots) {
    items.push('…');
  } else {
    for (let i = 2; i < leftSibling; i++) items.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) items.push(i);
  }

  if (showRightDots) {
    items.push('…');
  } else {
    for (let i = rightSibling + 1; i < total; i++) items.push(i);
  }

  items.push(total);
  return items;
});
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex flex-wrap items-center justify-between gap-3"
    aria-label="Pagination"
  >
    <p class="text-xs text-muted-foreground tabular-nums">
      Page {{ currentPage.toLocaleString() }} of {{ totalPages.toLocaleString() }}
    </p>

    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="currentPage === 1"
        aria-label="First page"
        @click="emit('update:page', 1)"
      >
        <ChevronsLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="emit('update:page', currentPage - 1)"
      >
        <ChevronLeft />
      </Button>

      <template v-for="(item, idx) in pageItems" :key="`${item}-${idx}`">
        <span v-if="item === '…'" class="px-1.5 text-sm text-muted-foreground select-none">…</span>
        <Button
          v-else
          :variant="item === currentPage ? 'default' : 'ghost'"
          size="icon-sm"
          class="tabular-nums"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="emit('update:page', item as number)"
        >
          {{ item }}
        </Button>
      </template>

      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="emit('update:page', currentPage + 1)"
      >
        <ChevronRight />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="currentPage === totalPages"
        aria-label="Last page"
        @click="emit('update:page', totalPages)"
      >
        <ChevronsRight />
      </Button>
    </div>
  </nav>
</template>
