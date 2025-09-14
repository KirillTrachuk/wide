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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePosition({ x: mouseX, y: mouseY });

    // Parallax: move images a few pixels based on cursor position
    const nx = (mouseX / rect.width) * 2 - 1; // -1..1
    const ny = (mouseY / rect.height) * 2 - 1; // -1..1
    const rangePx = 6; // couple of pixels
    const tx = nx * rangePx;
    const ty = ny * rangePx;
    const parallaxTargets = document.querySelectorAll(
      "img.background-image, .inside-image, .vertical-ticker__item .inside-image"
    );
    if (parallaxTargets.length) {
      gsap.to(parallaxTargets, {
        x: tx,
        y: ty,
        duration: 0.2,
        ease: "power2.out",
        overwrite: false,
      });
    }
  };

  const handleMouseLeave = () => {
    const parallaxTargets = document.querySelectorAll(
      "img.background-image, .inside-image, .vertical-ticker__item .inside-image"
    );
    if (parallaxTargets.length) {
      gsap.to(parallaxTargets, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
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
    setActiveTab(nextTab);
  };

  const handleNextTab = () => {
    const nextTab = activeTab >= 4 ? 4 : activeTab + 1;
    // If moving 2 → 3, animate to last text (index 2)
    if (activeTab === 2 && nextTab === 3) {
      animateToIndex(2);
    } else if (nextTab <= 2) {
      animateTextSwitch("next");
    } else if (nextTab >= 3) {
      animateToIndex(2);
    }
    setActiveTab(nextTab);
  };

  const handleReverseLeft = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(true);
  };

  const handleReverseRight = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(false);
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
      }
    } else if (prevActiveTab.current === 1 && activeTab === 2) {
      const centerText = document.querySelector(
        ".text-inside-grid__item-center"
      );
      const rightText = document.querySelector(".text-inside-grid__item-right");
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
            delay: 0.2,
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
        gsap.to(thirdSlide, {
          autoAlpha: 0,
          duration: 0.6,
          ease: "customEase",
        });
      }
    } else if (prevActiveTab.current === 3 && activeTab === 4) {
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        gsap.to(thirdSlide, {
          autoAlpha: 0,
          duration: 0.6,
          ease: "customEase",
        });
      }
    } else if (prevActiveTab.current === 4 && activeTab === 3) {
      const thirdSlide = document.querySelector(".text-third-slide");
      if (thirdSlide) {
        gsap.to(thirdSlide, {
          autoAlpha: 1,
          duration: 0.6,
          delay: 1.1,
          ease: "customEase",
        });
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

        gsap.delayedCall(1.0, () => {
          const itemEl = document.querySelector(
            ".hero-section-grid-bottom__item:nth-child(3)"
          );
          if (itemEl) {
            gsap.set(itemEl, {
              x: "-10.48rem",
              y: "0rem",
              scaleX: 4.4444,
              scaleY: 4.4375,
              transformOrigin: "bottom left",
            });
          }
          const top3El = document.querySelector(
            ".hero-section-grid-top__item:nth-child(3)"
          );
          if (top3El) {
            gsap.to(top3El, {
              x: "-1rem",
              y: "-1.5rem",
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
          const bottom4El = document.querySelector(
            ".hero-section-grid-bottom__item:nth-child(4)"
          );
          if (bottom4El) {
            gsap.to(bottom4El, {
              x: "-3.55rem",
              y: 0,
              duration: 1.5,
              ease: "customEase",
              overwrite: true,
            });
          }
          const bottom3Mask = document.querySelector(
            ".hero-section-grid-bottom__item:nth-child(3) .mask-image"
          );
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

      // After all items are positioned, start moving hero-section-grid up
      gsap.delayedCall(1.5, () => {
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
          // Duplicate children once to enable seamless looping
          if (!verticalTicker.dataset.duplicated) {
            verticalTicker.dataset.duplicated = "true";
            const children = Array.from(verticalTicker.children);
            children.forEach((child) => {
              verticalTicker.appendChild(child.cloneNode(true));
            });
          }
          // Calculate one cycle height (first half of content)
          const cycleHeightPx = verticalTicker.scrollHeight / 2;
          const vhPx = window.innerHeight || 1;
          const durationPer100vh = 20; // 100vh in 20s (same speed as grid)
          const duration = (cycleHeightPx / vhPx) * durationPer100vh;
          // Start from current y (or 0) and loop seamlessly
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

        // Keep 3rd bottom item in place by countering the grid movement (single pass)
        if (bottomItem3[0]) {
          gsap.to(bottomItem3[0], {
            y: "100vh",
            duration: 20,
            ease: "none",
            overwrite: true,
          });
        }
      });
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
      // Only swap positions horizontally (no height changes)
      const gridX =
        activeTab === 2 ? "-160%" : activeTab === 3 ? "-130%" : "-100%";
      gsap.to(heroSectionGrid, {
        x: gridX,
        duration: 1.5,
        ease: "customEase",
      });
      gsap.to(heroSectionFrame, {
        x: "167%",
        duration: 1.5,
        ease: "customEase",
      });

      // On tab 3, also shift the 3rd bottom item by 7.35rem
      if (activeTab === 3) {
        const bottom3El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3El) {
          gsap.to(bottom3El, {
            x: "7.35rem",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
      }

      // On tab 4, move vertical ticker to the right: 10.7rem
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
      }
    } else {
      // Only swap positions back horizontally (no height changes)
      gsap.to(heroSectionGrid, {
        x: "0%",
        duration: 1.5,
        ease: "customEase",
      });
      gsap.to(heroSectionFrame, {
        x: "0%",
        duration: 1.5,
        ease: "customEase",
      });

      // Reset the 3rd bottom item position when toggling reverse off on tab 3
      if (activeTab === 3) {
        const bottom3El = document.querySelector(
          ".hero-section-grid-bottom__item:nth-child(3)"
        );
        if (bottom3El) {
          gsap.to(bottom3El, {
            x: "-10.48rem",
            duration: 1.5,
            ease: "customEase",
            overwrite: true,
          });
        }
      }

      // On tab 4, move vertical ticker back to right: 4.7rem
      if (activeTab === 4) {
        const verticalTickerEl = document.querySelector(".vertical-ticker");
        if (verticalTickerEl) {
          gsap.to(verticalTickerEl, {
            right: "4.7rem",
            duration: 1.5,
            ease: "customEase",
          });
        }
      }
    }
  }, [isLayoutReversed]);

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
            disabled={activeTab === 1}
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
            disabled={activeTab === 4}
          >
            →
          </button>
        </div>
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
                src="/images/Card_07.png"
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
                src="/images/Card_08.png"
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
