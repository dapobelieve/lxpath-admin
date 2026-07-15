import type { Ref } from 'vue';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 5000,
  defaultValue?: T,
) {
  const data = ref<T | null>(defaultValue ?? null) as Ref<T | null>;
  const loading = ref(true);
  const error = ref<Error | null>(null);
  let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;

  async function refresh() {
    try {
      data.value = await fetchFn();
      error.value = null;
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  function start() {
    if (intervalId) return;
    refresh();
    intervalId = globalThis.setInterval(refresh, intervalMs);
  }

  function stop() {
    if (intervalId) {
      globalThis.clearInterval(intervalId);
      intervalId = null;
    }
  }

  onMounted(() => {
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    data,
    loading,
    error,
    refresh,
    start,
    stop,
  };
}
