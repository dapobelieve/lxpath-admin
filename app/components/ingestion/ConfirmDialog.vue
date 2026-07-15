<template>
  <TransitionRoot :show="open" as="template">
    <Dialog class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="card bg-base-100 shadow-xl w-full max-w-md">
            <div class="card-body">
              <DialogTitle class="card-title text-lg">{{ title }}</DialogTitle>
              <DialogDescription class="text-sm opacity-80">
                {{ message }}
              </DialogDescription>
              <div class="card-actions justify-end mt-4">
                <button class="btn btn-ghost btn-sm" @click="$emit('close')">
                  {{ cancelLabel }}
                </button>
                <button
                  class="btn btn-sm"
                  :class="confirmClass"
                  :disabled="loading"
                  @click="$emit('confirm')"
                >
                  <span v-if="loading" class="loading loading-spinner loading-xs" />
                  {{ confirmLabel }}
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmClass?: string;
    loading?: boolean;
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Keep as is',
    confirmClass: 'btn-error',
    loading: false,
  },
);

defineEmits<{
  (e: 'confirm'): void;
  (e: 'close'): void;
}>();
</script>
