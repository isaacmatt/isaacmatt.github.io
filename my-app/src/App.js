import './App.css';
import { Fragment, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import * as THREE from 'three';
import { playBlackholeSound, playCardHoverSound, unlockAudio } from './sounds';

// Set this to your Cloudinary "cloud name" (Dashboard → Account Details).
// Until it is set, cards fall back to the image placeholder.
const CLOUDINARY_CLOUD = 'drqu9wqpo';

// Builds a delivery URL that asks Cloudinary for a resized, auto-compressed,
// auto-format (WebP/AVIF) derivative. The raw original is never delivered.
// Accepts either a bare public ID ('My_Image_abc123') or a full Cloudinary URL
// pasted from the dashboard; in both cases our transformations are injected.
const cloudinaryUrl = (image, width) => {
  const marker = '/image/upload/';
  const idx = image.indexOf(marker);
  // For a full URL, keep everything after /upload/ (version + id + extension);
  // for a bare ID, use it as-is.
  const tail = idx === -1 ? image : image.slice(idx + marker.length);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/` +
    `f_auto,q_auto:best,c_fill,ar_16:9,w_${width}/${tail}`;
};

// Candidate widths for the srcset so the browser downloads the smallest
// version that fits the slot on the current screen / pixel density.
// Upper widths cover high-DPI (retina) displays so detailed photos stay sharp.
const IMAGE_WIDTHS = [640, 960, 1280, 1920];

const blackHoleVertexShader = `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const blackHoleFragmentShader = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float spinSpeed;
uniform float camDist;
uniform float camElev;
uniform vec3 diskColorInner;
uniform vec3 diskColorOuter;
uniform vec3 nebulaColor;

#define STEPS 300
#define RS 1.0
#define DISK_IN 2.6
#define DISK_OUT 9.0
#define DT 0.14

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;

  vec3 camPos = vec3(0.0, sin(camElev) * camDist, -cos(camElev) * camDist);
  vec3 forward = normalize(-camPos);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
  vec3 up = cross(forward, right);
  float fov = 1.3;
  vec3 dir = normalize(forward + uv.x * fov * right + uv.y * fov * up);

  vec3 p = camPos;
  vec3 vel = dir;
  vec3 hVec = cross(p, vel);
  float h2 = dot(hVec, hVec);

  vec3 color = vec3(0.0);
  bool captured = false;

  for (int i = 0; i < STEPS; i++) {
    float r = length(p);
    if (r < RS) {
      captured = true;
      break;
    }

    vec3 accel = -1.5 * h2 * p / pow(r, 5.0);
    vel += accel * DT;
    vec3 np = p + vel * DT;

    if (p.y * np.y < 0.0) {
      float t = p.y / (p.y - np.y);
      vec3 hit = mix(p, np, t);
      float rd = length(hit.xz);

      if (rd > DISK_IN && rd < DISK_OUT) {
        float ang = atan(hit.z, hit.x);
        float omega = spinSpeed * pow(rd, -1.5) * 10.0;
        float swirl = ang + iTime * omega;
        float radial = (rd - DISK_IN) / (DISK_OUT - DISK_IN);
        float n = fbm(vec3(cos(swirl) * rd, sin(swirl) * rd, iTime * 0.15) * 0.7);
        float bright = pow(1.0 - radial, 1.6) * (0.55 + 0.9 * n);

        vec3 tang = normalize(vec3(-hit.z, 0.0, hit.x));
        float beam = dot(tang, normalize(-dir));
        float doppler = 1.0 + 0.7 * beam;
        bright *= doppler;

        vec3 col = mix(diskColorInner, diskColorOuter, radial);
        color += col * max(bright, 0.0) * 1.7;
      }
    }

    p = np;
    if (r > 32.0 && dot(vel, p) > 0.0) break;
  }

  if (!captured && dot(color, color) < 0.02) {
    vec3 d = normalize(vel);
    float s = hash(floor(d * 260.0));
    float star = smoothstep(0.9965, 1.0, s);
    color += vec3(star) * vec3(0.85, 0.85, 1.0);
    color += nebulaColor * 0.025 * fbm(d * 4.0);
  }

  color = color / (color + vec3(1.0));
  color = pow(color, vec3(0.85));

  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  float alpha = captured ? 1.0 : smoothstep(0.004, 0.07, luma);

  gl_FragColor = vec4(color, alpha);
}
`;

function ShaderBlackHole({ isResetting, isHovered }) {
  const mountRef = useRef(null);
  const hoveredRef = useRef(isHovered);
  const isResettingRef = useRef(false);
  const resetStartTimeRef = useRef(null);

  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    if (isResetting && !isResettingRef.current) {
      resetStartTimeRef.current = performance.now();
    }
    isResettingRef.current = isResetting;
  }, [isResetting]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      iResolution: { value: new THREE.Vector2() },
      iTime: { value: 0 },
      spinSpeed: { value: 0.6 },
      camDist: { value: 16.0 },
      camElev: { value: 0.16 },
      diskColorInner: { value: new THREE.Vector3(0.92, 0.70, 1.00) },
      diskColorOuter: { value: new THREE.Vector3(0.45, 0.08, 0.85) },
      nebulaColor: { value: new THREE.Vector3(0.30, 0.05, 0.55) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: blackHoleVertexShader,
      fragmentShader: blackHoleFragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight, false);
      uniforms.iResolution.value.set(clientWidth, clientHeight);
    };

    let animationId;
    const start = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - start) / 1000;
      uniforms.iTime.value = elapsed;
      let speed;
      if (isResettingRef.current && resetStartTimeRef.current !== null) {
        const rt = (performance.now() - resetStartTimeRef.current) / 1000;
        if (rt < 2.0) {
          speed = 0.58 * Math.pow(1 - rt / 2.0, 2);
        } else {
          speed = 0.58 * Math.min(1, Math.pow((rt - 2.0) / 1.5, 2));
        }
      } else {
        speed = hoveredRef.current ? 0.9 : 0.58 + Math.sin(elapsed * 0.7) * 0.12;
      }
      uniforms.spinSpeed.value = speed;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="shader-blackhole-canvas" aria-hidden="true" />;
}

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(null);
  const [isCssHovered, setIsCssHovered] = useState(false);
  const [isCssBoosted, setIsCssBoosted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  const cssBooostTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const featuredIndexRef = useRef(null);
  const cardRefs = useRef([]);
  const hasAutoFeaturedRef = useRef(false);
  const featuredPanelRef = useRef(null);
  const shouldScrollToFeaturedRef = useRef(false);
  const introRef = useRef(null);
  const workRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const aboutSection = {
    title: 'About Me',
    body: 'I build software systems that bridge low-level engineering with intelligent applications. My work spans backend development, real-time systems, and machine learning pipelines, with a focus on modular architecture, performance, and structured problem-solving. I enjoy designing reliable systems that operate under real-world constraints.',
  };
  const workItems = [
    {
      title: 'TestWebPage Alpha',
      subtitle: 'Frontend Architecture & Deployment Sandbox',
      details: 'Built a React deployment sandbox to prototype responsive UI components, layout patterns, and GitHub Pages release workflows. Used version-controlled iterations to validate static hosting behavior, frontend performance, and maintainable component structure.',
      tags: ['React', 'GitHub Pages', 'Responsive UI'],
      category: 'web',
      repoUrl: 'https://github.com/isaacmatt/TestWebPage_Alpha',
      // Cloudinary public ID, e.g. 'eternal-void/testwebpage-alpha'. Leave '' to show the placeholder.
      image: 'https://res.cloudinary.com/drqu9wqpo/image/upload/v1781548397/TestWebPage_Feature_Image_msi7rn.png',
    },
    {
      title: 'AI Municipal Issue Router',
      subtitle: 'IBM watsonx Hackathon',
      details: 'Built an IBM watsonx hackathon prototype that accepts resident infrastructure reports through image and text input. Implemented classification, prioritization, and routing logic to move issues from automated intake into human review and work order preparation.',
      tags: ['AI', 'IBM watsonx', 'Python', 'Agentic'],
      category: 'ai',
      repoUrl: 'https://github.com/isaacmatt/IBM_watsonx-Hackathon-Orchestrate',
      image: '',
    },
    {
      title: 'Modular Motor Control Framework',
      subtitle: 'C++ · Arduino · Open-Loop Position Control',
      details: 'Modular C++ framework for Arduino-class MCUs driving 12V worm-gear motors. Reusable abstractions for PWM control, command modes, and open-loop position control, with hardware access kept separate from control logic. Used an encoder to characterize the count-to-angle relationship of the output shaft — calibrated for the bare motor, then re-calibrated with a turbine blade attached to account for the change in mechanical load.',
      tags: ['C++', 'Arduino', 'Embedded', 'Motor Control'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/MotorCode',
      image: 'https://res.cloudinary.com/drqu9wqpo/image/upload/v1781548397/Motor_Control_Feature_Image_mulsut.jpg',
    },
    {
      title: 'Micro_Comms — Wireless Turbine Controller',
      subtitle: 'ESP-NOW + I²C firmware · validated end-to-end · ISWTC 2024, Delft',
      details: 'Firmware for a wireless remote controller on the WEDESIGN small-scale wind turbine (ISWTC 2024, Delft). ESP-NOW carries low-latency operator commands; an I²C bridge passes them to the motor controller. Split the radio and motor-control work across two MCUs to keep wireless interrupt timing off the time-critical control loop. Comms link validated end-to-end on a test bench.',
      tags: ['C++', 'ESP-NOW', 'I²C', 'Embedded'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/Micro_Comms',
      image: '',
    },
    {
      title: 'Pico W Wireless Control Node',
      subtitle: 'Dual-Radio (WiFi + BLE) · Served Dashboard',
      details: 'Firmware for a Raspberry Pi Pico W that runs as a self-hosted access point serving a web dashboard, with a parallel Bluetooth command interface. Either radio can command a runtime switch from AP to Station mode to join an existing WiFi network. The dashboard controls on-board LEDs, reads sensors, and pulls live weather data — a single device exposing two wireless control paths to the same hardware.',
      tags: ['Pico W', 'WiFi', 'Bluetooth', 'Embedded'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/RaspberryPi_WifiManager',
      image: 'https://res.cloudinary.com/drqu9wqpo/image/upload/v1781548397/Wifi_Dashboard_Feature_Image_bzabim.png',
    },
    {
      title: 'SD Card Breakout PCB',
      subtitle: 'KiCad Schematic + Board Layout',
      details: 'Designed an SD card breakout board in KiCad for embedded storage — schematic capture through board layout, with footprint selection, compact routing, and clean signal paths for removable storage in microcontroller projects. Passed DRC and laid out for fabrication.',
      tags: ['KiCad', 'PCB Design', 'Schematic Capture', 'Hardware'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/SD_Card_Breakout_Board',
      image: '',
    },
    {
      title: 'ML Pothole Detection System',
      subtitle: 'Computer Vision Capstone — Team Project',
      details: 'Team capstone building a computer vision pipeline to detect road damage in aerial imagery (Python, PyTorch, YOLO, OpenCV). The best YOLOv11 configuration reached mAP@0.5 of ~0.90 on the project dataset, with pothole AP also ~0.90, after iterating from earlier checkpoints. My contribution: the geolocation pipeline — a Python EXIF extractor and the capture-level GPS storage design that tied each detection to a location.',
      tags: ['Python', 'EXIF', 'GPS', 'Computer Vision'],
      category: 'ml',
      repoUrl: 'https://github.com/isaacmatt/2025ECE_CapstoneG12',
      image: 'https://res.cloudinary.com/drqu9wqpo/image/upload/v1781548396/ML_CV_Detection_Feature_Image_qr4ci6.png',
    },
    {
      title: 'Portfolio Site',
      subtitle: 'React Single-Page App',
      details: 'This site — a React SPA I designed and built to present my engineering work, with project filtering and a custom dark theme. System design and integration directed by me; implementation built with AI assistance.',
      tags: ['React', 'JavaScript', 'Frontend'],
      category: 'creative',
      repoUrl: 'https://github.com/isaacmatt/eternal-infinite-void',  
      image: 'https://res.cloudinary.com/drqu9wqpo/image/upload/v1781547970/Portfolio_Feature_Image_ej77dq.png',
    },
  ];

  const handleCardPointerMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pullX = ((x / rect.width) - 0.5) * 10;
    const pullY = ((y / rect.height) - 0.5) * 8;
    const tilt = ((x / rect.width) - 0.5) * 1.6;

    card.style.setProperty('--grav-x', `${pullX.toFixed(2)}px`);
    card.style.setProperty('--grav-y', `${pullY.toFixed(2)}px`);
    card.style.setProperty('--grav-tilt', `${tilt.toFixed(2)}deg`);
    card.style.setProperty('--grav-glow', '1');
    card.style.setProperty('--grav-light-x', `${x.toFixed(0)}px`);
    card.style.setProperty('--grav-light-y', `${y.toFixed(0)}px`);
  };

  const handleCardPointerLeave = (event) => {
    const card = event.currentTarget;

    card.style.setProperty('--grav-x', '0px');
    card.style.setProperty('--grav-y', '0px');
    card.style.setProperty('--grav-tilt', '0deg');
    card.style.setProperty('--grav-glow', '0');
  };

  const handleBlackholePointerMove = (event) => {
    const blackhole = event.currentTarget;
    const rect = blackhole.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = centerX - x;
    const dy = centerY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const captureRadius = rect.width * 0.78;
    const intensity = Math.max(0, Math.min(1, 1 - distance / captureRadius));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    blackhole.style.setProperty('--cursor-x', `${x.toFixed(0)}px`);
    blackhole.style.setProperty('--cursor-y', `${y.toFixed(0)}px`);
    blackhole.style.setProperty('--light-angle', `${angle.toFixed(2)}deg`);
    blackhole.style.setProperty('--light-length', `${Math.max(40, distance).toFixed(0)}px`);
    blackhole.style.setProperty('--light-intensity', intensity.toFixed(2));
  };

  const handleBlackholePointerLeave = (event) => {
    handleBlackholeLeave();
    event.currentTarget.style.setProperty('--light-intensity', '0');
  };

  const triggerCssBoost = () => {
    playBlackholeSound();
    setIsCssBoosted(true);
    if (cssBooostTimeoutRef.current) clearTimeout(cssBooostTimeoutRef.current);
    cssBooostTimeoutRef.current = setTimeout(() => {
      setIsCssBoosted(false);
      cssBooostTimeoutRef.current = null;
    }, 900);
  };

  const triggerBlackholeReset = () => {
    playBlackholeSound();
    setIsResetting(true);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setIsResetting(false);
      resetTimeoutRef.current = null;
    }, 3800);
  };

  const handleBlackholeEnter = () => {
    setIsHovered(true);
  };

  const handleBlackholeLeave = () => {
    setIsHovered(false);
  };

  const handleBlackholeKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerBlackholeReset();
    }
  };

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current && typeof sectionRef.current.scrollIntoView === 'function') {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    return () => {
      if (cssBooostTimeoutRef.current) clearTimeout(cssBooostTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (featuredIndexRef.current !== null && workRef.current && !workRef.current.contains(e.target)) {
        setFeaturedIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    featuredIndexRef.current = featuredIndex;
  }, [featuredIndex]);

  // Mobile only: auto-open the first card's preview when the work section scrolls into view.
  useEffect(() => {
    if (!isMobile) return undefined;
    const section = workRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoFeaturedRef.current) {
          hasAutoFeaturedRef.current = true;
          setFeaturedIndex(0);
        }
      },
      { threshold: 0.22 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile]);

  // Mobile only: smooth-scroll to the inline preview when the user taps a card.
  useEffect(() => {
    if (!isMobile || featuredIndex === null) return;
    if (!shouldScrollToFeaturedRef.current) return;
    shouldScrollToFeaturedRef.current = false;
    const panel = featuredPanelRef.current;
    if (panel && typeof panel.scrollIntoView === 'function') {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [featuredIndex, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT = 88;
    const INFLUENCE_RADIUS = 230;
    const RADIAL_FORCE = 0.14;
    const TANGENTIAL_FORCE = 0.48;
    const RETURN_STRENGTH = 0.022;
    const DAMPING = 0.87;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const x = Math.random() * W;
      const y = Math.random() * H;
      return { x, y, homeX: x, homeY: y, vx: 0, vy: 0, size: Math.random() * 1.5 + 0.35, baseOpacity: Math.random() * 0.32 + 0.1 };
    });

    const handleResize = () => {
      const sx = window.innerWidth / W;
      const sy = window.innerHeight / H;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      particles.forEach(p => { p.homeX *= sx; p.homeY *= sy; p.x *= sx; p.y *= sy; });
    };

    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mx > 0) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 130);
        grd.addColorStop(0, 'rgba(150, 70, 255, 0.07)');
        grd.addColorStop(0.5, 'rgba(90, 30, 180, 0.03)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(mx, my, 130, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < INFLUENCE_RADIUS && dist > 2) {
          const t = 1 - dist / INFLUENCE_RADIUS;
          p.vx += (dx / dist) * t * RADIAL_FORCE;
          p.vy += (dy / dist) * t * RADIAL_FORCE;
          p.vx += (-dy / dist) * t * TANGENTIAL_FORCE;
          p.vy += (dx / dist) * t * TANGENTIAL_FORCE;
        }

        p.vx += (p.homeX - p.x) * RETURN_STRENGTH;
        p.vy += (p.homeY - p.y) * RETURN_STRENGTH;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const proximity = dist < INFLUENCE_RADIUS ? Math.max(0, 1 - dist / INFLUENCE_RADIUS) : 0;
        const opacity = p.baseOpacity + proximity * 0.55;
        const r = Math.round(175 + proximity * 80);
        const g = Math.round(135 + proximity * 35);

        if (proximity > 0.25) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, (p.size + proximity) * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(170, 90, 255, ${proximity * 0.11})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + proximity * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, 255, ${opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const renderFeaturedPanel = (index) => {
    const item = workItems[index];
    return (
      <div className="work-featured-panel" key={`featured-${index}`} ref={featuredPanelRef} data-category={item.category}>
        {CLOUDINARY_CLOUD && item.image ? (
          <img
            className="work-featured-image"
            src={cloudinaryUrl(item.image, 1280)}
            srcSet={IMAGE_WIDTHS
              .map(w => `${cloudinaryUrl(item.image, w)} ${w}w`)
              .join(', ')}
            sizes="(max-width: 768px) 96vw, 520px"
            width="1280"
            height="720"
            loading="lazy"
            decoding="async"
            alt={`${item.title} preview`}
          />
        ) : (
          <div className="work-featured-image-placeholder" aria-hidden="true">
            <span>Image placeholder</span>
          </div>
        )}
        <div className="work-featured-body">
          <Typography component="span" className="work-item-category">
            {item.category}
          </Typography>
          <Typography component="h4" className="work-featured-title">
            {item.title}
          </Typography>
          <Typography component="p" className="work-featured-subtitle">
            {item.subtitle}
          </Typography>
          <Box className="work-item-tags" style={{ justifyContent: 'flex-start', marginTop: '10px' }}>
            {item.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" className="work-tag" />
            ))}
          </Box>
          <p className="work-featured-details">{item.details}</p>
          {item.repoUrl && (
            <Button
              component="a"
              href={item.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="work-repo-btn"
            >
              View Repository
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
      <div className="scroll-controls">
        <button onClick={() => scrollToSection(introRef)}>Intro</button>
        <button onClick={() => scrollToSection(workRef)}>Work</button>
      </div>
      <section ref={introRef} className="intro-section">
      <div
        className={`blackhole blackhole-shader ${isHovered ? 'blackhole-hover' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Slow down and restart black hole"
        onMouseEnter={handleBlackholeEnter}
        onPointerMove={handleBlackholePointerMove}
        onPointerLeave={handleBlackholePointerLeave}
        onClick={triggerBlackholeReset}
        onKeyDown={handleBlackholeKeyDown}
      >
        <ShaderBlackHole isResetting={isResetting} isHovered={isHovered} />
      </div>
      <h1>Welcome to my portfolio!</h1>
      <h2>Thanks for visiting!</h2>
      <section className="content-panel" aria-live="polite">
        <h3>{aboutSection.title}</h3>
        <p>{aboutSection.body}</p>
      </section>
      </section>
      <section ref={workRef} className="work-table-section" aria-label="Work highlights">
        <h3>Work Highlights</h3>
        <div className={`work-layout${featuredIndex !== null && !isMobile ? ' work-layout--split' : ''}`}>
          {!isMobile && featuredIndex !== null && renderFeaturedPanel(featuredIndex)}
          <div className={`work-list${featuredIndex !== null && !isMobile ? ' work-list--sidebar' : ''}`}>
            {workItems.map((item, index) => {
              const isFeatured = featuredIndex === index;
              return (
                <Fragment key={item.title}>
                <Card
                  component="article"
                  ref={el => { cardRefs.current[index] = el; }}
                  data-card-index={index}
                  className={`work-item${isFeatured ? ' work-item-featured' : ''}`}
                  data-category={item.category}
                  elevation={0}
                  style={{ animationDelay: `${index * 75}ms` }}
                  onPointerMove={handleCardPointerMove}
                  onPointerLeave={handleCardPointerLeave}
                >
                  <CardActionArea
                    className="work-item-header"
                    aria-selected={isFeatured}
                    onMouseEnter={() => { if (!isMobile) { playCardHoverSound(); setFeaturedIndex(index); } }}
                    onClick={() => {
                      if (isFeatured) {
                        setFeaturedIndex(null);
                      } else {
                        if (isMobile) shouldScrollToFeaturedRef.current = true;
                        setFeaturedIndex(index);
                      }
                    }}
                  >
                    <Box className="work-item-meta">
                      <Typography component="span" className="work-item-category">
                        {item.category}
                      </Typography>
                      <Typography component="h4" className="work-item-title">
                        {item.title}
                      </Typography>
                      <Typography component="span" className="work-item-subtitle">
                        {item.subtitle}
                      </Typography>
                    </Box>
                    <Box className="work-item-right">
                      <Box className="work-item-tags">
                        {item.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" className="work-tag" />
                        ))}
                      </Box>
                      <Typography component="span" className="work-item-toggle" aria-hidden="true">
                        {isFeatured ? '×' : '+'}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
                {isMobile && isFeatured && renderFeaturedPanel(index)}
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '72px', marginBottom: '48px' }}>
        <div
          className={`blackhole${isCssHovered ? ' blackhole-hover' : ''}${isCssBoosted ? ' blackhole-boost' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Activate CSS black hole"
          onMouseEnter={() => setIsCssHovered(true)}
          onPointerMove={handleBlackholePointerMove}
          onPointerLeave={(e) => { setIsCssHovered(false); e.currentTarget.style.setProperty('--light-intensity', '0'); }}
          onClick={triggerCssBoost}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerCssBoost(); } }}
        >
          <div className="gravitational-lens" />
          <div className="matter-cloud cloud-outer" />
          <div className="matter-cloud cloud-inner" />
          <div className="accretion-disk disk-back" />
          <div className="accretion-disk disk-front" />
          <div className="matter-plane" />
          <div className="event-horizon">
            <div className="singularity-glint" />
          </div>
          <div className="photon-shell" />
          <div className="lensed-arc arc-top" />
          <div className="lensed-arc arc-bottom" />
          <div className="doppler-sweep" />
          <div className="gravity-ripple ripple-one" />
          <div className="gravity-ripple ripple-two" />
          <div className="cursor-light" />
        </div>
      </section>
      <footer className="site-attribution" aria-label="Icon attribution">
        <p>
          Icon attribution:{' '}
          <a href="https://www.flaticon.com/free-icons/space" title="space icons" target="_blank" rel="noreferrer">
            Space icons created by Freepik - Flaticon
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
