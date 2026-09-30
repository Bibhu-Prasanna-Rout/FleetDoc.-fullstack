export default function StatusBadge({ status }) {
  const cls =
    status === "Active" || status === "Paid"
      ? "status-active"
      : status === "Expiring Soon" || status === "Pending"
      ? "status-warning"
      : "status-expired";
  return <span className={cls}>{status}</span>;
}