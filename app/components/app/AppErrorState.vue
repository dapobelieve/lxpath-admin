<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue';

withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    retryLabel?: string;
  }>(),
  { title: 'Something went wrong', retryLabel: 'Retry' },
);

defineEmits<{ (e: 'retry'): void }>();
</script>

<template>
  <Alert variant="destructive" class="flex items-start gap-3 border-destructive/30 bg-destructive/5">
    <TriangleAlert />
    <div class="min-w-0 flex-1">
      <AlertTitle>{{ title }}</AlertTitle>
      <AlertDescription v-if="message">{{ message }}</AlertDescription>
    </div>
    <Button variant="outline" size="sm" class="shrink-0" @click="$emit('retry')">
      {{ retryLabel }}
    </Button>
  </Alert>
</template>
