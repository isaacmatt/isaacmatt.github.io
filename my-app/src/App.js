import './App.css';
import { useEffect, useRef, useState } from 'react';

const RING_BASE_DURATIONS = {
  a: 6500,
  b: 4800,
  c: 3600,
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [spinRate, setSpinRate] = useState(1);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };
  const boostTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const ringARef = useRef(null);
  const ringBRef = useRef(null);
  const ringCRef = useRef(null);
  const ringAnimationsRef = useRef([]);
  const hoverPlaybackRef = useRef({ a: 2.5, b: 0.57, c: 1.9 });
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
      details: 'An experimental web development environment used to prototype layout systems, deployment workflows, and responsive UI components. Built to test Git-based version control, static hosting configurations, and frontend performance considerations. Serves as a sandbox for iterative design and infrastructure experimentation.',
      tags: ['React', 'GitHub Pages', 'Responsive UI'],
      category: 'web',
      repoUrl: 'https://github.com/isaacmatt/TestWebPage_Alpha',
    },
    {
      title: 'AI Municipal Issue Router',
      subtitle: 'IBM watsonx Hackathon',
      details: 'An end-to-end workflow platform where residents submit infrastructure issues (e.g., road damage) via image and text input. Integrates classification logic, prioritization workflows, and routing mechanisms for human review and work order generation. Designed with agentic orchestration principles for structured intake, automated triage, and downstream approval integration.',
      tags: ['AI', 'IBM watsonx', 'Python', 'Agentic'],
      category: 'ai',
      repoUrl: 'https://github.com/isaacmatt/IBM_watsonx-Hackathon-Orchestrate',
    },
    {
      title: 'Modular Motor Control Framework',
      subtitle: 'C++ Embedded Systems',
      details: 'A modular C++ control framework for managing 12V worm gear motors using Arduino-based microcontrollers. Implements object-oriented abstractions for motor control, position tracking, and structured command execution. Supports scalable integration of encoders, PWM control, and multi-mode operation with clean hardware/logic separation.',
      tags: ['C++', 'Arduino', 'Embedded', 'OOP'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/MotorCode',
    },
    {
      title: 'Wireless + I2C Hybrid Comms',
      subtitle: 'Distributed Microcontroller Architecture',
      details: 'A dual-layer communication architecture combining wireless transmission with I2C-based device coordination for remote controller systems. Ensures reliable data transfer between distributed microcontrollers while managing timing constraints and structured message handling.',
      tags: ['C++', 'I2C', 'Wireless', 'Embedded'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/Micro_Comms',
    },
    {
      title: 'Raspberry Pi Pico W WiFi Module',
      subtitle: 'Embedded Wireless Networking',
      details: 'A hardware-focused project integrating the Raspberry Pi Pico W as a WiFi-enabled module for microcontroller systems. Explores wireless connectivity, board-level integration, and structured firmware workflows for sending data between embedded devices and networked services.',
      tags: ['Pico W', 'WiFi', 'Embedded', 'MicroPython'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/RaspberryPi_WifiManager',
    },
    {
      title: 'SD Card PCB Design',
      subtitle: 'Storage Interface Hardware',
      details: 'A PCB design project for an SD card interface module, focused on reliable storage connectivity, compact board layout, and clean signal routing. Covers schematic capture, footprint selection, and layout considerations for integrating removable storage into embedded systems.',
      tags: ['PCB Design', 'SD Card', 'KiCad', 'Hardware'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/SD_Card_Breakout_Board',
    },
    {
      title: 'ML Pothole Detection System',
      subtitle: 'Computer Vision - Capstone Project',
      details: 'A full-stack computer vision pipeline for detecting road damage using drone-captured imagery. Built using Python, OpenCV, and PyTorch (YOLO-based models). Includes dataset preprocessing, augmentation workflows, model training, and performance benchmarking under edge-compute constraints. Achieved >90% detection accuracy through iterative refinement.',
      tags: ['Python', 'PyTorch', 'YOLO', 'OpenCV'],
      category: 'ml',
      repoUrl: 'https://github.com/isaacmatt/2025ECE_CapstoneG12',
    },
    {
      title: 'Creative Systems Portfolio',
      subtitle: 'Experimental & Generative Design',
      details: 'A curated portfolio showcasing experimental and creative technical work, blending software engineering with visual and conceptual design. Highlights exploratory projects focused on simulation, generative design, and performance-conscious rendering.',
      tags: ['React', 'Creative', 'Generative'],
      category: 'creative',
      repoUrl: 'https://github.com/isaacmatt/eternal-infinite-void',
    },
  ];

  const triggerBoost = () => {
    setIsBoosted(true);
    setSpinRate(1.9);
    if (boostTimeoutRef.current) {
      clearTimeout(boostTimeoutRef.current);
    }
    boostTimeoutRef.current = setTimeout(() => {
      setIsBoosted(false);
      setSpinRate(1);
      boostTimeoutRef.current = null;
    }, 900);
  };

  const handleBlackholeEnter = () => {
    hoverPlaybackRef.current = {
      a: randomBetween(1.4, 3.3),
      b: randomBetween(0.35, 1.1),
      c: randomBetween(1.2, 2.8),
    };
    setIsHovered(true);
    if (!isBoosted) {
      setSpinRate(1.15);
    }
  };

  const handleBlackholeLeave = () => {
    setIsHovered(false);
    if (!isBoosted) {
      setSpinRate(1);
    }
  };

  const handleBlackholeKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerBoost();
    }
  };

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current && typeof sectionRef.current.scrollIntoView === 'function') {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = spinRate;
    }
  }, [spinRate]);

  useEffect(() => {
    const animationConfigs = [
      {
        element: ringARef.current,
        keyframes: [
          { transform: 'rotate(0deg) scale(1)', opacity: 0.8 },
          { transform: 'rotate(180deg) scale(1.02)', opacity: 1 },
          { transform: 'rotate(360deg) scale(1)', opacity: 0.8 },
        ],
        duration: RING_BASE_DURATIONS.a,
      },
      {
        element: ringBRef.current,
        keyframes: [
          { transform: 'rotate(360deg)', opacity: 0.72 },
          { opacity: 0.95, offset: 0.5 },
          { transform: 'rotate(0deg)', opacity: 0.72 },
        ],
        duration: RING_BASE_DURATIONS.b,
      },
      {
        element: ringCRef.current,
        keyframes: [
          { transform: 'rotate(0deg)', opacity: 0.66 },
          { opacity: 0.88, offset: 0.5 },
          { transform: 'rotate(360deg)', opacity: 0.66 },
        ],
        duration: RING_BASE_DURATIONS.c,
      },
    ];

    ringAnimationsRef.current = animationConfigs
      .filter((config) => config.element && typeof config.element.animate === 'function')
      .map((config) =>
        config.element.animate(config.keyframes, {
          duration: config.duration,
          iterations: Infinity,
          easing: 'linear',
        })
      );

    return () => {
      ringAnimationsRef.current.forEach((animation) => animation.cancel());
      ringAnimationsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!ringAnimationsRef.current.length) {
      return;
    }

    if (isHovered) {
      ringAnimationsRef.current[0].playbackRate = hoverPlaybackRef.current.a;
      ringAnimationsRef.current[1].playbackRate = hoverPlaybackRef.current.b;
      ringAnimationsRef.current[2].playbackRate = hoverPlaybackRef.current.c;
      return;
    }

    ringAnimationsRef.current[0].playbackRate = 1;
    ringAnimationsRef.current[1].playbackRate = 1;
    ringAnimationsRef.current[2].playbackRate = 1;
  }, [isHovered]);

  useEffect(() => {
    return () => {
      if (boostTimeoutRef.current) {
        clearTimeout(boostTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="App">
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
      <div className="scroll-controls">
        <button onClick={() => scrollToSection(introRef)}>Intro</button>
        <button onClick={() => scrollToSection(workRef)}>Work</button>
      </div>
      <section ref={introRef} className="intro-section">
      <div
        className={`blackhole ${isHovered ? 'blackhole-hover' : ''} ${isBoosted ? 'blackhole-boost' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Activate black hole spin burst"
        onMouseEnter={handleBlackholeEnter}
        onMouseLeave={handleBlackholeLeave}
        onClick={triggerBoost}
        onKeyDown={handleBlackholeKeyDown}
      >
        <video
          ref={videoRef}
          className="blackhole-video"
          src={`${process.env.PUBLIC_URL}/blackhole-loop.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div ref={ringARef} className="inner-spin-ring ring-a"></div>
        <div ref={ringBRef} className="inner-spin-ring ring-b"></div>
        <div ref={ringCRef} className="inner-spin-ring ring-c"></div>
        <div className="lensing-halo"></div>
        <div className="center-shadow"></div>
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
        <div className="work-list">
          {workItems.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <article
                key={item.title}
                className={`work-item${isExpanded ? ' work-item-expanded' : ''}`}
                data-category={item.category}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div
                  className="work-item-header"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(index); }
                  }}
                >
                  <div className="work-item-meta">
                    <span className="work-item-category">{item.category}</span>
                    <h4>{item.title}</h4>
                    <span className="work-item-subtitle">{item.subtitle}</span>
                  </div>
                  <div className="work-item-right">
                    <div className="work-item-tags">
                      {item.tags.map(tag => (
                        <span key={tag} className="work-tag">{tag}</span>
                      ))}
                    </div>
                    <span className="work-item-toggle" aria-hidden="true">{isExpanded ? '-' : '+'}</span>
                  </div>
                </div>
                <div className={`work-item-body${isExpanded ? ' expanded' : ''}`}>
                  <div>
                    <p>{item.details}</p>
                    {item.repoUrl && (
                      <a
                        href={item.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="work-repo-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Repository
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
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
