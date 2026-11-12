(() => {
  const nav = document.querySelector('.chapters');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  const end = document.getElementById('sources');
  let current = null;
  let pending = false;

  function update() {
    pending = false;
    const navHeight = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--chapters-height', `${navHeight}px`);
    const readingLine = navHeight + 48;
    let index = -1;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= readingLine) index = i;
    });
    if (end.getBoundingClientRect().top <= readingLine) index = -1;
    const next = links[index] || null;
    if (next === current) return;
    if (current) current.removeAttribute('aria-current');
    current = next;
    if (current) {
      current.setAttribute('aria-current', 'location');
      const left = current.offsetLeft - nav.offsetLeft;
      if (left < nav.scrollLeft) nav.scrollLeft = left;
      else if (left + current.offsetWidth > nav.scrollLeft + nav.clientWidth) {
        nav.scrollLeft = left + current.offsetWidth - nav.clientWidth;
      }
    }
  }
  const schedule = () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('load', schedule);
  schedule();
})();
