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
    case 'failed': return 'badge-error';
    case 'paused': return 'badge-ghost';
    default: return 'badge-ghost';
  }
}
