"use client";

/**
 * Cena 3D do hero — "efeito antigravidade".
 *
 * A metáfora visual é uma composição de carteira desmontada no ar: arcos que,
 * juntos, formariam um gráfico de rosca, flutuando separados em profundidades
 * diferentes. Ela reage a duas entradas: posição do mouse (parallax) e rolagem
 * da página (os arcos se afastam e giram conforme o usuário desce).
 *
 * Três decisões de engenharia importam mais que o visual aqui:
 *
 *  1. Nada de HDRI ou textura remota. As luzes são explícitas para que a cena
 *     funcione offline, sem CDN externa e sem violar CSP restritiva.
 *  2. `prefers-reduced-motion` desliga o loop de animação de verdade
 *     (frameloop="demand"), não apenas encurta transições: renderiza o quadro
 *     inicial e para de desenhar. Encurtar a duração não ajudaria alguém com
 *     sensibilidade vestibular — o movimento contínuo é o problema.
 *  3. O DPR é limitado a 1.8. Em telas 3x, renderizar na resolução nativa
 *     custa caro e não muda a percepção de uma cena difusa como esta.
 */

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";

const NAVY = "#0b1f3a";
const GOLD = "#c9a24b";
const BLUE = "#274c77";
const BLUE_LIGHT = "#8fa9c4";

/** Progresso de rolagem do hero, de 0 a 1. Lido pelo loop de animação. */
type ScrollRef = { current: number };

type ArcSpec = {
  readonly rotation: [number, number, number];
  readonly position: [number, number, number];
  readonly arc: number;
  readonly radius: number;
  readonly tube: number;
  readonly color: string;
  readonly speed: number;
};

/**
 * Os arcos somam pouco menos de uma volta completa: a rosca fica visivelmente
 * incompleta, o que evita que a cena leia como um gráfico de dados real.
 */
const ARCS: readonly ArcSpec[] = [
  {
    rotation: [0.4, 0.2, 0],
    position: [0, 0.1, 0],
    arc: Math.PI * 0.62,
    radius: 1.75,
    tube: 0.075,
    color: GOLD,
    speed: 0.22,
  },
  {
    rotation: [0.4, 0.2, Math.PI * 0.7],
    position: [0.1, -0.05, -0.4],
    arc: Math.PI * 0.5,
    radius: 1.75,
    tube: 0.06,
    color: BLUE_LIGHT,
    speed: -0.18,
  },
  {
    rotation: [0.4, 0.2, Math.PI * 1.25],
    position: [-0.1, 0.05, -0.8],
    arc: Math.PI * 0.42,
    radius: 1.75,
    tube: 0.05,
    color: BLUE,
    speed: 0.14,
  },
  {
    rotation: [-0.3, 0.5, Math.PI * 0.35],
    position: [0.2, 0.2, -1.6],
    arc: Math.PI * 0.3,
    radius: 2.5,
    tube: 0.035,
    color: BLUE,
    speed: -0.1,
  },
];

function Arc({ spec, scroll }: { spec: ArcSpec; scroll: ScrollRef }) {
  const ref = useRef<THREE.Mesh>(null);
  const basePosition = useMemo(() => new THREE.Vector3(...spec.position), [spec.position]);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;

    mesh.rotation.z += delta * spec.speed;

    // A rolagem dispersa os arcos: eles se afastam do centro e recuam.
    const t = scroll.current;
    mesh.position.set(
      basePosition.x + basePosition.x * t * 2.5,
      basePosition.y - t * 1.8,
      basePosition.z - t * 2.2,
    );

    // Flutuação lenta, dessincronizada por arco para não parecer um bloco só.
    const elapsed = state.clock.elapsedTime;
    mesh.position.y += Math.sin(elapsed * 0.35 + spec.radius) * 0.09;
    mesh.rotation.x = spec.rotation[0] + Math.sin(elapsed * 0.22 + spec.tube * 40) * 0.06;
  });

  return (
    <mesh ref={ref} rotation={spec.rotation} position={spec.position}>
      <torusGeometry args={[spec.radius, spec.tube, 24, 160, spec.arc]} />
      <meshStandardMaterial
        color={spec.color}
        metalness={0.72}
        roughness={0.22}
        envMapIntensity={1.6}
      />
    </mesh>
  );
}

type ShardSpec = {
  readonly position: [number, number, number];
  readonly scale: number;
  readonly color: string;
  readonly phase: number;
};

const SHARDS: readonly ShardSpec[] = [
  { position: [-2.6, 0.9, -0.5], scale: 0.13, color: GOLD, phase: 0 },
  { position: [2.4, -0.7, -0.3], scale: 0.1, color: BLUE_LIGHT, phase: 1.4 },
  { position: [1.9, 1.35, -1.4], scale: 0.08, color: GOLD, phase: 2.7 },
  { position: [-2.1, -1.15, -1.1], scale: 0.11, color: BLUE_LIGHT, phase: 4.1 },
  { position: [0.4, 1.8, -2.0], scale: 0.07, color: GOLD, phase: 5.5 },
  { position: [-1.2, -1.7, -1.8], scale: 0.06, color: BLUE, phase: 3.2 },
];

