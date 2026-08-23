// Kineira Health — shared behaviors

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // Animated stat counters
  if (!prefersReducedMotion) {
    const countEls = document.querySelectorAll('.count');
    function animateCount(el) {
      const target = parseFloat(el.dataset.target);
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach(el => countIO.observe(el));
  } else {
    document.querySelectorAll('.count').forEach(el => { el.textContent = el.dataset.target; });
  }

  // Body map interactivity (homepage only)
  const bodyMap = document.getElementById('bodyMapFigure');
  const panel = document.getElementById('bodyMapPanel');
  if (bodyMap && panel) {
    const regions = bodyMap.querySelectorAll('.region-hit');
    let pinned = false;

    function showPanel(region) {
      const title = region.dataset.title;
      const blurb = region.dataset.blurb;
      const concerns = region.dataset.concerns.split('|');
      const href = region.dataset.href;
      panel.innerHTML = `
        <div class="bm-panel-inner reveal in">
          <p class="eyebrow">${region.dataset.label}</p>
          <h3>${title}</h3>
          <p class="bm-blurb">${blurb}</p>
          <div class="bm-chips">${concerns.map(c => `<span>${c}</span>`).join('')}</div>
          <a href="${href}" class="btn-ghost">View programme
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>`;
    }

    function clearPanel() {
      panel.innerHTML = `<div class="bm-panel-empty">
          <p>Hover or tap a highlighted point on the figure to see how we help.</p>
        </div>`;
    }

    regions.forEach(region => {
      region.addEventListener('mouseenter', () => { if (!pinned) { showPanel(region); highlight(region); } });
      region.addEventListener('mouseleave', () => { if (!pinned) { clearPanel(); unhighlight(); } });
      region.addEventListener('focus', () => { showPanel(region); highlight(region); });
      region.addEventListener('click', (e) => {
        if (window.matchMedia('(hover: none)').matches) {
          const already = region.classList.contains('is-active');
          if (!already) {
            e.preventDefault();
            regions.forEach(unhighlightEl);
            highlight(region);
            showPanel(region);
            pinned = true;
          }
        }
      });
    });

    function highlight(region) {
      regions.forEach(unhighlightEl);
      region.classList.add('is-active');
    }
    function unhighlightEl(r) { r.classList.remove('is-active'); }
    function unhighlight() { regions.forEach(unhighlightEl); }

    clearPanel();
  }

  // Depth toggle (surface/muscle/skeletal) — homepage body map
  const depthToggle = document.getElementById('depthToggle');
  if (depthToggle) {
    const buttons = depthToggle.querySelectorAll('button');
    const silhouette = document.getElementById('bodySilhouette');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => { b.setAttribute('aria-checked', 'false'); });
        btn.setAttribute('aria-checked', 'true');
        if (silhouette) silhouette.setAttribute('data-depth', btn.dataset.depth);
      });
    });
  }

  // How-it-works connector line draw-in on scroll
  const connector = document.getElementById('stepsConnector');
  if (connector && !prefersReducedMotion) {
    const len = connector.getTotalLength();
    connector.style.strokeDasharray = len;
    connector.style.strokeDashoffset = len;
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          connector.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)';
          connector.style.strokeDashoffset = '0';
          io2.unobserve(connector);
        }
      });
    }, { threshold: 0.3 });
    io2.observe(connector);
  } else if (connector) {
    connector.style.strokeDashoffset = '0';
  }
});
