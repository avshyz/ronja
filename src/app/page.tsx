'use client'
import React, {
  JSX,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, OrbitControls, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { differenceInSeconds } from 'date-fns'

const DEADLINE = new Date('2025-05-31T21:59:00.000+02:00')

// Type definitions
interface TorusData {
  id: number
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// Individual Torus component - using normal material for better performance
function AnimatedTorus({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.z += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[0.5, 0.2, 8, 16]} />
      <meshNormalMaterial />
    </mesh>
  )
}

// Simplified Torus Field using normal materials
function TorusField(): JSX.Element {
  const groupRef = useRef<THREE.Group>(null)

  // Much smaller count to reduce GPU load
  const COUNT = 200

  // Generate torus positions and properties
  const torusData = useMemo((): TorusData[] => {
    const data: TorusData[] = []
    const WORLD_SIZE = 20 // Much smaller world

    for (let i = 0; i < COUNT; i++) {
      const position = new THREE.Vector3()
        .random()
        .subScalar(0.5)
        .multiplyScalar(WORLD_SIZE)

      const rotation: [number, number, number] = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ]

      const scale = 0.5 + Math.random() * 0.5

      data.push({
        id: i,
        position: [position.x, position.y, position.z],
        rotation,
        scale,
      })
    }
    return data
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      const elapsedTime = state.clock.elapsedTime
      groupRef.current.rotation.y = elapsedTime * 0.02 // Much slower
      groupRef.current.rotation.z = elapsedTime * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {torusData.map((data) => (
        <AnimatedTorus
          key={data.id}
          position={data.position}
          rotation={data.rotation}
          scale={data.scale}
        />
      ))}
    </group>
  )
}

// Simplified camera animation
function AnimatedCamera(): null {
  useFrame((state) => {
    const elapsedTime = state.clock.elapsedTime * 0.2 // Much slower
    state.camera.position.y = Math.sin(elapsedTime) * 1.5
    state.camera.position.x = Math.cos(elapsedTime) * 1.5
  })

  return null
}

// Simplified text component with normal material
function TextContent(): JSX.Element {
  const [timeLeft, setTimeLeft] = useState(
    differenceInSeconds(DEADLINE, Date.now())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(differenceInSeconds(DEADLINE, Date.now()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(timeLeft / (24 * 60 * 60))
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
  const seconds = Math.floor(timeLeft % 60)

  return (
    <>
      <Center position={[0, 0.5, 0]}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.3}
          height={0.05}
          curveSegments={2}
          bevelEnabled={false}
        >
          I love Ronja
          <meshNormalMaterial />
        </Text3D>
      </Center>
      <Center position={[0, -0.5, 0]}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={0.2}
          height={0.05}
          curveSegments={2}
          bevelEnabled={false}
        >
          {`${days}d ${hours}h ${minutes}m ${seconds}s`}
          <meshNormalMaterial />
        </Text3D>
      </Center>
    </>
  )
}

// Main scene component
function Scene(): JSX.Element {
  return (
    <>
      <AnimatedCamera />

      {/* Basic lighting */}
      <ambientLight intensity={0.2} />

      {/* 3D Text */}
      <Suspense fallback={null}>
        <TextContent />
      </Suspense>

      {/* Simplified Torus Field */}
      <TorusField />

      {/* Controls */}
      <OrbitControls
        enablePan={false} // Disable pan to reduce complexity
        enableZoom={true}
        enableRotate={true}
        maxDistance={8}
        minDistance={3}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}

// Error boundary component
function ErrorFallback(): JSX.Element {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
        textAlign: 'center',
      }}
    >
      <div>WebGL Context Error</div>
      <div
        style={{ fontSize: '14px', marginTop: '10px', marginBottom: '20px' }}
      >
        The 3D scene encountered an error
      </div>
      <button
        onClick={handleReload}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Reload Page
      </button>
    </div>
  )
}

// Loading fallback component
function LoadingFallback(): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '18px',
      }}
    >
      Loading 3D Scene...
    </div>
  )
}

// Main App component with enhanced error handling
export default function App(): JSX.Element {
  const [hasError, setHasError] = useState(false)

  const handleCanvasError = useCallback(() => {
    console.error('Canvas error occurred')
    setHasError(true)
  }, [])

  if (hasError) {
    return <ErrorFallback />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{
            antialias: false, // Disable antialiasing for better performance
            alpha: false,
            powerPreference: 'default', // Let browser decide
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false, // Allow software rendering
          }}
          onError={handleCanvasError}
          dpr={2} // Fixed DPR to avoid scaling issues
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
