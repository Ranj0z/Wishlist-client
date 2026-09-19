// Loading-state placeholders used in place of a bare spinner or "Loading…"
// text across list, table, and grid views. See architecture doc §7.1.

type CardGridSkeletonProps = {
  count?: number;
  withImage?: boolean;
};

export function CardGridSkeleton({ count = 6, withImage = false }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card bg-base-100 border border-base-300">
          {withImage && <div className="skeleton h-32 w-full rounded-t-box rounded-b-none" />}
          <div className="card-body p-5 gap-3">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

type TableSkeletonProps = {
  columns: number;
  rows?: number;
};

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300">
      <table className="table table-sm w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton h-4 w-full max-w-[10rem]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ListSkeletonProps = {
  count?: number;
};

export function ListSkeleton({ count = 4 }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-box border border-base-300 p-4 space-y-2">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
