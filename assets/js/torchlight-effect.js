// Gestione del loading screen
document.addEventListener('DOMContentLoaded', function() {
  // Aggiungi classe loading al body per prevenire scroll
  document.body.classList.add('loading');
  
  // Rimuovi classe loading dopo che l'animazione è completata
  setTimeout(() => {
    document.body.classList.remove('loading');
    
    // Rimuovi completamente l'overlay dopo l'animazione
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      setTimeout(() => {
        loadingOverlay.remove();
      }, 800); // Aspetta che l'animazione di fade sia completata
    }
  }, 2300); // Timing sincronizzato con l'animazione CSS
});

// Improved torchlight hover effect for all elements with .link class
const buttons = document.querySelectorAll('.link');

buttons.forEach(button => {
  // Create or get the light element
  let lightElement = button.querySelector('.torchlight');
  if (!lightElement) {
    lightElement = document.createElement('div');
    lightElement.className = 'torchlight';
    button.appendChild(lightElement);
  }

  button.addEventListener('mouseenter', () => {
    // Show the light when mouse enters
    lightElement.style.opacity = '1';
    lightElement.style.transition = 'opacity 0.2s ease-in';
  });

  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    // Offset the light position slightly to the right (adjust the +15 value as needed)
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top;
    
    // Update position immediately without transition for smooth following
    lightElement.style.transition = 'none';
    lightElement.style.left = `${x}px`;
    lightElement.style.top = `${y}px`;
  });

  button.addEventListener('mouseleave', () => {
    // Add blur and fade out effect when mouse leaves
    lightElement.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';
    lightElement.style.opacity = '0';
    lightElement.style.filter = 'blur(20px)';
    
    // Reset blur after transition
    setTimeout(() => {
      lightElement.style.filter = 'blur(0px)';
    }, 600);
  });
});

// Star Trail Effect with Physics
class StarTrail {
  constructor() {
    this.stars = [];
    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
    this.isMoving = false;
    this.lastTime = Date.now();
    this.velocity = { x: 0, y: 0 };
    this.friction = 0.95;
    this.pushForce = 0.3;
    this.trailPositions = []; // Memorizza le posizioni passate del cursore
    this.maxTrailLength = 8; // Lunghezza della scia
    
    this.init();
  }

  init() {
    // Create star trail container
    this.container = document.createElement('div');
    this.container.className = 'star-trail';
    document.body.appendChild(this.container);

    // Event listeners
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseout', () => this.handleMouseOut());
    
    // Start animation loop
    this.animate();
  }

  handleMouseMove(e) {
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    
    // Update mouse position
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // Calculate velocity
    if (deltaTime > 0) {
      this.velocity.x = (this.mouse.x - this.mouse.prevX) / deltaTime * 10;
      this.velocity.y = (this.mouse.y - this.mouse.prevY) / deltaTime * 10;
    }

    // Aggiungi posizione corrente alla scia
    this.trailPositions.unshift({ x: this.mouse.x, y: this.mouse.y, time: now });
    
    // Mantieni solo le ultime N posizioni
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.pop();
    }

    this.isMoving = true;
    this.lastTime = now;

    // Crea stelle solo se il cursore si sta muovendo abbastanza velocemente
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > 0.5) {
      this.createStarsAlongTrail();
    }
  }

  handleMouseOut() {
    this.isMoving = false;
  }

  createStarsAlongTrail() {
    // Calcola la velocità corrente
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    
    // Non generare stelle se la velocità è troppo bassa
    if (speed < 2.4) return;
    
    // Crea stelle solo dietro al cursore (primi punti della scia)
    for (let i = 1; i < this.trailPositions.length; i++) {
        const pos = this.trailPositions[i];
        
        // Probabilità ridotta e che diminuisce verso la fine della scia
        const probability = (this.maxTrailLength - i) / this.maxTrailLength * 0.2;
        
        if (Math.random() < probability) {
            this.createStarAt(pos.x, pos.y, i);
        }
    }
}


  createStarAt(x, y, trailIndex) {
    // Create star element
    const star = document.createElement('div');
    star.className = Math.random() > 0.5 ? 'star-particle medium' : 'star-particle small';
    
    // Random offset per aspetto più naturale, ma più piccolo per seguire la scia
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    
    // Physics properties - svanimento con sfocatura dopo timeout
    const starObj = {
      element: star,
      x: x + offsetX,
      y: y + offsetY,
      vx: -this.velocity.x * 0.05 + (Math.random() - 0.5) * 1,
      vy: -this.velocity.y * 0.05 + (Math.random() - 0.5) * 1,
      creationTime: Date.now(),
      fadeStartTime: null, // Segna quando inizia la sfocatura
      size: Math.random() > 0.5 ? 3 : 2
    };

    // Set initial position e opacità - inizialmente senza transizioni
    star.style.left = starObj.x + 'px';
    star.style.top = starObj.y + 'px';
    star.style.opacity = '0.9';
    star.style.filter = 'blur(0px)';
    star.style.transition = 'none'; // Inizialmente nessuna transizione

    this.container.appendChild(star);
    this.stars.push(starObj);
  }

  updateStars() {
    const currentTime = Date.now();
    
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      const age = currentTime - star.creationTime;
      
      // Apply physics
      star.vx *= this.friction;
      star.vy *= this.friction;
      
      // Check for mouse push effect
      const dx = star.x - this.mouse.x;
      const dy = star.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 50 && this.isMoving) {
        // Push effect
        const pushX = (dx / distance) * this.pushForce;
        const pushY = (dy / distance) * this.pushForce;
        star.vx += pushX;
        star.vy += pushY;
      }

      // Update position
      star.x += star.vx;
      star.y += star.vy;
      star.element.style.left = star.x + 'px';
      star.element.style.top = star.y + 'px';
      
      // Gestione timeout ridotto - svanimento con effetto sfocatura finale
      if (age >= 500 && !star.fadeStartTime) { // Scomparsa dopo mezzo secondo
        // Applica sfocatura finale prima di rimuovere
        star.element.style.filter = 'blur(4px)';
        star.element.style.opacity = '0.1';
        star.element.style.transition = 'filter 0.2s ease-out, opacity 0.2s ease-out';
        
        star.fadeStartTime = currentTime;
        
        // Rimuovi dopo l'animazione di sfocatura
        setTimeout(() => {
          if (star.element.parentNode) {
            star.element.parentNode.removeChild(star.element);
          }
          // Trova e rimuovi dalla array (potrebbe essere in posizione diversa dopo 200ms)
          const index = this.stars.indexOf(star);
          if (index > -1) {
            this.stars.splice(index, 1);
          }
        }, 200);
        
        continue; // Salta il resto dell'elaborazione per questa stella
      }
    }
  }

  animate() {
    this.updateStars();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize star trail when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StarTrail();
});