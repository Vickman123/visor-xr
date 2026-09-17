import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VRMode, VRLocomotionMode } from '../../../types';

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
  height = 0.08,
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
        fontSize={0.026}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        font={undefined}
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
}) => {
  const { gl, camera } = useThree();
  const [isOpen, setIsOpen] = useState(false);
  const groupRef = React.useRef<THREE.Group>(null);
  const prevYPressedRef = React.useRef(false);

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

  const repositionMenu = (cam: THREE.Camera) => {
    if (!groupRef.current) return;
    const headPos = new THREE.Vector3();
    const headDir = new THREE.Vector3();
    cam.getWorldPosition(headPos);
    cam.getWorldDirection(headDir);
    headDir.y = 0;
    headDir.normalize();

    // Position menu ~0.72m in front of eyes at comfortable height
    groupRef.current.position.set(
      headPos.x + headDir.x * 0.72,
      headPos.y - 0.08,
      headPos.z + headDir.z * 0.72
    );
    const yaw = Math.atan2(headDir.x, headDir.z) + Math.PI;
    groupRef.current.rotation.set(-0.15, yaw, 0);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        repositionMenu(camera);
      }
      return next;
    });
  };

  // 1. Listen for Quest Controller Button Y (secondary button on left controller, buttons[5])
  useFrame((state) => {
    const session = gl.xr.getSession();
    if (!session) return;

    let yPressed = false;
    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      // Quest touch controllers: buttons[5] is Y on Left, B on Right
      if (source.gamepad.buttons[5]?.pressed) {
        yPressed = true;
        break;
      }
    }

    if (yPressed && !prevYPressedRef.current) {
      setIsOpen((prev) => {
        const next = !prev;
        if (next) {
          repositionMenu(state.camera);
        }
        return next;
      });
    }
    prevYPressedRef.current = yPressed;
  });

  // 2. Listen for Keyboard 'y' / 'Y' key (for testing on PC or emulator)
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'y' || e.key === 'Y') {
        toggleMenu();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [camera]);

  // If closed: render a minimal floating pill indicator that can also be clicked
  if (!isOpen) {
    return (
      <group position={[0, 0.7, -0.75]} rotation={[-0.2, 0, 0]}>
        <MenuButton
          position={[0, 0, 0]}
          width={0.24}
          height={0.06}
          icon="🎮"
          label="Menú [Botón Y]"
          accentColor={isAR ? '#059669' : '#0ea5e9'}
          active={false}
          onClick={toggleMenu}
        />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, 1.25, -0.65]} rotation={[-0.15, 0, 0]}>
      {/* Back Panel / Glass Base */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[0.56, 0.48, 0.01]} />
        <meshStandardMaterial
          color="#0b0f17"
          roughness={0.6}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Header Title with Active Mode Badge */}
      <Text
        position={[0, 0.195, 0.005]}
        fontSize={0.024}
        color={isAR ? '#34d399' : '#38bdf8'}
        anchorX="center"
        anchorY="middle"
      >
        {isAR ? '👓 MODO AR (CÁMARA REAL)' : '🥽 MODO VR INMERSIVO'}
      </Text>

      {/* Controller Y Hint Subtitle */}
      <Text
        position={[0, 0.165, 0.005]}
        fontSize={0.015}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Presiona botón [Y] para ocultar/mostrar
      </Text>

      {/* Row 1: Mode Switch */}
      <MenuButton
        position={[-0.13, 0.095, 0]}
        icon="🏗️"
        label="Maqueta"
        active={vrMode === 'maqueta'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('maqueta')}
      />
      <MenuButton
        position={[0.13, 0.095, 0]}
        icon="🚪"
        label="Escala 1:1"
        active={vrMode === 'escala1_1'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('escala1_1')}
      />

      {/* Row 2: Locomotion Selection */}
      <MenuButton
        position={[-0.13, 0.005, 0]}
        icon="📍"
        label="Teleport"
        active={locomotionMode === 'teleport'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('teleport')}
      />
      <MenuButton
        position={[0.13, 0.005, 0]}
        icon="🚶"
        label="Joystick"
        active={locomotionMode === 'joystick'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('joystick')}
      />

      {/* Row 3: Actions (Scale / Reset) */}
      <MenuButton
        position={[-0.13, -0.085, 0]}
        icon="↔"
        label={`Escala ${currentScale.toFixed(1)}x`}
        onClick={onCycleScale}
      />
      <MenuButton
        position={[0.13, -0.085, 0]}
        icon="🔄"
        label="Reset"
        onClick={onResetTransform}
      />

      {/* Row 4: Navigation & Ocultar [Y] */}
      <MenuButton
        position={[-0.13, -0.175, 0]}
        icon="🏠"
        label="Inicio"
        onClick={handleGoHome}
      />
      <MenuButton
        position={[0.13, -0.175, 0]}
        icon="👁️"
        label="Ocultar [Y]"
        accentColor="#64748b"
        onClick={toggleMenu}
      />
    </group>
  );
};
