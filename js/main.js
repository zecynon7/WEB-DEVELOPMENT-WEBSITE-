const toggle=document.querySelector('.navbar__toggle'),links=document.querySelector('.navbar__links');
toggle?.addEventListener('click',()=>{const open=links.classList.toggle('is-open');toggle.setAttribute('aria-expanded',open)});
document.getElementById('year')&&(document.getElementById('year').textContent=new Date().getFullYear());
