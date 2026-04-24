<template>
  <div class="flex flex-col h-full">
    <LayoutHeader :title="path?.pathName || 'Path Detail'" @refresh="refresh" />

    <div class="p-6 space-y-6 overflow-auto">
      <div v-if="pending" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="path">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h3 class="card-title text-lg">Path Info</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="opacity-70">Career</span>
                  <span class="font-medium">{{ path.selectedCareer || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-70">Status</span>
                  <span class="badge badge-sm" :class="statusBadge(path.status)">{{ path.status }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-70">Courses</span>
                  <span class="font-medium">{{ path.totalCourses }} ({{ path.completedCourses }} completed)</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-70">Progress</span>
                  <progress class="progress progress-primary w-32" :value="path.overallProgress" max="100" />
                </div>
                <div class="flex justify-between">
                  <span class="opacity-70">Budget</span>
                  <span class="font-medium">{{ path.budgetAmount ?? '—' }} {{ path.budgetCurrency || '' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-70">Created</span>
                  <span>{{ formatDate(path.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="path.validationResult" class="card bg-base-100 shadow lg:col-span-2">
            <div class="card-body">
              <h3 class="card-title text-lg">Validation Result</h3>
              <div class="flex items-center gap-4 mb-4">
                <div class="radial-progress" :class="scoreColor(path.validationResult.score)" :style="{ '--value': path.validationResult.score, '--size': '4rem', '--thickness': '6px' }">
                  {{ path.validationResult.score }}
                </div>
                <div>
                  <span class="badge" :class="path.validationResult.isValid ? 'badge-success' : 'badge-error'">
                    {{ path.validationResult.isValid ? 'Valid' : 'Issues Found' }}
                  </span>
                  <p class="text-sm mt-1 opacity-80">{{ path.validationResult.overallAssessment }}</p>
                  <p class="text-xs mt-1 opacity-50">Validated {{ formatDateTime(path.validationResult.validatedAt) }} &middot; {{ path.validationResult.modelUsed }}</p>
                </div>
              </div>

              <div v-if="path.validationResult.flags.length > 0">
                <h4 class="font-semibold text-sm mb-3">Flags ({{ path.validationResult.flags.length }})</h4>
                <div class="space-y-3">
                  <div v-for="flag in path.validationResult.flags" :key="flag.courseId + flag.category" class="border border-base-300 rounded-lg p-4">
                    <div class="flex items-center gap-2 flex-wrap mb-2">
                      <span class="badge badge-sm" :class="severityBadge(flag.severity)">{{ flag.severity }}</span>
                      <span class="badge badge-sm badge-outline">{{ categoryLabel(flag.category) }}</span>
                      <span class="badge badge-sm badge-ghost">{{ flag.difficulty }}</span>
                    </div>
                    <p class="font-medium text-sm">{{ flag.courseTitle }}</p>
                    <p class="text-sm opacity-80 mt-1">{{ flag.reason }}</p>
                    <div class="mt-2 p-2 bg-base-200 rounded text-sm">
                      <span class="font-semibold opacity-70">Suggestion:</span> {{ flag.suggestion }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm opacity-60">No flags — all courses pass validation.</div>
            </div>
          </div>

          <div v-else class="card bg-base-100 shadow lg:col-span-2">
            <div class="card-body">
              <h3 class="card-title text-lg">Validation Result</h3>
              <p class="text-sm opacity-60">This path has not been validated yet.</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-lg">Courses</h3>
            <div class="space-y-6">
              <div v-for="difficulty in ['beginner', 'intermediate', 'advanced']" :key="difficulty">
                <h4 class="font-semibold text-sm capitalize mb-2 opacity-70">{{ difficulty }} ({{ path.courses[difficulty]?.length || 0 }})</h4>
                <div v-if="path.courses[difficulty]?.length" class="overflow-x-auto">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Provider</th>
                        <th>Cost</th>
                        <th>Skills</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="course in path.courses[difficulty]" :key="course.courseId">
                        <td class="max-w-xs truncate">{{ course.title }}</td>
                        <td>{{ course.provider }}</td>
                        <td>{{ course.cost }}</td>
                        <td>
                          <div class="flex flex-wrap gap-1">
                            <span v-for="skill in course.skillsLearned.slice(0, 3)" :key="skill" class="badge badge-xs badge-outline">{{ skill }}</span>
                            <span v-if="course.skillsLearned.length > 3" class="badge badge-xs badge-ghost">+{{ course.skillsLearned.length - 3 }}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-else class="text-sm opacity-50">No courses at this level.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="alert alert-error">
        <span>Path not found</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PathDetail } from '~/types';
import { statusBadge, scoreColor, severityBadge, categoryLabel, formatDate, formatDateTime } from '~/utils/formatters';

const route = useRoute();
const { getValidationPathDetail } = useAdminApi();

const { data: path, pending, refresh } = useAsyncData<PathDetail | null>(
  'path-detail',
  () => getValidationPathDetail(route.params.id as string),
  { default: () => null },
);
</script>
