/**
 * SUFFO ARCHITECTURE — INTERACTION CONTROLLER
 * Handles dynamic cursor preview tracking, 3D card tilt, live search,
 * scrollspy, real-time studio clock, and animated metric counters.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. REAL-TIME LIVE STUDIO CLOCK (UTC+1 Central European / Studio Time)
  // ----------------------------------------------------
  const liveClock = document.getElementById('liveClock');
  if (liveClock) {
    const updateTime = () => {
      const now = new Date();
      // Format as 2-digit HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${hours}:${minutes}:${seconds}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // ----------------------------------------------------
  // 2. SMART CURSOR-FOLLOWING ACCORDION PREVIEW
  // ----------------------------------------------------
  const accordionContainer = document.querySelector('.collection-interactive-container');
  const accordionItems = document.querySelectorAll('.accordion-item');
  const previewBox = document.getElementById('hoverPreview');
  const previewImg = document.getElementById('previewImg');
  const previewMeta = document.getElementById('previewMeta');

  if (accordionContainer && previewBox && previewImg) {
    let mousePos = { x: 0, y: 0 };
    let previewPos = { x: 0, y: 0 };
    let isHoveringList = false;
    let animFrameId = null;

    // Linear Interpolation Helper for Silky Smooth Physics
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const updatePreviewPosition = () => {
      if (!isHoveringList) return;

      // Smoothly interpolate current preview position towards target mouse position
      previewPos.x = lerp(previewPos.x, mousePos.x + 30, 0.12);
      previewPos.y = lerp(previewPos.y, mousePos.y - 100, 0.12);

      previewBox.style.transform = `translate3d(${previewPos.x}px, ${previewPos.y}px, 0)`;
      animFrameId = requestAnimationFrame(updatePreviewPosition);
    };

    accordionItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        // Toggle active row highlight
        accordionItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Extract metadata and image
        const imgUrl = item.getAttribute('data-image');
        const title = item.getAttribute('data-title');
        const spec = item.getAttribute('data-spec');

        if (imgUrl) {
          previewImg.src = imgUrl;
        }

        if (previewMeta && title && spec) {
          previewMeta.innerHTML = `
            <span class="prev-title">${title}</span>
            <span class="prev-spec">${spec}</span>
          `;
        }

        if (!isHoveringList) {
          isHoveringList = true;
          previewBox.classList.add('visible');
          cancelAnimationFrame(animFrameId);
          animFrameId = requestAnimationFrame(updatePreviewPosition);
        }
      });
    });

    accordionContainer.addEventListener('mousemove', (e) => {
      const containerRect = accordionContainer.getBoundingClientRect();
      mousePos.x = e.clientX - containerRect.left;
      mousePos.y = e.clientY - containerRect.top;
    });

    accordionContainer.addEventListener('mouseleave', () => {
      isHoveringList = false;
      previewBox.classList.remove('visible');
      cancelAnimationFrame(animFrameId);
    });
  }

  // ----------------------------------------------------
  // 3. 3D DISCOVERY CARD STACK PARALLAX TILT
  // ----------------------------------------------------
  const cardsStack = document.getElementById('cardsStack');
  const cardFront = document.querySelector('.card-front');
  const cardBack = document.querySelector('.card-back');

  if (cardsStack && cardFront && cardBack) {
    cardsStack.addEventListener('mousemove', (e) => {
      const rect = cardsStack.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      // Dynamic tilt calculations
      const frontRotate = -5 + normX * 12;
      const backRotate = 5 - normX * 10;
      const frontY = 90 + normY * 15;
      const backY = 10 - normY * 15;

      cardFront.style.transform = `rotate(${frontRotate}deg) translateY(${frontY - 90}px) scale(1.02)`;
      cardBack.style.transform = `rotate(${backRotate}deg) translateY(${backY - 10}px)`;
    });

    cardsStack.addEventListener('mouseleave', () => {
      cardFront.style.transform = 'rotate(-5deg) translateY(0) scale(1)';
      cardBack.style.transform = 'rotate(5deg) translateY(0)';
    });
  }

  // ----------------------------------------------------
  // 4. PROPERTY SEARCH & CATEGORY FILTERING
  // ----------------------------------------------------
  const filterPills = document.querySelectorAll('.filter-pill[data-filter]');
  const searchInput = document.getElementById('searchInput');
  const stackCards = document.querySelectorAll('.skew-card');

  const filterCards = () => {
    const activePill = document.querySelector('.filter-pill.active');
    const selectedFilter = activePill ? activePill.getAttribute('data-filter') : 'all';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    stackCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const contentText = card.textContent.toLowerCase();

      const matchesFilter = (selectedFilter === 'all') || (category === selectedFilter);
      const matchesQuery = query === '' || title.includes(query) || contentText.includes(query);

      if (matchesFilter && matchesQuery) {
        card.style.opacity = '1';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.opacity = '0.35';
        card.style.filter = 'grayscale(80%)';
      }
    });
  };

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  // ----------------------------------------------------
  // 5. ANIMATED YEAR METRIC COUNTER (IntersectionObserver)
  // ----------------------------------------------------
  const specYear = document.getElementById('specYear');
  if (specYear) {
    let hasAnimated = false;
    const animateCounter = () => {
      if (hasAnimated) return;
      hasAnimated = true;
      let start = 1990;
      const target = 2024;
      const duration = 1200;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out
        const currentVal = Math.floor(start + (target - start) * easeProgress);
        specYear.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          specYear.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(specYear);
    } else {
      animateCounter();
    }
  }

  // ----------------------------------------------------
  // 6. ACTIVE NAVIGATION SCROLLSPY
  // ----------------------------------------------------
  const navPills = document.querySelectorAll('.nav-pill');
  const sections = document.querySelectorAll('section[id], div[id="home"], footer[id]');

  if (sections.length > 0 && navPills.length > 0) {
    const onScroll = () => {
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navPills.forEach(pill => {
            const href = pill.getAttribute('href');
            if (href === `#${sectionId}`) {
              navPills.forEach(p => p.classList.remove('active'));
              pill.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ----------------------------------------------------
  // 7. SHORTLIST / FAVORITE TOGGLE BUTTONS
  // ----------------------------------------------------
  const addButtons = document.querySelectorAll('.add-circle-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btn.querySelector('.btn-icon');

      if (btn.classList.contains('saved')) {
        btn.classList.remove('saved');
        if (icon) icon.textContent = '+';
        btn.style.backgroundColor = 'var(--text-dark)';
        btn.style.color = '#fff';
      } else {
        btn.classList.add('saved');
        if (icon) icon.textContent = '✓';
        btn.style.backgroundColor = 'var(--accent-lime)';
        btn.style.color = '#000';
      }
    });
  });

  // ----------------------------------------------------
  // 8. INTERACTIVE GLASS HOTSPOTS
  // ----------------------------------------------------
  const glassTags = document.querySelectorAll('.glass-tag');
  glassTags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('expanded');
    });
  });
});
