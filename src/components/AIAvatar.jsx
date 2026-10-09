import React, { useEffect, useRef, useState } from 'react';
import { Bot, Volume2, Sparkles } from 'lucide-react';

export default function AIAvatar({
  isSpeaking = false,
  volume = 0,
  emotion = 'friendly',
  avatarUrl = '/images/avatar.jpg'
}) {
  const containerRef = useRef(null);
  const avatarInstanceRef = useRef(null);
  const [is3DReady, setIs3DReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let animId = null;

    async function initThreeAvatar() {
      if (!containerRef.current) return;

      try {
        // Dynamic import of Three.js using standard ES Module
        const THREE = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js');

        if (!isMounted || !containerRef.current) return;

        const container = containerRef.current;
        container.innerHTML = '';

        const width = container.clientWidth || 360;
        const height = container.clientHeight || 300;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 1.15, 0.72);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.appendChild(renderer.domElement);

        // Studio lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        keyLight.position.set(1.5, 2, 2);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xa855f7, 0.6);
        fillLight.position.set(-1.5, 1, 1);
        scene.add(fillLight);

        // Create Holographic / Avatar Mesh Group
        const avatarGroup = new THREE.Group();
        avatarGroup.position.set(0, 1.1, 0);
        scene.add(avatarGroup);

        // Circular Face Avatar Texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          avatarUrl,
          (texture) => {
            if (!isMounted) return;
            const faceGeo = new THREE.CircleGeometry(0.25, 64);
            const faceMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            avatarGroup.add(faceMesh);

            // Glowing Outer Ring
            const ringGeo = new THREE.RingGeometry(0.252, 0.262, 64);
            const ringMat = new THREE.MeshBasicMaterial({
              color: 0x38bdf8,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            avatarGroup.add(ringMesh);

            // Audio Wave Ring (pulses with volume/speaking)
            const waveGeo = new THREE.RingGeometry(0.265, 0.275, 64);
            const waveMat = new THREE.MeshBasicMaterial({
              color: 0x0ea5e9,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.4
            });
            const waveMesh = new THREE.Mesh(waveGeo, waveMat);
            avatarGroup.add(waveMesh);

            avatarInstanceRef.current = {
              avatarGroup,
              ringMesh,
              waveMesh,
              renderer,
              camera,
              scene
            };

            setIs3DReady(true);
          },
          undefined,
          () => {
            // Fallback: procedural orb if texture fails
            const sphereGeo = new THREE.SphereGeometry(0.24, 32, 32);
            const sphereMat = new THREE.MeshStandardMaterial({
              color: 0x0284c7,
              roughness: 0.3,
              metalness: 0.2
            });
            const orb = new THREE.Mesh(sphereGeo, sphereMat);
            avatarGroup.add(orb);
            setIs3DReady(true);
          }
        );

        // Animation loop
        const clock = new THREE.Clock();
        const animate = () => {
          if (!isMounted) return;
          animId = requestAnimationFrame(animate);

          const time = clock.getElapsedTime();

          // Idle gentle breathing bob
          avatarGroup.position.y = 1.1 + Math.sin(time * 1.5) * 0.012;
          avatarGroup.rotation.y = Math.sin(time * 0.8) * 0.04;

          if (avatarInstanceRef.current) {
            const { ringMesh, waveMesh } = avatarInstanceRef.current;
            if (ringMesh) {
              ringMesh.rotation.z = time * 0.5;
            }
            if (waveMesh) {
              const currentSpeaking = containerRef.current?.getAttribute('data-speaking') === 'true';
              const scale = currentSpeaking ? 1.0 + Math.sin(time * 12) * 0.08 : 1.0;
              waveMesh.scale.set(scale, scale, 1);
              waveMesh.material.opacity = currentSpeaking ? 0.7 + Math.sin(time * 10) * 0.3 : 0.2;
            }
          }

          renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          if (!container || !renderer || !camera) return;
          const w = container.clientWidth || 360;
          const h = container.clientHeight || 300;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.warn('[AIAvatar] Three.js dynamic initialization notice:', err.message);
        setIs3DReady(false);
      }
    }

    initThreeAvatar();

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      if (avatarInstanceRef.current?.renderer) {
        try {
          avatarInstanceRef.current.renderer.dispose();
        } catch (e) {}
      }
    };
  }, [avatarUrl]);

  return (
    <div
      className="relative w-full h-full min-h-[280px] sm:min-h-[340px] flex items-center justify-center bg-gradient-to-b from-sky-950/20 via-neutral-900 to-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-inner group"
      data-speaking={isSpeaking ? 'true' : 'false'}
    >
      {/* Dynamic 3D WebGL Canvas */}
      <div
        ref={containerRef}
        data-speaking={isSpeaking ? 'true' : 'false'}
        className="w-full h-full absolute inset-0 z-10 flex items-center justify-center"
      />

      {/* Fallback & Loading Presentation */}
      {!is3DReady && (
        <div className="z-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="relative">
            <div className={`w-28 h-28 rounded-full overflow-hidden border-2 transition-all ${
              isSpeaking
                ? 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.5)] scale-105'
                : 'border-neutral-700'
            }`}>
              <img
                src={avatarUrl}
                alt="AI Recruiter Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 p-2 rounded-full bg-sky-500 text-white shadow-lg animate-bounce">
                <Volume2 className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <span>TalentAI Recruiter</span>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </h4>
            <p className="text-xs text-neutral-400">Adaptive Screening Avatar</p>
          </div>
        </div>
      )}

      {/* HUD Recruiter Audio Active Ribbon */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isSpeaking ? 'Recruiter Speaking...' : 'Recruiter Listening'}</span>
        </div>
      </div>

      {/* Speaking Soundwave Ripple Effect */}
      {isSpeaking && (
        <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-center gap-1 px-4 py-1.5 bg-sky-950/40 backdrop-blur-md rounded-xl border border-sky-500/30 text-sky-400 text-xs font-mono">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span className="animate-pulse">Active Recruiter Voice Feed</span>
        </div>
      )}
    </div>
  );
}
