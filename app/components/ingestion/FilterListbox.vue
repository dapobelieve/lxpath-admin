<template>
  <Listbox v-model="model">
    <div class="relative">
      <ListboxButton class="btn btn-sm btn-outline border-base-300 font-normal justify-between min-w-40 gap-2">
        <span class="opacity-60">{{ label }}:</span>
        <span class="font-medium">{{ selectedLabel }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </ListboxButton>
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions class="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-box bg-base-100 border border-base-300 shadow-lg p-1 focus:outline-none">
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            v-slot="{ active, selected }"
            :value="option.value"
            as="template"
          >
            <li
              class="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer"
              :class="[active ? 'bg-base-200' : '', selected ? 'text-primary font-semibold' : '']"
            >
              <span>{{ option.label }}</span>
              <svg v-if="selected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';

interface FilterOption {
  label: string;
  value: string;
}

const props = defineProps<{
  label: string;
  options: FilterOption[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const selectedLabel = computed(
  () =>
    props.options.find((option) => option.value === props.modelValue)?.label ??
    props.options[0]?.label ??
    '',
);
</script>
