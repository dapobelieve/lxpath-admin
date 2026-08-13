<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue';

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark';
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Toggle theme" @click="toggle">
        <ClientOnly>
          <component :is="isDark ? Sun : Moon" />
          <span>{{ isDark ? 'Light mode' : 'Dark mode' }}</span>

          <template #fallback>
            <Moon />
            <span>Theme</span>
          </template>
        </ClientOnly>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
