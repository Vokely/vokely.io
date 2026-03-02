import { gsap } from 'gsap';

const Reveal = (ref, start = "top 80%", end = "bottom 20%") => {
  const element = ref.current;
  if (!element) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: start,
      end: end,
      scrub: true,
      markers: false,
    },
  })
  .fromTo(element, {
    y: -100,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
  });
}

export default Reveal;