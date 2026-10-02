import { useId } from "react";

import styles from "./s.module.css";

type LoadingSceneSize = "small" | "medium" | "large";

const GOO_SIZE_CLASS = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
} as const;

export function Goo({ size }: { size: LoadingSceneSize }) {
  const reactId = useId().replace(/:/g, "");
  const filterId = `goo-${reactId}`;

  return (
    <div className={[styles.root, GOO_SIZE_CLASS[size]].join(" ")} style={{ ["--goo-filter" as string]: `url(#${filterId})` }}>
      <svg className={styles.filterSvg} aria-hidden>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 48 -7"
          />
        </filter>
      </svg>
      <div className={styles.loader} />
    </div>
  );
}
