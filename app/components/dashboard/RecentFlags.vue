<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue';
import type { ValidationStats } from '~/types';
import { categoryLabel, formatDate, severityVariant } from '~/utils/formatters';

defineProps<{ flags?: ValidationStats['recentFlags'] }>();

const icons = { ShieldCheck };
</script>

<template>
  <Card class="gap-0 overflow-hidden py-0">
    <div class="border-b px-4 py-3">
      <h2 class="text-sm font-semibold">Recent flags</h2>
      <p class="text-xs text-muted-foreground">Latest issues raised across validated paths</p>
    </div>

    <AppEmptyState
      v-if="!flags?.length"
      title="No flags right now"
      description="Every recently validated path came back clean."
      :icon="icons.ShieldCheck"
    />

    <ul v-else class="divide-y">
      <li
        v-for="item in flags"
        :key="`${item.pathId}-${item.flag.courseId}-${item.flag.category}`"
        class="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <Badge :variant="severityVariant(item.flag.severity)" class="mt-0.5 capitalize">
          {{ item.flag.severity }}
        </Badge>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              :to="`/paths/${item.pathId}`"
              class="truncate text-sm font-medium hover:text-primary hover:underline"
            >
              {{ item.pathName }}
            </NuxtLink>
            <Badge variant="outline">{{ categoryLabel(item.flag.category) }}</Badge>
          </div>
          <p class="mt-0.5 truncate text-sm text-muted-foreground">{{ item.flag.courseTitle }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ item.flag.reason }}</p>
        </div>

        <span class="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:block">
          {{ formatDate(item.validatedAt) }}
        </span>
      </li>
    </ul>
  </Card>
</template>
