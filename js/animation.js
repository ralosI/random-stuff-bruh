(() => {
  const techniques = {
    ogoshi: {
      title: "O-GOSHI",
      subtitle: "Hip throw · a study of forward kuzushi and a hip turning point.",
      guide: "steps.html#ogoshi",
      phases: ["KU​ZUSHI", "TSUKURI", "KAKE"],

      principle: [
        "KUZUSHI",
        "Observe the partner's upper body moving forward before the turning entry.",
        "COM & BASE",
        "A forward shift can move the centre of mass toward the edge of the base of support."
      ],

      motion: "hip"
    },

    osotogari: {
      title: "O-SOTO-GARI",
      subtitle: "Major outer reap · a study of backward kuzushi and timing.",
      guide: "steps.html#osotogari",
      phases: ["KU​ZUSHI", "TSUKURI", "KAKE"],

      principle: [
        "BACKWARD KUZUSHI",
        "Notice the partner's posture shifting backward before the leg-reaping motion.",
        "TIMING & SUPPORT",
        "The simplified model shows a change in support and balance; real timing is taught by a coach."
      ],

      motion: "reap"
    },

    seoi: {
      title: "IPPON-SEOI-NAGE",
      subtitle: "One-arm shoulder throw · a study of forward kuzushi and turning position.",
      guide: "steps.html#seoi",
      phases: ["KU​ZUSHI", "TSUKURI", "KAKE"],

      principle: [
        "FORWARD KUZUSHI",
        "Watch the forward balance shift, followed by the turning entry.",
        "LEVER & ROTATION",
        "A turning point and the direction of applied force affect rotational motion."
      ],

      motion: "shoulder"
    }
  };

  const params = new URLSearchParams(location.search);
  const key = params.get("throw") || "ogoshi";
  const tech = techniques[key] || techniques.ogoshi;

  const title = document.querySelector("#throw-title");
  const subtitle = document.querySelector("#throw-subtitle");

  const principleTitle = document.querySelector("#principle-title");
  const principleText = document.querySelector("#principle-text");

  const mathTitle = document.querySelector("#math-title");
  const mathText = document.querySelector("#math-text");

  const guideLink = document.querySelector("#guide-link");
  const phaseLabel = document.querySelector("#phase-label");
  const frameCount = document.querySelector("#frame-count");
  const timelineFill = document.querySelector("#timeline-fill");

  const playBtn = document.querySelector("#play-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const speedSelect = document.querySelector("#speed-select");

  const canvas = document.querySelector("#dojo-canvas");
  const ctx = canvas.getContext("2d");

  title.innerHTML = `${tech.title.split("-").join("-")} <span>ANIMATION</span>`;
  subtitle.textContent = tech.subtitle;

  principleTitle.textContent = tech.principle[0];
  principleText.textContent = tech.principle[1];

  mathTitle.textContent = tech.principle[2];
  mathText.textContent = tech.principle[3];

  guideLink.href = tech.guide;

  let progress = 0;
  let playing = false;
  let last = 0;
  let raf = 0;

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function line(x1, y1, x2, y2, color, width = 12) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function circle(x, y, r, fill, stroke = "#14141c", sw = 4) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);

    ctx.fillStyle = fill;
    ctx.fill();

    ctx.lineWidth = sw;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  function drawPerson(x, y, pose, gi, flip = 1, opacity = 1) {
    ctx.save();

    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.scale(flip, 1);

    const ink = "#11111a";

    const skin = gi === "white"
      ? "#e7b99e"
      : "#b77d64";

    const coat = gi === "white"
      ? "#f2f0ea"
      : "#8d7cff";

    const trim = gi === "white"
      ? "#b8b9c8"
      : "#5142a8";

    const lean = pose.lean || 0;
    const rot = pose.rot || 0;
    const arm = pose.arm || 0;
    const leg = pose.leg || 0;
    const fall = pose.fall || 0;

    ctx.translate(0, fall);
    ctx.rotate(rot);

    // Legs
    line(-8, 0, -17 + leg * 15, 42, ink, 17);
    line(-17 + leg * 15, 42, -25 + leg * 20, 79, ink, 14);

    line(8, 0, 17 - leg * 10, 42, ink, 17);
    line(17 - leg * 10, 42, 25 - leg * 12, 79, ink, 14);

    line(-25 + leg * 20, 79, -10 + leg * 20, 81, coat, 9);
    line(25 - leg * 12, 79, 40 - leg * 12, 81, coat, 9);

    // Torso and belt
    ctx.save();
    ctx.rotate(lean);

    ctx.beginPath();
    ctx.moveTo(-23, -62);
    ctx.quadraticCurveTo(-32, -45, -24, -4);
    ctx.lineTo(24, -4);
    ctx.quadraticCurveTo(32, -45, 23, -62);
    ctx.closePath();

    ctx.fillStyle = coat;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = ink;
    ctx.stroke();

    line(0, -59, 4, -19, trim, 4);

    line(
      -22,
      -11,
      23,
      -11,
      gi === "white" ? "#777b90" : "#ff476f",
      6
    );

    // Arms
    line(-19, -53, -35 + arm * 5, -34 + arm * 3, ink, 12);
    line(
      -35 + arm * 5,
      -34 + arm * 3,
      -48 + arm * 8,
      -24 + arm * 4,
      coat,
      10
    );

    line(19, -53, 29 + arm * 13, -37 - arm * 3, ink, 12);
    line(
      29 + arm * 13,
      -37 - arm * 3,
      43 + arm * 17,
      -35 - arm * 5,
      coat,
      10
    );

    ctx.restore();

    // Neck and head
    line(0, -62, 0, -71, ink, 9);
    circle(0, -84, 15, skin, ink, 4);

    ctx.beginPath();
    ctx.arc(0, -87, 15, Math.PI, Math.PI * 2);
    ctx.lineTo(15, -84);
    ctx.lineTo(8, -94);
    ctx.lineTo(-5, -96);
    ctx.closePath();

    ctx.fillStyle = "#242330";
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.fillStyle = "#12121c";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(155,140,255,.07)";
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dojo mat
    const floor = h * 0.79;

    ctx.fillStyle = "#20202c";
    ctx.fillRect(0, floor, w, h - floor);

    ctx.strokeStyle = "#454052";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, floor);
    ctx.lineTo(w, floor);
    ctx.stroke();

    for (let x = 0; x < w; x += 100) {
      ctx.strokeStyle = "rgba(255,255,255,.04)";

      ctx.beginPath();
      ctx.moveTo(x, floor);
      ctx.lineTo(x + 35, h);
      ctx.stroke();
    }

    const p = ease(Math.min(1, progress));

    let tx = 330;
    let ty = floor - 88;

    let ux = 535;
    let uy = floor - 88;

    let tpose = {
      lean: 0,
      rot: 0,
      arm: 0.2,
      leg: 0,
      fall: 0
    };

    let upose = {
      lean: 0,
      rot: 0,
      arm: 0.1,
      leg: 0,
      fall: 0
    };

    // Phase 1: Kuzushi
    if (progress < 0.32) {
      const q = progress / 0.32;

      upose.lean = (tech.motion === "reap" ? -0.12 : 0.15) * q;
      upose.arm = 0.3 * q;

      tx -= q * 8;
      ux += q * 6;
    }

    // Phase 2: Tsukuri
    else if (progress < 0.62) {
      const q = (progress - 0.32) / 0.30;

      tpose.rot = (tech.motion === "reap" ? -0.1 : 0.15) * q;
      tpose.lean = 0.12 * q;
      tpose.arm = 0.6 + q * 0.4;

      tx = lerp(330, 400, q);
      ux = lerp(535, 490, q);

      upose.lean = tech.motion === "reap" ? -0.2 : 0.35;
      upose.rot = (tech.motion === "reap" ? -0.15 : 0.25) * q;
      upose.arm = 0.5 + q * 0.3;
    }

    // Phase 3: Kake
    else {
      const q = (progress - 0.62) / 0.38;

      tpose.rot = 0.15;
      tpose.lean = 0.1;
      tpose.arm = 1;

      tx = 400;

      upose.rot = tech.motion === "reap" ? -0.65 : -0.9;
      upose.lean = 0.4;
      upose.fall = q * 58;
      upose.leg = q * 0.8;

      ux = lerp(490, 565, q);
      uy = lerp(floor - 88, floor - 25, q);
    }

    // Motion trails
    if (progress > 0.2 && progress < 0.85) {
      ctx.strokeStyle = "rgba(255,71,111,.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);

      ctx.beginPath();
      ctx.moveTo(ux - 45, uy - 115);
      ctx.quadraticCurveTo(
        ux + 30,
        uy - 145,
        ux + 75,
        uy - 65
      );
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Centre-of-mass guide
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(155,140,255,.55)";

    ctx.beginPath();
    ctx.moveTo(ux, uy - 90);
    ctx.lineTo(ux, floor);
    ctx.stroke();

    ctx.setLineDash([]);

    // Base-of-support guide
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(ux - 38, floor + 5);
    ctx.lineTo(ux + 38, floor + 5);
    ctx.stroke();

    // Draw the two figures
    drawPerson(tx, ty, tpose, "purple", 1, 1);
    drawPerson(ux, uy, upose, "white", -1, 1);

    // Centre-of-mass marker
    circle(ux, uy - 83, 5, "#ff476f", "#ff476f", 1);

    ctx.fillStyle = "#ff476f";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText("COM", ux + 13, uy - 83);

    // Labels
    ctx.fillStyle = "#d8d5e2";
    ctx.font = "bold 10px Inter, sans-serif";

    ctx.fillText("TORI", tx - 25, floor + 30);
    ctx.fillText("UKE", ux - 15, floor + 30);

    ctx.fillStyle = "#a4a2b5";
    ctx.font = "10px Inter, sans-serif";

    ctx.fillText(
      "SCHEMATIC MOTION — NOT A FULL TECHNIQUE",
      18,
      24
    );

    // Update phase label and timeline
    const phase = progress < 0.32
      ? 0
      : progress < 0.62
        ? 1
        : 2;

    phaseLabel.textContent =
      `PHASE 0${phase + 1} / ${tech.phases[phase].replace("\u200b", "")}`;

    frameCount.textContent =
      `FRAME ${String(Math.round(progress * 100)).padStart(2, "0")}`;

    timelineFill.style.width = `${progress * 100}%`;
  }

  function loop(now) {
    if (!playing) return;

    if (!last) last = now;

    const dt = Math.min(50, now - last);
    last = now;

    progress += dt / 4200 * Number(speedSelect.value);

    if (progress >= 1) {
      progress = 1;
      playing = false;
      playBtn.textContent = "↻ REPLAY ANIMATION";
      last = 0;
    }

    draw();

    if (playing) {
      raf = requestAnimationFrame(loop);
    }
  }

  function play() {
    if (progress >= 1) {
      progress = 0;
    }

    playing = true;
    playBtn.textContent = "Ⅱ PLAYING";
    last = 0;

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function reset() {
    playing = false;

    cancelAnimationFrame(raf);

    progress = 0;
    last = 0;

    playBtn.textContent = "▶ PLAY ANIMATION";

    draw();
  }

  playBtn.addEventListener("click", () => {
    if (playing) {
      playing = false;
      cancelAnimationFrame(raf);
      playBtn.textContent = "▶ RESUME";
    } else {
      play();
    }
  });

  resetBtn.addEventListener("click", reset);

  window.addEventListener("resize", draw);

  if (reduced) {
    playBtn.textContent = "▶ PLAY ANIMATION";
  }

  draw();
})();
