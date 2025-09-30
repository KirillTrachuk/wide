import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./App.sass";

gsap.registerEase("customEase", [0.54, 0.0, 0.27, 1.0]);

function App() {
  const [count, setCount] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(1);
  const [isLayoutReversed, setIsLayoutReversed] = useState(false);
  const [hasLayoutChanged, setHasLayoutChanged] = useState(false);
  const prevActiveTab = useRef(activeTab);
  const prevTabForGrid = useRef(activeTab);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimatingTabs, setIsAnimatingTabs] = useState(false);
  const parallaxQuickRef = useRef([]);
  const tab3ParallaxReadyRef = useRef(false);
  const tab3ParallaxDelayRef = useRef(null);
  const frameParallaxLockedRef = useRef(false);
  const isReversingRef = useRef(false);
  const reversingLockCountRef = useRef(0);

  const handleMouseMove = (e) => {
    if (isReversingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePosition({ x: mouseX, y: mouseY });

    if (activeTab === 3 && !tab3ParallaxReadyRef.current) return;
    if (!parallaxQuickRef.current.length) return;
    const nx = (mouseX / rect.width) * 2 - 1; // -1..1
    const ny = (mouseY / rect.height) * 2 - 1; // -1..1
    const rangePx = 14;
    parallaxQuickRef.current.forEach(
      ({ el, xTo, yTo, depth, baseX = 0, baseY = 0 }) => {
        if (
          frameParallaxLockedRef.current &&
          el &&
          el.classList &&
          el.classList.contains("hero-section-frame")
        )
          return;
        // base target from cursor
        const baseTx = nx * rangePx;
        const baseTy = ny * rangePx;
        // compute distance-based factor (closer to cursor => stronger)
        const elRect = el.getBoundingClientRect();
        const elCx = elRect.left - rect.left + elRect.width / 2;
        const elCy = elRect.top - rect.top + elRect.height / 2;
        const ex = (elCx - mouseX) / (rect.width / 2);
        const ey = (elCy - mouseY) / (rect.height / 2);
        const dist = Math.min(1, Math.hypot(ex, ey));
        const nearFactor = 1.4; // strength when cursor is close
        const farFactor = 0.6; // strength when cursor is far
        const proximityFactor =
          farFactor + (1 - dist) * (nearFactor - farFactor);
        const tx = baseTx * depth * proximityFactor;
        const ty = baseTy * depth * proximityFactor;
        xTo(baseX + tx);
        yTo(baseY + ty);
      }
    );
  };

  const handleMouseLeave = () => {
    if (!parallaxQuickRef.current.length) return;
    parallaxQuickRef.current.forEach(({ xTo, yTo, baseX = 0, baseY = 0 }) => {
      xTo(baseX);
      yTo(baseY);
    });
  };

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleLayoutToggle = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(!isLayoutReversed);
  };

  const setTextVisibilityImmediate = (index) => {
    const lines = document.querySelectorAll(
      ".text-under-photo > .first-line, .text-under-photo > .second-line, .text-under-photo > .third-line"
    );
    lines.forEach((el, i) => {
      if (i === index) {
        gsap.set(el, { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(el, { autoAlpha: 0, y: 16 });
      }
    });
  };

  const animateToIndex = (targetIdx) => {
    const lines = document.querySelectorAll(
      ".text-under-photo > .first-line, .text-under-photo > .second-line, .text-under-photo > .third-line"
    );
    if (!lines.length) return;
    const outIdx = currentTextIndex;
    if (targetIdx === outIdx) {
      setTextVisibilityImmediate(targetIdx);
      return;
    }
    const outEl = lines[outIdx];
    const inEl = lines[targetIdx];
    gsap.to(outEl, { autoAlpha: 0, y: 16, duration: 0.6, ease: "customEase" });
    gsap.fromTo(
      inEl,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "customEase" }
    );
    setCurrentTextIndex(targetIdx);
  };

  const animateTextSwitch = (direction) => {
    // If targeting tabs 3 or 4, lock to last text
    if (activeTab >= 3) {
      animateToIndex(2);
      return;
    }
    const targetIdx =
      direction === "next"
        ? (currentTextIndex + 1) % 3
        : (currentTextIndex + 2) % 3;
    animateToIndex(targetIdx);
  };

  useEffect(() => {
    // Initialize text visibility
    setTextVisibilityImmediate(0);
  }, []);

  const handlePrevTab = () => {
    if (isAnimatingTabs) return;
    const nextTab = activeTab <= 1 ? 1 : activeTab - 1;
    // If moving 3 → 2, animate to previous text from current (likely 2 → 1)
    if (activeTab === 3 && nextTab === 2) {
      const targetIdx = (currentTextIndex + 2) % 3;
      animateToIndex(targetIdx);
    } else if (nextTab <= 2) {
      animateTextSwitch("prev");
    } else if (nextTab >= 3) {
      animateToIndex(2);
    }
    setIsAnimatingTabs(true);
    setActiveTab(nextTab);
    gsap.delayedCall(2.0, () => setIsAnimatingTabs(false));
  };

  const handleNextTab = () => {
    if (isAnimatingTabs) return;
    const nextTab = activeTab >= 4 ? 4 : activeTab + 1;
    // If moving 2 → 3, animate to last text (index 2)
    if (activeTab === 2 && nextTab === 3) {
      animateToIndex(2);
    } else if (nextTab <= 2) {
      animateTextSwitch("next");
    } else if (nextTab >= 3) {
      animateToIndex(2);
    }
    setIsAnimatingTabs(true);
    setActiveTab(nextTab);
    gsap.delayedCall(2.0, () => setIsAnimatingTabs(false));
  };

  const handleReverseLeft = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(true);
  };

  const handleReverseRight = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(false);
    if (activeTab === 3) {
      const frame34Img = document.querySelector(
        ".hero-section-frame-34 .hero-section-frame__image"
      );
      if (frame34Img) {
        const prevTransition = frame34Img.style.transition;
        gsap.killTweensOf(frame34Img);
        gsap.set(frame34Img, { willChange: "clip-path", transition: "none" });
        gsap.set(frame34Img, {
          clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
        });
        frame34Img.style.transition = prevTransition;
        gsap.set(frame34Img, { willChange: "" });
      }
      const bottom3El = document.querySelector(
        ".hero-section-grid-bottom__item:nth-child(3)"
      );
      if (bottom3El) {
        gsap.killTweensOf(bottom3El);
        gsap.set(bottom3El, { willChange: "clip-path" });
        gsap.to(bottom3El, {
          clipPath: "polygon(1% 1%, 99% 1%, 99% 99%, 0% 100%)",
          duration: 0.8,
          ease: "customEase",
          overwrite: true,
          onComplete: () => gsap.set(bottom3El, { willChange: "" }),
        });
      }
    }
  };

  const getSecondImageClass = () => {
    return activeTab === 2 || activeTab === 3 ? "show" : "hide";
  };

  const getFirstImageClass = () => {
    return activeTab === 2 || activeTab === 3 ? "mask-up" : "";
  };

  useEffect(() => {
    const heroSectionFrame = document.querySelector(".hero-section-frame");

    if (prevActiveTab.current === 2 && activeTab === 3) {
      gsap.set(heroSectionFrame, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      });
      gsap.to(heroSectionFrame, {
        clipPath: "polygon(0 0, 0% 0, 0% 0%, 0 0%)",
        duration: 1.5,
        ease: "customEase",
      });
      if (prevActiveTab.current === 2) {
        const maskR = document.querySelector(
          ".hero-section-frame__image.mini.show .mask-image-r"
        );
        if (maskR) {
          gsap.set(maskR, { y: "-100%" });
        }
      }
      const tigSecond = document.querySelector(".text-inside-grid-second");
      if (tigSecond) {
        gsap.to(tigSecond, { autoAlpha: 0, duration: 0.6, ease: "customEase" });
      }
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        gsap.fromTo(
          thirdSlide,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, delay: 1.1, ease: "customEase" }
        );
        // Masked reveal from bottom for each text-frame line
        const maskedLines = thirdSlide.querySelectorAll(
          ".text-frame .text-frame-client p, .text-frame .text-frame-type p"
        );
        maskedLines.forEach((el, i) =>
          gsap.set(el, { y: "100%", autoAlpha: 0 })
        );
        gsap.to(maskedLines, {
          y: "0%",
          autoAlpha: 1,
          duration: 0.8,
          ease: "customEase",
          stagger: 0.08,
          delay: 1.1,
        });
      }
    } else if (prevActiveTab.current === 1 && activeTab === 2) {
      const centerText = document.querySelector(
        ".text-inside-grid__item-center"
      );
      const rightText = document.querySelector(".text-inside-grid__item-right");
      const firstFrame = document.querySelector(
        ".hero-section-frame > .hero-section-frame__image:not(.mini)"
      );
      const frameMask = firstFrame?.querySelector(".mask-image");
      if (frameMask) {
        gsap.killTweensOf(frameMask);
        gsap.set(frameMask, { clearProps: "transform" });
      }
      if (centerText) {
        gsap.to(centerText, {
          autoAlpha: 0,
          duration: 0.6,
          ease: "customEase",
        });
      }
      if (rightText) {
        gsap.to(rightText, {
          x: "4.5rem",
          duration: 0.6,
          ease: "customEase",
          onComplete: () => {
            gsap.to(rightText, {
              autoAlpha: 0,
              duration: 0.3,
              ease: "customEase",
            });
          },
        });
      }

      const centerTextSecond = document.querySelector(
        ".text-inside-grid-second .text-inside-grid__item-center"
      );
      if (centerTextSecond) {
        gsap.fromTo(
          centerTextSecond,
          { x: "4rem", y: "-0.9rem" },
          {
            x: "0rem",
            y: "-0.9rem",
            duration: 1.2,
            delay: 0.8,
            ease: "customEase",
          }
        );
      }

      const leftTopFirst = document.querySelector(
        ".text-inside-grid-second-top-left p:nth-child(1)"
      );
      const leftTopSecond = document.querySelector(
        ".text-inside-grid-second-top-left p:nth-child(2)"
      );
      if (leftTopFirst) {
        gsap.to(leftTopFirst, {
          y: "-3rem",
          duration: 1.0,
          ease: "customEase",
        });
      }
      if (leftTopSecond) {
        gsap.to(leftTopSecond, {
          y: "-1.45rem",
          duration: 1.0,
          ease: "customEase",
        });
      }

      const topRight = document.querySelector(
        ".text-inside-grid-second-top-right"
      );
      if (topRight) {
        gsap.to(topRight, { x: "-4.5rem", duration: 0.8, ease: "customEase" });
      }
    } else if (prevActiveTab.current === 2 && activeTab === 1) {
      const centerText = document.querySelector(
        ".text-inside-grid__item-center"
      );
      const rightText = document.querySelector(".text-inside-grid__item-right");
      // Immediately return the secondary center text to its initial spot (no delay)
      const centerTextSecond = document.querySelector(
        ".text-inside-grid-second .text-inside-grid__item-center"
      );
      if (centerTextSecond) {
        gsap.to(centerTextSecond, {
          x: "4rem",
          y: "-0.9rem",
          duration: 0.8,
          ease: "customEase",
        });
      }
      // Return the two top-left paragraphs to their original positions
      const leftTopFirst = document.querySelector(
        ".text-inside-grid-second-top-left p:nth-child(1)"
      );
      const leftTopSecond = document.querySelector(
        ".text-inside-grid-second-top-left p:nth-child(2)"
      );
      if (leftTopFirst) {
        gsap.to(leftTopFirst, { y: 0, duration: 0.8, ease: "customEase" });
      }
      if (leftTopSecond) {
        gsap.to(leftTopSecond, { y: 0, duration: 0.8, ease: "customEase" });
      }
      const topRight = document.querySelector(
        ".text-inside-grid-second-top-right"
      );
      if (topRight) {
        gsap.to(topRight, { x: 0, duration: 0.8, ease: "customEase" });
      }
      gsap.delayedCall(0.2, () => {
        if (centerText) {
          gsap.to(centerText, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "customEase",
          });
        }
        if (rightText) {
          gsap.to(rightText, {
            x: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "customEase",
          });
        }
      });
    } else if (prevActiveTab.current === 3 && activeTab === 2) {
      const top3El = document.querySelector(
        ".hero-section-grid-top__item:nth-child(3)"
      );
      if (top3El) {
        gsap.set(top3El, {
          x: "-1rem",
          y: "-1.5rem",
          scale: 1.7,
          transformOrigin: "bottom left",
        });
      }
      if (isLayoutReversed) {
        gsap.set(heroSectionFrame, {
          clipPath: "polygon(99% 0, 100% 0, 100% 1%, 99% 1%)",
          willChange: "clip-path",
        });
        gsap.to(heroSectionFrame, {
          clipPath: "polygon(1% 0, 100% 0, 100% 99%, 1% 99%)",
          duration: 1.5,
          ease: "customEase",
        });
      } else {
        gsap.to(heroSectionFrame, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1.5,
          ease: "customEase",
        });
      }
      const maskR = document.querySelector(
        ".hero-section-frame__image.mini.show .mask-image-r"
      );
      if (maskR) {
        gsap.set(maskR, { y: "0%" });
      }
      const tigSecond = document.querySelector(".text-inside-grid-second");
      if (tigSecond) {
        gsap.to(tigSecond, { autoAlpha: 1, duration: 0.6, ease: "customEase" });
      }
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        const maskedLines = thirdSlide.querySelectorAll(
          ".text-frame .text-frame-client p, .text-frame .text-frame-type p"
        );
        // Hide back into mask quickly (no stagger)
        gsap.to(maskedLines, {
          y: "200%",
          duration: 0.25,
          ease: "customEase",
          force3D: true,
        });
        // Do not fade out the container; text is hidden by mask overflow
      }
    } else if (prevActiveTab.current === 3 && activeTab === 4) {
      const top3El = document.querySelector(
        ".hero-section-grid-top__item:nth-child(3)"
      );
      if (top3El) {
        gsap.set(top3El, {
          x: "-1rem",
          y: "-1.5rem",
          scale: 1.7,
          transformOrigin: "bottom left",
        });
      }
      const top4El = document.querySelector(
        ".hero-section-grid-top__item:nth-child(4)"
      );
      if (top4El) {
        gsap.set(top4El, {
          x: "-1rem",
          y: "0.6rem",
          transformOrigin: "bottom left",
        });
      }
      const bottom3El = document.querySelector(
        ".hero-section-grid-bottom__item:nth-child(3)"
      );
      if (bottom3El) {
        gsap.set(bottom3El, {
          x: "-10.48rem",
          y: "0rem",
          scaleX: 4.4444,
          scaleY: 4.4375,
          transformOrigin: "bottom left",
        });
      }
      const bottom4El = document.querySelector(
        ".hero-section-grid-bottom__item:nth-child(4)"
      );
      if (bottom4El) {
        gsap.set(bottom4El, {
          x: "-3.55rem",
          y: 0,
        });
      }
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        const maskedLines = thirdSlide.querySelectorAll(
          ".text-frame .text-frame-client p, .text-frame .text-frame-type p"
        );
        gsap.to(maskedLines, {
          y: "200%",
          duration: 0.25,
          ease: "customEase",
          force3D: true,
        });
      }
      // no show for second paragraph on 3→4
    } else if (prevActiveTab.current === 4 && activeTab === 3) {
      // no animation for the second paragraph on 4→3
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        const maskedLines = thirdSlide.querySelectorAll(
          ".text-frame .text-frame-client p, .text-frame .text-frame-type p"
        );
        gsap.set(maskedLines, { y: "200%" });
      }
    }

    prevActiveTab.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const topItems = document.querySelectorAll(
      ".hero-section-grid-top__item:nth-child(-n+2)"
    );
    const bottomItems = document.querySelectorAll(
      ".hero-section-grid-bottom__item:nth-child(-n+2)"
    );
    const topItems34 = document.querySelectorAll(
      ".hero-section-grid-top__item:nth-child(n+3)"
    );
    const bottomItems34 = document.querySelectorAll(
      ".hero-section-grid-bottom__item:nth-child(n+3)"
    );
    const topItem3 = document.querySelectorAll(
      ".hero-section-grid-top__item:nth-child(3)"
    );
    const bottomItem3 = document.querySelectorAll(
      ".hero-section-grid-bottom__item:nth-child(3)"
    );
    const topItem4 = document.querySelectorAll(
      ".hero-section-grid-top__item:nth-child(4)"
    );
    const bottomItem4 = document.querySelectorAll(
      ".hero-section-grid-bottom__item:nth-child(4)"
    );

    const wasTab2 = prevTabForGrid.current === 2;

    if (activeTab === 2) {
      const cameFromTab3 = prevTabForGrid.current === 3;
      if (cameFromTab3) {
        const itemEl = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (itemEl) {
          gsap.to(itemEl, {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            transformOrigin: "bottom right",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
            onComplete: () => gsap.set(itemEl, { clearProps: "transform" }),
          });
        }
        const top3El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        if (top3El) {
          gsap.to(top3El, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
            onComplete: () => gsap.set(top3El, { clearProps: "transform" }),
          });
        }
        const bottom4El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        if (bottom4El) {
          gsap.to(bottom4El, {
            x: 0,
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
        const top4El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        if (top4El) {
          gsap.to(top4El, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
            onComplete: () => gsap.set(top4El, { clearProps: "transform" }),
          });
        }
        const bottom3Mask = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3) .mask-image-r"
        );
        if (bottom3Mask) {
          gsap.to(bottom3Mask, {
            y: "-100%",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
      }

      gsap.to(topItems, {
        top: "-3rem",
        duration: 1.5,
        ease: "customEase",
        stagger: 0.1,
      });

      gsap.to(bottomItems, {
        top: "3rem",
        duration: 1.5,
        ease: "customEase",
        stagger: 0.1,
      });

      gsap.to(topItems34, {
        top: "2.6rem",
        scale: 1.7,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
        stagger: 0.1,
      });

      // Bottom item 3 should grow on tab 2 (as before)
      gsap.to(bottomItem3, {
        scale: 1.7,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
      });

      // 4th bottom item scales on tab 2
      gsap.to(bottomItem4, {
        scale: 1.7,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
      });

      gsap.to(topItem4, {
        left: "1rem",
        duration: 1.5,
        ease: "customEase",
      });

      gsap.to(bottomItem4, {
        left: "1rem",
        duration: 1.5,
        ease: "customEase",
      });
    } else if (activeTab === 3) {
      // Only animate the 3rd bottom item; others remain untouched
      if (wasTab2) {
        const frameEl = document.querySelector(".hero-section-frame");
        const itemEl = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (frameEl && itemEl) {
          const frameRect = frameEl.getBoundingClientRect();
          const itemRectCurrent = itemEl.getBoundingClientRect();
          const baseWidth = itemEl.offsetWidth;
          const baseHeight = itemEl.offsetHeight;
          const dx = frameRect.left - itemRectCurrent.left;
          const dy = frameRect.top - itemRectCurrent.top;
          const rootFontSizePx =
            parseFloat(getComputedStyle(document.documentElement).fontSize) ||
            16;
          const dxRem = dx / rootFontSizePx;
          const dyRem = dy / rootFontSizePx;
          const scaleX = frameRect.width / baseWidth;
          const scaleY = frameRect.height / baseHeight;
          gsap.fromTo(
            itemEl,
            {
              x: 0,
              y: 0,
              scaleX: 1.7,
              scaleY: 1.7,
              transformOrigin: "bottom left",
            },
            {
              x: "-10.48rem",
              y: "0rem",
              scaleX: 4.4444,
              scaleY: 4.4375,
              transformOrigin: "bottom left",
              duration: 1.5,
              ease: "customEase",
              overwrite: true,
              immediateRender: false,
            }
          );
        }
        const top3El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        if (top3El) {
          gsap.to(top3El, {
            x: "-1rem",
            y: "-1.5rem",
            scale: 1.7,
            transformOrigin: "bottom left",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
        const bottom4El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        if (bottom4El) {
          gsap.to(bottom4El, {
            x: "-3.55rem",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
        const top4El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        if (top4El) {
          gsap.to(top4El, {
            x: "-1rem",
            y: "0.6rem",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
        const bottom3Mask = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3) .mask-image-r"
        );
        if (bottom3Mask) {
          gsap.to(bottom3Mask, {
            y: "0%",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
      } else if (prevTabForGrid.current === 4) {
        // Coming from tab 4 to tab 3: restore and set targets for tab 3
        const heroSectionGridEl = document.querySelector(".hero-section-grid");
        const verticalTickerEl = document.querySelector(".vertical-ticker");
        if (heroSectionGridEl) {
          gsap.killTweensOf(heroSectionGridEl);
          gsap.to(heroSectionGridEl, {
            y: 0,
            duration: 1.0,
            ease: "customEase",
          });
        }
        if (verticalTickerEl) {
          gsap.killTweensOf(verticalTickerEl);
          gsap.to(verticalTickerEl, {
            y: 0,
            duration: 1.0,
            ease: "customEase",
          });
        }
        if (bottomItem3[0]) {
          gsap.killTweensOf(bottomItem3[0]);
          gsap.to(bottomItem3[0], { y: 0, duration: 1.0, ease: "customEase" });
        }
        const itemEl = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        // Do not reposition bottom item 3 immediately; use delayed placement to match previous behavior
        const top3El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        const top4El = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        const bottom4El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        const bottom3Mask = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3) .mask-image"
        );

        const tlReturn = gsap.timeline({
          defaults: { duration: 1.5, ease: "customEase", overwrite: true },
          onComplete: () => {
            const thirdSlide = document.querySelector(".text-third-slide");
            if (thirdSlide) {
              const maskedLines = thirdSlide.querySelectorAll(
                ".text-frame .text-frame-client p, .text-frame .text-frame-type p"
              );
              gsap.to(thirdSlide, {
                autoAlpha: 1,
                duration: 0.2,
                ease: "customEase",
              });
              gsap.to(maskedLines, {
                y: "0%",
                duration: 0.35,
                ease: "customEase",
                force3D: true,
                stagger: 0.04,
              });
            }
          },
        });

        if (top3El) tlReturn.to(top3El, { x: "-1rem", y: "-1.5rem" }, 0);
        if (top4El) tlReturn.to(top4El, { x: "-1rem", y: "0.6rem" }, 0);
        if (bottom4El) tlReturn.to(bottom4El, { x: "-3.55rem", y: 0 }, 0);

        // After the grid descends, place bottom item 3 and animate its mask as before
        gsap.delayedCall(1.0, () => {
          if (itemEl) {
            gsap.set(itemEl, {
              x: "-10.48rem",
              y: "0rem",
              scaleX: 4.4444,
              scaleY: 4.4375,
              transformOrigin: "bottom left",
            });
          }
          if (bottom3Mask) {
            gsap.to(bottom3Mask, {
              y: "0%",
              duration: 1.5,
              ease: "customEase",
              overwrite: true,
            });
          }
        });
      }
      // No other grid animations on tab 3 to avoid unintended distortions
    } else if (activeTab === 4) {
      // Keep 3rd bottom item at its tab 3 position
      gsap.to(bottomItem3, {
        x: "-10.48rem",
        y: "0rem",
        scaleX: 4.4444,
        scaleY: 4.4375,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
        overwrite: true,
      });

      // Set CSS properties for grid layout
      // const gridTop = document.querySelector(".hero-section-grid-top");
      // if (gridTop) gsap.set(gridTop, { flexDirection: "column" });

      // Move 3rd top item slightly up
      if (topItem3[0]) {
        gsap.to(topItem3[0], {
          y: "-2.7rem",
          duration: 1.5,
          ease: "customEase",
          overwrite: true,
        });
      }

      // Move 4th top item to the left
      if (topItem4[0]) {
        gsap.to(topItem4[0], {
          x: "-3.55rem",
          duration: 1.5,
          ease: "customEase",
          overwrite: true,
        });
      }

      // Move 4th bottom item down
      if (bottomItem4[0]) {
        gsap.to(bottomItem4[0], {
          y: "1rem",
          duration: 1.5,
          ease: "customEase",
          overwrite: true,
        });
      }

      // Hide items on right side: top except 3 and 4; bottom except 3 and 4
      const topToHide = document.querySelectorAll(
        ".hero-section-grid-top__item:not(:nth-child(3)):not(:nth-child(4))"
      );
      const bottomToHide = document.querySelectorAll(
        ".hero-section-grid-bottom__item:not(:nth-child(3)):not(:nth-child(4))"
      );
      if (topToHide.length) gsap.set(topToHide, { autoAlpha: 0 });
      if (bottomToHide.length) gsap.set(bottomToHide, { autoAlpha: 0 });

      // Start moving hero-section-grid up immediately
      const heroSectionGrid = document.querySelector(".hero-section-grid");
      if (heroSectionGrid) {
        gsap.to(heroSectionGrid, {
          y: "-100vh",
          duration: 20,
          ease: "none",
          overwrite: true,
        });
      }

      // Sync vertical ticker to continue upward at the same speed (infinite)
      const verticalTicker = document.querySelector(".vertical-ticker");
      if (verticalTicker) {
        if (!verticalTicker.dataset.duplicated) {
          verticalTicker.dataset.duplicated = "true";
          const children = Array.from(verticalTicker.children);
          children.forEach((child) => {
            verticalTicker.appendChild(child.cloneNode(true));
          });
        }
        const cycleHeightPx = verticalTicker.scrollHeight / 2;
        const vhPx = window.innerHeight || 1;
        const durationPer100vh = 20;
        const duration = (cycleHeightPx / vhPx) * durationPer100vh;
        gsap.set(verticalTicker, { willChange: "transform" });
        gsap.to(verticalTicker, {
          y: -cycleHeightPx,
          duration,
          ease: "none",
          repeat: -1,
          onRepeat: () => gsap.set(verticalTicker, { y: 0 }),
          overwrite: true,
        });
      }

      // Keep 3rd bottom item in place by countering the grid movement
      if (bottomItem3[0]) {
        gsap.to(bottomItem3[0], {
          y: "100vh",
          duration: 20,
          ease: "none",
          overwrite: true,
        });
      }

      // Line up key items concurrently with slight stagger
      const tlLineup = gsap.timeline({
        defaults: { duration: 1.5, ease: "customEase", overwrite: true },
      });
      if (topItem3[0]) tlLineup.to(topItem3[0], { y: "-2.7rem" }, 0);
      if (topItem4[0]) tlLineup.to(topItem4[0], { x: "-3.55rem" }, 0.1);
      if (bottomItem4[0]) tlLineup.to(bottomItem4[0], { y: "1rem" }, 0.2);
    } else {
      // Restore visibility only when switching 2 → 1
      if (prevTabForGrid.current === 2 && activeTab === 1) {
        const hiddenTop = document.querySelectorAll(
          ".hero-section-grid-top__item"
        );
        const hiddenBottom = document.querySelectorAll(
          ".hero-section-grid-bottom__item"
        );
        if (hiddenTop.length) gsap.set(hiddenTop, { autoAlpha: 1 });
        if (hiddenBottom.length) gsap.set(hiddenBottom, { autoAlpha: 1 });
      }

      gsap.to([...topItems, ...bottomItems], {
        top: 0,
        scale: 1,
        left: 0,
        duration: 1.5,
        ease: "customEase",
        stagger: 0.05,
      });

      gsap.to(topItems34, {
        top: 0,
        scale: 1,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
        stagger: 0.05,
      });

      gsap.to(bottomItems34, {
        scale: 1,
        transformOrigin: "bottom left",
        left: 0,
        duration: 1.5,
        ease: "customEase",
        stagger: 0.05,
      });

      gsap.to([...topItem4, ...bottomItem4], {
        left: 0,
        duration: 1.5,
        ease: "customEase",
      });
    }

    // When reverse is enabled and switching 2 → 1, move grid to -115%
    if (isLayoutReversed && prevTabForGrid.current === 2 && activeTab === 1) {
      const heroSectionGridEl = document.querySelector(".hero-section-grid");
      if (heroSectionGridEl) {
        gsap.to(heroSectionGridEl, {
          x: "-115%",
          duration: 1.5,
          ease: "customEase",
        });
      }
    }

    prevTabForGrid.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!hasLayoutChanged) {
      return;
    }

    const heroSectionFrame = document.querySelector(".hero-section-frame");
    const heroSectionGrid = document.querySelector(".hero-section-grid");

    if (isLayoutReversed) {
      const gridX =
        activeTab === 2 ? "-160%" : activeTab === 3 ? "-130%" : "-100%";
      if (activeTab === 2) {
        const top3 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        const top4 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        const bottom3 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        const bottom4 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        const items = [top3, top4, bottom3, bottom4].filter(Boolean);
        gsap.set(heroSectionFrame, {
          willChange: "clip-path",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        });
        if (items.length) {
          gsap.set(items, {
            willChange: "clip-path",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          });
        }
        const tigSecond = document.querySelector(".text-inside-grid-second");
        const tlRev2 = gsap.timeline({
          defaults: { ease: "customEase" },
          onStart: () => {
            reversingLockCountRef.current += 1;
            isReversingRef.current = true;
          },
          onComplete: () => {
            if (items.length) gsap.set(items, { willChange: "" });
            gsap.set(heroSectionFrame, { willChange: "" });
            reversingLockCountRef.current -= 1;
            if (reversingLockCountRef.current <= 0) {
              reversingLockCountRef.current = 0;
              isReversingRef.current = false;
            }
          },
        });
        if (tigSecond) tlRev2.to(tigSecond, { autoAlpha: 0, duration: 0.2 }, 0);
        tlRev2.to(
          heroSectionFrame,
          {
            clipPath: "polygon(90% 100%, 100% 100%, 100% 100%, 90% 100%)",
            duration: 1.2,
          },
          0
        );
        if (items.length) {
          tlRev2.to(
            items,
            {
              clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)",
              duration: 1.2,
              stagger: { each: 0.06, from: "start" },
            },
            0
          );
        }
        tlRev2
          .to(heroSectionGrid, { x: gridX, duration: 0.1 }, ">")
          .to(heroSectionFrame, { xPercent: 167, duration: 0.1 }, "<");
        tlRev2.set(
          heroSectionFrame,
          { clipPath: "polygon(0 100%, 0% 100%, 0% 100%, 0 100%)" },
          ">-0.05"
        );
        tlRev2.add("revealOpen");
        tlRev2.to(
          heroSectionFrame,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0 100%)",
            duration: 1.2,
          },
          "revealOpen"
        );
        if (items.length) {
          tlRev2.to(
            items,
            {
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              duration: 1.2,
              stagger: 0,
            },
            "revealOpen"
          );
        }
        if (tigSecond)
          tlRev2.to(tigSecond, { autoAlpha: 1, duration: 0.2 }, ">-0.05");
      } else {
        gsap.to(heroSectionGrid, {
          x: gridX,
          duration: 1.5,
          ease: "customEase",
        });
        gsap.to(heroSectionFrame, {
          xPercent: 167,
          duration: 1.5,
          ease: "customEase",
        });
      }

      if (activeTab === 3) {
        const bottom3El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3El) {
          gsap.killTweensOf(bottom3El);
          gsap.set(bottom3El, {
            willChange: "clip-path",
            // ensure starting from fully open if needed
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          });
          gsap.to(bottom3El, {
            clipPath: "polygon(0 100%, 0% 100%, 0% 100%, 0% 100%)",
            duration: 1.2,
            ease: "customEase",
            overwrite: true,
            onComplete: () => gsap.set(bottom3El, { willChange: "" }),
          });
        }
        const frame34Img = document.querySelector(
          ".hero-section-frame-34 .hero-section-frame__image"
        );
        if (frame34Img) {
          const prevTransition = frame34Img.style.transition;
          gsap.set(frame34Img, { willChange: "clip-path", transition: "none" });
          gsap.to(frame34Img, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.2,
            ease: "customEase",
            overwrite: true,
            onComplete: () => {
              frame34Img.style.transition = prevTransition;
              gsap.set(frame34Img, { willChange: "" });
            },
          });
        }
      }

      if (activeTab === 4) {
        const verticalTickerEl = document.querySelector(".vertical-ticker");
        if (verticalTickerEl) {
          if (verticalTickerEl.dataset.rightOriginal === undefined) {
            verticalTickerEl.dataset.rightOriginal =
              getComputedStyle(verticalTickerEl).right || "0px";
          }
          gsap.to(verticalTickerEl, {
            right: "10.7rem",
            duration: 1.5,
            ease: "customEase",
          });
        }
        const frame34Img = document.querySelector(
          ".hero-section-frame-34 .hero-section-frame__image"
        );
        if (frame34Img) {
          const prevTransition = frame34Img.style.transition;
          gsap.set(frame34Img, { willChange: "clip-path", transition: "none" });
          gsap.set(frame34Img, {
            clipPath: "polygon(96% 0, 100% 0, 100% 100%, 96% 100%)",
          });
          gsap.to(frame34Img, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.2,
            ease: "customEase",
            overwrite: true,
            onComplete: () => {
              frame34Img.style.transition = prevTransition;
              gsap.set(frame34Img, { willChange: "" });
            },
          });
        }
        const bottom3El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3El) {
          gsap.killTweensOf(bottom3El, "clipPath");
          gsap.set(bottom3El, {
            willChange: "clip-path",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          });
          gsap.to(bottom3El, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.2,
            ease: "customEase",
            overwrite: false,
            onComplete: () => gsap.set(bottom3El, { willChange: "" }),
          });
        }
      }

      if (activeTab === 1) {
        const topItemsAll = document.querySelectorAll(
          ".hero-section-grid-top__item"
        );
        const bottomItemsAll = document.querySelectorAll(
          ".hero-section-grid-bottom__item"
        );
        const tlStaggerIn = gsap.timeline({ defaults: { ease: "customEase" } });
        if (topItemsAll.length)
          tlStaggerIn
            .to(topItemsAll, { y: "-0.6rem", duration: 0.5, stagger: 0.06 }, 0)
            .to(topItemsAll, { y: 0, duration: 0.6, stagger: 0.06 }, ">-0.2");
        if (bottomItemsAll.length)
          tlStaggerIn
            .to(
              bottomItemsAll,
              { y: "0.6rem", duration: 0.5, stagger: 0.06 },
              0.05
            )
            .to(
              bottomItemsAll,
              { y: 0, duration: 0.6, stagger: 0.06 },
              ">-0.2"
            );

        const frameMask = document.querySelector(
          ".hero-section-frame .mask-image"
        );
        if (frameMask) {
          const prevTransition = frameMask.style.transition;
          gsap.set(frameMask, { transition: "none" });
          const tlMask = gsap.timeline({
            defaults: { ease: "customEase" },
            onComplete: () => {
              frameMask.style.transition = prevTransition;
            },
          });
          tlMask.to(frameMask, { y: "3rem", duration: 1 }, 0);
        }
      }
    } else {
      if (activeTab === 2) {
        const top3 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        const top4 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        const bottom3 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        const bottom4 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        const items = [top3, top4, bottom3, bottom4].filter(Boolean);
        gsap.set(heroSectionFrame, {
          willChange: "clip-path",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        });
        if (items.length) {
          gsap.set(items, {
            willChange: "clip-path",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          });
        }
        const tigSecond = document.querySelector(".text-inside-grid-second");
        const tlRev2Back = gsap.timeline({
          defaults: { ease: "customEase" },
          onStart: () => {
            reversingLockCountRef.current += 1;
            isReversingRef.current = true;
          },
          onComplete: () => {
            if (items.length) gsap.set(items, { willChange: "" });
            gsap.set(heroSectionFrame, { willChange: "" });
            reversingLockCountRef.current -= 1;
            if (reversingLockCountRef.current <= 0) {
              reversingLockCountRef.current = 0;
              isReversingRef.current = false;
            }
          },
        });
        if (tigSecond)
          tlRev2Back.to(tigSecond, { autoAlpha: 0, duration: 0.2 }, 0);
        tlRev2Back.to(
          heroSectionFrame,
          {
            clipPath: "polygon(0 100%, 0% 100%, 0% 100%, 0% 100%)",
            duration: 0.8,
          },
          0
        );
        if (items.length) {
          tlRev2Back.to(
            items,
            {
              clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)",
              duration: 0.8,
              stagger: { each: 0.06, from: "start" },
            },
            0
          );
        }
        tlRev2Back
          .to(heroSectionGrid, { x: "0%", duration: 0.3 }, ">")
          .to(heroSectionFrame, { xPercent: 0, duration: 0.3 }, "<");
        tlRev2Back.to(
          heroSectionFrame,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.8,
          },
          ">"
        );
        if (items.length) {
          tlRev2Back.to(
            items,
            {
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              duration: 0.8,
              stagger: 0,
            },
            ">-0.05"
          );
        }
        tlRev2Back.add("revealOpenBack");
        tlRev2Back.to(
          heroSectionFrame,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.8,
          },
          "revealOpenBack"
        );
        if (items.length) {
          tlRev2Back.to(
            items,
            {
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              duration: 0.8,
              stagger: 0,
            },
            "revealOpenBack"
          );
        }
        if (tigSecond)
          tlRev2Back.to(tigSecond, { autoAlpha: 1, duration: 0.2 }, ">-0.05");
      } else {
        gsap.to(heroSectionGrid, {
          x: "0%",
          duration: 1.5,
          ease: "customEase",
        });
        gsap.to(heroSectionFrame, {
          xPercent: 0,
          duration: 1.5,
          ease: "customEase",
        });
      }

      if (activeTab === 3) {
        const bottom3El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3El) {
          gsap.killTweensOf(bottom3El);
          gsap.set(bottom3El, { willChange: "clip-path" });
          gsap.to(bottom3El, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.2,
            ease: "customEase",
            overwrite: true,
            onComplete: () => gsap.set(bottom3El, { willChange: "" }),
          });
        }
      }

      if (activeTab === 4) {
        const verticalTickerEl = document.querySelector(".vertical-ticker");
        if (verticalTickerEl) {
          gsap.to(verticalTickerEl, {
            right: "4.7rem",
            duration: 1.5,
            ease: "customEase",
          });
        }
        const frame34Img = document.querySelector(
          ".hero-section-frame-34 .hero-section-frame__image"
        );
        if (frame34Img) {
          const prevTransition = frame34Img.style.transition;
          gsap.set(frame34Img, { willChange: "clip-path", transition: "none" });
          gsap.set(frame34Img, {
            clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          });
          frame34Img.style.transition = prevTransition;
          gsap.set(frame34Img, { willChange: "" });
        }
      }

      if (activeTab === 1) {
        const topItemsAll = document.querySelectorAll(
          ".hero-section-grid-top__item"
        );
        const bottomItemsAll = document.querySelectorAll(
          ".hero-section-grid-bottom__item"
        );
        const tlStaggerOut = gsap.timeline({
          defaults: { ease: "customEase" },
        });
        if (topItemsAll.length)
          tlStaggerOut
            .to(
              topItemsAll,
              {
                y: "-0.6rem",
                duration: 0.5,
                stagger: { each: 0.06, from: "end" },
              },
              0
            )
            .to(
              topItemsAll,
              { y: 0, duration: 0.6, stagger: { each: 0.06, from: "end" } },
              ">-0.2"
            );
        if (bottomItemsAll.length)
          tlStaggerOut
            .to(
              bottomItemsAll,
              {
                y: "0.6rem",
                duration: 0.5,
                stagger: { each: 0.06, from: "end" },
              },
              0.05
            )
            .to(
              bottomItemsAll,
              { y: 0, duration: 0.6, stagger: { each: 0.06, from: "end" } },
              ">-0.2"
            );

        const frameMask = document.querySelector(
          ".hero-section-frame .mask-image"
        );
        if (frameMask) {
          const prevTransition = frameMask.style.transition;
          gsap.set(frameMask, { transition: "none" });
          const tlMask = gsap.timeline({
            defaults: { ease: "customEase" },
            onComplete: () => {
              frameMask.style.transition = prevTransition;
            },
          });
          tlMask.to(frameMask, { y: 0, duration: 1 }, 0);
        }
      }
    }
  }, [isLayoutReversed]);

  useEffect(() => {
    // Only enable parallax on tabs 1 and 2. Disable immediately on 3/4.
    // Teardown any previous.
    if (parallaxQuickRef.current.length) {
      parallaxQuickRef.current.forEach(({ el, baseX = 0, baseY = 0 }) => {
        gsap.killTweensOf(el);
        if (el) el.style.willChange = "";
        gsap.set(el, { x: baseX, y: baseY });
      });
      parallaxQuickRef.current = [];
    }
    if (activeTab <= 2) {
      const targets = document.querySelectorAll(
        ".hero-section-grid-top__item, .hero-section-grid-bottom__item"
      );
      targets.forEach((el) => {
        const depthAttr = parseFloat(el.getAttribute("data-depth"));
        const depth = Number.isFinite(depthAttr) ? depthAttr : 1.3;
        el.style.willChange = "transform";
        const xTo = gsap.quickTo(el, "x", {
          duration: 0.6,
          ease: "customEase",
        });
        const yTo = gsap.quickTo(el, "y", {
          duration: 0.6,
          ease: "customEase",
        });
        parallaxQuickRef.current.push({
          el,
          xTo,
          yTo,
          depth,
          baseX: 0,
          baseY: 0,
        });
      });
      // Include hero-section-frame with a subtler depth
      const frameEl = document.querySelector(".hero-section-frame");
      if (frameEl) {
        const depthAttr = parseFloat(frameEl.getAttribute("data-depth"));
        const depth = Number.isFinite(depthAttr) ? depthAttr : 0.8;
        frameEl.style.willChange = "transform";
        const xTo = gsap.quickTo(frameEl, "x", {
          duration: 0.6,
          ease: "customEase",
        });
        const yTo = gsap.quickTo(frameEl, "y", {
          duration: 0.6,
          ease: "customEase",
        });
        const baseX = 0;
        const baseY = 0;
        parallaxQuickRef.current.push({
          el: frameEl,
          xTo,
          yTo,
          depth,
          baseX,
          baseY,
        });
      }
    } else if (activeTab === 3) {
      tab3ParallaxReadyRef.current = false;
      if (tab3ParallaxDelayRef.current) tab3ParallaxDelayRef.current.kill();
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const baseX = -1 * rem;
      const baseY = -1.5 * rem;
      tab3ParallaxDelayRef.current = gsap.delayedCall(1.5, () => {
        const top3 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(3)"
        );
        if (top3) {
          const depthAttr = parseFloat(top3.getAttribute("data-depth"));
          const depth = Number.isFinite(depthAttr) ? depthAttr : 1.0;
          top3.style.willChange = "transform";
          const xTo = gsap.quickTo(top3, "x", {
            duration: 0.6,
            ease: "customEase",
          });
          const yTo = gsap.quickTo(top3, "y", {
            duration: 0.6,
            ease: "customEase",
          });
          parallaxQuickRef.current.push({
            el: top3,
            xTo,
            yTo,
            depth,
            baseX,
            baseY,
          });
        }
        const top4 = document.querySelector(
          ".hero-section-grid-top__item:nth-child(4)"
        );
        if (top4) {
          const depthAttr = parseFloat(top4.getAttribute("data-depth"));
          const depth = Number.isFinite(depthAttr) ? depthAttr : 0.9;
          top4.style.willChange = "transform";
          const xTo = gsap.quickTo(top4, "x", {
            duration: 0.6,
            ease: "customEase",
          });
          const yTo = gsap.quickTo(top4, "y", {
            duration: 0.6,
            ease: "customEase",
          });
          const baseX4 = -1 * rem;
          const baseY4 = 0.6 * rem;
          parallaxQuickRef.current.push({
            el: top4,
            xTo,
            yTo,
            depth,
            baseX: baseX4,
            baseY: baseY4,
          });
        }
        const bottom3 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3) {
          const depthAttr = parseFloat(bottom3.getAttribute("data-depth"));
          const depth = Number.isFinite(depthAttr) ? depthAttr : 0.6;
          bottom3.style.willChange = "transform";
          const xTo = gsap.quickTo(bottom3, "x", {
            duration: 0.6,
            ease: "customEase",
          });
          const yTo = gsap.quickTo(bottom3, "y", {
            duration: 0.6,
            ease: "customEase",
          });
          const baseXb3 = -10.48 * rem;
          const baseYb3 = 0 * rem;
          parallaxQuickRef.current.push({
            el: bottom3,
            xTo,
            yTo,
            depth,
            baseX: baseXb3,
            baseY: baseYb3,
          });
        }
        const bottom4 = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(4)"
        );
        if (bottom4) {
          const depthAttr = parseFloat(bottom4.getAttribute("data-depth"));
          const depth = Number.isFinite(depthAttr) ? depthAttr : 0.9;
          bottom4.style.willChange = "transform";
          const xTo = gsap.quickTo(bottom4, "x", {
            duration: 0.6,
            ease: "customEase",
          });
          const yTo = gsap.quickTo(bottom4, "y", {
            duration: 0.6,
            ease: "customEase",
          });
          const baseXb4 = -3.55 * rem;
          const baseYb4 = 0 * rem;
          parallaxQuickRef.current.push({
            el: bottom4,
            xTo,
            yTo,
            depth,
            baseX: baseXb4,
            baseY: baseYb4,
          });
        }
        tab3ParallaxReadyRef.current = true;
      });
    }
    return () => {
      // On unmount or dependency change, ensure we clean up
      if (parallaxQuickRef.current.length) {
        parallaxQuickRef.current.forEach(({ el, baseX = 0, baseY = 0 }) => {
          gsap.killTweensOf(el);
          if (el) el.style.willChange = "";
          gsap.set(el, { x: baseX, y: baseY });
        });
        parallaxQuickRef.current = [];
      }
      tab3ParallaxReadyRef.current = false;
      if (tab3ParallaxDelayRef.current) {
        tab3ParallaxDelayRef.current.kill();
        tab3ParallaxDelayRef.current = null;
      }
    };
  }, [activeTab]);

  useEffect(() => {
    // Disable any parallax when entering tab 4
    if (activeTab === 4 && parallaxQuickRef.current.length) {
      parallaxQuickRef.current.forEach(
        ({ xTo, yTo, el, baseX = 0, baseY = 0 }) => {
          gsap.killTweensOf(el);
          xTo(baseX);
          yTo(baseY);
        }
      );
      parallaxQuickRef.current = [];
    }
  }, [activeTab]);

  useEffect(() => {
    const preloader = document.querySelector(".preloader");
    const leftPanel = document.querySelector(".preloader__panel.left");
    const rightPanel = document.querySelector(".preloader__panel.right");
    const frameEl = document.querySelector(".hero-section-frame");
    const topItems = document.querySelectorAll(".hero-section-grid-top__item");
    const bottomItems = document.querySelectorAll(
      ".hero-section-grid-bottom__item"
    );
    const textInside = document.querySelectorAll(
      ".text-inside-grid, .text-inside-grid-second"
    );

    if (!preloader || !leftPanel || !rightPanel) return;

    gsap.set(preloader, {
      pointerEvents: "auto",
      autoAlpha: 1,
      display: "block",
    });
    gsap.set([leftPanel, rightPanel], { x: 0 });
    if (frameEl) gsap.set(frameEl, { autoAlpha: 0 });
    if (topItems && topItems.length) gsap.set(topItems, { autoAlpha: 0 });
    if (bottomItems && bottomItems.length)
      gsap.set(bottomItems, { autoAlpha: 0 });
    if (textInside && textInside.length) gsap.set(textInside, { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: "customEase" } });

    tl.to(leftPanel, { x: "-100%", duration: 1.5 }, 0)
      .to(rightPanel, { x: "100%", duration: 1.5 }, 0)
      .add(() => {
        gsap.set(preloader, { pointerEvents: "none", display: "none" });
      })
      .to(frameEl, { autoAlpha: 1, duration: 1.1 }, ">")
      .to(topItems, { autoAlpha: 1, duration: 1.1, stagger: 0.12 }, "<")
      .to(bottomItems, { autoAlpha: 1, duration: 1.1, stagger: 0.12 }, "<")
      .to(textInside, { autoAlpha: 1, duration: 1.1, stagger: 0.12 }, "<");
  }, []);

  return (
    <>
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab reverse-left ${isLayoutReversed ? "active" : ""}`}
            onClick={handleReverseLeft}
            aria-label="Reverse Left"
          >
            LFT
          </button>
          <button
            className={`tab reverse-right ${!isLayoutReversed ? "active" : ""}`}
            onClick={handleReverseRight}
            aria-label="Reverse Right"
          >
            RGHT
          </button>
        </div>
        <p className="label">dich™</p>
        <div className="tabs">
          <button
            className={`tab ${"prev"}`}
            onClick={handlePrevTab}
            aria-label="Previous"
            disabled={activeTab === 1 || isAnimatingTabs}
          >
            ←
          </button>
          <div className="tab-indicator" aria-live="polite">
            {activeTab} / 4
          </div>
          <button
            className={`tab ${"next"}`}
            onClick={handleNextTab}
            aria-label="Next"
            disabled={activeTab === 4 || isAnimatingTabs}
          >
            →
          </button>
        </div>
      </div>

      <div className="preloader">
        <div className="preloader__panel left"></div>
        <div className="preloader__panel right"></div>
      </div>

      <section
        className={`hero-section ${activeTab === 2 ? "tab-2-active" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hero-section-frame">
          <div className={`hero-section-frame__image ${getFirstImageClass()}`}>
            <img
              className="background-image"
              src="/images/WD_01.png"
              alt="background"
            />
            <img
              className="mask-image"
              src="/images/mask-wide-test1.svg"
              alt="mask"
            />
          </div>
          <div
            className={`hero-section-frame__image mini ${getSecondImageClass()}`}
          >
            <img
              className="background-image"
              src="/images/WD_02.png"
              alt="background"
            />
            <img
              className="mask-image-r"
              src="/images/mask-wide-test2.svg"
              alt="mask"
            />
          </div>
        </div>
        <div
          className="hero-section-frame-34"
          aria-hidden={!(activeTab === 3 || activeTab === 4)}
        >
          <div className="hero-section-frame__image">
            <img
              className="background-image"
              src="/images/WD_05.png"
              alt="background"
            />
            <img
              className="mask-image"
              src="/images/mask-wide-test1.svg"
              alt="mask"
            />
          </div>
        </div>
        <div className="hero-section-grid">
          <div className="hero-section-grid-top">
            <div className="hero-section-grid-top__item">
              <img
                className="inside-image"
                src="/images/Card_01.png"
                alt="image"
              />
            </div>
            <div className="hero-section-grid-top__item">
              <img
                className="inside-image"
                src="/images/Card_02.png"
                alt="image"
              />
            </div>
            <div className="hero-section-grid-top__item">
              <img
                className="inside-image"
                src="/images/Card_03.png"
                alt="image"
              />
            </div>
            <div className="hero-section-grid-top__item">
              <img
                className="inside-image"
                src="/images/Card_04.png"
                alt="image"
              />
            </div>
          </div>
          <div className="hero-section-grid-bottom">
            <div className="hero-section-grid-bottom__item">
              <img
                className="inside-image"
                src="/images/Card_05.png"
                alt="image"
              />
            </div>
            <div className="hero-section-grid-bottom__item">
              <img
                className="inside-image"
                src="/images/Card_06.png"
                alt="image"
              />
            </div>
            <div className="hero-section-grid-bottom__item">
              <img
                className="inside-image"
                src="/images/WD_03.png"
                alt="image"
              />
              <img
                className="mask-image-r"
                src="/images/mask-wide-test2.svg"
                alt="mask"
              />
            </div>
            <div className="hero-section-grid-bottom__item">
              <img
                className="inside-image"
                src="/images/WD_0101.png"
                alt="image"
              />
            </div>
          </div>
          <div className="text-inside-grid">
            <p className="text-inside-grid__item-center">
              Simplicity and geometry — simplicity always wins. Einstein said
              that the definition of genius is taking the complex and making it
              simple.
            </p>
            <p className="text-inside-grid__item-right">02.09.2025</p>
            <div className="text-third-slide">
              <div className="text-frame">
                <div className="text-frame-client">
                  <p>client:</p>
                  <p>lummi.ai</p>
                </div>
                <div className="text-frame-type">
                  <p>type:</p>
                  <p>comercial</p>
                </div>
              </div>
              <div className="text-frame">
                <div className="text-frame-client">
                  <p>client:</p>
                  <p>BL/S®</p>
                </div>
                <div className="text-frame-type">
                  <p>type:</p>
                  <p>personal</p>
                </div>
              </div>
              <div className="text-frame">
                <div className="text-frame-client">
                  <p>client:</p>
                  <p>DICH™</p>
                </div>
                <div className="text-frame-type">
                  <p>type:</p>
                  <p>personal</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-inside-grid-second">
            <div className="text-inside-grid-second-top">
              <div className="text-inside-grid-second-top-left">
                <p>enjoy</p>
                <p>VIBES</p>
              </div>
              <div className="text-inside-grid-second-top-right">
                <p>©—✽</p>
                <p>enjoy</p>
              </div>
            </div>
            <p className="text-inside-grid__item-center">
              implementation of innovations. One has to flow, be flexible and
              adapt, stillness is death.
            </p>
          </div>
        </div>
        <div className="vertical-ticker">
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_01.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_02.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_03.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_04.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_05.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_06.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_07.png"
              alt="image"
            />
          </div>
          <div className="vertical-ticker__item">
            <img
              className="inside-image"
              src="/images/Card_08.png"
              alt="image"
            />
          </div>
        </div>
        <div className="text-under-photo">
          <div className="first-line">
            {" "}
            <p>The Beachland Ballroom by ultra mono</p>
            <p>02.09.2025</p>
          </div>
          <div className="second-line">
            <p>A Woman Without Secrets by Erin Willett</p>
            <p>02.09.2025</p>
          </div>
          <div className="third-line">
            <p>The Beachland Ballroom by ultra mono</p>
            <p>02.09.2025</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
