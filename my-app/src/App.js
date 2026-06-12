import './App.css';
import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };
  const boostTimeoutRef = useRef(null);
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
    },
    {
      title: 'AI Municipal Issue Router',
      subtitle: 'IBM watsonx Hackathon',
      details: 'Built an IBM watsonx hackathon prototype that accepts resident infrastructure reports through image and text input. Implemented classification, prioritization, and routing logic to move issues from automated intake into human review and work order preparation.',
      tags: ['AI', 'IBM watsonx', 'Python', 'Agentic'],
      category: 'ai',
      repoUrl: 'https://github.com/isaacmatt/IBM_watsonx-Hackathon-Orchestrate',
    },
    {
      title: 'Modular Motor Control Framework',
      subtitle: 'C++ Embedded Systems',
      details: 'Designed a modular C++ control framework for Arduino-class microcontrollers driving 12V worm gear motors. Implemented reusable abstractions for PWM control, encoder-ready position tracking, and command modes while keeping hardware access separate from control logic.',
      tags: ['C++', 'Arduino', 'Embedded', 'OOP'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/MotorCode',
    },
    {
      title: 'Wireless + I2C Hybrid Comms',
      subtitle: 'Distributed Microcontroller Architecture',
      details: 'Developed a distributed microcontroller communication model that combines wireless transmission with I2C device coordination. Structured message handling and timing boundaries to support reliable data exchange across remote controller hardware.',
      tags: ['C++', 'I2C', 'Wireless', 'Embedded'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/Micro_Comms',
    },
    {
      title: 'Raspberry Pi Pico W WiFi Module',
      subtitle: 'Embedded Wireless Networking',
      details: 'Implemented a Raspberry Pi Pico W WiFi module for embedded network communication. Developed firmware workflows for connecting microcontroller hardware to wireless services, testing data transfer reliability, and preparing the module for larger system integration.',
      tags: ['Pico W', 'WiFi', 'Embedded', 'MicroPython'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/RaspberryPi_WifiManager',
    },
    {
      title: 'SD Card PCB Design',
      subtitle: 'Storage Interface Hardware',
      details: 'Designed an SD card breakout PCB for embedded storage integration. Created the schematic and board layout with attention to footprint selection, compact routing, and reliable signal paths for removable storage in microcontroller projects.',
      tags: ['PCB Design', 'SD Card', 'KiCad', 'Hardware'],
      category: 'hardware',
      repoUrl: 'https://github.com/isaacmatt/SD_Card_Breakout_Board',
    },
    {
      title: 'ML Pothole Detection System',
      subtitle: 'Computer Vision - Capstone Project',
      details: 'Built a computer vision pipeline for detecting road damage in drone imagery using Python, OpenCV, PyTorch, and YOLO-based models. Developed preprocessing, augmentation, training, and benchmarking workflows, achieving greater than 90% detection accuracy through iterative model refinement.',
      tags: ['Python', 'PyTorch', 'YOLO', 'OpenCV'],
      category: 'ml',
      repoUrl: 'https://github.com/isaacmatt/2025ECE_CapstoneG12',
    },
    {
      title: 'Creative Systems Portfolio',
      subtitle: 'Experimental & Generative Design',
      details: 'Built and curated an experimental portfolio for technical projects that combine software engineering, interactive visuals, and generative design. Focused on performance-conscious rendering, polished presentation, and clear communication of engineering work.',
      tags: ['React', 'Creative', 'Generative'],
      category: 'creative',
      repoUrl: 'https://github.com/isaacmatt/eternal-infinite-void',
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

  const triggerBoost = () => {
    setIsBoosted(true);
    if (boostTimeoutRef.current) {
      clearTimeout(boostTimeoutRef.current);
    }
    boostTimeoutRef.current = setTimeout(() => {
      setIsBoosted(false);
      boostTimeoutRef.current = null;
    }, 900);
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
      triggerBoost();
    }
  };

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current && typeof sectionRef.current.scrollIntoView === 'function') {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        onPointerMove={handleBlackholePointerMove}
        onPointerLeave={handleBlackholePointerLeave}
        onClick={triggerBoost}
        onKeyDown={handleBlackholeKeyDown}
      >
        <div className="cursor-light" aria-hidden="true"></div>
        <div className="gravitational-lens lens-back"></div>
        <div className="matter-cloud cloud-outer"></div>
        <div className="matter-cloud cloud-inner"></div>
        <div className="accretion-disk disk-back"></div>
        <div className="photon-shell"></div>
        <div className="event-horizon">
          <div className="singularity-glint"></div>
        </div>
        <div className="accretion-disk disk-front"></div>
        <div className="matter-plane"></div>
        <div className="lensed-arc arc-top"></div>
        <div className="lensed-arc arc-bottom"></div>
        <div className="doppler-sweep"></div>
        <div className="gravity-ripple ripple-one"></div>
        <div className="gravity-ripple ripple-two"></div>
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
              <Card
                component="article"
                key={item.title}
                className={`work-item${isExpanded ? ' work-item-expanded' : ''}`}
                data-category={item.category}
                elevation={0}
                style={{ animationDelay: `${index * 75}ms` }}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                <CardActionArea
                  className="work-item-header"
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(index)}
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
                      {isExpanded ? '-' : '+'}
                    </Typography>
                  </Box>
                </CardActionArea>
                <div className={`work-item-body${isExpanded ? ' expanded' : ''}`}>
                  <CardContent className="work-item-body-content">
                    <p>{item.details}</p>
                    {item.repoUrl && (
                      <Button
                        component="a"
                        href={item.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="work-repo-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Repository
                      </Button>
                    )}
                  </CardContent>
                </div>
              </Card>
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
