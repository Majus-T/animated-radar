// Radar chart configuration
const config = {
    size: 450,
    center: 250,
    levels: 5,
    maxValue: 100,
    categories: ['Speed', 'Power', 'Accuracy', 'Efficiency', 'Reliability', 'Innovation'],
    data: [
        { label: 'Dataset 1', values: [80, 65, 75, 85, 70, 60] }
    ]
};

const svg = document.getElementById('radarSVG');
const gridGroup = document.getElementById('gridGroup');
const axesGroup = document.getElementById('axesGroup');
const dataPolygon = document.getElementById('dataPolygon');
const dotsGroup = document.getElementById('dotsGroup');

let animationRunning = false;

// Initialize radar chart
function init() {
    drawGrid();
    drawAxes();
    drawData();
}

// Draw concentric circles for grid
function drawGrid() {
    gridGroup.innerHTML = '';
    const angleSlice = (Math.PI * 2) / config.categories.length;

    for (let level = 1; level <= config.levels; level++) {
        const radius = (config.size / 2) * (level / config.levels);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', config.center);
        circle.setAttribute('cy', config.center);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', 'grid-circle');
        gridGroup.appendChild(circle);

        // Add level labels
        const labelValue = Math.round((config.maxValue / config.levels) * level);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', config.center + 5);
        text.setAttribute('y', config.center - radius + 10);
        text.setAttribute('class', 'axis-label');
        text.textContent = labelValue;
        gridGroup.appendChild(text);
    }
}

// Draw axes and category labels
function drawAxes() {
    axesGroup.innerHTML = '';
    const angleSlice = (Math.PI * 2) / config.categories.length;

    config.categories.forEach((category, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = config.center + (config.size / 2) * Math.cos(angle);
        const y = config.center + (config.size / 2) * Math.sin(angle);

        // Draw axis line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', config.center);
        line.setAttribute('y1', config.center);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'axis-line');
        axesGroup.appendChild(line);

        // Draw category label
        const labelDistance = (config.size / 2) + 30;
        const labelX = config.center + labelDistance * Math.cos(angle);
        const labelY = config.center + labelDistance * Math.sin(angle);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('class', 'axis-label');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '13');
        text.setAttribute('font-weight', '600');
        text.textContent = category;
        axesGroup.appendChild(text);
    });
}

// Draw data polygon
function drawData(animated = false) {
    const angleSlice = (Math.PI * 2) / config.categories.length;
    const dataset = config.data[0];

    let points = [];
    dotsGroup.innerHTML = '';

    dataset.values.forEach((value, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const radius = (config.size / 2) * (value / config.maxValue);
        const x = config.center + radius * Math.cos(angle);
        const y = config.center + radius * Math.sin(angle);
        points.push([x, y]);

        // Draw data points
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 4);
        circle.setAttribute('class', 'data-dot');
        circle.style.opacity = animated ? '0' : '1';
        dotsGroup.appendChild(circle);
    });

    // Create polygon path
    const pathData = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ') + ' Z';
    dataPolygon.setAttribute('d', pathData);
    dataPolygon.style.opacity = animated ? '0' : '1';
}

// Animate radar chart
function animateRadar() {
    if (animationRunning) return;
    animationRunning = true;

    const angleSlice = (Math.PI * 2) / config.categories.length;
    const dataset = config.data[0];
    const duration = 1500;
    const startTime = Date.now();

    // Animate polygon and dots
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        let points = [];
        dataset.values.forEach((value, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const radius = (config.size / 2) * (value / config.maxValue) * easeProgress;
            const x = config.center + radius * Math.cos(angle);
            const y = config.center + radius * Math.sin(angle);
            points.push([x, y]);

            // Update dots
            const dot = dotsGroup.children[i];
            if (dot) {
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.style.opacity = easeProgress;
            }
        });

        // Update polygon
        const pathData = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`).join(' ') + ' Z';
        dataPolygon.setAttribute('d', pathData);
        dataPolygon.style.opacity = easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animationRunning = false;
        }
    }

    animate();
}

// Reset chart
function resetChart() {
    if (animationRunning) return;
    drawData();
}

// Event listeners
document.getElementById('animateBtn').addEventListener('click', animateRadar);
document.getElementById('resetBtn').addEventListener('click', resetChart);

// Initialize on page load
init();