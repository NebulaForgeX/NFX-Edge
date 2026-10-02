import styles from "./s.module.css";

const FIRE_SIZE_CLASS = {
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
} as const;

export function Fire({ size }: { size: keyof typeof FIRE_SIZE_CLASS }) {
  return (
    <div className={FIRE_SIZE_CLASS[size]}>
      <div className={styles.fire}>
        <div className={styles.fireLeft}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireCenter}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireRight}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireBottom}>
          <div className={styles.mainFire} />
        </div>
      </div>
    </div>
  );
}
