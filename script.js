window.onerror = function(msg, url, line, col, error) {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;';
    errDiv.innerHTML = 'ERROR: ' + msg + '<br>Line: ' + line + '<br>Col: ' + col;
    document.body.appendChild(errDiv);
};

document.addEventListener('DOMContentLoaded', () => {

    // ── Whiteboard Logic ──
    document.querySelectorAll('.wb-canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const toolbar = canvas.previousElementSibling;
        let currentTool = 'pen';
        
        toolbar.querySelectorAll('.wb-tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                if (tool === 'clear') {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                } else {
                    currentTool = tool;
                    toolbar.querySelectorAll('.wb-tool').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        canvas.addEventListener('pointerdown', (e) => {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(getPos(e).x, getPos(e).y);
            draw(e);
        });

        canvas.addEventListener('pointermove', (e) => {
            if (isDrawing) draw(e);
        });

        const stop = () => {
            isDrawing = false;
            ctx.beginPath();
        };
        canvas.addEventListener('pointerup', stop);
        canvas.addEventListener('pointerout', stop);

        function draw(e) {
            const pos = getPos(e);
            ctx.lineWidth = currentTool === 'erase' ? 40 : 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (currentTool === 'erase') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#0047ab'; // blue pen
            }
            
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    });

    // ── State ──
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide'); // Now includes generated whiteboards
    const navList = document.getElementById('nav-list');
    const totalSlidesSpan = document.getElementById('total-slides');
    const currSlideSpan = document.getElementById('curr-slide');
    const progressBar = document.getElementById('progress-bar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // ── Sidebar Toggle ──
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });

    // ── Populate Sidebar ──
    slides.forEach((slide, i) => {
        const title = slide.getAttribute('data-title') || `Slide ${i + 1}`;
        const li = document.createElement('li');
        li.className = `nav-item${i === 0 ? ' active' : ''}`;
        li.textContent = `→  ${title}`;
        li.onclick = () => goToSlide(i);
        navList.appendChild(li);
    });
    totalSlidesSpan.textContent = slides.length;

    // ── Navigation ──
    const goToSlide = (index) => {
        if (index < 0 || index >= slides.length) return;
        slides[currentSlide].classList.remove('active');
        document.querySelectorAll('.nav-item')[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        document.querySelectorAll('.nav-item')[currentSlide].classList.add('active');
        updateUI();
    };

    const updateUI = () => {
        currSlideSpan.textContent = currentSlide + 1;
        progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === slides.length - 1;
    };

    nextBtn.onclick = () => goToSlide(currentSlide + 1);
    prevBtn.onclick = () => goToSlide(currentSlide - 1);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSlide(currentSlide + 1);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToSlide(currentSlide - 1);
    });

    // ── Simulation Engine ──
    window.simulate = (type) => {
        const canvasId = (type === 'matrix') ? 'matrix-exec' : (type === 'list') ? 'list-exec' : `${type}-exec`;
        const logId = `${type}-log`;
        const canvas = document.getElementById(canvasId);
        const log = document.getElementById(logId);
        if (!canvas) return;

        if (type === 'matrix') { renderMatrix(canvas); return; }
        if (type === 'list') { renderList(canvas); return; }

        canvas.innerHTML = '';
        if (log) log.textContent = '> Compiling graph object...';

        setTimeout(() => {
            if (log) log.textContent = '> Allocating vertices A, B, C...';
            setTimeout(() => {
                if (log) log.textContent = `> [SUCCESS] ${type.toUpperCase()} graph built. Rendering...`;
                renderGraph(canvas, type);
            }, 500);
        }, 400);
    };

    // ── Matrix Visual ──
    const renderMatrix = (el) => {
        el.innerHTML = `
        <table style="border-collapse:collapse; font-family:var(--font-mono); font-size:1.4rem; text-align:center;">
            <tr><th style="padding:12px 18px; background:#0047ab; color:#fff;"></th><th style="padding:12px 18px; background:#0047ab; color:#fff;">A</th><th style="padding:12px 18px; background:#0047ab; color:#fff;">B</th><th style="padding:12px 18px; background:#0047ab; color:#fff;">C</th><th style="padding:12px 18px; background:#0047ab; color:#fff;">D</th></tr>
            <tr><td style="padding:12px 18px; font-weight:800; background:#f5f6f8;">A</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td></tr>
            <tr><td style="padding:12px 18px; font-weight:800; background:#f5f6f8;">B</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td></tr>
            <tr><td style="padding:12px 18px; font-weight:800; background:#f5f6f8;">C</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td></tr>
            <tr><td style="padding:12px 18px; font-weight:800; background:#f5f6f8;">D</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td><td style="padding:12px 18px; border:1px solid #e0e0e0; background:#e8f5e9; font-weight:700;">1</td><td style="padding:12px 18px; border:1px solid #e0e0e0;">0</td></tr>
        </table>`;
    };

    // ── List Visual ──
    const renderList = (el) => {
        el.innerHTML = `
        <div style="font-family:var(--font-mono); font-size:1.3rem; text-align:left; padding:30px;">
            <div style="margin-bottom:18px;"><span style="font-weight:800; color:#0047ab;">A</span> &nbsp;→&nbsp; [B] → [D] → NULL</div>
            <div style="margin-bottom:18px;"><span style="font-weight:800; color:#0047ab;">B</span> &nbsp;→&nbsp; [A] → [C] → NULL</div>
            <div style="margin-bottom:18px;"><span style="font-weight:800; color:#0047ab;">C</span> &nbsp;→&nbsp; [B] → [D] → NULL</div>
            <div><span style="font-weight:800; color:#0047ab;">D</span> &nbsp;→&nbsp; [A] → [C] → NULL</div>
        </div>`;
    };

    // ── Graph SVG Visual ──
    const renderGraph = (container, type) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 240 200');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const nodes = [
            { x: 120, y: 40, id: 'A' },
            { x: 50, y: 140, id: 'B' },
            { x: 190, y: 140, id: 'C' }
        ];
        const edges = [
            { u: 0, v: 1, w: 10 },
            { u: 1, v: 2, w: 25 },
            { u: 2, v: 0, w: 15 }
        ];

        // Draw edges with animation
        edges.forEach((e, i) => {
            const s = nodes[e.u], d = nodes[e.v];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', s.x); line.setAttribute('y1', s.y);
            line.setAttribute('x2', s.x); line.setAttribute('y2', s.y);
            line.setAttribute('stroke', '#333'); line.setAttribute('stroke-width', '2.5');
            svg.appendChild(line);

            setTimeout(() => {
                line.style.transition = 'all 0.6s ease-out';
                line.setAttribute('x2', d.x); line.setAttribute('y2', d.y);
            }, i * 450);

            // Weighted labels
            if (type === 'weighted') {
                const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                t.setAttribute('x', (s.x + d.x) / 2 + (i === 0 ? -14 : i === 2 ? 14 : 0));
                t.setAttribute('y', (s.y + d.y) / 2 - 8);
                t.setAttribute('font-size', '13'); t.setAttribute('font-weight', '800');
                t.setAttribute('fill', '#0047ab');
                t.textContent = e.w;
                t.style.opacity = '0';
                svg.appendChild(t);
                setTimeout(() => { t.style.transition = 'opacity 0.4s'; t.style.opacity = '1'; }, i * 450 + 600);
            }

            // Arrow markers for directed
            if (type === 'directed') {
                const dx = d.x - s.x, dy = d.y - s.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / len, uy = dy / len;
                const ax = d.x - ux * 22, ay = d.y - uy * 22;
                const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const p1 = `${d.x - ux * 18},${d.y - uy * 18}`;
                const p2 = `${ax - uy * 6},${ay + ux * 6}`;
                const p3 = `${ax + uy * 6},${ay - ux * 6}`;
                arrow.setAttribute('points', `${d.x - ux * 12},${d.y - uy * 12} ${p2} ${p3}`);
                arrow.setAttribute('fill', '#0047ab');
                arrow.style.opacity = '0';
                svg.appendChild(arrow);
                setTimeout(() => { arrow.style.transition = 'opacity 0.3s'; arrow.style.opacity = '1'; }, i * 450 + 600);
            }
        });

        // Draw nodes
        nodes.forEach((n, i) => {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', '18');
            c.setAttribute('fill', '#fff'); c.setAttribute('stroke', '#0047ab'); c.setAttribute('stroke-width', '3');
            c.style.opacity = '0';
            svg.appendChild(c);

            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', n.x); t.setAttribute('y', n.y + 6);
            t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '14');
            t.setAttribute('font-weight', '900'); t.setAttribute('fill', '#0047ab');
            t.textContent = n.id;
            t.style.opacity = '0';
            svg.appendChild(t);

            setTimeout(() => {
                c.style.transition = 'opacity 0.35s'; c.style.opacity = '1';
                t.style.transition = 'opacity 0.35s'; t.style.opacity = '1';
            }, i * 350);
        });

        container.appendChild(svg);
    };

    // Init
    updateUI();
});
// ── ADT Interactive Widget ──
const adtState = {
    nodes: [
        { id: 'A', x: 100, y: 170 },
        { id: 'B', x: 250, y: 70 },
        { id: 'C', x: 400, y: 170 },
        { id: 'D', x: 250, y: 270 }
    ],
    edges: [
        { u: 'A', v: 'B', id: 'e-A-B' },
        { u: 'B', v: 'C', id: 'e-B-C' },
        { u: 'C', v: 'D', id: 'e-C-D' },
        { u: 'D', v: 'A', id: 'e-D-A' },
        { u: 'A', v: 'C', id: 'e-A-C' }
    ],
    hasE: false,
    hasDE: false
};

