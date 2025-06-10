# 🌌 3D Solar System Simulation (Three.js)

Live link - https://solarsystem-ruddy.vercel.app/

This project is a fully interactive 3D simulation of our solar system, built using [Three.js](https://threejs.org/) and plain JavaScript — no frameworks involved.  
It’s designed to be mobile-responsive, visually engaging, and technically solid.

---

  🚀 Features

- ☀️ Sun at the center with 8 orbiting planets
- 🪐 Real-time elliptical orbit animation
- ✨ Procedural starry background (no image dependency)
- 🎚 Speed control sliders for each planet
- 🛰 OrbitControls to zoom, rotate, and pan
- 📌 Tooltips on hover
- 👆 Camera fly-to on planet click
- ⏯ Pause / Resume animation
- 🌓 Light / Dark theme toggle
- 📱 Mobile-responsive layout

---

## 🧠 How It Works

- **Three.js** handles all 3D rendering
- Each planet is a `SphereGeometry` orbiting around the sun based on trigonometric calculations
- Orbits are visualized using `EllipseCurve` and updated in the animation loop
- Starfield background is created using 1000+ `THREE.Points`
- All interactions are done with **plain JavaScript** — no libraries, no frameworks

---

## 🛠 How to Use

 

 
