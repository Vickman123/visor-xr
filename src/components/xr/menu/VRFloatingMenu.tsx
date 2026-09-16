import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
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
  const { gl } = useThree();

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

  return (
    <group position={[0, 1.25, -0.65]} rotation={[-0.15, 0, 0]}>
      {/* Back Panel / Glass Base */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[0.54, 0.44, 0.01]} />
        <meshStandardMaterial
          color="#0b0f17"
          roughness={0.6}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Header Title with Active Mode Badge */}
      <Text
        position={[0, 0.175, 0.005]}
        fontSize={0.026}
        color={isAR ? '#34d399' : '#38bdf8'}
        anchorX="center"
        anchorY="middle"
      >
        {isAR ? '👓 MODO AR (CÁMARA REAL)' : '🥽 MODO VR INMERSIVO'}
      </Text>

      {/* Row 1: Mode Switch */}
      <MenuButton
        position={[-0.125, 0.095, 0]}
        icon="🏗️"
        label="Maqueta"
        active={vrMode === 'maqueta'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('maqueta')}
      />
      <MenuButton
        position={[0.125, 0.095, 0]}
        icon="🚪"
        label="Escala 1:1"
        active={vrMode === 'escala1_1'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetVRMode('escala1_1')}
      />

      {/* Row 2: Locomotion Selection */}
      <MenuButton
        position={[-0.125, 0.005, 0]}
        icon="📍"
        label="Teleport"
        active={locomotionMode === 'teleport'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('teleport')}
      />
      <MenuButton
        position={[0.125, 0.005, 0]}
        icon="🚶"
        label="Joystick"
        active={locomotionMode === 'joystick'}
        accentColor={isAR ? '#059669' : '#0ea5e9'}
        onClick={() => onSetLocomotionMode('joystick')}
      />

      {/* Row 3: Actions (Scale / Reset) */}
      <MenuButton
        position={[-0.125, -0.085, 0]}
        icon="↔"
        label={`Escala ${currentScale.toFixed(1)}x`}
        onClick={onCycleScale}
      />
      <MenuButton
        position={[0.125, -0.085, 0]}
        icon="🔄"
        label="Reset"
        onClick={onResetTransform}
      />

      {/* Row 4: Navigation & Exit */}
      <MenuButton
        position={[-0.125, -0.175, 0]}
        icon="🏠"
        label="Inicio"
        onClick={handleGoHome}
      />
      <MenuButton
        position={[0.125, -0.175, 0]}
        icon="❌"
        label="Salir"
        accentColor="#ef4444"
        onClick={handleExitXR}
      />
    </group>
  );
};
