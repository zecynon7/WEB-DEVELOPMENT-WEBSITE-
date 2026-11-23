import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { imgUrl } from "../lib/format";
import { reduceMotion, setReady, startEngine } from "../motion/engine";
import { useFrame } from "../motion/hooks";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { IconSprite } from "./components/Icon";
import { Preloader } from "./components/Preloader";
import { ServerStatus } from "./components/ServerStatus";
import { SiteProvider, useSite, useSiteData } from "./SiteContext";
import { TransitionProvider, useTransition } from "./Transition";

function ScrollProgress() {
  const bar = useRef(null);
  useFrame((_dt, y) => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.current?.style.setProperty("--sp", docH > 0 ? (y / docH).toFixed(4) : "0");
  });
  return (
    <div className="scroll-progress" aria-hidden="true" ref={bar}>
      <i />
    </div>
  );
}

function Shell() {
  const { loaded, content } = useSiteData();
  const { brand, logo } = useSite();
  const { pathname } = useLocation();
  const { curtain } = useTransition();

  // the intro plays once per session, only when you arrive on the home page
  const [intro, setIntro] = useState(() => {
    if (pathname !== "/") return false;
    try {
      return !sessionStorage.getItem("bb-pre");
    } catch {
      return true;
    }
  });

  useEffect(() => {
    startEngine();
  }, []);
  useLayoutEffect(() => {
    if (intro && curtain.current) curtain.current.style.display = "none";
  }, []); // eslint-disable-line

  // lift the curtain once the page for this route is on screen
  useEffect(() => {
    if (!loaded || intro) return;
    const c = curtain.current;
    if (!c || reduceMotion) {
      setReady(true);
      return;
    }
    if (c.classList.contains("is-open")) {
      // back / forward button: no sweep, just replay the entrance
      window.scrollTo(0, 0);
      setReady(false);
      const t = window.setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
    let t = 0;
    const open = () =>
      requestAnimationFrame(() => {
        c.classList.remove("is-closing");
        c.classList.add("is-open");
        t = window.setTimeout(() => setReady(true), 480);
      });
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 900))]).then(open);
    return () => clearTimeout(t);
  }, [loaded, pathname, intro, curtain]);

  const finishIntro = () => {
    const c = curtain.current;
    if (c) {
      c.style.transition = "none";
      c.classList.add("is-open");
      void c.offsetWidth;
      c.style.display = "";
      c.style.transition = "";
    }
    setIntro(false);
  };

  const logoSrc = imgUrl(logo, 160);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <div className="ambient" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="page-curtain" aria-hidden="true" ref={curtain}>
        <div className="page-curtain__logo">
          {logoSrc && <img src={logoSrc} alt="" />}
          {brand && <p>{brand.toUpperCase()}</p>}
        </div>
      </div>
      <IconSprite />
      {!loaded && (reduceMotion || !intro) && <ServerStatus />}
      {intro && <Preloader assetsReady={loaded} brand={brand} heroSrc={imgUrl(content.home?.hero_image, 1600)} onDone={finishIntro} />}
      {loaded && (
        <>
          <Header />
          <main id="main">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}

export default function SiteLayout() {
  return (
    <SiteProvider>
      <TransitionProvider>
        <Shell />
      </TransitionProvider>
    </SiteProvider>
  );
}
