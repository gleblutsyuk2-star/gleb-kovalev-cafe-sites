/* Yandex Metrika counter for gleb-kovalev-cafe-sites.vercel.app */
(function (m, e, t, r, i, k, a) {
  m[i] = m[i] || function () {
    (m[i].a = m[i].a || []).push(arguments);
  };
  m[i].l = Date.now();

  for (var j = 0; j < document.scripts.length; j += 1) {
    if (document.scripts[j].src === r) return;
  }

  k = e.createElement(t);
  a = e.getElementsByTagName(t)[0];
  k.async = true;
  k.src = r;
  a.parentNode.insertBefore(k, a);
})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=112585768", "ym");

ym(112585768, "init", {
  ssr: true,
  clickmap: true,
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce: true,
  trackLinks: true
});
