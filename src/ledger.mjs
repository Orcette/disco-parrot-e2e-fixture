/** Summarize caller-provided receipt inputs without changing them. */
export function summarizeReceipts(receipts) {
  if (!Array.isArray(receipts)) throw new TypeError("Receipts must be an array");
  return { count: receipts.length, durationMs: receipts.reduce((total, receipt) => {
    if (!Number.isFinite(receipt.durationMs) || receipt.durationMs < 0) throw new TypeError("Receipt duration must be non-negative");
    return total + receipt.durationMs;
  }, 0) };
}
