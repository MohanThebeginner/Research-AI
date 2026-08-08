type StatusTagProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  READY: "border-primary text-primary",
  PENDING: "border-accent text-accent",
  PROCESSING: "border-accent text-accent",
  FAILED: "border-danger text-danger",
};

export default function StatusTag({ status }: StatusTagProps) {
  const style = statusStyles[status] || "border-muted text-muted";

  return (
    <span
      className={`border-l-2 pl-2 font-mono text-xs uppercase tracking-wider ${style}`}
    >
      {status}
    </span>
  );
}
