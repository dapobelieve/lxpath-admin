<template>
  <Menu as="div" class="relative inline-block text-left">
    <MenuButton
      class="btn btn-xs btn-ghost btn-square focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-base-100"
      :aria-label="`Actions for ${title}`"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
      </svg>
    </MenuButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <MenuItems class="absolute right-0 z-30 mt-1 w-48 origin-top-right rounded-box bg-base-100 border border-base-300 shadow-lg p-1 focus:outline-none">
        <MenuItem v-slot="{ active }">
          <NuxtLink
            :to="`/courses/${courseId}`"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer"
            :class="active ? 'bg-base-200' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View details
          </NuxtLink>
        </MenuItem>
        <MenuItem v-slot="{ active }">
          <a
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer"
            :class="active ? 'bg-base-200' : ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open course link
          </a>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

defineProps<{
  courseId: string;
  title: string;
  link: string;
}>();
</script>
