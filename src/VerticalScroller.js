import { htmlToElement, debounce } from './utils/helper';

export default class VerticalScroller {
  bullets = [];
  templates = {
    bullet: /*html*/ `<li class="mt-vs__bullet"></li>`,
  };

  constructor() {
    this.currentPage = 0;
    this.touchstartY = 0;
    this.touchendY = 0;
    this.activePage = null;
    this.previousPage = null;
    this.switchPageDebounced = debounce((event) => this.switchPage(event));
    this.init();
  }

  init() {
    this.pages = document.querySelectorAll('.mt-vs__content');
    this.activePage = this.pages[0];
    this.container = document.querySelector('.mt-vs__container');
    this.addBullets();

    this.container.addEventListener('wheel', this.switchPageDebounced);

    window.document.addEventListener('transitionend', (event) => {
      if (event.target && event.target.classList.contains('mt-vs__content')) {
        this.container.addEventListener('wheel', this.switchPageDebounced);
      }
    });

    this.container.addEventListener('touchstart', (event) => {
      this.touchstartY = event.changedTouches[0].screenY;
    });

    this.container.addEventListener('touchend', (event) => {
      this.touchendY = event.changedTouches[0].screenY;
      if (this.container.offsetHeight >= this.container.scrollHeight) {
        if (this.touchendY < this.touchstartY) this.setPage(+1);
        if (this.touchendY > this.touchstartY) this.setPage(-1);
      } else this.setPage(-1);
    });
  }

  addBullets() {
    for (let i = 0; i < this.pages.length; i++) {
      const bullet = htmlToElement(this.templates.bullet);

      bullet.addEventListener('click', () => {
        this.scrollTo(i);
      });

      if (i === 0) bullet.classList.add('mt-vs__bullet--active');

      this.bullets.push(this.container.querySelector('.mt-vs__navigation ul').insertAdjacentElement('beforeend', bullet));
    }
  }

  setActiveBullet(activeIndex) {
    this.bullets.forEach((bullet, index) => {
      if (index !== activeIndex) bullet.classList.remove('mt-vs__bullet--active');
      else bullet.classList.add('mt-vs__bullet--active');
    });
  }

  setPage(addend) {
    this.container.removeEventListener('wheel', this.switchPageDebounced);
    if ((this.currentPage < this.pages.length - 1 && addend === 1) || (this.currentPage > 0 && addend === -1)) {
      this.pages[this.currentPage].classList.remove('mt-vs__content--active');
      this.currentPage = this.currentPage + addend;
      this.pages[this.currentPage].classList.add('mt-vs__content--active');
      this.previousPage = this.activePage;
      this.activePage = this.pages[this.currentPage];

      if (addend > 0) {
        if (!this.previousPage.classList.contains('slide-top')) this.previousPage.classList.add('slide-top');
        if (this.previousPage.classList.contains('slide-bottom')) this.previousPage.classList.remove('slide-bottom');
      } else {
        if (!this.previousPage.classList.contains('slide-bottom')) this.previousPage.classList.add('slide-bottom');
      }

      this.activePage.scroll(0, 0);
      this.setActiveBullet(this.currentPage);
    } else this.container.addEventListener('wheel', this.switchPageDebounced);
  }

  scrollTo(targetPage) {
    if (this.currentPage === targetPage) return;

    const difference = Math.abs(targetPage - this.currentPage);
    const addend = targetPage - this.currentPage > 0 ? 1 : -1;
    let transitionSpeed = 1 / difference;

    if(difference >= 3)
      transitionSpeed = 0.4;
    else if(difference >= 2)
    transitionSpeed = 0.5;
    else if(difference >= 1)
      transitionSpeed = 1;

    this.container.style.setProperty('--transition-speed', transitionSpeed + 's');

    for (let i = 0; i < difference; i++) {
      setTimeout(() => {
        this.setPage(addend);
      }, i * ((transitionSpeed * 1000 ) + 50));
    }
  }

  switchPage = (event) => {
    if (this.activePage.scrollTop === 0 && event.deltaY < 0) {
      this.setPage(-1);
      return;
    }

    if (this.activePage.offsetHeight + this.activePage.scrollTop >= this.activePage.scrollHeight) this.setPage(1);
  };
}