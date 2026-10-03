import { StackIcon, type AnimatedIconComponent } from "nfx-ui/icons";
import type { ReactNode } from "react";

import { useRef } from "react";
import { Table, Text } from "@radix-ui/themes";

import { useReveal } from "@/animations/Reveal";

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

function DataTableBody<T>({ columns, rows, rowKey, onRowClick, selected, footer }: DataTableProps<T>) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  useReveal(bodyRef, { selector: ":scope > tr", distance: 8, stagger: 0.03 });

  return (
    <Table.Root variant="surface" size="2" className={styles.ledger}>
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeaderCell key={column.key} className={styles.head}>
              <Text size="1" weight="medium" color="gray">
                {column.header}
              </Text>
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body ref={bodyRef}>
        {rows.map((row) => {
          const picked = selected?.(row);
          return (
            <Table.Row
              key={rowKey(row)}
              align="center"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? styles.clickable : undefined}
              data-picked={picked ? "true" : undefined}
            >
              {columns.map((column) => (
                <Table.Cell key={column.key} className={styles.cell}>
                  <Text size="2" className={column.mono ? styles.mono : undefined}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </Text>
                </Table.Cell>
              ))}
            </Table.Row>
          );
        })}
        {footer ? (
          <Table.Row align="center">
            {columns.map((column, index) => (
              <Table.Cell key={column.key} className={styles.cell}>
                <Text size="2" className={column.mono ? styles.mono : undefined}>
                  {footer[index]}
                </Text>
              </Table.Cell>
            ))}
          </Table.Row>
        ) : null}
      </Table.Body>
    </Table.Root>
  );
}

export function DataTable<T>(props: DataTableProps<T>) {
  const { rows, empty, loading, emptyIcon, emptyAction, footer } = props;
  if (loading) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "Loading..."} />;
  }
  if (!rows.length && !footer) {
    return <EmptyState icon={emptyIcon ?? StackIcon} title={empty ?? "No data"} action={emptyAction} />;
  }
  return <DataTableBody {...props} />;
}

export default DataTable;
