<template>
  <header class="navbar bg-base-100 border-b border-base-200">
    <div class="flex-1">
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
    </div>
    <div class="flex-none gap-2">
      <button class="btn btn-sm btn-ghost" @click="$emit('refresh')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
defineEmits<{ (e: 'refresh'): void }>();
</script>
