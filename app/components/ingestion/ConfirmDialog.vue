<script setup lang="ts">
import { Loader2 } from '@lucide/vue';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Keep as is',
    destructive: true,
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'close'): void;
}>();
</script>

<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ message }}</DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="ghost" @click="emit('close')">{{ cancelLabel }}</Button>
        <Button
          :variant="destructive ? 'destructive' : 'default'"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <Loader2 v-if="loading" class="animate-spin" />
          {{ confirmLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
