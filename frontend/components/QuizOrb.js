'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function QuizOrb() {
  const host = useRef(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 640, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 640 ? 1.25 : 1.75));
    element.appendChild(renderer.domElement);

    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(1.55, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xc96b43,
      metalness: 0.32,
      roughness: 0.24,
      flatShading: true,
      wireframe: true,
    });
    group.add(new THREE.Mesh(geometry, material));
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 2),
      new THREE.MeshStandardMaterial({ color: 0xa99b88, metalness: 0.18, roughness: 0.55 })
    );
    group.add(core);
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const light = new THREE.PointLight(0xe4a07d, 18);
    light.position.set(2, 2, 4);
    scene.add(light);

    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const moveCamera = (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5;
      const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5;
      gsap.to(camera.position, { x: x * 0.5, y: -y * 0.35, duration: 0.8, ease: 'power2.out', overwrite: true });
    };
    resize();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rotation = reduceMotion ? null : gsap.to(group.rotation, { y: Math.PI * 2, x: 0.35, duration: 22, repeat: -1, ease: 'none' });
    const pulse = reduceMotion ? null : gsap.to(core.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    let frame = 0;
    const render = () => {
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    if (reduceMotion) renderer.render(scene, camera);
    else render();
    if (!reduceMotion) element.addEventListener('pointermove', moveCamera, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      element.removeEventListener('pointermove', moveCamera);
      rotation?.kill();
      pulse?.kill();
      geometry.dispose();
      material.dispose();
      core.geometry.dispose();
      core.material.dispose();
      renderer.dispose();
      element.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} aria-hidden="true" className="quiz-orb" />;
}
