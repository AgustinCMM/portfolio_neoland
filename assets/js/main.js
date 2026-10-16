/* ============================================================================
   Agustín Massa — Portfolio
   JavaScript propio, sin dependencias adicionales.

   Funciones:
     1. Año actual en el pie de página (obtenido del entorno de ejecución).
     2. Estado activo del enlace de navegación correspondiente a la sección visible.
     3. Cierre del menú móvil al pulsar un enlace interno.

   Bootstrap 5.3.8 (bundle con Popper) se carga antes que este archivo y gestiona
   el plegado del menú. Este script solo lo usa para cerrarlo y comprueba que
   esté disponible antes de hacerlo.
   ============================================================================ */
(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. Año actual del pie de página
     ------------------------------------------------------------------------- */
  var yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------------------------------------------------------------------------
     Preparación de la navegación
     ------------------------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.am-nav-link')
  );

  var linksBySectionId = {};
  var sections = [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') {
      return;
    }

    var section = document.getElementById(href.slice(1));
    if (!section) {
      return;
    }

    linksBySectionId[section.id] = link;
    sections.push(section);
  });

  /* -------------------------------------------------------------------------
     3. Cierre del menú móvil al navegar a una sección
     ------------------------------------------------------------------------- */
  var collapse = document.getElementById('menuPrincipal');
  var internalLinks = document.querySelectorAll('#menuPrincipal a[href^="#"]');

  Array.prototype.forEach.call(internalLinks, function (link) {
    link.addEventListener('click', function () {
      if (!collapse || !collapse.classList.contains('show')) {
        return;
      }

      if (window.bootstrap && window.bootstrap.Collapse) {
        window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    });
  });

  /* -------------------------------------------------------------------------
     2. Enlace activo según la sección visible
     ------------------------------------------------------------------------- */
  if (!sections.length) {
    return;
  }

  var header = document.querySelector('.am-header');
  var ticking = false;
  var activeId = null;

  function setActive(id) {
    if (id === activeId) {
      return;
    }

    activeId = id;

    navLinks.forEach(function (link) {
      var isActive = link === linksBySectionId[id];
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActive() {
    ticking = false;

    /* Se considera activa la última sección cuyo borde superior ha pasado por
       debajo de la cabecera fija. */
    var offset = (header ? header.offsetHeight : 72) + 24;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= offset) {
        current = section;
      }
    });

    /* Al llegar al final del documento se activa siempre la última sección,
       que de otro modo podría no alcanzar la línea de la cabecera. */
    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    if (atBottom) {
      current = sections[sections.length - 1];
    }

    setActive(current.id);
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateActive);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  updateActive();
})();
