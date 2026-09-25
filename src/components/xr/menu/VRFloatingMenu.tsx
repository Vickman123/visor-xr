import React, { useState, useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Project, VRMode, VRLocomotionMode } from '../../../types';

interface VRFloatingMenuProps {
  vrMode: VRMode;
  locomotionMode: VRLocomotionMode;
  isAR?: boolean;
  onSetVRMode: (mode: VRMode) => void;
  onSetLocomotionMode: (mode: VRLocomotionMode) => void;
  onResetTransform: () => void;
  onCycleScale: () => void;
  onGoHome: () => void;
  currentScale?: number;
  projects?: Project[];
  currentProject?: Project;
  onSelectProject?: (project: Project) => void;
}

interface MenuButtonProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  label: string;
  icon: string;
  active?: boolean;
  accentColor?: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  position,
  width = 0.22,
  height = 0.075,
  label,
  icon,
  active = false,
  accentColor = '#0ea5e9',
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const bgColor = active ? accentColor : hovered ? '#334155' : '#1e293b';
  const textColor = active ? '#ffffff' : hovered ? '#38bdf8' : '#e2e8f0';

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Background Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, 0.015]} />
        <meshStandardMaterial
          color={bgColor}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Button Text */}
      <Text
        position={[0, 0, 0.012]}
        fontSize={0.024}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {`${icon} ${label}`}
      </Text>
    </group>
  );
};

