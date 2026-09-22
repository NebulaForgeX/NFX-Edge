import { StackIcon, type AnimatedIconComponent } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { Table } from "@radix-ui/themes";

import EmptyState from "../EmptyState";
import styles from "./s.module.css";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  mono?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  loading?: boolean;
  emptyIcon?: AnimatedIconComponent;
  onRowClick?: (row: T) => void;
  selected?: (row: T) => boolean;
  footer?: ReactNode[];
}

export function DataTable<T>({ columns, rows, rowKey, empty, loading, emptyIcon, onRowClick, selected, footer }: DataTableProps<T>) {
  if (loading) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "Loading..."} />;
  }
  if (!rows.length && !footer) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "No data"} />;
  }
  return (
    <div className={styles.wrap}>
      <Table.Root variant="ghost" size="2" className={styles.ledger}>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeaderCell key={column.key} className={styles.head}>
                {column.header}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[onRowClick ? styles.clickable : "", selected?.(row) ? styles.picked : ""].filter(Boolean).join(" ") || undefined}
            >
              {columns.map((column) => (
                <Table.Cell key={column.key} className={column.mono ? styles.mono : styles.cell}>
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
          {footer ? (
            <Table.Row>
              {columns.map((column, index) => (
                <Table.Cell key={column.key} className={column.mono ? styles.mono : styles.cell}>
                  {footer[index]}
                </Table.Cell>
              ))}
            </Table.Row>
          ) : null}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export default DataTable;
