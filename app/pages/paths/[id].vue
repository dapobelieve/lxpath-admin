<script setup lang="ts">
import {
  ArrowLeft,
  FileText,
  Layers,
  NotebookPen,
  Sparkles,
  TriangleAlert,
} from '@lucide/vue';
import type { PathCvSignedUrl, PathDetail } from '~/types';
import { sanitizeNoteHtml } from '~/utils/sanitizeNoteHtml';
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
const { getValidationPathDetail, getValidationPathCvUrl } = useAdminApi();

const icons = { Sparkles, TriangleAlert, Layers, NotebookPen, FileText };

const { data: path, pending, refresh } = useAsyncData<PathDetail | null>(
  'path-detail',
  () => getValidationPathDetail(route.params.id as string),
  { default: () => null },
);

const highlights = computed(() => path.value?.validationResult?.highlights ?? []);
const flags = computed(() => path.value?.validationResult?.flags ?? []);
const levels = ['beginner', 'intermediate', 'advanced'] as const;

const breakdown = computed(
  () => path.value?.careerPathBreakdown ?? path.value?.skillBreakdown ?? null,
);

const breakdownLevels = computed(() =>
  levels.map((level) => {
    const entry = breakdown.value?.levels?.[level];
    return {
      level,
      description: entry?.description ?? '',
      items: entry?.skills ?? entry?.topics ?? [],
    };
  }),
);

const hasBreakdown = computed(() =>
  breakdownLevels.value.some((entry) => entry.items.length > 0),
);

const lxNotes = computed(() => path.value?.courses?.lxNotes ?? []);

function notesForLevel(level: (typeof levels)[number]) {
  return lxNotes.value.filter((note) => note.difficulty === level);
}

const cv = computed(() => path.value?.cv ?? null);
const openNoteId = ref<string | null>(null);

function toggleNote(lxNoteId: string) {
  openNoteId.value = openNoteId.value === lxNoteId ? null : lxNoteId;
}

const cvPreview = ref<PathCvSignedUrl | null>(null);
const cvPreviewOpen = ref(false);
const cvPreviewLoading = ref(false);
const cvPreviewError = ref(false);

async function openCvPreview() {
  cvPreviewOpen.value = true;
  cvPreviewLoading.value = true;
  cvPreviewError.value = false;
  cvPreview.value = await getValidationPathCvUrl(route.params.id as string);
  cvPreviewLoading.value = false;
  if (!cvPreview.value) cvPreviewError.value = true;
}

