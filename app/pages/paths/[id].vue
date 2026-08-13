<script setup lang="ts">
import { ArrowLeft, Sparkles, TriangleAlert } from '@lucide/vue';
import type { PathDetail } from '~/types';
import {
  categoryLabel,
  formatDate,
  formatDateTime,
  highlightCategoryLabel,
  scoreColor,
  severityVariant,
  strengthVariant,
} from '~/utils/formatters';

const route = useRoute();
const { getValidationPathDetail } = useAdminApi();

const icons = { Sparkles, TriangleAlert };

const { data: path, pending, refresh } = useAsyncData<PathDetail | null>(
  'path-detail',
  () => getValidationPathDetail(route.params.id as string),
  { default: () => null },
);

const highlights = computed(() => path.value?.validationResult?.highlights ?? []);
const flags = computed(() => path.value?.validationResult?.flags ?? []);
const levels = ['beginner', 'intermediate', 'advanced'] as const;
</script>

<template>
  <AppPage
    :title="path?.pathName || 'Path detail'"
    :description="path?.selectedCareer"
    :refreshing="pending"
    @refresh="refresh"
  >
    <template #actions>
      <Button as-child variant="ghost" size="sm">
        <NuxtLink to="/paths">
          <ArrowLeft />
          Back
        </NuxtLink>
      </Button>
    </template>

    <template v-if="pending && !path">
      <div class="grid gap-4 lg:grid-cols-3">
        <Skeleton class="h-64 rounded-xl" />
        <Skeleton class="h-64 rounded-xl lg:col-span-2" />
      </div>
      <Skeleton class="h-72 rounded-xl" />
    </template>

    <template v-else-if="path">
      <div class="grid gap-4 lg:grid-cols-3">
        <Card class="h-fit">
          <CardHeader>
            <CardTitle class="text-base">Path info</CardTitle>
          </CardHeader>
          <CardContent class="divide-y">
            <AppKeyValue label="Career" :value="path.selectedCareer || '—'" />
            <AppKeyValue label="Status">
              <AppStatusBadge :status="path.status" />
            </AppKeyValue>
            <AppKeyValue label="Courses">
              {{ path.totalCourses }}
              <span class="font-normal text-muted-foreground">({{ path.completedCourses }} completed)</span>
            </AppKeyValue>
            <AppKeyValue label="Progress">
              <span class="flex items-center gap-2">
                <Progress :model-value="path.overallProgress" class="h-1.5 w-24" />
                <span class="tabular-nums">{{ path.overallProgress }}%</span>
              </span>
            </AppKeyValue>
            <AppKeyValue label="Budget">
              {{ path.budgetAmount ?? '—' }} {{ path.budgetCurrency || '' }}
            </AppKeyValue>
            <AppKeyValue label="Created" :value="formatDate(path.createdAt)" />
          </CardContent>
        </Card>

        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="text-base">Validation result</CardTitle>
            <CardDescription v-if="path.validationResult">
              Validated {{ formatDateTime(path.validationResult.validatedAt) }} · {{ path.validationResult.modelUsed }}
            </CardDescription>
          </CardHeader>

          <CardContent v-if="path.validationResult" class="space-y-6">
            <div class="flex items-start gap-5">
              <AppProgressRing
                :value="path.validationResult.score"
                :size="76"
                :class="scoreColor(path.validationResult.score)"
              >
                <span class="text-lg">{{ path.validationResult.score }}</span>
              </AppProgressRing>

              <div class="min-w-0 flex-1">
                <Badge :variant="path.validationResult.isValid ? 'success' : 'destructive'">
                  {{ path.validationResult.isValid ? 'Valid' : 'Issues found' }}
                </Badge>
                <p class="mt-2 text-sm text-muted-foreground">
                  {{ path.validationResult.overallAssessment }}
                </p>
              </div>
            </div>

            <Separator />

            <section>
              <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
                <component :is="icons.Sparkles" class="size-4 text-success" />
                Strengths
                <Badge variant="muted">{{ highlights.length }}</Badge>
              </h3>

              <div v-if="highlights.length" class="space-y-3">
                <article
                  v-for="highlight in highlights"
                  :key="`${highlight.courseId}-${highlight.category}`"
                  class="rounded-lg border border-success/30 bg-success/5 p-4"
                >
                  <div class="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge :variant="strengthVariant(highlight.strength)" class="capitalize">
                      {{ highlight.strength }}
                    </Badge>
                    <Badge variant="outline">{{ highlightCategoryLabel(highlight.category) }}</Badge>
                    <Badge variant="muted" class="capitalize">{{ highlight.difficulty }}</Badge>
                  </div>
                  <p class="text-sm font-medium">{{ highlight.courseTitle }}</p>
                  <p class="mt-1 text-sm text-muted-foreground">{{ highlight.reason }}</p>
                  <p class="mt-2 rounded-md bg-background/60 p-2 text-sm">
                    <span class="font-medium text-muted-foreground">Career impact:</span>
                    {{ highlight.careerImpact }}
                  </p>
                </article>
              </div>
              <p v-else class="text-sm text-muted-foreground">
                Validated before strengths were captured.
              </p>
            </section>

            <section v-if="flags.length">
              <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
                <component :is="icons.TriangleAlert" class="size-4 text-warning" />
                Issues to review
                <Badge variant="muted">{{ flags.length }}</Badge>
              </h3>

              <div class="space-y-3">
                <article
                  v-for="flag in flags"
                  :key="`${flag.courseId}-${flag.category}`"
                  class="rounded-lg border p-4"
                >
                  <div class="mb-2 flex flex-wrap items-center gap-1.5">
                    <Badge :variant="severityVariant(flag.severity)" class="capitalize">
                      {{ flag.severity }}
                    </Badge>
                    <Badge variant="outline">{{ categoryLabel(flag.category) }}</Badge>
                    <Badge variant="muted" class="capitalize">{{ flag.difficulty }}</Badge>
                  </div>
                  <p class="text-sm font-medium">{{ flag.courseTitle }}</p>
                  <p class="mt-1 text-sm text-muted-foreground">{{ flag.reason }}</p>
                  <p class="mt-2 rounded-md bg-muted p-2 text-sm">
                    <span class="font-medium text-muted-foreground">Suggestion:</span>
                    {{ flag.suggestion }}
                  </p>
                </article>
              </div>
            </section>
          </CardContent>

          <CardContent v-else>
            <p class="text-sm text-muted-foreground">This path has not been validated yet.</p>
          </CardContent>
        </Card>
      </div>

      <Card class="gap-0 overflow-hidden py-0">
        <div class="border-b px-4 py-3">
          <h2 class="text-sm font-semibold">Courses</h2>
          <p class="text-xs text-muted-foreground">Grouped by difficulty</p>
        </div>

        <Tabs default-value="beginner" class="gap-0">
          <div class="border-b px-4 py-3">
            <TabsList>
              <TabsTrigger v-for="level in levels" :key="level" :value="level" class="capitalize">
                {{ level }}
                <Badge variant="muted" class="ml-1.5">{{ path.courses[level]?.length || 0 }}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent v-for="level in levels" :key="level" :value="level" class="mt-0">
            <div
              v-if="path.courses[level]?.length"
              class="overflow-x-auto [&_th]:h-10 [&_th]:px-4 [&_th]:text-xs [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:px-4 [&_td]:py-3"
            >
              <Table>
                <TableHeader>
                  <TableRow class="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Title</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="course in path.courses[level]" :key="course.courseId">
                    <TableCell class="max-w-sm truncate font-medium">{{ course.title }}</TableCell>
                    <TableCell class="text-muted-foreground">{{ course.provider }}</TableCell>
                    <TableCell class="tabular-nums">{{ course.cost }}</TableCell>
                    <TableCell>
                      <div class="flex flex-wrap gap-1">
                        <Badge
                          v-for="skill in course.skillsLearned.slice(0, 3)"
                          :key="skill"
                          variant="muted"
                        >
                          {{ skill }}
                        </Badge>
                        <Badge v-if="course.skillsLearned.length > 3" variant="outline">
                          +{{ course.skillsLearned.length - 3 }}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <AppEmptyState
              v-else
              title="No courses at this level"
              description="This path has nothing scheduled for this difficulty."
            />
          </TabsContent>
        </Tabs>
      </Card>
    </template>

    <AppErrorState v-else title="Path not found" message="This path may have been deleted." @retry="refresh" />
  </AppPage>
</template>
