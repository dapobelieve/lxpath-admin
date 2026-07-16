<template>
  <Listbox v-model="model">
    <div class="relative">
      <ListboxButton
        class="btn btn-sm font-normal justify-between gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-base-100"
        :class="[widthClass, isActive ? 'btn-primary btn-outline' : 'btn-outline border-base-300']"
      >
        <span :class="isActive ? 'opacity-80' : 'opacity-60'">{{ label }}:</span>
        <span class="font-medium truncate">{{ selectedLabel }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <ListboxOptions class="absolute z-30 mt-1 min-w-full w-max max-w-xs max-h-64 overflow-auto rounded-box bg-base-100 border border-base-300 shadow-lg p-1 focus:outline-none">
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            v-slot="{ active, selected }"
            :value="option.value"
            as="template"
          >
            <li
              class="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer"
              :class="[active ? 'bg-base-200' : '', selected ? 'text-primary font-semibold' : '']"
            >
              <span class="truncate">{{ option.label }}</span>
              <svg v-if="selected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts" generic="T extends string | number">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';

interface FilterOption {
  label: string;
  value: T;
}

const props = withDefaults(
  defineProps<{
    label: string;
    options: FilterOption[];
    modelValue: T;
    activeValue?: T;
    widthClass?: string;
  }>(),
  { widthClass: 'min-w-40' },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: T) => emit('update:modelValue', value),
});

const selectedLabel = computed(
  () =>
    props.options.find((option) => option.value === props.modelValue)?.label ??
    props.options[0]?.label ??
    '',
);

const isActive = computed(() => props.modelValue !== (props.activeValue ?? props.options[0]?.value));
</script>