function Shard({ spec, scroll }: { spec: ShardSpec; scroll: ScrollRef }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;

    const elapsed = state.clock.elapsedTime;
    mesh.position.y = spec.position[1] + Math.sin(elapsed * 0.45 + spec.phase) * 0.22;
    mesh.position.x = spec.position[0] + Math.cos(elapsed * 0.3 + spec.phase) * 0.14;
    mesh.position.z = spec.position[2] - scroll.current * 1.5;
    mesh.rotation.x += delta * 0.25;
    mesh.rotation.y += delta * 0.18;
  });

  return (
    <mesh ref={ref} position={spec.position} scale={spec.scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={spec.color}
        metalness={0.7}
        roughness={0.18}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}

/**
 * Parallax: o grupo inteiro segue o mouse com defasagem.
 *
 * A interpolação usa `damp` em vez de lerp por frame fixo, então o
 * comportamento não muda entre um monitor de 60Hz e um de 144Hz.
 */
function ParallaxGroup({
  children,
  scroll,
}: {
  children: React.ReactNode;
  scroll: ScrollRef;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const targetX = state.pointer.y * 0.12;
    const targetY = state.pointer.x * 0.2;

    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 3, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 3, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, scroll.current * 0.4, 3, delta);
  });

  return <group ref={ref}>{children}</group>;
}

/**
 * Iluminação da cena.
 *
 * O `Environment` aqui não carrega HDRI nenhum: ele renderiza os `Lightformer`
 * filhos para um cubemap em memória. Superfície metálica sem mapa de ambiente
 * renderiza preta — metal quase não tem componente difusa, ele só reflete — e
 * era exatamente o que acontecia antes. Com os lightformers, os arcos ganham
 * reflexo sem que a página dependa de CDN externa.
 *
 * `frames={1}` renderiza o cubemap uma única vez: a cena de luz é estática,
 * então recalcular a cada quadro seria desperdício puro de GPU.
 */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} color={BLUE_LIGHT} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-5, -2, 2]} intensity={28} distance={18} color={GOLD} />
      <pointLight position={[5, 3, -3]} intensity={20} distance={18} color={BLUE} />

      <Environment resolution={256} frames={1}>
        {/* Faixa quente principal — dá o brilho dourado nas bordas dos arcos. */}
        <Lightformer
          form="rect"
          intensity={5}
          color={GOLD}
          position={[-4, 2, -6]}
          scale={[8, 8, 1]}
        />
        {/* Contraluz fria, para separar os arcos do fundo azul-marinho. */}
        <Lightformer
          form="rect"
          intensity={3}
          color={BLUE_LIGHT}
          position={[5, -2, -6]}
          scale={[8, 8, 1]}
        />
        {/* Faixa branca estreita: cria a linha especular que lê como metal polido. */}
        <Lightformer
          form="rect"
          intensity={6}
          color="#ffffff"
          position={[0, 5, -3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 2, 1]}
        />
      </Environment>
    </>
  );
}

function Scene({ scroll }: { scroll: ScrollRef }) {
  return (
    <>
      <fog attach="fog" args={[NAVY, 9, 22]} />
      <Lights />
      {/* A composição vive na metade direita: a esquerda é do texto do hero, e
          arco cruzando a palavra atrapalha a leitura do título. */}
      <group position={[1.5, 0.15, 0]}>
        <ParallaxGroup scroll={scroll}>
          {ARCS.map((spec, i) => (
            <Arc key={`arc-${i}`} spec={spec} scroll={scroll} />
          ))}
          {SHARDS.map((spec, i) => (
            <Shard key={`shard-${i}`} spec={spec} scroll={scroll} />
          ))}
        </ParallaxGroup>
      </group>
    </>
  );
}

/**
 * Detecção de WebGL.
 *
 * O resultado é cacheado no módulo porque `getSnapshot` do
 * `useSyncExternalStore` precisa devolver um valor estável — recriar um canvas
 * a cada chamada devolveria um booleano novo e faria o React re-renderizar em
 * laço. Usamos `useSyncExternalStore` em vez de efeito com `setState` porque é
 * exatamente o caso que ele resolve: ler uma capacidade da plataforma que nunca
 * muda durante a vida da página.
 */
let webGLSupportCache: boolean | null = null;

function detectWebGLSupport(): boolean {
  if (webGLSupportCache === null) {
    try {
      const canvas = document.createElement("canvas");
      webGLSupportCache = Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
      );
    } catch {
      webGLSupportCache = false;
    }
  }
  return webGLSupportCache;
}

/** Capacidade da plataforma não emite eventos: não há o que assinar. */
const subscribeToNothing = () => () => {};

function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribeToNothing, detectWebGLSupport, () => false);
}

/** Progresso de rolagem dentro da altura da janela, normalizado de 0 a 1. */
function useScrollProgress(): ScrollRef {
  const scroll = useRef(0);

  useEffect(() => {
    const update = () => {
      const max = window.innerHeight || 1;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / max));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scroll;
}

export default function HeroScene() {
  const supportsWebGL = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();
  const scroll = useScrollProgress();

  // Sem WebGL, o gradiente de fallback do Hero permanece sozinho — a página
  // continua completa, apenas sem a cena.
  if (!supportsWebGL) return null;

  return (
    <Canvas
      // Decorativa: o conteúdo real do hero é o texto ao lado.
      aria-hidden="true"
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 1.8]}
      frameloop={prefersReducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Scene scroll={scroll} />
    </Canvas>
  );
}
