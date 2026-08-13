<script setup lang="ts" generic="T extends string | number">
interface FilterOption {
  label: string;
  value: T;
}

const props = withDefaults(
  defineProps<{
    label: string;
    options: FilterOption[];
    modelValue: T;
    widthClass?: string;
  }>(),
  { widthClass: 'min-w-40' },
);

const emit = defineEmits<{ (e: 'update:modelValue', value: T): void }>();

const EMPTY_KEY = '__all__';

function toKey(value: unknown): string {
  return value === '' || value === null || value === undefined ? EMPTY_KEY : String(value);
}

const model = computed({
  get: () => toKey(props.modelValue),
  set: (key: string) => {
    const option = props.options.find((item) => toKey(item.value) === key);
    if (option) emit('update:modelValue', option.value);
  },
});

const selectedLabel = computed(
  () => props.options.find((option) => toKey(option.value) === toKey(props.modelValue))?.label
    ?? props.options[0]?.label
    ?? '',
);

const isActive = computed(() => toKey(props.modelValue) !== toKey(props.options[0]?.value));
</script>

<template>
  <Select v-model="model">
    <SelectTrigger
      size="sm"
      :class="[widthClass, 'justify-between font-normal', isActive ? 'border-primary/40 bg-primary/5 text-foreground' : '']"
      :aria-label="label"
    >
      <span class="flex min-w-0 items-center gap-1.5">
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="truncate font-medium">{{ selectedLabel }}</span>
      </span>
    </SelectTrigger>
    <SelectContent class="max-h-72">
      <SelectItem
        v-for="option in options"
        :key="toKey(option.value)"
        :value="toKey(option.value)"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
