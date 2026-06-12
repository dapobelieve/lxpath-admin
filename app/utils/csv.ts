function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][],
): void {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(','));
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
