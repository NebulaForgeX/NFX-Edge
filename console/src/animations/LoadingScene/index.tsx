import { LoadingSceneVariantEnum } from "@/enums";

import { Fire } from "./Fire";
import { Goo } from "./Goo";
import styles from "./s.module.css";

export type LoadingSceneSize = "small" | "medium" | "large";

export type LoadingSceneProps = {
  variant?: LoadingSceneVariantEnum;
  size?: LoadingSceneSize;
  className?: string;
};

/** Loading illustration — goo blobs or fire (mirrors EmptyScene variant pattern). */
export function LoadingScene({ variant = LoadingSceneVariantEnum.GOO, size = "medium", className }: LoadingSceneProps) {
  return (
    <div className={[styles.sceneSizing, className].filter(Boolean).join(" ")} aria-hidden>
      <div className={styles.sceneGrow}>
        <div className={styles.scenePos}>
          <div className={styles.sceneClip}>
            <div className={styles.scenePy}>
              <div className={styles.scenePx}>
                <div className={styles.sceneLayout}>
                  {variant === LoadingSceneVariantEnum.FIRE ? <Fire size={size} /> : <Goo size={size} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
