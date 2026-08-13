<script setup lang="ts">
import { CircleCheck, CircleHelp } from '@lucide/vue';

defineProps<{ verified?: boolean }>();
</script>

<template>
  <Badge :variant="verified ? 'success' : 'muted'">
    <CircleCheck v-if="verified" />
    <CircleHelp v-else />
    {{ verified ? 'Verified' : 'Unverified' }}
  </Badge>
</template>
