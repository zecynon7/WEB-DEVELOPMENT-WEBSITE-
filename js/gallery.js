const items=[...document.querySelectorAll('.gallery__item')],lb=document.getElementById('lightbox');
document.querySelectorAll('.filters__btn').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.filters__btn').forEach(x=>{x.classList.remove('is-active');x.classList.add('btn--ghost')});
 b.classList.add('is-active');b.classList.remove('btn--ghost');
 items.forEach(i=>i.hidden=b.dataset.filter!=='all'&&i.dataset.cat!==b.dataset.filter)}));
document.querySelectorAll('.gallery__btn').forEach(b=>b.addEventListener('click',()=>{
 lb.querySelector('img').src=b.dataset.full;lb.querySelector('img').alt=b.querySelector('img').alt;
 lb.querySelector('p').textContent=b.dataset.caption;lb.showModal()}));
lb.querySelector('.lightbox__close').addEventListener('click',()=>lb.close());
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
