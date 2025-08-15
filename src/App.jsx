import { useState, useEffect } from "react";
import { gsap } from "gsap";
import "./App.sass";

gsap.registerEase("customEase", [0.54, 0.0, 0.27, 1.0]);

function App() {
  const [count, setCount] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(1);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const getSecondImageClass = () => {
    return activeTab === 2 ? "show" : "hide";
  };

  const getFirstImageClass = () => {
    return activeTab === 2 ? "mask-up" : "";
  };

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
    } else {
      gsap.to([...topItems, ...bottomItems], {
        top: 0,
        scale: 1,
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
  }, [activeTab]);

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
