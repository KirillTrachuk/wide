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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleLayoutToggle = () => {
    setHasLayoutChanged(true);
    setIsLayoutReversed(!isLayoutReversed);
  };

  const getSecondImageClass = () => {
    return activeTab === 2 || activeTab === 3 ? "show" : "hide";
  };

  const getFirstImageClass = () => {
    return activeTab === 2 || activeTab === 3 ? "mask-up" : "";
  };

  useEffect(() => {
    const heroSectionFrame = document.querySelector(".hero-section-frame");

    if (prevActiveTab.current !== 3 && activeTab === 3) {
      gsap.set(heroSectionFrame, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      });
      gsap.to(heroSectionFrame, {
        clipPath: "polygon(0 0, 7% 0, 6% 4%, 0 5%)",
        duration: 1.5,
        ease: "customEase",
      });
    } else if (prevActiveTab.current === 3 && activeTab === 2) {
      gsap.to(heroSectionFrame, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 1.5,
        ease: "customEase",
      });
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

    if (activeTab === 2) {
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

      gsap.to(bottomItems34, {
        scale: 1.7,
        transformOrigin: "bottom left",
        duration: 1.5,
        ease: "customEase",
        stagger: 0.1,
      });

      gsap.to(bottomItem3, {
        left: 0,
        x: 0,
        y: 0,
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

      gsap.to(".hero-section-grid", {
        x: "0.5rem",
        duration: 1.5,
        ease: "customEase",
      });
    } else if (activeTab === 3) {
      const targetEl = document.querySelector(".hero-section-frame");
      const itemEl = document.querySelector(
        ".hero-section-grid-bottom__item:nth-child(3)"
      );
      if (targetEl && itemEl) {
        gsap.killTweensOf(itemEl);
        const targetRect = targetEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();
        const currentScaleX =
          parseFloat(gsap.getProperty(itemEl, "scaleX")) || 1;
        const currentScaleY =
          parseFloat(gsap.getProperty(itemEl, "scaleY")) || 1;
        const baseWidth = itemRect.width / currentScaleX;
        const baseHeight = itemRect.height / currentScaleY;
        const deltaX =
          targetRect.left +
          targetRect.width / 2 -
          (itemRect.left + itemRect.width / 2);
        const deltaY =
          targetRect.top +
          targetRect.height / 2 -
          (itemRect.top + itemRect.height / 2);
        const scaleX = targetRect.width / baseWidth;
        const scaleY = targetRect.height / baseHeight;

        gsap.to(itemEl, {
          x: deltaX,
          y: deltaY,
          scaleX,
          scaleY,
          transformOrigin: "center center",
          duration: 1.5,
          ease: "customEase",
          overwrite: "auto",
        });
      }

      gsap.to(bottomItem4, {
        left: "-1rem",
        duration: 1.5,
        ease: "customEase",
      });

      gsap.to(topItem3, {
        top: "-1rem",
        duration: 1.5,
        ease: "customEase",
      });

      gsap.to(topItem4, {
        left: "-.5rem",
        duration: 1.5,
        ease: "customEase",
      });
    } else {
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

      gsap.to(".hero-section-grid", {
        x: 0,
        duration: 1.5,
        ease: "customEase",
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!hasLayoutChanged) {
      return;
    }

    const heroSectionFrame = document.querySelector(".hero-section-frame");
    const heroSectionGrid = document.querySelector(".hero-section-grid");

    if (isLayoutReversed) {
      gsap.to(heroSectionGrid, {
        height: "3.3rem",
        duration: 0.8,
        ease: "customEase",
        onComplete: () => {
          gsap.to(heroSectionGrid, {
            x: "-100%",
            duration: 1.5,
            ease: "customEase",
            onComplete: () => {
              gsap.to(heroSectionGrid, {
                height: "710px",
                duration: 0.8,
                ease: "customEase",
              });
            },
          });
          gsap.to(heroSectionFrame, {
            x: "167%",
            duration: 1.5,
            ease: "customEase",
          });
        },
      });
    } else {
      gsap.to(heroSectionGrid, {
        height: "3.3rem",
        duration: 0.8,
        ease: "customEase",
        onComplete: () => {
          gsap.to(heroSectionGrid, {
            x: "0%",
            duration: 1.5,
            ease: "customEase",
            onComplete: () => {
              gsap.to(heroSectionGrid, {
                height: "710px",
                duration: 0.8,
                ease: "customEase",
              });
            },
          });
          gsap.to(heroSectionFrame, {
            x: "0%",
            duration: 1.5,
            ease: "customEase",
          });
        },
      });
    }
  }, [isLayoutReversed]);

  return (
    <>
      <div className="tabs-container">
        <div className="tabs">
          {[1, 2, 3, 4].map((tabNumber) => (
            <button
              key={tabNumber}
              className={`tab ${activeTab === tabNumber ? "active" : ""}`}
              onClick={() => handleTabClick(tabNumber)}
            >
              {tabNumber}
            </button>
          ))}
        </div>
        <button
          className={`layout-toggle ${isLayoutReversed ? "reversed" : ""}`}
          onClick={handleLayoutToggle}
        >
          {isLayoutReversed ? "←" : "→"}
        </button>
      </div>

      <section
        className={`hero-section ${activeTab === 2 ? "tab-2-active" : ""}`}
        onMouseMove={handleMouseMove}
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
            </div>
            <div className="hero-section-grid-bottom__item">
              <img
                className="inside-image"
                src="/images/Card_08.png"
                alt="image"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
