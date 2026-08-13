import type { BadgeVariants } from '~/components/ui/badge';

export type BadgeVariant = NonNullable<BadgeVariants['variant']>;

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

export function formatDurationMs(ms: number): string {
  if (!ms || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'info',
  approved: 'success',
  generating: 'warning',
  running: 'warning',
  completed_with_errors: 'warning',
  shortlisted: 'accent',
  quota_exhausted: 'destructive',
  failed: 'destructive',
  rejected: 'destructive',
  paused: 'muted',
  pending: 'muted',
  cancelled: 'muted',
};

export function statusVariant(status: string): BadgeVariant {
  return STATUS_VARIANTS[status] ?? 'muted';
}

export function statusLabel(status: string): string {
  return status ? status.replace(/_/g, ' ') : '—';
}

const ACTION_VARIANTS: Record<string, BadgeVariant> = {
  created: 'success',
  updated: 'info',
  skipped: 'muted',
  failed: 'destructive',
};

export function actionVariant(action: string): BadgeVariant {
  return ACTION_VARIANTS[action] ?? 'muted';
}

const SEVERITY_VARIANTS: Record<string, BadgeVariant> = {
  high: 'destructive',
  medium: 'warning',
  low: 'info',
};

export function severityVariant(severity: string): BadgeVariant {
  return SEVERITY_VARIANTS[severity] ?? 'muted';
}

const STRENGTH_VARIANTS: Record<string, BadgeVariant> = {
  exceptional: 'success',
  strong: 'info',
};

export function strengthVariant(strength: string): BadgeVariant {
  return STRENGTH_VARIANTS[strength] ?? 'muted';
}

export function scoreVariant(score: number): BadgeVariant {
  if (score >= 90) return 'success';
  if (score >= 70) return 'info';
  if (score >= 50) return 'warning';
  return 'destructive';
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-info';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

const HIGHLIGHT_CATEGORY_LABELS: Record<string, string> = {
  career_alignment: 'Career Alignment',
  skill_gap_filled: 'Fills Skill Gap',
  progression: 'Progression',
  value: 'Value',
};

export function highlightCategoryLabel(category: string): string {
  return HIGHLIGHT_CATEGORY_LABELS[category] ?? category;
}

const FLAG_CATEGORY_LABELS: Record<string, string> = {
  relevance: 'Relevance',
  redundancy: 'Redundancy',
  budget_mismatch: 'Budget',
};

export function categoryLabel(category: string): string {
  return FLAG_CATEGORY_LABELS[category] ?? category;
}
