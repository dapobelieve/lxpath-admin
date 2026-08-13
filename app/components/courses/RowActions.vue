<script setup lang="ts">
import { ExternalLink, Eye, MoreHorizontal } from '@lucide/vue';

defineProps<{
  courseId: string;
  title: string;
  link: string;
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm" :aria-label="`Actions for ${title}`">
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuItem as-child>
        <NuxtLink :to="`/courses/${courseId}`">
          <Eye />
          View details
        </NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <a :href="link" target="_blank" rel="noopener noreferrer">
          <ExternalLink />
          Open course link
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
