import React, { useRef, useEffect } from "react"
import * as THREE from "three"

const SpeechWaveform = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
    })
    const torusKnot = new THREE.Mesh(geometry, material)

    scene.add(torusKnot)
    camera.position.z = 30

    const particles = new THREE.BufferGeometry()
    const particleCount = 5000
    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100
    }

    particles.setAttribute("position", new THREE.BufferAttribute(posArray, 3))
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x8b5cf6,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    const animate = () => {
      requestAnimationFrame(animate)

      torusKnot.rotation.x += 0.01
      torusKnot.rotation.y += 0.01

      particleSystem.rotation.x += 0.001
      particleSystem.rotation.y += 0.001

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      mountRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full -z-5" />
}

export default SpeechWaveform