const initialAdtState = JSON.parse(JSON.stringify(adtState));

function renderAdtGraph() {
    const canvas = document.getElementById('adt-canvas');
    if (!canvas) return;
    
    // Clear canvas
    canvas.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 340');
    
    // Draw edges
    adtState.edges.forEach(e => {
        const source = adtState.nodes.find(n => n.id === e.u);
        const target = adtState.nodes.find(n => n.id === e.v);
        if (!source || !target) return;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        line.setAttribute('class', 'edge-adt');
        line.setAttribute('id', e.id);
        
        // If it's a newly added edge, animate it
        if (e.isNew) {
            line.classList.add('edge-draw');
            e.isNew = false;
        }
        
        svg.appendChild(line);
    });
    
    // Draw nodes
    adtState.nodes.forEach(n => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', `node-${n.id}`);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', n.x);
        circle.setAttribute('cy', n.y);
        circle.setAttribute('r', 22);
        circle.setAttribute('class', 'node-adt');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', n.x);
        text.setAttribute('y', n.y);
        text.setAttribute('class', 'node-adt-text');
        text.textContent = n.id;
        
        g.appendChild(circle);
        g.appendChild(text);
        
        // If it's a newly added node, animate it
        if (n.isNew) {
            g.classList.add('fade-in');
            n.isNew = false;
        }
        
        svg.appendChild(g);
    });
    
    canvas.appendChild(svg);
}

