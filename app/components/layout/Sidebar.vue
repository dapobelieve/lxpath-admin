<template>
  <aside class="w-64 bg-base-200 min-h-screen p-4 flex flex-col">
    <div class="mb-8">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <span class="text-2xl">&#x1F6E1;&#xFE0F;</span>
        <span>lxpath Admin</span>
      </h1>
    </div>

    <ul class="menu menu-lg gap-2">
      <li>
        <NuxtLink to="/" class="flex items-center gap-3" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/paths" class="flex items-center gap-3" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Learning Paths
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/users" class="flex items-center gap-3" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Users
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/courses" class="flex items-center gap-3" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Courses
        </NuxtLink>
      </li>
    </ul>

    <div class="mt-auto pt-8">
      <div class="flex items-center gap-2">
        <span class="text-sm opacity-70">Theme</span>
        <input type="checkbox" value="dark" class="toggle theme-controller" />
      </div>
    </div>
  </aside>
</template>
