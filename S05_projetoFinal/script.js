document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".sidebar nav ul li");
  const pages = document.querySelectorAll(".page");
  const tutorialBtn = document.getElementById("start-tutorial");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  let currentStep = 0;
  let isTutorialRunning = false;
  let currentTarget = null;

  function getTutorialSteps() {
    const base = [
      { selector: '[data-target="notas"]', message: "Clique aqui para ver suas Notas." },
      { selector: '[data-target="aulas"]', message: "Aqui você acessa suas Aulas." },
      { selector: '[data-target="frequencia"]', message: "Acompanhe sua Frequência nesta aba." },
      { selector: '[data-target="eventos"]', message: "Veja os Eventos futuros aqui." },
    ];
    if (window.innerWidth <= 768) {
      return [
        { selector: '#menu-toggle', message: "Clique primeiramente no Menu para ver as opções." },
        ...base,
      ];
    }
    return base;
  }

  function waitForVisibility(element, callback) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        callback();
      }
    }, { threshold: 0.5 });
    observer.observe(element);
  }

  function highlightStep(stepIndex) {
    const steps = getTutorialSteps();
    if (stepIndex >= steps.length) {
      stopTutorial(true);
      return;
    }

    const { selector, message } = steps[stepIndex];
    const element = document.querySelector(selector);
    if (!element) return;

    currentTarget = element;

    if (selector === '#menu-toggle' && sidebar.classList.contains('active')) {
      setTimeout(() => highlightStep(stepIndex), 300);
      return;
    }

    if (selector.includes('[data-target=') && window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
      sidebar.classList.add('active');
      setTimeout(() => highlightStep(stepIndex), 300);
      return;
    }

    document.querySelectorAll(".tutorial-tooltip").forEach(t => t.remove());
    document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));

    waitForVisibility(element, () => {
      const tooltip = document.createElement("div");
      tooltip.className = "tutorial-tooltip";
      tooltip.innerHTML = `<p>${message}</p>`;
      document.body.appendChild(tooltip);

      const rect = element.getBoundingClientRect();
      const tooltipHeight = tooltip.offsetHeight;
      const tooltipWidth = tooltip.offsetWidth;
      const padding = 12;

      let top = rect.bottom + window.scrollY + 8;
      if (top + tooltipHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - tooltipHeight - 8;
        if (top < window.scrollY + 10) top = window.scrollY + 10;
      }

      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (left < padding) left = padding;

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      element.classList.add("highlight");
    });
  }

  function startTutorial() {
    isTutorialRunning = true;
    currentStep = 0;
    tutorialBtn.innerText = "Parar Tutorial";

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
      pages.forEach(page => page.classList.remove("active"));
      document.getElementById("home").classList.add("active");
    }

    highlightStep(currentStep);
  }

  function stopTutorial(showSuccess = false) {
    isTutorialRunning = false;
    currentStep = 0;
    currentTarget = null;
    tutorialBtn.innerText = "Iniciar Tutorial";
    document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
    document.querySelectorAll(".tutorial-tooltip").forEach(t => t.remove());
    document.querySelectorAll(".error-popup").forEach(p => p.remove());

    if (showSuccess) {
      showSuccessPopup("✅ Tutorial concluído com sucesso!");
      pages.forEach(page => page.classList.remove("active"));
      document.getElementById("home").classList.add("active");
      if (window.innerWidth <= 768) sidebar.classList.remove("active");
    }
  }

  tutorialBtn.addEventListener("click", () => {
    isTutorialRunning ? stopTutorial() : startTutorial();
  });

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  document.addEventListener("click", e => {
    if (!isTutorialRunning || !currentTarget) return;

    // Permitir clicar no botão de parar tutorial
    if (e.target === tutorialBtn || tutorialBtn.contains(e.target)) {
      return;
    }

    const isCorrect = e.target === currentTarget || currentTarget.contains(e.target);

    if (!isCorrect) {
      e.preventDefault();
      e.stopPropagation();
      showErrorPopup("⚠️ Siga o passo indicado pelo tutorial para continuar.");
      return;
    }

    currentTarget.classList.remove("highlight");
    document.querySelectorAll(".tutorial-tooltip").forEach(t => t.remove());
    currentStep++;
    highlightStep(currentStep);
  }, true);

  navItems.forEach(item => {
    item.addEventListener("click", e => {
      if (isTutorialRunning) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const target = item.getAttribute("data-target");
      pages.forEach(page => page.classList.remove("active"));
      document.getElementById(target).classList.add("active");
      sidebar.classList.remove("active");
    });
  });

  function showErrorPopup(message) {
    if (document.querySelector(".error-popup")) return;

    const popup = document.createElement("div");
    popup.className = "error-popup";
    popup.innerText = message;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 2500);
  }

  function showSuccessPopup(message) {
    const popup = document.createElement("div");
    popup.className = "error-popup";
    popup.style.backgroundColor = "#003366";
    popup.style.color = "white";
    popup.innerText = message;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 2500);
  }

  // CARROSSEL
  const track = document.querySelector(".carousel-track");
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".indicator");
  let currentSlide = 0;

  function updateCarousel() {
    const slideWidth = slides[0].offsetWidth + 20;
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    indicators.forEach(ind => ind.classList.remove("active"));
    indicators[currentSlide].classList.add("active");
  }

  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoSlide();
  }

  indicators.forEach(indicator => {
    indicator.addEventListener("click", () => {
      goToSlide(parseInt(indicator.getAttribute("data-slide")));
    });
  });

  function showNextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
  }

  let carouselInterval = setInterval(showNextSlide, 5000);

  function resetAutoSlide() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(showNextSlide, 5000);
  }
});
