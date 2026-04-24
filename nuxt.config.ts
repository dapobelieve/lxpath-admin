export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'https://api.lxpath.com',
    },
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8030',
        changeOrigin: true,
      },
    },
  },

  app: {
    head: {
      title: 'lxpath Admin',
      meta: [
        { name: 'description', content: 'Admin dashboard for learning path validation' },
      ],
    },
  },
});
