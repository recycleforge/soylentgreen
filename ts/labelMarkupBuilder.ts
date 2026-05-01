import { applyVars } from '../utils/rendering';

type Params = Record<string, any>;

const escapeHtml = (v: any = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatText = (v: any = '') =>
  escapeHtml(v).replace(/\t/g, '<br />');

export const sanitizeLabelHtml = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<(object|embed|form)[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

const TEMPLATES = [
  {
    id: 'simple',
    fields: ['title', 'subtitle'],
    html: (p: Params) => `
      <div class="label">
        <div class="title">${p.title || ''}</div>
        <div class="subtitle">${p.subtitle || ''}</div>
      </div>`
  },
  {
    id: 'price',
    fields: ['product', 'price'],
    html: (p: Params) => `
      <div class="label">
        <div>${p.product || ''}</div>
        <div>$${p.price || ''}</div>
      </div>`
  }
];

const getTemplate = (id: string) =>
  TEMPLATES.find(t => t.id === id) || TEMPLATES[0];

const resolveParams = (tpl: any, item: Params = {}, record: Params = {}) => {
  const out: Params = {};

  tpl.fields.forEach((k: string) => {
    const raw = item[k] ?? '';
    const val = applyVars(raw, record);
    out[k] = formatText(val);
  });

  return out;
};

export const buildLabelTemplateMarkup = (
  item: Params = {},
  record: Params = {}
) => {
  const tpl = getTemplate(item.template_id || 'simple');
  const params = resolveParams(tpl, item, record);

  const html = tpl.html(params);
  return sanitizeLabelHtml(html);
};
