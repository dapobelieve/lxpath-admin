<script setup lang="ts">
import {
  BookOpen,
  ChartPie,
  ListChecks,
  Route,
  ShieldCheck,
  Users,
  SquarePlay,
} from '@lucide/vue';

const route = useRoute();

const groups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', to: '/', icon: ChartPie },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Learning Paths', to: '/paths', icon: Route },
      { title: 'Courses', to: '/courses', icon: BookOpen },
      { title: 'Users', to: '/users', icon: Users },
    ],
  },
  {
    label: 'Ingestion',
    items: [
      { title: 'YouTube Runs', to: '/ingestion', icon: SquarePlay },
      { title: 'Course Review', to: '/ingestion/review', icon: ListChecks },
    ],
  },
];

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/';
  if (to === '/ingestion') return route.path === '/ingestion' || route.path.startsWith('/ingestion/runs');
  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>

<template>
  <Sidebar collapsible="icon" class="border-r">
    <SidebarHeader class="border-b h-16 justify-center">
      <div class="flex items-center gap-2.5 px-1">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck class="size-4" />
        </div>
        <div class="grid min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
          <span class="truncate text-sm font-semibold">lxpath</span>
          <span class="truncate text-xs text-muted-foreground">Admin console</span>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-0">
      <SidebarGroup v-for="group in groups" :key="group.label">
        <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="item.to">
              <SidebarMenuButton as-child :is-active="isActive(item.to)" :tooltip="item.title">
                <NuxtLink :to="item.to">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-t">
      <AppThemeToggle />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
