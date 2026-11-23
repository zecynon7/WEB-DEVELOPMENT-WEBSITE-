/** The loading animation: glowing core, two counter-rotating rings, a dashed halo and two orbiting beads.
 *  Put anything (the coffee cup) inside and it sits in the middle. Pure CSS, see "LOADER" in styles/motion.css. */
export function Spinner({ children }) {
  return (
    <div className="loader" aria-hidden="true">
      <i className="loader__glow" />
      <i className="loader__ring loader__ring--a" />
      <i className="loader__ring loader__ring--b" />
      <i className="loader__ring loader__ring--c" />
      <i className="loader__orbit loader__orbit--1" />
      <i className="loader__orbit loader__orbit--2" />
      {children}
    </div>
  );
}