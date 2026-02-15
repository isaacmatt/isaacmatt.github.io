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
  const boostTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const ringARef = useRef(null);
  const ringBRef = useRef(null);
  const ringCRef = useRef(null);
  const ringAnimationsRef = useRef([]);
  const hoverPlaybackRef = useRef({ a: 2.5, b: 0.57, c: 1.9 });
  const introRef = useRef(null);
  const workRef = useRef(null);

  const aboutSection = {
    title: 'About Me',
    body: 'I build software systems that bridge low-level engineering with intelligent applications. My work spans backend development, real-time systems, and machine learning pipelines, with a focus on modular architecture, performance, and structured problem-solving. I enjoy designing reliable systems that operate under real-world constraints.',
  };
  const workItems = [
    {
      title: 'TestWebPage Alpha — Frontend Architecture & Deployment Sandbox',
      details: 'An experimental web development environment used to prototype layout systems, deployment workflows, and responsive UI components. Built to test Git-based version control, static hosting configurations, and frontend performance considerations. Serves as a sandbox for iterative design and infrastructure experimentation.',
      repoUrl: 'https://github.com/isaacmatt/TestWebPage_Alpha',
    },
    {
      title: 'AI-Driven Municipal Issue Routing System (IBM watsonx Hackathon)',
      details: ' An end-to-end workflow platform where residents submit infrastructure issues (e.g., road damage) via image and text input. The system integrates classification logic, prioritization workflows, and routing mechanisms for human review and work order generation.Designed with agentic orchestration principles, enabling structured intake, data extraction, automated triage, and integration with downstream approval systems. Focused on scalable decision pipelines and structured information flow.',
      repoUrl: 'https://github.com/isaacmatt/IBM_watsonx-Hackathon-Orchestrate',
    },
    {
      title: 'Modular Motor Control Framework (C++ Embedded Systems)',
      details: 'A modular C++ control framework for managing 12V worm gear motors using Arduino-based microcontrollers. Implements object-oriented abstractions for motor control, position tracking, and structured command execution. Designed to support scalable integration of encoders, PWM control, and multi-mode operation while maintaining clean separation between hardware drivers and control logic.',
      repoUrl: 'https://github.com/isaacmatt/MotorCode',
    },
        {
      title: 'Wireless + I2C Hybrid Communication System',
      details: 'A dual-layer communication architecture combining wireless transmission with I2C-based device coordination for remote controller systems. Designed to ensure reliable data transfer between distributed microcontrollers while managing timing constraints and structured message handling. Explores layered communication design, protocol abstraction, and modular integration patterns.',
      repoUrl: 'https://github.com/isaacmatt/Micro_Comms',
    },
        {
      title: 'Machine Learning-Based Pothole Detection System',
      details: 'A full-stack computer vision pipeline for detecting road damage using drone-captured imagery. Built using Python, OpenCV, and PyTorch (YOLO-based models). Includes dataset preprocessing, augmentation workflows, model training and evaluation, and performance benchmarking under edge-compute constraints (Raspberry Pi-class hardware). Achieved >90% detection accuracy through iterative dataset refinement and hyperparameter tuning.',
      repoUrl: 'https://github.com/isaacmatt/2025ECE_CapstoneG12',
    },
        {
      title: 'Creative Systems Portfolio',
      details: 'A curated portfolio showcasing experimental and creative technical work, blending software engineering with visual and conceptual design. Highlights exploratory projects focused on simulation, generative design, and performance-conscious rendering.',
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

  return (
    <div className="App">
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
          {workItems.map((item) => (
            <article key={item.title} className="work-item">
              <h4>{item.title}</h4>
              <p>{item.details}</p>
              <a href={item.repoUrl} target="_blank" rel="noreferrer">
                View Repository
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