export const VRFloatingMenu: React.FC<VRFloatingMenuProps> = ({
  vrMode,
  locomotionMode,
  isAR = false,
  onSetVRMode,
  onSetLocomotionMode,
  onResetTransform,
  onCycleScale,
  onGoHome,
  currentScale = 1.0,
  projects = [],
  currentProject,
  onSelectProject,
}) => {
  const { gl } = useThree();
  const [isOpen, setIsOpen] = useState(true);
  const groupRef = useRef<THREE.Group>(null);

  // Cached left controller pose
  const leftHandPos = useRef(new THREE.Vector3());
  const leftHandQuat = useRef(new THREE.Quaternion());
  const hasLeftHand = useRef(false);
  const prevBtnPressedRef = useRef(false);

  const handleExitXR = () => {
    const session = gl.xr.getSession();
    if (session) {
      session.end();
    }
  };

  const handleGoHome = () => {
    handleExitXR();
    onGoHome();
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Cycle to previous project while inside XR
  const handlePrevProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIndex]);
  };

  // Cycle to next project while inside XR
  const handleNextProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIndex]);
  };

  // Listen for Quest controller buttons [X] and [Y] on Left Controller, and track left hand pose
  useFrame((state, _delta, frame: any) => {
    const session = state.gl.xr.getSession();
    const referenceSpace = state.gl.xr.getReferenceSpace();

    let foundLeft = false;

    if (session) {
      for (const source of session.inputSources) {
        if (!source.gamepad) continue;

        // Check Left Controller
        if (source.handedness === 'left') {
          // Meta Quest Left Controller buttons:
          // buttons[4]: X button
          // buttons[5]: Y button
          const xPressed = source.gamepad.buttons[4]?.pressed;
          const yPressed = source.gamepad.buttons[5]?.pressed;
          const isPressed = !!(xPressed || yPressed);

          if (isPressed && !prevBtnPressedRef.current) {
            setIsOpen((prev) => !prev);
          }
          prevBtnPressedRef.current = isPressed;

          // Track left controller 3D pose in real time
          const space = source.gripSpace || source.targetRaySpace;
          if (space && frame && referenceSpace) {
            const pose = frame.getPose(space, referenceSpace);
            if (pose && pose.transform) {
              const p = pose.transform.position;
              const o = pose.transform.orientation;
              if (Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)) {
                foundLeft = true;
                leftHandPos.current.set(p.x, p.y, p.z);
                if (o && Number.isFinite(o.x)) {
                  leftHandQuat.current.set(o.x, o.y, o.z, o.w);
                }
              }
            }
          }
        }
      }
    }

    hasLeftHand.current = foundLeft;

    // When menu is open, glue it to the left hand and orient it towards the viewer's eyes!
    if (groupRef.current && isOpen) {
      if (hasLeftHand.current) {
        // Wrist palette offset: slightly above (+0.14m) and slightly to the right (+0.05m) of the controller
        const offset = new THREE.Vector3(0.05, 0.14, 0.04);
        offset.applyQuaternion(leftHandQuat.current);

        const targetPos = leftHandPos.current.clone().add(offset);
        groupRef.current.position.copy(targetPos);

        // Always face towards the headset camera so it is 100% readable from any wrist angle
        const camPos = state.camera.position;
        groupRef.current.lookAt(camPos.x, camPos.y + 0.05, camPos.z);
      } else {
        // Fallback for emulator / testing: float on the left side (never in the center!)
        const headPos = new THREE.Vector3();
        const headDir = new THREE.Vector3();
        state.camera.getWorldPosition(headPos);
        state.camera.getWorldDirection(headDir);
        headDir.y = 0;
        headDir.normalize();

        const sideLeft = new THREE.Vector3(-headDir.z, 0, headDir.x);
        groupRef.current.position.set(
          headPos.x + headDir.x * 0.65 + sideLeft.x * 0.35,
          headPos.y - 0.05,
          headPos.z + headDir.z * 0.65 + sideLeft.z * 0.35
        );
        const yaw = Math.atan2(headDir.x, headDir.z) + Math.PI;
        groupRef.current.rotation.set(-0.12, yaw + 0.35, 0);
      }
    }
  });

  // Keyboard shortcut 'x' or 'y' for desktop testing
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'y') {
        toggleMenu();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // When closed: Do NOT block the center with any floating button!
  if (!isOpen) {
    return null;
  }

  const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
  const activeProjectTitle = currentProject
    ? `[${currentIndex + 1}/${projects.length}] ${currentProject.name}`
    : 'Modelo Actual';

  return (
    <group ref={groupRef} scale={[0.65, 0.65, 0.65]}>
      {/* Back Panel / Handheld Glass Clipboard Base */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[0.58, 0.58, 0.012]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* Cyber Neon Cyan Border Accent */}
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[0.59, 0.59, 0.005]} />
        <meshBasicMaterial color={isAR ? '#10b981' : '#06b6d4'} />
      </mesh>

      {/* Header Title with Active Mode Badge */}
      <Text
        position={[0, 0.24, 0.005]}
        fontSize={0.024}
        color={isAR ? '#34d399' : '#38bdf8'}
        anchorX="center"
        anchorY="middle"
      >
        {isAR ? '👓 MENÚ XR · REALIDAD AUMENTADA' : '🥽 MENÚ XR · REALIDAD VIRTUAL'}
      </Text>

      {/* Controller Hint */}
      <Text
        position={[0, 0.21, 0.005]}
        fontSize={0.013}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Presiona [X] o [Y] en mando izquierdo para ocultar
      </Text>

      {/* Row 1: In-VR Project Switcher */}
      {projects && projects.length > 1 && onSelectProject && (
        <group position={[0, 0.14, 0]}>
          <MenuButton
            position={[-0.19, 0, 0]}
            width={0.11}
            icon="◀"
            label="Ant."
            onClick={handlePrevProject}
          />
          {/* Current project badge / label */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.24, 0.075, 0.015]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
          </mesh>
          <Text
            position={[0, 0, 0.012]}
            fontSize={0.016}
            maxWidth={0.22}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {activeProjectTitle}
          </Text>
          <MenuButton
            position={[0.19, 0, 0]}
            width={0.11}
            icon="▶"
            label="Sig."
            onClick={handleNextProject}
          />
        </group>
      )}

      {/* Row 2: Mode Switch */}
      <MenuButton
        position={[-0.13, 0.05, 0]}
        icon="🏗️"
        label="Maqueta"
        active={vrMode === 'maqueta'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('maqueta')}
      />
      <MenuButton
        position={[0.13, 0.05, 0]}
        icon="🚪"
        label="Escala 1:1"
        active={vrMode === 'escala1_1'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('escala1_1')}
      />

      {/* Row 3: Locomotion Selection */}
      <MenuButton
        position={[-0.13, -0.04, 0]}
        icon="📍"
        label="Teleport"
        active={locomotionMode === 'teleport'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('teleport')}
      />
      <MenuButton
        position={[0.13, -0.04, 0]}
        icon="🚶"
        label="Joystick"
        active={locomotionMode === 'joystick'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('joystick')}
      />

      {/* Row 4: Actions (Scale / Reset) */}
      <MenuButton
        position={[-0.13, -0.13, 0]}
        icon="↔"
        label={`Escala ${currentScale.toFixed(1)}x`}
        onClick={onCycleScale}
      />
      <MenuButton
        position={[0.13, -0.13, 0]}
        icon="🔄"
        label="Reset"
        onClick={onResetTransform}
      />

      {/* Row 5: Navigation & Ocultar */}
      <MenuButton
        position={[-0.13, -0.22, 0]}
        icon="🏠"
        label="Salir a Web"
        onClick={handleGoHome}
      />
      <MenuButton
        position={[0.13, -0.22, 0]}
        icon="❌"
        label="Ocultar"
        accentColor="#64748b"
        onClick={toggleMenu}
      />
    </group>
  );
};
