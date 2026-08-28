class AnimatedRadar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.maxRadius = Math.min(this.width, this.height) / 2 - 20;
        this.rotation = 0;
        this.rotationSpeed = 2; // degrees per frame
        this.rings = 5;
        
        // Dots management
        this.dots = [];
        this.maxDots = 3;
        this.spawnChance = 0.005; // 0.5% chance per frame
        
        // Set canvas resolution
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.animate();
    }
    
    spawnDot() {
        if (this.dots.length < this.maxDots && Math.random() < this.spawnChance) {
            // Random angle and radius for spawn
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.maxRadius * 0.8;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;
            
            // Random direction for movement
            const direction = Math.random() * Math.PI * 2;
            
            this.dots.push({
                x: x,
                y: y,
                direction: direction,
                speed: 0.5,
                detected: false
            });
        }
    }
    
    updateDots() {
        const sweepAngle = (this.rotation * Math.PI) / 180;
        const sweepWidth = 60; // degrees
        const sweepRadians = (sweepWidth * Math.PI) / 180;
        
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            
            // Check if sweep is over this dot
            const dotAngle = Math.atan2(dot.y - this.centerY, dot.x - this.centerX);
            const dotDistance = Math.sqrt(
                Math.pow(dot.x - this.centerX, 2) + Math.pow(dot.y - this.centerY, 2)
            );
            
            // Check if dot is within sweep
            const angleDiff = Math.abs(dotAngle - sweepAngle);
            const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
            
            if (normalizedDiff < sweepRadians / 2 && dotDistance < this.maxRadius) {
                dot.detected = true;
                // Move dot in its direction
                dot.x += Math.cos(dot.direction) * dot.speed;
                dot.y += Math.sin(dot.direction) * dot.speed;
            }
            
            // Remove dot if it goes out of bounds (at the edge)
            const distFromCenter = Math.sqrt(
                Math.pow(dot.x - this.centerX, 2) + Math.pow(dot.y - this.centerY, 2)
            );
            if (distFromCenter > this.maxRadius) {
                this.dots.splice(i, 1);
            }
        }
    }
    
    drawDots() {
        this.dots.forEach(dot => {
            // Draw dot
            this.ctx.fillStyle = dot.detected ? 'rgba(255, 100, 100, 0.9)' : 'rgba(0, 255, 0, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw glow if detected
            if (dot.detected) {
                this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#0d1b2a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical and horizontal lines
        const gridSize = this.width / 8;
        for (let i = 0; i <= this.width; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.height; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.width, i);
            this.ctx.stroke();
        }
    }
    
    drawRings() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.lineWidth = 1;
        
        const ringRadius = this.maxRadius / this.rings;
        for (let i = 1; i <= this.rings; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, ringRadius * i, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawCrosshair() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
        this.ctx.lineWidth = 1;
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX - this.maxRadius - 10, this.centerY);
        this.ctx.lineTo(this.centerX + this.maxRadius + 10, this.centerY);
        this.ctx.stroke();
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY - this.maxRadius - 10);
        this.ctx.lineTo(this.centerX, this.centerY + this.maxRadius + 10);
        this.ctx.stroke();
    }
    
    drawSweep() {
        const angle = (this.rotation * Math.PI) / 180;
        const sweepWidth = 60; // degrees
        const sweepAngle = (sweepWidth * Math.PI) / 180;
        
        // Create gradient for sweep
        const gradient = this.ctx.createLinearGradient(
            this.centerX,
            this.centerY,
            this.centerX + Math.cos(angle) * this.maxRadius,
            this.centerY + Math.sin(angle) * this.maxRadius
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.6)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.arc(
            this.centerX,
            this.centerY,
            this.maxRadius,
            angle - sweepAngle / 2,
            angle + sweepAngle / 2
        );
        this.ctx.closePath();
        this.ctx.fill();
        
        // Sweep outline
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.arc(
            this.centerX,
            this.centerY,
            this.maxRadius,
            angle - sweepAngle / 2,
            angle + sweepAngle / 2
        );
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawCenter() {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    animate() {
        this.drawBackground();
        this.drawGrid();
        this.drawRings();
        this.drawCrosshair();
        this.drawSweep();
        this.drawDots();
        this.drawCenter();
        
        this.spawnDot();
        this.updateDots();
        
        this.rotation += this.rotationSpeed;
        if (this.rotation >= 360) {
            this.rotation = 0;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize radar when page loads
window.addEventListener('DOMContentLoaded', () => {
    new AnimatedRadar('radarCanvas');
});