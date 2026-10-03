import type { RefObject } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export type RevealOptions = {
  selector?: string;
  dependencies?: unknown[];
  distance?: number;
  stagger?: number;
};

export function useReveal(scope: RefObject<Nullable<HTMLElement>>, { selector = ":scope > *", dependencies = [], distance = 14, stagger = 0.06 }: RevealOptions = {}) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const targets = root.querySelectorAll(selector);
      if (!targets.length) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(targets, {
          autoAlpha: 0,
          y: distance,
          duration: 0.55,
          ease: "power3.out",
          stagger,
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => media.revert();
    },
    { scope, dependencies },
  );
}
