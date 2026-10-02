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
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  selected?: (row: T) => boolean;
  footer?: ReactNode[];
}

export function DataTable<T>({ columns, rows, rowKey, empty, loading, emptyIcon, emptyAction, onRowClick, selected, footer }: DataTableProps<T>) {
  if (loading) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "Loading..."} />;
  }
  if (!rows.length && !footer) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "No data"} action={emptyAction} />;
  }
  return (
    <div className={styles.wrap}>
      <Table.Root variant="ghost" size="2" className={styles.ledger}>
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeaderCell key={column.key} className={styles.head}>
                <span>{column.header}</span>
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const picked = selected?.(row);
            return (
            <Table.Row
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? styles.clickable : picked ? styles.picked : undefined}
              data-picked={onRowClick && picked ? "true" : undefined}
            >
              {columns.map((column) => (
                <Table.Cell key={column.key} className={styles.cellMin}>
                  <span className={column.mono ? styles.mono : styles.cellType}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </span>
                </Table.Cell>
              ))}
            </Table.Row>
            );
          })}
          {footer ? (
            <Table.Row>
              {columns.map((column, index) => (
                <Table.Cell key={column.key} className={styles.cellMin}>
                  <span className={column.mono ? styles.mono : styles.cellType}>{footer[index]}</span>
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
