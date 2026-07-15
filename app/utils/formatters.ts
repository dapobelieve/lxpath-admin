export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

export function formatDate(d: string | Date): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(d: string | Date): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-info';
  if (score >= 50) return 'text-warning';
  return 'text-error';
}

export function severityBadge(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'high': return 'badge-error';
    case 'medium': return 'badge-warning';
    case 'low': return 'badge-info';
  }
}

export function categoryLabel(category: string): string {
  switch (category) {
    case 'relevance': return 'Relevance';
    case 'redundancy': return 'Redundancy';
    case 'budget_mismatch': return 'Budget';
    default: return category;
  }
}

export function statusBadge(status: string): string {
  switch (status) {
    case 'active': return 'badge-success';
    case 'completed': return 'badge-info';
    case 'generating': return 'badge-warning';
    case 'pending': return 'badge-ghost';
    case 'running': return 'badge-warning';
    case 'completed_with_errors': return 'badge-warning';
    case 'quota_exhausted': return 'badge-error';
    case 'failed': return 'badge-error';
    case 'cancelled': return 'badge-ghost';
    case 'paused': return 'badge-ghost';
    default: return 'badge-ghost';
  }
}

export function statusLabel(status: string): string {
  return status ? status.replace(/_/g, ' ') : '—';
}

export function actionBadge(action: string): string {
  switch (action) {
    case 'created': return 'badge-success';
    case 'updated': return 'badge-info';
    case 'skipped': return 'badge-ghost';
    case 'failed': return 'badge-error';
    default: return 'badge-ghost';
  }
}

export function formatDurationMs(ms: number): string {
  if (!ms || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
