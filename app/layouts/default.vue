<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-w-0">
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
