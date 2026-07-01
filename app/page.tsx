"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";

const SITE_NAME = "Credit Cache";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.com";
const SITE_DESCRIPTION =
  "Credit Cache helps users explore opportunities, scholarship sweepstakes, lottery, and win recovery with a simple, trustworthy experience.";

type PointerPoint = {
  x: number;
  y: number;
};

type GestureState =
  | {
      mode: "rotate";
      pointerId: number;
      startX: number;
      startY: number;
      startRotX: number;
      startRotY: number;
    }
  | {
      mode: "pinch";
      pointerIdA: number;
      pointerIdB: number;
      startDistance: number;
      startAngle: number;
      startScale: number;
      startRotX: number;
      startRotY: number;
    }
  | null;

function CurvedGridBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      320,
    );
    camera.position.set(0, 8.8, 22);
    camera.lookAt(0, -1.8, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.pointerEvents = "none";
    mount.appendChild(renderer.domElement);

    const gridColorHex =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--border")
        .trim() || "rgba(0,0,0,0.08)";

    const gridColor = new THREE.Color(gridColorHex);

    const gridGroup = new THREE.Group();
    gridGroup.position.y = -2.4;
    scene.add(gridGroup);

    const planeSize = 220;

    const vertexShader = `
      varying vec3 vWorldPos;
      varying vec4 vClipPos;
      varying float vViewDepth;

      uniform float uCurveDepth;

      void main() {
        vec3 pos = vec3(position.x, 0.0, position.y);

        float halfSize = 110.0;
        float radial = length(pos.xz) / halfSize;
        float clampedRadial = clamp(radial, 0.0, 1.0);

        // Much flatter than before, so it reads like a real grid floor.
        pos.y = -uCurveDepth * pow(clampedRadial, 1.5);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);
        vec4 clipPos = projectionMatrix * viewPos;

        vWorldPos = worldPos.xyz;
        vClipPos = clipPos;
        vViewDepth = -viewPos.z;

        gl_Position = clipPos;
      }
    `;

    const fragmentShader = `
      precision highp float;

      varying vec3 vWorldPos;
      varying vec4 vClipPos;
      varying float vViewDepth;

      uniform vec3 uGridColor;
      uniform float uOpacity;
      uniform float uMinorStep;
      uniform float uMajorStep;
      uniform float uMinorWidth;
      uniform float uMajorWidth;
      uniform float uMinorIntensity;
      uniform float uMajorIntensity;
      uniform float uFadeStart;
      uniform float uFadeEnd;
      uniform float uRadialFadeStart;
      uniform float uRadialFadeEnd;
      uniform float uTime;

      float gridLine(vec2 p, float stepSize, float width) {
        vec2 coord = p / stepSize;
        vec2 cell = abs(fract(coord - 0.5) - 0.5);
        vec2 aa = fwidth(coord) * 0.9;
        vec2 line = 1.0 - smoothstep(vec2(width) - aa, vec2(width) + aa, cell);
        return max(line.x, line.y);
      }

      void main() {
        vec2 world = vWorldPos.xz;

        float minor = gridLine(world, uMinorStep, uMinorWidth) * uMinorIntensity;
        float major = gridLine(world, uMajorStep, uMajorWidth) * uMajorIntensity;
        float grid = max(minor, major);

        vec2 ndc = vClipPos.xy / vClipPos.w;
        float screenX = abs(ndc.x);
        float screenY = ndc.y * 0.5 + 0.5;

        // Stronger fade toward the edges so the horizon stays clean on wide screens.
        float sideFade = 1.0 - smoothstep(0.48, 1.0, screenX);
        float topFade = 1.0 - smoothstep(0.34, 0.92, screenY);

        float depthFade = 1.0 - smoothstep(uFadeStart, uFadeEnd, vViewDepth);
        float radialFade = 1.0 - smoothstep(uRadialFadeStart, uRadialFadeEnd, length(world));

        float fade = depthFade * mix(1.0, sideFade * topFade, 0.9) * radialFade;

        float shimmer = 0.985 + 0.015 * sin(uTime * 0.0007 + world.x * 0.03 + world.y * 0.02);

        float alpha = grid * uOpacity * fade * shimmer;

        gl_FragColor = vec4(uGridColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      uniforms: {
        uGridColor: { value: gridColor },
        uOpacity: { value: 0.22 },
        uMinorStep: { value: 4.0 },
        uMajorStep: { value: 20.0 },
        uMinorWidth: { value: 0.012 },
        uMajorWidth: { value: 0.024 },
        uMinorIntensity: { value: 0.42 },
        uMajorIntensity: { value: 1.0 },
        uFadeStart: { value: 16.0 },
        uFadeEnd: { value: 52.0 },
        uRadialFadeStart: { value: 42.0 },
        uRadialFadeEnd: { value: 86.0 },
        uCurveDepth: { value: 0.45 },
        uTime: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 1);
    const gridMesh = new THREE.Mesh(geometry, material);
    gridGroup.add(gridMesh);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointers = new Map<number, PointerPoint>();

    const current = {
      scale: 0.62,
      rotX: -0.18,
      rotY: 0.05,
    };

    const target = {
      scale: 0.62,
      rotX: -0.18,
      rotY: 0.05,
    };

    let gesture: GestureState = null;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const distance = (a: PointerPoint, b: PointerPoint) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const angle = (a: PointerPoint, b: PointerPoint) =>
      Math.atan2(b.y - a.y, b.x - a.x);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const updateGestureState = () => {
      const active = Array.from(pointers.entries());

      if (active.length === 1) {
        const [pointerId, point] = active[0];

        gesture = {
          mode: "rotate",
          pointerId,
          startX: point.x,
          startY: point.y,
          startRotX: target.rotX,
          startRotY: target.rotY,
        };
        return;
      }

      if (active.length >= 2) {
        const [idA, pA] = active[0];
        const [idB, pB] = active[1];

        gesture = {
          mode: "pinch",
          pointerIdA: idA,
          pointerIdB: idB,
          startDistance: distance(pA, pB),
          startAngle: angle(pA, pB),
          startScale: target.scale,
          startRotX: target.rotX,
          startRotY: target.rotY,
        };
        return;
      }

      gesture = null;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      updateGestureState();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (!gesture) return;

      if (gesture.mode === "rotate") {
        if (event.pointerId !== gesture.pointerId) return;

        const point = pointers.get(event.pointerId);
        if (!point) return;

        const dx = point.x - gesture.startX;
        const dy = point.y - gesture.startY;

        target.rotY = gesture.startRotY + dx * 0.0055;
        target.rotX = clamp(gesture.startRotX + dy * 0.0045, -0.72, 0.18);
      }

      if (gesture.mode === "pinch") {
        const a = pointers.get(gesture.pointerIdA);
        const b = pointers.get(gesture.pointerIdB);
        if (!a || !b) return;

        const nextDistance = distance(a, b);
        const nextAngle = angle(a, b);

        target.scale = clamp(
          gesture.startScale * (nextDistance / gesture.startDistance),
          0.42,
          1.0,
        );

        target.rotY = gesture.startRotY + (nextAngle - gesture.startAngle) * 0.55;
        target.rotX = clamp(gesture.startRotX, -0.72, 0.18);
      }
    };

    const endPointer = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      updateGestureState();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const zoom = Math.exp(-event.deltaY * 0.0012);
      target.scale = clamp(target.scale * zoom, 0.42, 1.0);
    };

    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", endPointer);
    mount.addEventListener("pointercancel", endPointer);
    mount.addEventListener("wheel", onWheel, { passive: false });

    let raf = 0;

    const animate = (time: number) => {
      raf = requestAnimationFrame(animate);

      material.uniforms.uTime.value = time;

      current.scale = lerp(current.scale, target.scale, 0.08);
      current.rotX = lerp(current.rotX, target.rotX, 0.08);
      current.rotY = lerp(current.rotY, target.rotY, 0.08);

      gridGroup.scale.setScalar(current.scale);

      if (reducedMotion) {
        gridGroup.rotation.x = current.rotX;
        gridGroup.rotation.y = current.rotY;
      } else {
        gridGroup.rotation.x = current.rotX + Math.sin(time * 0.00008) * 0.008;
        gridGroup.rotation.y = current.rotY + Math.sin(time * 0.00012) * 0.012;
      }

      renderer.render(scene, camera);
    };

    raf = requestAnimationFrame(animate);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);

      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", endPointer);
      mount.removeEventListener("pointercancel", endPointer);
      mount.removeEventListener("wheel", onWheel);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      aria-hidden="true"
      style={{ touchAction: "none", cursor: "grab" }}
    />
  );
}

function FadeInBlock({
  children,
  delay = 0,
  className = "",
  loaded,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  loaded: boolean;
}) {
  return (
    <div
      className={`transform-gpu transition-all duration-700 ${className}`}
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0px)" : "translateY(18px)",
        filter: loaded ? "blur(0px)" : "blur(2px)",
        transitionDelay: loaded ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Head>
        <title>Credit Cache | Opportunities, Scholarships, Lottery & Win Recovery</title>
        <meta
          name="description"
          content={SITE_DESCRIPTION}
        />
        <meta
          name="keywords"
          content="Credit Cache, opportunities, scholarships, lottery, win recovery, signup, support center"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta
          property="og:title"
          content="Credit Cache | Opportunities, Scholarships, Lottery & Win Recovery"
        />
        <meta
          property="og:description"
          content={SITE_DESCRIPTION}
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/cc.jpg`} />
        <meta property="og:image:alt" content="Credit Cache logo" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Credit Cache | Opportunities, Scholarships, Lottery & Win Recovery"
        />
        <meta
          name="twitter:description"
          content={SITE_DESCRIPTION}
        />
        <meta name="twitter:image" content={`${SITE_URL}/cc.jpg`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>

      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background font-sans text-foreground">
        <CurvedGridBackground />

        <main className="relative z-10 flex w-full max-w-3xl flex-1 flex-col items-center justify-between px-6 py-24 sm:items-start sm:px-16">
          <FadeInBlock loaded={loaded} delay={0}>
            <Image
              className="dark:invert"
              src="/cc.jpg"
              alt="Credit Cache logo"
              width={200}
              height={60}
              priority
            />
          </FadeInBlock>

          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <FadeInBlock loaded={loaded} delay={140}>
              <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
                Welcome to Credit Cache. Let&apos;s see what brings you here.
              </h1>
            </FadeInBlock>

            <FadeInBlock loaded={loaded} delay={280}>
              <p className="max-w-md text-lg leading-8 text-muted">
                Looking for an opportunity, scholarship sweepstakes, lottery, or win
                recovery? Create a free{" "}
                <Link
                  href="/signup"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  account
                </Link>{" "}
                or contact the{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  support center
                </Link>
                .
              </p>
            </FadeInBlock>
          </div>

          <FadeInBlock loaded={loaded} delay={420} className="w-full">
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
              <Link
                href="/signup"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-[var(--surface-strong)] px-5 text-foreground shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:opacity-90 md:w-[158px]"
              >
                Get Started
              </Link>

              <Link
                href="/auth/signin"
                className="flex h-12 w-full items-center justify-center rounded-full border border-border bg-transparent px-5 text-foreground backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-[var(--surface)] md:w-[158px]"
              >
                Opportunities
              </Link>
            </div>
          </FadeInBlock>
        </main>
      </div>
    </>
  );
}