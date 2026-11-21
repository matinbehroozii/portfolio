// 3D background: a vertical field of glowing dust. Scrolling moves the camera
// straight up through it, so the dust flows from top to bottom while you scroll.
// Highly optimized for low-end hardware: low-power mode, throttled DPR, and on-demand rendering.
(function () {
  const canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;

  const PRIMARY = new THREE.Color("#e30032");
  const SECONDARY = new THREE.Color("#f3eb27");

  const TRAVEL = 30;
  const MARGIN = 14;
  const FIELD_TOP = MARGIN;
  const FIELD_BOTTOM = -TRAVEL - MARGIN;
  const FIELD_HEIGHT = FIELD_TOP - FIELD_BOTTOM;
  const FIELD_WIDTH = 34;
  const FIELD_DEPTH = 16;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      precision: "mediump"
    });
  } catch (e) {
    return;
  }

  // Cap pixel ratio to 1.25 max to prevent fill-rate lag on integrated GPUs
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x090909, 8, 26);

  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
  camera.position.z = 6;

  // Dust particles (~7 per unit of height = lightweight & atmospheric)
  const P = Math.round(FIELD_HEIGHT * 7);
  const pos = new Float32Array(P * 3);
  const col = new Float32Array(P * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < P; i++) {
    const y = FIELD_BOTTOM + Math.random() * FIELD_HEIGHT;
    pos[i * 3] = (Math.random() - 0.5) * FIELD_WIDTH;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = -Math.random() * FIELD_DEPTH;
    tmp.lerpColors(PRIMARY, SECONDARY, (y - FIELD_BOTTOM) / FIELD_HEIGHT);
    col[i * 3] = tmp.r;
    col[i * 3 + 1] = tmp.g;
    col[i * 3 + 2] = tmp.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  scene.add(
    new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    )
  );

  // ----- Scroll + mouse state -----
  let target = 0;
  let current = 0;
  let mx = 0, my = 0;
  let cx = 0, cy = 0;
  let isAnimating = false;

  function readScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    target = scrollable > 0 ? window.scrollY / scrollable : 0;
    requestRender();
  }
  window.addEventListener("scroll", readScroll, { passive: true });

  if (!reduceMotion) {
    let mouseTimeout;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      requestRender();
    }, { passive: true });
  }

  function resize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    readScroll();
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // ----- On-Demand render loop (Sleeps when idle = 0% GPU load) -----
  function renderStep() {
    current += (target - current) * (reduceMotion ? 1 : 0.08);
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;

    camera.position.y = -TRAVEL + current * TRAVEL - cy * 0.5;
    camera.position.x = cx * 0.8;

    renderer.render(scene, camera);

    const diffScroll = Math.abs(target - current);
    const diffX = Math.abs(mx - cx);
    const diffY = Math.abs(my - cy);

    // If still moving, keep animating; otherwise go to sleep to save 100% GPU
    if (diffScroll > 0.0002 || diffX > 0.001 || diffY > 0.001) {
      requestAnimationFrame(renderStep);
    } else {
      isAnimating = false;
    }
  }

  function requestRender() {
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(renderStep);
    }
  }

  // Initial draw
  requestRender();
})();
