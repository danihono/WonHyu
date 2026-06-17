/* ============================================================
   WON-HYO Taekwondo Club — interações (JS puro)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Header muda no scroll ---------- */
  /* ---------- 0. Ativa animações só se o relógio de animação estiver vivo ----------
     requestAnimationFrame só dispara quando o frame está sendo pintado.
     Se o iframe estiver congelado (preview/print), nada é ocultado e o
     conteúdo permanece visível por padrão (nunca preso em opacity:0). */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("anim");
    });
  });

  const header = document.querySelector(".header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Menu mobile ---------- */
  const burger = document.querySelector(".burger");
  const body = document.body;
  burger.addEventListener("click", () => body.classList.toggle("menu-open"));
  // Fecha ao clicar em qualquer link do menu
  document.querySelectorAll(".mobile-menu a").forEach((a) =>
    a.addEventListener("click", () => body.classList.remove("menu-open"))
  );
  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") body.classList.remove("menu-open");
  });

  /* ---------- 3. Scroll suave (offset do header) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---------- 4. Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => revObserver.observe(el));

  /* ---------- 5. Contador animado dos KPIs ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const dur = 1800;
    const start = performance.now();
    // Fallback: garante o valor final mesmo se o rAF não rodar (iframe congelado)
    const safety = setTimeout(() => {
      el.textContent = target.toLocaleString("pt-BR");
    }, dur + 700);
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.floor(easeOut(p) * target);
      el.textContent = val.toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = target.toLocaleString("pt-BR"); clearTimeout(safety); }
    };
    requestAnimationFrame(step);
  };

  const kpiObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          kpiObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => kpiObserver.observe(c));

  /* ---------- 6. Partículas / luz no hero (canvas) ---------- */
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COLORS = ["rgba(91,139,255,", "rgba(255,83,102,", "rgba(255,255,255,"];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = Math.min(90, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -Math.random() * 0.5 - 0.12,
        a: Math.random() * 0.5 + 0.12,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.03;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + alpha + ")";
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.c + "0.8)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) draw();
    else { // estado estático
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.a + ")";
        ctx.fill();
      }
    }
  }

  /* ---------- 7. Parallax suave no hero ---------- */
  const heroImg = document.querySelector(".hero-bg img");
  if (heroImg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroImg.style.transform = `scale(1.06) translateY(${y * 0.18}px)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- 9. Modal (Sobre o Mestre) ---------- */
  const openers = document.querySelectorAll("[data-open-modal]");
  let lastFocused = null;

  const openModal = (modal) => {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  openers.forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(document.getElementById(btn.dataset.openModal));
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => closeModal(modal));
    });
  });

  // Fecha modal com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const open = document.querySelector(".modal.open");
      if (open) closeModal(open);
    }
  });

  /* ---------- 10. Carrossel infinito (comunidade) ---------- */
  const ctrack = document.getElementById("community-track");
  if (ctrack) {
    const originals = Array.prototype.slice.call(ctrack.children);
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      ctrack.appendChild(clone);
    });
  }

  /* ============================================================
     11. MAPA · CAMPEÃO PELO MUNDO
     ============================================================
     >>> LUGARES ONDE O MESTRE FOI CAMPEÃO <<<
     Cada país tem um marcador; "titles" lista [ano, conquista].
     tier: "gold" (Olimpíadas) · "red" (Mundial) · "blue" (demais)
     lon = longitude (-180 a 180) · lat = latitude (-90 a 90)
  */
  const champLocations = [
    { name: "Filipinas", iso: "ph", lon: 122,   lat: 13,   tier: "red",  titles: [["1995", "Mundial"]] },
    { name: "Cuba",      iso: "cu", lon: -79,   lat: 22,   tier: "blue", titles: [["1996", "Pan-Americano"]] },
    { name: "Brasil",    iso: "br", lon: -50,   lat: -12,  tier: "blue", titles: [["1996", "Copa do Mundo"], ["2003", "Pan-Americano"]] },
    { name: "Paraguai",  iso: "py", lon: -58,   lat: -23,  tier: "blue", titles: [["1997", "Sul-Americano"]] },
    { name: "Hong Kong", iso: "hk", lon: 114,   lat: 22.5, tier: "red",  titles: [["1997", "Mundial"]] },
    { name: "Egito",     iso: "eg", lon: 30,    lat: 27,   tier: "blue", titles: [["1997", "Copa do Mundo"]] },
    { name: "Alemanha",  iso: "de", lon: 10,    lat: 51,   tier: "red",  titles: [["1998", "Mundial"]] },
    { name: "Turquia",   iso: "tr", lon: 34,    lat: 39,   tier: "red",  titles: [["1998", "Mundial"]] },
    { name: "Canadá",    iso: "ca", lon: -106,  lat: 56,   tier: "red",  titles: [["1999", "Jogos Pan-Americanos"], ["2000", "Mundial"]] },
    { name: "Irlanda",   iso: "ie", lon: -8,    lat: 53,   tier: "red",  titles: [["2000", "Mundial"]] },
    { name: "Coreia",    iso: "kr", lon: 127.8, lat: 36.5, tier: "red",  titles: [["2001", "Mundial"]] },
    { name: "Grécia",    iso: "gr", lon: 22,    lat: 39,   tier: "gold", titles: [["2004", "Olimpíadas"]] },
    { name: "Espanha",   iso: "es", lon: -4,    lat: 40,   tier: "red",  titles: [["2005", "Mundial"]] },
  ];

  const mapMarkers = document.getElementById("map-markers");
  if (mapMarkers) {
    // Projeção ORTOGRÁFICA sobre a imagem do globo (assets/globo.jpg · 1672x941)
    // Calibrada visualmente: centro do globo, raio e orientação (lon/lat centrais).
    const IMG_W = 1672, IMG_H = 941;
    const G = { cx: 1150, cy: 470, R: 345, lam0: 13, phi0: 20 };
    const rad = (d) => d * Math.PI / 180;
    const L0 = rad(G.lam0), P0 = rad(G.phi0);
    const project = (lon, lat) => {
      const dl = rad(lon) - L0, p = rad(lat);
      const cosc = Math.sin(P0) * Math.sin(p) + Math.cos(P0) * Math.cos(p) * Math.cos(dl);
      const px = G.cx + G.R * Math.cos(p) * Math.sin(dl);
      const py = G.cy - G.R * (Math.cos(P0) * Math.sin(p) - Math.sin(P0) * Math.cos(p) * Math.cos(dl));
      return { xPct: (px / IMG_W) * 100, yPct: (py / IMG_H) * 100, cosc };
    };
    const FRONT = 0.16; // acima disso o ponto está na face visível do globo

    // Gera os marcadores (apenas os da face visível; os demais ficam na lista abaixo)
    let markersHTML = "";
    champLocations.forEach((p) => {
      const q = project(p.lon, p.lat);
      if (q.cosc < FRONT) return; // do outro lado do globo
      const tierClass = p.tier === "blue" ? "blue" : p.tier === "gold" ? "gold" : "";
      const rows = p.titles
        .map((t) => '<span class="tip-row"><i>' + t[0] + '</i>' + t[1] + "</span>")
        .join("");
      const aria = p.name + " — " + p.titles.map((t) => t[0] + " " + t[1]).join(", ");
      markersHTML +=
        '<button class="marker ' + tierClass + '" ' +
        'style="left:' + q.xPct.toFixed(2) + '%;top:' + q.yPct.toFixed(2) + '%" ' +
        'aria-label="' + aria + '">' +
        '<span class="ping"></span><span class="pin"></span>' +
        '<span class="tip"><b>' + p.name + "</b>" + rows + "</span>" +
        "</button>";
    });
    mapMarkers.innerHTML = markersHTML;

    // Lista cronológica achatada (ano · país · conquista)
    const flat = [];
    champLocations.forEach((p) => {
      p.titles.forEach((t) => flat.push({ year: t[0], name: p.name, note: t[1], tier: p.tier }));
    });
    flat.sort((a, b) => a.year.localeCompare(b.year));

    // Contagem
    const countEl = document.getElementById("champ-count");
    if (countEl) countEl.textContent = flat.length;
    const placesEl = document.getElementById("champ-places");
    if (placesEl) placesEl.textContent = champLocations.length;

    // Lista por país (bandeira + conquistas), ordenada pelo 1º ano
    const listEl = document.getElementById("champ-list");
    if (listEl) {
      const ordered = champLocations
        .map((p) => ({ p, first: p.titles.map((t) => t[0]).sort()[0] }))
        .sort((a, b) => a.first.localeCompare(b.first))
        .map((o) => o.p);

      listEl.innerHTML = ordered
        .map((p) => {
          const rows = p.titles
            .slice()
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map((t) => {
              const tc =
                p.tier === "blue" ? "t-blue" : p.tier === "gold" ? "t-gold" : "t-red";
              return (
                '<span class="ci-row"><i class="ci-year">' + t[0] +
                '</i><span class="ci-note ' + tc + '">' + t[1] + "</span></span>"
              );
            })
            .join("");
          const flag = (window.FLAGS && window.FLAGS[p.iso]) || "";
          return (
            '<li class="champ-item">' +
            '<span class="ci-flag" role="img" aria-label="Bandeira · ' + p.name + '">' + flag + "</span>" +
            '<span class="ci-body"><span class="ci-name">' + p.name + "</span>" +
            '<span class="ci-rows">' + rows + "</span></span>" +
            "</li>"
          );
        })
        .join("");
    }
  }

  /* ---------- 12. Filosofia: partículas + toque nos pilares ---------- */
  (function philoFx() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Toque: ativa o pilar tocado (mobile), desativa os demais
    const pillars = document.querySelectorAll(".pillar");
    pillars.forEach((p) => {
      p.addEventListener("click", (e) => {
        if (window.matchMedia("(hover: hover)").matches) return; // desktop usa :hover
        if (!p.classList.contains("is-active")) {
          e.preventDefault();
          pillars.forEach((o) => o.classList.remove("is-active"));
          p.classList.add("is-active");
        }
      });
    });

    // Partículas de fundo
    const canvas = document.getElementById("philo-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, parts, raf;
    const COLORS = ["rgba(91,139,255,", "rgba(255,83,102,", "rgba(255,255,255,"];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = Math.min(70, Math.floor((w * h) / 22000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.32 - 0.06,
        a: Math.random() * 0.4 + 0.1,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.025;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + alpha + ")";
        ctx.shadowBlur = 6; ctx.shadowColor = p.c + "0.7)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    if (!reduce) draw();
  })();

  /* ---------- 13. CTA final: parallax + partículas ---------- */
  (function ctaFx() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Parallax suave na imagem de fundo
    const ctaImg = document.querySelector(".cta-bg img");
    const ctaSection = document.getElementById("agendar");
    if (ctaImg && ctaSection && !reduce) {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = ctaSection.getBoundingClientRect();
          const vh = window.innerHeight;
          if (rect.top < vh && rect.bottom > 0) {
            const prog = (vh - rect.top) / (vh + rect.height); // 0..1
            const shift = (prog - 0.5) * 60;
            ctaImg.style.transform = "scale(1.12) translateY(" + shift.toFixed(1) + "px)";
          }
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Partículas
    const canvas = document.getElementById("cta-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, parts;
    const COLORS = ["rgba(91,139,255,", "rgba(255,83,102,", "rgba(255,255,255,"];
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const count = Math.min(60, Math.floor((w * h) / 26000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -Math.random() * 0.3 - 0.05,
        a: Math.random() * 0.4 + 0.1,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.025;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + alpha + ")";
        ctx.shadowBlur = 6; ctx.shadowColor = p.c + "0.7)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    if (!reduce) draw();
  })();

  /* ---------- 8. Ano dinâmico no footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
