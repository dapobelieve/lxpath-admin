<template>
  <tr v-for="row in rows" :key="row" class="border-t border-base-200">
    <td class="px-4 py-3">
      <div class="skeleton h-4 w-48 mb-2" />
      <div class="skeleton h-3 w-28" />
    </td>
    <td class="px-4 py-3"><div class="skeleton h-4 w-20" /></td>
    <td class="px-4 py-3"><div class="skeleton h-5 w-16 rounded-full" /></td>
    <td class="px-4 py-3">
      <div class="flex gap-1">
        <div class="skeleton h-5 w-14 rounded-full" />
        <div class="skeleton h-5 w-14 rounded-full" />
      </div>
    </td>
    <td class="px-4 py-3"><div class="skeleton h-4 w-14" /></td>
    <td class="px-4 py-3"><div class="skeleton h-4 w-10" /></td>
    <td class="px-4 py-3"><div class="skeleton h-5 w-20 rounded-full" /></td>
    <td class="px-4 py-3"><div class="skeleton h-4 w-20" /></td>
    <td class="px-4 py-3"><div class="skeleton h-6 w-6 rounded-md ml-auto" /></td>
  </tr>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 8 });

const rows = computed(() => Array.from({ length: props.count }, (_, i) => i));
</script>
