import React from 'react';
import { Environment } from '@react-three/drei';

export type LightingPreset = 'city' | 'studio' | 'sunset' | 'neutral';

interface LightingProps {
  enableShadows?: boolean;
  preset?: LightingPreset;
}

export const Lighting: React.FC<LightingProps> = ({ enableShadows = false, preset = 'neutral' }) => {
  return (
    <>
      {/* Soft environment lighting map for realistic reflections on glass, metal & concrete */}
      {preset !== 'neutral' && (
        <Environment
          preset={preset as any}
          background={false}
          environmentIntensity={0.65}
        />
      )}

      {/* Primary hemisphere sky light */}
      <hemisphereLight
        args={[0xffffff, 0x3b4252, preset === 'sunset' ? 0.9 : 0.8]}
        position={[0, 50, 0]}
      />

      {/* Sun / Key Directional Light with balanced shadow maps */}
      <directionalLight
        position={preset === 'sunset' ? [25, 12, 18] : [18, 28, 15]}
        intensity={preset === 'sunset' ? 1.6 : 1.3}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      {/* Soft secondary fill light */}
      <directionalLight
        position={[-15, 12, -12]}
        intensity={0.4}
      />
    </>
  );
};
