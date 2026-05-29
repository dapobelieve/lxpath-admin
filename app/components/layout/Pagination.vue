<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-between gap-3 flex-wrap"
    aria-label="Pagination"
  >
    <div class="text-xs opacity-70">
      Page {{ currentPage }} of {{ totalPages.toLocaleString() }}
    </div>

    <div class="flex items-center gap-2">
      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === 1"
        aria-label="First page"
        @click="emit('update:page', 1)"
      >
        &laquo;
      </button>
      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="emit('update:page', currentPage - 1)"
      >
        &lsaquo;
      </button>

      <template v-for="(item, idx) in pageItems" :key="`${item}-${idx}`">
        <span
          v-if="item === '…'"
          class="px-2 text-sm opacity-50 select-none"
        >…</span>
        <button
          v-else
          class="btn btn-sm min-w-[2.25rem]"
          :class="item === currentPage ? 'btn-primary' : 'btn-ghost'"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="emit('update:page', item as number)"
        >
          {{ item }}
        </button>
      </template>

      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="emit('update:page', currentPage + 1)"
      >
        &rsaquo;
      </button>
      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === totalPages"
        aria-label="Last page"
        @click="emit('update:page', totalPages)"
      >
        &raquo;
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}>();

const emit = defineEmits<{
  'update:page': [page: number];
}>();

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
