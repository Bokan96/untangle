(() => {
  'use strict';

  const MIN_DOTS = 4;
  const MAX_DOTS = 30;
  const DEFAULT_DOTS = 8;
  const NODE_R = 11;                       // drawn radius in px
  const PAD = NODE_R + 6;                  // keeps dots inside the board
  const HIT_R = { touch: 34, pen: 26, mouse: 22 }; // grab distance in px
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const $ = (id) => document.getElementById(id);
  const board = $('board');
  const svg = $('graph');
  const linkLayer = $('links');
  const nodeLayer = $('nodes');
  const ui = {
    size: $('size'), fewer: $('fewer'), more: $('more'), newGame: $('new'),
    crossings: $('crossings'), crossingsLabel: $('crossings-label'),
    moves: $('moves'), movesLabel: $('moves-label'), time: $('time'),
    hints: $('hints'), hint: $('hint'),
    win: $('win'), winStats: $('win-stats'), next: $('next'),
  };

  // Game state. Node positions are stored normalised to 0..1 so the layout
  // survives resizes and rotation (axis scaling never changes crossings).
  let size = clamp(Math.round(load('untangle.size', DEFAULT_DOTS)), MIN_DOTS, MAX_DOTS);
  let nodes = [];   // { x, y, crossed, el }
  let links = [];   // { a, b, crossed, el }
  let crossings = 0;
  let moves = 0;
  let solved = false;
  let startTime = 0;
  let timerId = 0;
  let width = 0;
  let height = 0;
  const drags = new Map(); // pointerId -> { node, dx, dy, moved }

  ui.hints.checked = load('untangle.hints', true);

  // ---------------------------------------------------------------- geometry

  function orient(p, q, r) {
    return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  }

  // Assumes r is collinear with p-q.
  function onSegment(p, q, r) {
    return Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) &&
           Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
  }

  function crosses(l, m) {
    const { a, b } = l;
    const { a: c, b: d } = m;
    if (a === c || a === d || b === c || b === d) {
      // Links sharing an endpoint only cross if they overlap along one line.
      const s = a === c || a === d ? a : b;
      const u = s === a ? b : a;
      const v = s === c ? d : c;
      return orient(s, u, v) === 0 &&
             (u.x - s.x) * (v.x - s.x) + (u.y - s.y) * (v.y - s.y) > 0;
    }
    const o1 = orient(a, b, c), o2 = orient(a, b, d);
    const o3 = orient(c, d, a), o4 = orient(c, d, b);
    if (o1 * o2 < 0 && o3 * o4 < 0) return true;
    return (o1 === 0 && onSegment(a, b, c)) || (o2 === 0 && onSegment(a, b, d)) ||
           (o3 === 0 && onSegment(c, d, a)) || (o4 === 0 && onSegment(c, d, b));
  }

  function countCrossings() {
    let count = 0;
    for (const l of links) l.crossed = false;
    for (let i = 0; i < links.length; i++) {
      for (let j = i + 1; j < links.length; j++) {
        if (crosses(links[i], links[j])) {
          links[i].crossed = links[j].crossed = true;
          count++;
        }
      }
    }
    for (const n of nodes) n.crossed = false;
    for (const l of links) if (l.crossed) l.a.crossed = l.b.crossed = true;
    return count;
  }

  // -------------------------------------------------------------- generation

  // Scatter random points and greedily connect pairs whose line doesn't cross
  // an existing one. The result is planar by construction, so always solvable.
  function makeGraph(n) {
    const pts = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random() }));
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([pts[i], pts[j]]);
    const result = [];
    for (const [a, b] of shuffle(pairs)) {
      const link = { a, b };
      if (!result.some((l) => crosses(l, link))) result.push(link);
    }
    return { nodes: pts, links: result };
  }

  // Place the dots on a ring in random order: tangled, but never stacked.
  function scramble() {
    shuffle(nodes.slice()).forEach((p, i, all) => {
      const t = (2 * Math.PI * i) / all.length - Math.PI / 2;
      p.x = 0.5 + 0.45 * Math.cos(t);
      p.y = 0.5 + 0.45 * Math.sin(t);
    });
  }

  function newGame() {
    ({ nodes, links } = makeGraph(size));
    do scramble(); while (countCrossings() === 0);

    drags.clear();
    moves = 0;
    solved = false;
    stopTimer();
    startTime = 0;
    ui.time.textContent = '0.0';
    ui.size.textContent = size;
    ui.fewer.disabled = size <= MIN_DOTS;
    ui.more.disabled = size >= MAX_DOTS;
    ui.win.hidden = true;
    ui.hint.classList.remove('gone');
    board.classList.remove('solved', 'dragging');

    linkLayer.replaceChildren(...links.map((l) => (l.el = svgEl('line'))));
    nodeLayer.replaceChildren(...nodes.map((n) => {
      n.el = svgEl('circle');
      n.el.setAttribute('r', NODE_R);
      return n.el;
    }));
    render();
  }

  // --------------------------------------------------------------- rendering

  const px = (n) => PAD + n.x * (width - 2 * PAD);
  const py = (n) => PAD + n.y * (height - 2 * PAD);

  function render() {
    crossings = countCrossings();
    const hints = ui.hints.checked;
    const active = new Set();
    const neighbors = new Set();
    for (const { node } of drags.values()) active.add(node);
    for (const l of links) {
      if (active.has(l.a)) neighbors.add(l.b);
      if (active.has(l.b)) neighbors.add(l.a);
    }

    for (const l of links) {
      l.el.setAttribute('x1', px(l.a));
      l.el.setAttribute('y1', py(l.a));
      l.el.setAttribute('x2', px(l.b));
      l.el.setAttribute('y2', py(l.b));
      l.el.setAttribute('class', hints && l.crossed ? 'crossed' : '');
    }
    for (const n of nodes) {
      n.el.setAttribute('cx', px(n));
      n.el.setAttribute('cy', py(n));
      n.el.setAttribute('class', [
        hints && n.crossed && 'crossed',
        active.has(n) && 'active',
        neighbors.has(n) && 'neighbor',
      ].filter(Boolean).join(' '));
    }

    ui.crossings.textContent = crossings;
    ui.crossingsLabel.textContent = plural(crossings, 'crossing');
    ui.moves.textContent = moves;
    ui.movesLabel.textContent = plural(moves, 'move');
  }

  function resize() {
    const rect = svg.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (nodes.length) render();
  }

  // ------------------------------------------------------------------- input

  function pointerPos(e) {
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function nearestNode(p, maxDist) {
    let best = null;
    let bestDist = maxDist * maxDist;
    for (const n of nodes) {
      const d = (px(n) - p.x) ** 2 + (py(n) - p.y) ** 2;
      if (d <= bestDist && ![...drags.values()].some((g) => g.node === n)) {
        best = n;
        bestDist = d;
      }
    }
    return best;
  }

  svg.addEventListener('pointerdown', (e) => {
    if (solved || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const p = pointerPos(e);
    const node = nearestNode(p, HIT_R[e.pointerType] || HIT_R.mouse);
    if (!node) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    drags.set(e.pointerId, { node, dx: px(node) - p.x, dy: py(node) - p.y, moved: false });
    nodeLayer.appendChild(node.el); // draw the grabbed dot on top
    board.classList.add('dragging');
    render();
  });

  svg.addEventListener('pointermove', (e) => {
    const drag = drags.get(e.pointerId);
    if (!drag) return;
    const p = pointerPos(e);
    drag.node.x = clamp((p.x + drag.dx - PAD) / (width - 2 * PAD), 0, 1);
    drag.node.y = clamp((p.y + drag.dy - PAD) / (height - 2 * PAD), 0, 1);
    if (!drag.moved) {
      drag.moved = true;
      if (!startTime) startTimer();
      ui.hint.classList.add('gone');
    }
    render();
  });

  function endDrag(e) {
    const drag = drags.get(e.pointerId);
    if (!drag) return;
    drags.delete(e.pointerId);
    if (drag.moved) moves++;
    if (!drags.size) board.classList.remove('dragging');
    render();
    if (!drags.size && crossings === 0 && moves > 0) win();
  }
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  board.addEventListener('contextmenu', (e) => e.preventDefault());

  // ------------------------------------------------------------- timer & win

  function startTimer() {
    startTime = performance.now();
    timerId = setInterval(updateTime, 100);
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = 0;
  }

  function updateTime() {
    ui.time.textContent = ((performance.now() - startTime) / 1000).toFixed(1);
  }

  function win() {
    solved = true;
    updateTime();
    stopTimer();
    board.classList.add('solved');
    ui.winStats.textContent = `${moves} ${plural(moves, 'move')} · ${ui.time.textContent}s`;
    ui.next.textContent = size < MAX_DOTS ? `Next: ${size + 1} dots` : 'Play again';
    ui.win.hidden = false;
  }

  // ---------------------------------------------------------------- controls

  function setSize(n) {
    size = clamp(n, MIN_DOTS, MAX_DOTS);
    save('untangle.size', size);
    newGame();
  }

  ui.fewer.addEventListener('click', () => setSize(size - 1));
  ui.more.addEventListener('click', () => setSize(size + 1));
  ui.newGame.addEventListener('click', newGame);
  ui.next.addEventListener('click', () => setSize(size + 1));
  ui.hints.addEventListener('change', () => {
    save('untangle.hints', ui.hints.checked);
    render();
  });

  // ----------------------------------------------------------------- helpers

  function svgEl(tag) {
    return document.createElementNS(SVG_NS, tag);
  }

  function plural(n, word) {
    return n === 1 ? word : word + 's';
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return typeof v === typeof fallback ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private mode etc.) — settings just won't persist.
    }
  }

  // -------------------------------------------------------------------- init

  new ResizeObserver(resize).observe(board);
  resize();
  newGame();
})();