const cvIsInlineRenderable = computed(
  () => cvPreview.value?.contentType === 'application/pdf'
    || Boolean(cvPreview.value?.contentType?.startsWith('image/')),
);
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

      <div class="grid gap-4 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <component :is="icons.Layers" class="size-4 text-muted-foreground" />
              Path breakdown
            </CardTitle>
            <CardDescription>
              {{ breakdown?.career || breakdown?.skill || 'Skills targeted at each level' }}
            </CardDescription>
          </CardHeader>

          <CardContent v-if="hasBreakdown" class="space-y-4">
            <section v-for="entry in breakdownLevels" :key="entry.level">
              <div class="mb-2 flex items-center gap-2">
                <Badge variant="muted" class="capitalize">{{ entry.level }}</Badge>
                <span class="text-xs text-muted-foreground">{{ entry.description }}</span>
              </div>
              <div v-if="entry.items.length" class="flex flex-wrap gap-1.5">
                <Badge v-for="item in entry.items" :key="item" variant="outline">
                  {{ item }}
                </Badge>
              </div>
              <p v-else class="text-sm text-muted-foreground">No skills recorded.</p>
            </section>
          </CardContent>

          <CardContent v-else>
            <p class="text-sm text-muted-foreground">
              No breakdown was captured when this path was generated.
            </p>
          </CardContent>
        </Card>

        <Card class="h-fit">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <component :is="icons.FileText" class="size-4 text-muted-foreground" />
              CV
            </CardTitle>
            <CardDescription v-if="cv?.totalYearsExperience != null">
              {{ cv.totalYearsExperience }} years experience detected
            </CardDescription>
          </CardHeader>

          <CardContent class="space-y-3">
            <template v-if="cv?.hasFile">
              <p class="truncate text-sm font-medium">{{ cv.fileName }}</p>
              <Button size="sm" variant="outline" class="w-full" @click="openCvPreview">
                Preview CV
              </Button>
            </template>

            <p v-else-if="cv?.skippedCV" class="text-sm text-muted-foreground">
              This learner skipped the CV upload.
            </p>
            <p v-else class="text-sm text-muted-foreground">
              No CV on file for this path.
            </p>

            <div v-if="cv?.extractedSkills?.length">
              <Separator class="my-3" />
              <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Extracted skills
              </p>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="skill in cv.extractedSkills"
                  :key="skill.name"
                  variant="muted"
                >
                  {{ skill.name }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog v-model:open="cvPreviewOpen">
        <DialogContent class="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{{ cvPreview?.fileName || 'CV preview' }}</DialogTitle>
            <DialogDescription v-if="cvPreview">
              Link expires in {{ Math.round(cvPreview.expiresInSeconds / 60) }} minutes
            </DialogDescription>
          </DialogHeader>

          <Skeleton v-if="cvPreviewLoading" class="h-[70vh] w-full rounded-lg" />

          <p v-else-if="cvPreviewError" class="py-8 text-center text-sm text-muted-foreground">
            Could not generate a preview link for this CV.
          </p>

          <iframe
            v-else-if="cvPreview && cvIsInlineRenderable"
            :src="cvPreview.url"
            class="h-[70vh] w-full rounded-lg border"
            title="CV preview"
          />

          <div v-else-if="cvPreview" class="py-8 text-center">
            <p class="mb-3 text-sm text-muted-foreground">
              This file type cannot be previewed in the browser.
            </p>
            <Button as-child size="sm" variant="outline">
              <a :href="cvPreview.url" target="_blank" rel="noopener noreferrer">Download</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card class="gap-0 overflow-hidden py-0">
        <div class="border-b px-4 py-3">
          <h2 class="text-sm font-semibold">Courses</h2>
          <p class="text-xs text-muted-foreground">
            Courses and LX notes, grouped by difficulty
          </p>
        </div>

        <Tabs default-value="beginner" class="gap-0">
          <div class="border-b px-4 py-3">
            <TabsList>
              <TabsTrigger v-for="level in levels" :key="level" :value="level" class="capitalize">
                {{ level }}
                <Badge variant="muted" class="ml-1.5">
                  {{ (path.courses[level]?.length || 0) + notesForLevel(level).length }}
                </Badge>
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

            <section v-if="notesForLevel(level).length" class="border-t px-4 py-4">
              <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
                <component :is="icons.NotebookPen" class="size-4 text-muted-foreground" />
                LX notes
                <Badge variant="muted">{{ notesForLevel(level).length }}</Badge>
              </h3>
              <p class="mb-3 text-xs text-muted-foreground">
                Generated for topics with no matching course in the catalogue.
              </p>

              <div class="space-y-2">
                <article
                  v-for="note in notesForLevel(level)"
                  :key="note.lxNoteId"
                  class="rounded-lg border"
                >
                  <button
                    type="button"
                    class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40"
                    @click="toggleNote(note.lxNoteId)"
                  >
                    <span class="min-w-0">
                      <span class="block text-sm font-medium">{{ note.title }}</span>
                      <span class="mt-1 flex flex-wrap gap-1">
                        <Badge
                          v-for="skill in note.skillsCovered"
                          :key="skill"
                          variant="outline"
                        >
                          {{ skill }}
                        </Badge>
                      </span>
                    </span>
                    <span class="shrink-0 text-xs text-muted-foreground">
                      {{ note.estimatedReadTime || '' }}
                      {{ openNoteId === note.lxNoteId ? '▲' : '▼' }}
                    </span>
                  </button>

                  <div
                    v-if="openNoteId === note.lxNoteId"
                    class="border-t px-4 py-3 text-sm [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1"
                    v-html="sanitizeNoteHtml(note.content)"
                  />
                </article>
              </div>
            </section>

            <AppEmptyState
              v-if="!path.courses[level]?.length && !notesForLevel(level).length"
              title="Nothing at this level"
              description="This path has no courses or LX notes for this difficulty."
            />
          </TabsContent>
        </Tabs>
      </Card>
    </template>

    <AppErrorState v-else title="Path not found" message="This path may have been deleted." @retry="refresh" />
  </AppPage>
</template>
