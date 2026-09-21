import { Transaction } from '../types';

export function exportTransactionsToCsv(transactions: Transaction[], filename = 'ExpenseTracker_Transactions.csv') {
  if (!transactions || transactions.length === 0) {
    return;
  }

  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Category',
    'Amount',
    'Title',
    'Notes',
  ];

  const escapeCell = (cell: string | number | undefined | null) => {
    if (cell === undefined || cell === null) return '""';
    const str = String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = transactions.map((t) => {
    // Ensure Date is clearly visible
    let dateVal = t.dateStr;
    if (!dateVal && t.timestamp) {
      dateVal = t.timestamp.split('T')[0];
    }
    if (!dateVal) {
      dateVal = new Date().toISOString().split('T')[0];
    }

    // Ensure Time is clearly visible
    let timeVal = t.timeStr;
    if (!timeVal && t.timestamp) {
      try {
        const d = new Date(t.timestamp);
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        timeVal = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      } catch {
        timeVal = '';
      }
    }

    return [
      escapeCell(t.id),
      escapeCell(dateVal),
      escapeCell(timeVal || ''),
      escapeCell(t.type),
      escapeCell(t.category),
      t.amount.toFixed(2),
      escapeCell(t.title),
      escapeCell(t.note || ''),
    ];
  });

  const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
