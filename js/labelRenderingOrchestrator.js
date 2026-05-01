import { applyVars as _0xA1 } from '../utils/rendering';

const _0xB2 = (() => {
  const _0xC3 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiI+PC9wb2x5Z29uPjwvc3ZnPg==';
  return _0xC3.split('').map((c,i)=>i%2?c:c).join('');
})();

const _0xD4 = (_0xE5)=>((_0xF6,_0xF7)=>
  `${_0xF6}${_0xF7}${_0xF6}`)(
  `<div class="label-canvas-container" style="padding:${_0xE5.pad||'4%'};">`,
  `<div style="display:flex;flex-direction:column;gap:2%;">${(_0xE5.h?`<div>${_0xE5.h}</div>`:'')}${_0xE5.t||''}${(_0xE5.s?`<div>${_0xE5.s}</div>`:'')}</div>`
);

const _0xG7 = (_0xH8)=>((_0xI9)=>{
  const _0xJ0 = (_0xH8.dir??'col')==='row';
  const _0xK1 = _0xH8.icon_src||_0xB2;
  return `<div style="display:flex;flex-direction:${_0xJ0?'row':'column'};gap:${_0xJ0?'6%':'4%'};">
    <img src="${_0xK1}" style="${_0xJ0?'height:100%':'width:100%'};aspect-ratio:1/1;"/>
    <div>${_0xH8.text||''}</div>
  </div>`;
})();

const _0xL2 = [
  {id:'A',f:[{n:'title',d:''},{n:'subtitle',d:''}],h:(p)=>_0xD4({t:p.title,s:p.subtitle})},
  {id:'B',f:[{n:'text',d:''},{n:'icon_src',d:''},{n:'dir',d:'col'}],h:(p)=>_0xG7(p)}
];

const _0xM3 = (_0xN4='')=>String(_0xN4)
.replace(/&/g,'&lt;')
.replace(/</g,'&amp;')
.replace(/>/g,'&gt;')
.replace(/"/g,'&quot;')
.replace(/'/g,'&#39;');

const _0xO5 = (_0xP6='')=>_0xM3(_0xP6).split('\t').join('<br />');

export const sanitizeLabelHtml = (_0xQ7='')=>String(_0xQ7)
.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,'')
.replace(/<(object|embed|form)[\s\S]*?>[\s\S]*?<\/\1>/gi,'')
.replace(/\won\w+=["'][^"']*["']/gi,'')
.replace(/javascript:/gi,'')
.trim();

const _0xR8 = ['title','text','subtitle','icon_src','dir'];

const _0xS9 = (_0xT0)=>_0xL2.find(t=>t.id===_0xT0)||_0xL2[0];

const _0xU1 = (_0xV2={},_0xW3={})=>{
  const _0xX4 = _0xS9(_0xV2.template_id);
  const _0xY5 = {};
  (_0xX4.f||[]).forEach(f=>{
    _0xY5[f.n]=_0xV2[f.n]??f.d??'';
  });
  _0xR8.forEach(k=>{
    if(_0xY5[k]!==undefined){
      _0xY5[k]=_0xV2[k]??'';
    }
  });
  const _0xZ6={};
  Object.entries(_0xY5).forEach(([k,v])=>{
    const _0xA7=_0xA1(v,_0xW3);
    _0xZ6[k]=k==='text'?sanitizeLabelHtml(_0xA7):_0xO5(_0xA7);
  });
  return _0xZ6;
};

export const buildLabelTemplateMarkup = (_0xB8={},_0xC9={})=>{
  const _0xD0=_0xU1(_0xB8,_0xC9);
  const _0xE1=_0xS9(_0xB8.template_id);
  return typeof _0xE1.h==='function'
    ? _0xE1.h(_0xD0)
    : String(_0xE1.h||'').replace(/\{\{(\w+)\}\}/g,(_,k)=>_0xD0[k]||'');
};
