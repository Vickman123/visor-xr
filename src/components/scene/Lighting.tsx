import React from 'react';

interface LightingProps {
  enableShadows?: boolean;
}

export const Lighting: React.FC<LightingProps> = ({ enableShadows = true }) => {
  return (
    <>
      {/* Ambient hemisphere light for realistic ambient architectural illumination */}
      <hemisphereLight
        args={[0xffffff, 0x444950, 0.75]}
        position={[0, 50, 0]}
      />

      {/* Sun / Key Directional Light */}
      <directionalLight
        position={[15, 25, 12]}
        intensity={1.2}
        castShadow={enableShadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* Subtle fill light to soften architectural shadows without heavy GPU cost */}
      <directionalLight
        position={[-12, 10, -10]}
        intensity={0.35}
      />
    </>
  );
};
