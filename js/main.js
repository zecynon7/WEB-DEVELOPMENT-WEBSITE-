// Shared by every page: phone menu button and the year in the footer
function toggleMenu() {
  const nav = document.getElementById("nav");
  const button = document.querySelector(".menu-button");
  const isOpen = nav.classList.toggle("open");
  button.setAttribute("aria-expanded", isOpen);
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}
}

// Smooth scroll animations on load and scroll
document.addEventListener('DOMContentLoaded', function() {
  // Add animation classes to elements as they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  document.querySelectorAll('.section, .card, .grid > div').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});

// Add parallax scroll effect to hero image
window.addEventListener('scroll', function() {
  const heroImg = document.querySelector('.photo-hero');
  if (heroImg) {
    const scrollPos = window.scrollY;
    heroImg.style.transform = `translateY(${scrollPos * 0.3}px)`;
  }
});

// Smooth hover effect for links
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', function() {
    this.style.textShadow = '0 0 10px rgba(163, 74, 25, 0.2)';
  });
  link.addEventListener('mouseleave', function() {
    this.style.textShadow = 'none';
  });
});
