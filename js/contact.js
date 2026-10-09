const f=document.getElementById('contact-form'),s=document.getElementById('form-status');
f.addEventListener('submit',e=>{e.preventDefault();let ok=true;
 f.querySelectorAll('[required]').forEach(i=>{const bad=!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value));i.classList.toggle('is-invalid',bad);if(bad)ok=false});
 s.textContent=ok?'Thank you! Your message has been sent.':'Please fill in all required fields with valid information.';
 if(ok)f.reset()});