window.adtSim = function(operation) {
    const btnAddV = document.getElementById('btn-add-v');
    const btnAddE = document.getElementById('btn-add-e');
    const btnRemE = document.getElementById('btn-rem-e');
    const btnRemV = document.getElementById('btn-rem-v');
    
    if (operation === 'addVertex') {
        if (!adtState.hasE) {
            adtState.nodes.push({ id: 'E', x: 250, y: 170, isNew: true });
            adtState.hasE = true;
            btnAddV.disabled = true;
            btnAddE.disabled = false;
        }
    } 
    else if (operation === 'addEdge') {
        if (adtState.hasE && !adtState.hasDE) {
            // Check if D exists
            const hasD = adtState.nodes.some(n => n.id === 'D');
            if (hasD) {
                adtState.edges.push({ u: 'D', v: 'E', id: 'e-D-E', isNew: true });
                adtState.hasDE = true;
                btnAddE.disabled = true;
            }
        }
    }
    else if (operation === 'removeEdge') {
        const edgeIndex = adtState.edges.findIndex(e => e.id === 'e-A-C');
        if (edgeIndex !== -1) {
            // Animate out before removing from state
            const edgeEl = document.getElementById('e-A-C');
            if (edgeEl) edgeEl.classList.add('fade-out');
            
            setTimeout(() => {
                adtState.edges.splice(edgeIndex, 1);
                renderAdtGraph();
            }, 300);
            btnRemE.disabled = true;
            return; // Skip normal render to wait for animation
        }
    }
    else if (operation === 'removeVertex') {
        const nodeIndex = adtState.nodes.findIndex(n => n.id === 'B');
        if (nodeIndex !== -1) {
            // Animate out
            const nodeEl = document.getElementById('node-B');
            const connectedEdges = ['e-A-B', 'e-B-C'];
            
            if (nodeEl) nodeEl.classList.add('fade-out');
            connectedEdges.forEach(eid => {
                const el = document.getElementById(eid);
                if (el) el.classList.add('fade-out');
            });
            
            setTimeout(() => {
                adtState.nodes.splice(nodeIndex, 1);
                // Remove all incident edges
                adtState.edges = adtState.edges.filter(e => e.u !== 'B' && e.v !== 'B');
                renderAdtGraph();
            }, 350);
            btnRemV.disabled = true;
            return;
        }
    }
    else if (operation === 'reset') {
        adtState.nodes = JSON.parse(JSON.stringify(initialAdtState.nodes));
        adtState.edges = JSON.parse(JSON.stringify(initialAdtState.edges));
        adtState.hasE = false;
        adtState.hasDE = false;
        
        btnAddV.disabled = false;
        btnAddE.disabled = true;
        btnRemE.disabled = false;
        btnRemV.disabled = false;
    }
    
    renderAdtGraph();
};

// Initial render
setTimeout(renderAdtGraph, 500);
