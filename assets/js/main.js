const root = document.documentElement;
root.classList.add('js');

const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
};
burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });
} else {
  items.forEach((el) => el.classList.add('in'));
}

const coupon = document.getElementById('cupon');
const couponEnds = new Date('2026-12-17T00:00:00-05:00');
if (coupon && typeof coupon.showModal === 'function' && new Date() < couponEnds) {
  const seen = () => { try { return sessionStorage.getItem('cupon-visto'); } catch (e) { return null; } };
  const close = () => {
    try { sessionStorage.setItem('cupon-visto', '1'); } catch (e) { /* private mode */ }
    coupon.close();
  };
  coupon.querySelector('[data-close]').addEventListener('click', close);
  coupon.querySelector('.btn').addEventListener('click', close);
  coupon.addEventListener('click', (e) => { if (e.target === coupon) close(); });
  coupon.addEventListener('cancel', () => { try { sessionStorage.setItem('cupon-visto', '1'); } catch (e) { /* noop */ } });
  if (!seen()) setTimeout(() => coupon.showModal(), 1200);
}

document.getElementById('year').textContent = new Date().getFullYear();
