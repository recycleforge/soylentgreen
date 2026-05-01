import { applyVars } from '../utils/rendering';

type P = Record<string, any>;

const _e = (x: any = '') =>
  ('' + x)
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;');

const _f = (x: any = '') => _e(x).replace(/\t/g, '<br />');

export const sanitizeLabelHtml = (h = '') =>
  String(h)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<(object|embed|form)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

const _t = [
  {
    id: 'simple',
    fields: ['title', 'subtitle'],
    html: (p: P) =>
      `<div class="label"><div class="title">${p.title || ''}</div><div class="subtitle">${p.subtitle || ''}</div></div>`
  },
  {
    id: 'price',
    fields: ['product', 'price'],
    html: (p: P) =>
      `<div class="label"><div>${p.product || ''}</div><div>$${p.price || ''}</div></div>`
  }
];

const _g = (i: string) => _t.find(t => t.id === i) ?? _t[0];

const _r = (t: any, a: P = {}, b: P = {}) =>
  ((o: P = {}) => (
    t.fields.forEach((k: string) => {
      const v = a?.[k] ?? '';
      o[k] = _f(applyVars(v, b));
    }),
    o
  ))();

export const buildLabelTemplateMarkup = (i: P = {}, r: P = {}) => {
  const t = _g(i?.template_id || 'simple');
  const p = _r(t, i, r);
  return sanitizeLabelHtml(t.html(p));
};
