import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Sphere, Torus, Cone } from "@react-three/drei";

function useReducedMotion() {
  return useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
}

function SpinningShape({ children, position, speed = 0.4, floatSpeed = 1.4, floatAmp = 0.16 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useFrame((state, delta) => {
    if (!ref.current) return;
    if (!reduced) {
      ref.current.rotation.x += delta * speed * 0.6;
      ref.current.rotation.y += delta * speed;
    }
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed + position[0]) * floatAmp;
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

function SceneRig({ tx, ty, children }) {
  const group = useRef(null);
  useFrame(() => {
    if (!group.current) return;
    const x = tx.get();
    const y = ty.get();
    group.current.rotation.y = x * 0.5;
    group.current.rotation.x = -y * 0.35;
  });
  return <group ref={group}>{children}</group>;
}

const SHAPES = [
  { key: "cube", position: [-2.7, 1.5, 0], speed: 0.5, color: "#527575" },
  { key: "sphere", position: [2.8, 1.15, -0.3], speed: 0.35, floatSpeed: 1.1, color: "#d87943" },
  { key: "torus", position: [-2.35, -1.55, 0.2], speed: 0.6, floatSpeed: 1.7, color: "#b8632f" },
  { key: "cone", position: [2.5, -1.65, -0.2], speed: 0.45, floatSpeed: 1.3, color: "#111827" },
];

function Shape({ shapeKey, color, ...rest }) {
  switch (shapeKey) {
    case "cube":
      return (
        <SpinningShape {...rest}>
          <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.16} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
          </RoundedBox>
        </SpinningShape>
      );
    case "sphere":
      return (
        <SpinningShape {...rest}>
          <Sphere args={[0.55, 24, 24]}>
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
          </Sphere>
        </SpinningShape>
      );
    case "torus":
      return (
        <SpinningShape {...rest}>
          <Torus args={[0.5, 0.2, 16, 32]}>
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
          </Torus>
        </SpinningShape>
      );
    case "cone":
      return (
        <SpinningShape {...rest}>
          <Cone args={[0.55, 0.9, 24]}>
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
          </Cone>
        </SpinningShape>
      );
    default:
      return null;
  }
}

export default function HeroToys3D({ tx, ty, quality = "full" }) {
  const lite = quality === "lite";
  const shapes = lite ? SHAPES.slice(0, 2) : SHAPES;

  return (
    <Canvas
      className="hero-toys-canvas"
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ alpha: true, antialias: !lite, powerPreference: lite ? "low-power" : "default" }}
      dpr={lite ? 1 : [1, 2]}
      frameloop="always"
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      {!lite && <directionalLight position={[-3, -2, -4]} intensity={0.35} color="#f7e8e0" />}

      <SceneRig tx={tx} ty={ty}>
        {shapes.map((s) => (
          <Shape key={s.key} shapeKey={s.key} position={s.position} speed={s.speed} floatSpeed={s.floatSpeed} color={s.color} />
        ))}
      </SceneRig>
    </Canvas>
  );
}
