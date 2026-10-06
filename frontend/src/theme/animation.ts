export const animation = {
  duration: {
    instant: 90,
    fast: 150,
    normal: 240,
    slow: 380,
    theme: 260,
  },
  /** Scale applied while an element is pressed. */
  pressScale: {
    button: 0.97,
    card: 0.985,
    icon: 0.9,
  },
  spring: {
    gentle: { damping: 18, stiffness: 180, mass: 1 },
    snappy: { damping: 14, stiffness: 260, mass: 0.9 },
  },
};

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  header: 200,
  nav: 300,
  overlay: 800,
  modal: 900,
  toast: 1000,
};
