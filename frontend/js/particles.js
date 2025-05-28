tsParticles.load("tsparticles", {
  fullScreen: { enable: true, zIndex: -1 },
  background: {
    color: { value: "transparent" }
  },
  particles: {
    number: { value: 60 },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: {
      value: 0.3,
      random: true
    },
    size: {
      value: { min: 1, max: 3 }
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      straight: false,
      outModes: "out"
    }
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse"
      }
    },
    modes: {
      repulse: {
        distance: 70
      }
    }
  }
});
