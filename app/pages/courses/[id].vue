<script setup lang="ts">
import { ArrowLeft, ExternalLink } from '@lucide/vue';
import { formatDate, formatNumber } from '~/utils/formatters';

const route = useRoute();
const courseId = route.params.id as string;

const { getCourseDetail } = useAdminApi();

const { data: course, pending, refresh } = useAsyncData(
  `course-detail-${courseId}`,
  () => getCourseDetail(courseId),
  { default: () => null },
);

const meta = computed<Record<string, any>>(() => course.value?.meta ?? {});
</script>

<template>
  <AppPage
    :title="course?.title || 'Course detail'"
    :description="course?.institution"
    :refreshing="pending"
    @refresh="refresh"
  >
    <template #actions>
      <Button as-child variant="ghost" size="sm">
        <NuxtLink to="/courses">
          <ArrowLeft />
          Back
        </NuxtLink>
      </Button>
      <Button v-if="course" as-child size="sm">
        <a :href="course.link" target="_blank" rel="noopener noreferrer">
          Open course
          <ExternalLink />
        </a>
      </Button>
    </template>

    <template v-if="pending && !course">
      <Skeleton class="h-8 w-96 rounded-lg" />
      <div class="grid gap-4 lg:grid-cols-3">
        <Skeleton class="h-64 rounded-xl lg:col-span-2" />
        <Skeleton class="h-64 rounded-xl" />
      </div>
    </template>

    <template v-else-if="course">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-1.5">
          <Badge v-if="course.provider" variant="outline">{{ course.provider }}</Badge>
          <Badge v-if="course.level" variant="muted" class="capitalize">{{ course.level }}</Badge>
          <Badge :variant="course.isVerified ? 'success' : 'muted'">
            {{ course.isVerified ? 'Verified' : 'Unverified' }}
          </Badge>
          <Badge v-if="course.source" variant="accent">{{ course.source }}</Badge>
        </div>
        <h2 class="text-2xl font-semibold tracking-tight">{{ course.title }}</h2>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="text-base">About</CardTitle>
          </CardHeader>
          <CardContent class="space-y-5">
            <p class="whitespace-pre-line text-sm text-muted-foreground">
              {{ course.description || 'No description available' }}
            </p>

            <div v-if="course.skillsLearned?.length">
              <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Skills</h3>
              <div class="flex flex-wrap gap-1.5">
                <Badge v-for="skill in course.skillsLearned" :key="skill" variant="muted">{{ skill }}</Badge>
              </div>
            </div>

            <div v-if="course.prerequisites?.length">
              <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prerequisites
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <Badge v-for="item in course.prerequisites" :key="item" variant="outline">{{ item }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent class="divide-y">
              <AppKeyValue label="Cost" :value="course.cost || '—'" />
              <AppKeyValue label="Duration" :value="course.duration || '—'" />
              <AppKeyValue label="Language" :value="course.language || '—'" />
              <AppKeyValue label="Category" :value="course.category || '—'" />
              <AppKeyValue label="Subject" :value="course.subject || '—'" />
              <AppKeyValue label="Rating" :value="course.rating ? course.rating.toFixed(1) : '—'" />
              <AppKeyValue label="Reviews" :value="course.reviewCount ? formatNumber(course.reviewCount) : '—'" />
              <AppKeyValue label="Added" :value="formatDate(course.createdAt)" />
              <AppKeyValue label="Updated" :value="course.updatedAt ? formatDate(course.updatedAt) : '—'" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-base">Provenance</CardTitle>
            </CardHeader>
            <CardContent class="divide-y">
              <AppKeyValue label="Source" :value="course.source || '—'" />
              <AppKeyValue v-if="meta.career" label="Career" :value="meta.career" />
              <AppKeyValue v-if="meta.seedQuery" label="Seed query">
                <span class="font-mono text-xs">{{ meta.seedQuery }}</span>
              </AppKeyValue>
              <AppKeyValue v-if="meta.viewCount" label="Views" :value="formatNumber(meta.viewCount)" />
              <AppKeyValue v-if="meta.likeCount" label="Likes" :value="formatNumber(meta.likeCount)" />
              <AppKeyValue v-if="meta.taggedBy" label="Tagged by">
                <Badge :variant="meta.taggedBy === 'llm' ? 'info' : 'muted'">{{ meta.taggedBy }}</Badge>
              </AppKeyValue>
            </CardContent>
            <CardFooter v-if="meta.ingestRunId || meta.channelUrl" class="gap-2">
              <Button v-if="meta.ingestRunId" as-child variant="outline" size="sm">
                <NuxtLink :to="`/ingestion/runs/${meta.ingestRunId}`">View ingestion run</NuxtLink>
              </Button>
              <Button v-if="meta.channelUrl" as-child variant="outline" size="sm">
                <a :href="meta.channelUrl" target="_blank" rel="noopener noreferrer">
                  Channel
                  <ExternalLink />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </template>

    <AppErrorState
      v-else
      title="Course not found"
      message="This course may have been removed from the catalog."
      @retry="refresh"
    />
  </AppPage>
</template>
