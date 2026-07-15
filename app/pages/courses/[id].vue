<template>
  <div class="flex flex-col h-full">
    <LayoutHeader title="Course Detail" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else-if="!course" class="alert alert-error">
        <span>Course not found</span>
        <NuxtLink to="/courses" class="btn btn-sm">Back to Courses</NuxtLink>
      </div>

      <template v-else>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <NuxtLink to="/courses" class="btn btn-sm btn-ghost">&larr; Back</NuxtLink>
              <span v-if="course.provider" class="badge badge-outline">{{ course.provider }}</span>
              <span v-if="course.level" class="badge badge-ghost">{{ course.level }}</span>
              <span v-if="course.isVerified" class="badge badge-success badge-outline">verified</span>
              <span v-else class="badge badge-error badge-outline">unverified</span>
            </div>
            <h1 class="text-2xl font-bold">{{ course.title }}</h1>
            <div v-if="course.institution" class="opacity-70">{{ course.institution }}</div>
          </div>
          <a :href="course.link" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Open Course</a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="card bg-base-200 shadow lg:col-span-2">
            <div class="card-body">
              <h2 class="card-title text-base">About</h2>
              <p class="text-sm whitespace-pre-line opacity-90">{{ course.description || 'No description available' }}</p>

              <div v-if="course.skillsLearned && course.skillsLearned.length" class="mt-4">
                <h3 class="text-sm font-semibold mb-2 opacity-70">Skills</h3>
                <div class="flex flex-wrap gap-1">
                  <span v-for="skill in course.skillsLearned" :key="skill" class="badge badge-outline">{{ skill }}</span>
                </div>
              </div>

              <div v-if="course.prerequisites && course.prerequisites.length" class="mt-4">
                <h3 class="text-sm font-semibold mb-2 opacity-70">Prerequisites</h3>
                <div class="flex flex-wrap gap-1">
                  <span v-for="item in course.prerequisites" :key="item" class="badge badge-ghost">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="card bg-base-200 shadow">
              <div class="card-body">
                <h2 class="card-title text-base">Details</h2>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between"><span class="opacity-60">Cost</span><span>{{ course.cost || '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Duration</span><span>{{ course.duration || '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Language</span><span>{{ course.language || '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Category</span><span class="text-right">{{ course.category || '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Subject</span><span class="text-right">{{ course.subject || '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Rating</span><span>{{ course.rating ? course.rating.toFixed(1) : '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Reviews</span><span>{{ course.reviewCount ? formatNumber(course.reviewCount) : '—' }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Added</span><span>{{ formatDate(course.createdAt) }}</span></div>
                  <div class="flex justify-between"><span class="opacity-60">Updated</span><span>{{ course.updatedAt ? formatDate(course.updatedAt) : '—' }}</span></div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 shadow">
              <div class="card-body">
                <h2 class="card-title text-base">Provenance</h2>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between"><span class="opacity-60">Source</span><span>{{ course.source || '—' }}</span></div>
                  <div v-if="meta.career" class="flex justify-between"><span class="opacity-60">Career</span><span class="text-right">{{ meta.career }}</span></div>
                  <div v-if="meta.seedQuery" class="flex justify-between gap-2"><span class="opacity-60">Seed query</span><span class="text-right opacity-80">{{ meta.seedQuery }}</span></div>
                  <div v-if="meta.viewCount" class="flex justify-between"><span class="opacity-60">Views</span><span>{{ formatNumber(meta.viewCount) }}</span></div>
                  <div v-if="meta.likeCount" class="flex justify-between"><span class="opacity-60">Likes</span><span>{{ formatNumber(meta.likeCount) }}</span></div>
                  <div v-if="meta.taggedBy" class="flex justify-between">
                    <span class="opacity-60">Tagged by</span>
                    <span class="badge badge-xs" :class="meta.taggedBy === 'llm' ? 'badge-info badge-outline' : 'badge-ghost'">{{ meta.taggedBy }}</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                  <NuxtLink
                    v-if="meta.ingestRunId"
                    :to="`/ingestion/runs/${meta.ingestRunId}`"
                    class="btn btn-xs btn-ghost"
                  >View ingestion run</NuxtLink>
                  <a
                    v-if="meta.channelUrl"
                    :href="meta.channelUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-xs btn-ghost"
                  >Channel</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
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
