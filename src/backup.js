(() => {
  let currentPage = 0;
  let touchstartY = 0;
  let touchendY = 0;
  let activePage = null;
  let previousPage = null;

  const pages = document.querySelectorAll('.mt-vs__content');
  const container = document.querySelector('.mt-vs__container');
  const bullets = document.querySelectorAll('.mt-vs__bullet');

  activePage = pages[0];

  function debounce(func, timeout = 25) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  const processChange = debounce((e) => printBoundingClient(e));

  const printBoundingClient = (e) => {
    if (activePage.scrollTop === 0 && e.deltaY < 0) {
      getPreviousPage();
      return;
    }

    if (activePage.offsetHeight + activePage.scrollTop >= activePage.scrollHeight) {
      getNextPage();
      return;
    }
  };

  const setBullet = (activeIndex) => {
    bullets.forEach((bullet, index) => {
      if (index !== activeIndex) bullet.classList.remove('mt-vs__bullet--active');
      else bullet.classList.add('mt-vs__bullet--active');
    });
  };

  const getNextPage = () => {
    container.removeEventListener('wheel', processChange);
    if (currentPage < pages.length - 1) {
      console.log('get next page');

      pages[currentPage].classList.remove('mt-vs__content--active');
      pages[++currentPage].classList.add('mt-vs__content--active');
      previousPage = activePage;
      activePage = pages[currentPage];
      if (!previousPage.classList.contains('slide-top')) previousPage.classList.add('slide-top');
      if (previousPage.classList.contains('slide-bottom')) previousPage.classList.remove('slide-bottom');
      activePage.scroll(0, 0);
      setBullet(currentPage);
    } else container.addEventListener('wheel', processChange);
  };

  const getPreviousPage = () => {
    container.removeEventListener('wheel', processChange);
    if (currentPage > 0) {
      console.log('get previous page');

      pages[currentPage].classList.remove('mt-vs__content--active');
      pages[--currentPage].classList.add('mt-vs__content--active');
      previousPage = activePage;
      activePage = pages[currentPage];

      if (!previousPage.classList.contains('slide-bottom')) previousPage.classList.add('slide-bottom');
      activePage.scroll(0, 0);
      setBullet(currentPage);
    } else container.addEventListener('wheel', processChange);
  };

  container.addEventListener('wheel', processChange);

  window.document.addEventListener('transitionend', (event) => {
    if (event.target && event.target.classList.contains('mt-vs__content')) {
      container.addEventListener('wheel', processChange);
    }
  });

  container.addEventListener('touchstart', (e) => {
    touchstartY = e.changedTouches[0].screenY;
  });

  container.addEventListener('touchend', (e) => {
    touchendY = e.changedTouches[0].screenY;
    if (container.offsetHeight >= container.scrollHeight) {
      if (touchendY < touchstartY) getNextPage();
      if (touchendY > touchstartY) getPreviousPage();
    } else getPreviousPage();
  });
})();