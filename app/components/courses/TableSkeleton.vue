<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 8 });

const rows = computed(() => Array.from({ length: props.count }, (_, i) => i));
</script>

<template>
  <TableRow v-for="row in rows" :key="row" class="hover:bg-transparent">
    <TableCell>
      <Skeleton class="mb-2 h-4 w-48" />
      <Skeleton class="h-3 w-28" />
    </TableCell>
    <TableCell><Skeleton class="h-4 w-20" /></TableCell>
    <TableCell><Skeleton class="h-5 w-16 rounded-full" /></TableCell>
    <TableCell>
      <div class="flex gap-1">
        <Skeleton class="h-5 w-14 rounded-full" />
        <Skeleton class="h-5 w-14 rounded-full" />
      </div>
    </TableCell>
    <TableCell><Skeleton class="h-4 w-14" /></TableCell>
    <TableCell><Skeleton class="h-4 w-10" /></TableCell>
    <TableCell><Skeleton class="h-5 w-20 rounded-full" /></TableCell>
    <TableCell><Skeleton class="h-4 w-20" /></TableCell>
    <TableCell><Skeleton class="ml-auto size-6 rounded-md" /></TableCell>
  </TableRow>
</template>
