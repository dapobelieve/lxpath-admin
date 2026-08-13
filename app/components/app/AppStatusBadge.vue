<script setup lang="ts">
import { statusLabel, statusVariant } from '~/utils/formatters';

defineProps<{ status: string }>();
</script>

<template>
  <Badge :variant="statusVariant(status)" class="gap-1.5 capitalize">
    <span class="size-1.5 rounded-full bg-current opacity-80" />
    {{ statusLabel(status) }}
  </Badge>
</template>
