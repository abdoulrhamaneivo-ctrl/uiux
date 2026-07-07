export const DataTable = ({ headers, children }: { headers?: string[]; children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
    <table className="w-full text-left text-sm">
      {headers && (
        <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-6 py-3">{h}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    </table>
  </div>
);
