import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Node {
  id: number
  x: number
  y: number
  supportType: 'fixed' | 'pinned' | 'roller' | 'free'
}

interface Element {
  startNodeId: number
  endNodeId: number
}

interface Displacement {
  dx: number
  dy: number
}

interface Beam3DSceneProps {
  state: {
    nodes: Node[]
    elements: Element[]
  }
  results: {
    displacements: Displacement[] | null
  }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFORM_SCALE = 100
const BEAM_RADIUS  = 0.055
const STEEL_BLUE   = '#4a7ab5'
const DEFORM_GREEN = '#00e676'
const SUPPORT_RED  = '#d93025'
const SUPPORT_GREY = '#505060'

// ─── Beam tube (straight or deformed) ─────────────────────────────────────────

function BeamTube({
  points,
  color,
  opacity = 1,
}: {
  points: THREE.Vector3[]
  color: string
  opacity?: number
}) {
  const geo = useMemo(() => {
    if (points.length < 2) return null
    const curve = new THREE.CatmullRomCurve3(points)
    const segments = Math.max(points.length * 3, 60)
    return new THREE.TubeGeometry(curve, segments, BEAM_RADIUS, 10, false)
  }, [points])

  if (!geo) return null

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.35}
        metalness={0.65}
      />
    </mesh>
  )
}

// ─── Element-by-element cylinder rendering (spec requirement) ─────────────────

function BeamElement({
  startNode,
  endNode,
  color,
}: {
  startNode: Node
  endNode: Node
  color: string
}) {
  const start = new THREE.Vector3(startNode.x, startNode.y, 0)
  const end   = new THREE.Vector3(endNode.x,   endNode.y,   0)
  const mid   = start.clone().add(end).multiplyScalar(0.5)
  const len   = start.distanceTo(end)
  const dir   = end.clone().sub(start).normalize()
  const quat  = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir,
  )

  return (
    <mesh
      position={[mid.x, mid.y, mid.z]}
      quaternion={[quat.x, quat.y, quat.z, quat.w]}
    >
      <cylinderGeometry args={[BEAM_RADIUS, BEAM_RADIUS, len, 10]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
    </mesh>
  )
}

// ─── Supports ─────────────────────────────────────────────────────────────────

function FixedSupport({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y - 0.28, 0]}>
      <boxGeometry args={[0.55, 0.42, 0.42]} />
      <meshStandardMaterial color={SUPPORT_GREY} roughness={0.6} metalness={0.4} />
    </mesh>
  )
}

function PinnedSupport({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y - 0.28, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.2, 0.44, 8]} />
      <meshStandardMaterial color={SUPPORT_RED} roughness={0.55} metalness={0.25} />
    </mesh>
  )
}

function RollerSupport({ x, y }: { x: number; y: number }) {
  return (
    <group>
      {/* Triangle cone */}
      <mesh position={[x, y - 0.21, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.17, 0.34, 8]} />
        <meshStandardMaterial color={SUPPORT_RED} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* Roller drum */}
      <mesh position={[x, y - 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.36, 16]} />
        <meshStandardMaterial color={SUPPORT_RED} roughness={0.55} metalness={0.25} />
      </mesh>
    </group>
  )
}

// ─── Camera initialiser (runs once on mount) ──────────────────────────────────

function CameraRig({ centerX, span }: { centerX: number; span: number }) {
  const { camera } = useThree()
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    const dist = Math.max(span * 1.3, 8)
    const elev = Math.max(span * 0.45, 3)
    camera.position.set(centerX, elev, dist)
    camera.lookAt(centerX, 0, 0)
  }, [centerX, span])

  return null
}

// ─── Inner scene (must live inside Canvas) ────────────────────────────────────

function Scene({ state, results }: Beam3DSceneProps) {
  const { nodes, elements } = state
  const { displacements }   = results

  // Node lookup map
  const nodeMap = useMemo(() => {
    const m: Record<number, Node> = {}
    nodes.forEach(n => { m[n.id] = n })
    return m
  }, [nodes])

  // Undeformed beam points
  const undeformedPts = useMemo(
    () => nodes.map(n => new THREE.Vector3(n.x, n.y, 0)),
    [nodes],
  )

  // Deformed beam points (scaled)
  const deformedPts = useMemo(() => {
    if (!displacements || displacements.length !== nodes.length) return null
    return nodes.map((n, i) => new THREE.Vector3(
      n.x + (displacements[i]?.dx ?? 0) * DEFORM_SCALE,
      n.y + (displacements[i]?.dy ?? 0) * DEFORM_SCALE,
      0,
    ))
  }, [nodes, displacements])

  // Camera framing
  const { centerX, span } = useMemo(() => {
    if (nodes.length === 0) return { centerX: 0, span: 10 }
    const xs  = nodes.map(n => n.x)
    const min = Math.min(...xs)
    const max = Math.max(...xs)
    return { centerX: (min + max) / 2, span: max - min }
  }, [nodes])

  const supportNodes = nodes.filter(n => n.supportType !== 'free')

  // Choose rendering strategy:
  // — few elements (≤ 20): render individual cylinders per element (shows structural segments)
  // — many elements (plotData points): use a single smooth tube for performance
  const useTube = elements.length > 20

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[12, 18, 8]}  intensity={1.1} castShadow />
      <directionalLight position={[-9, 7, -6]}  intensity={0.35} />
      <directionalLight position={[0,  -5,  10]} intensity={0.15} />

      {/* Controls */}
      <OrbitControls makeDefault target={[centerX, 0, 0]} />

      {/* Infinite grid floor at y = −1 */}
      <Grid
        position={[centerX, -1, 0]}
        args={[200, 200]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#343448"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#50506a"
        fadeDistance={65}
        infiniteGrid
      />

      {/* Initial camera position */}
      <CameraRig centerX={centerX} span={span} />

      {/* ── Undeformed structure ── */}
      {useTube ? (
        <BeamTube points={undeformedPts} color={STEEL_BLUE} />
      ) : (
        elements.map((el, i) => {
          const s = nodeMap[el.startNodeId]
          const e = nodeMap[el.endNodeId]
          if (!s || !e) return null
          return <BeamElement key={i} startNode={s} endNode={e} color={STEEL_BLUE} />
        })
      )}

      {/* ── Supports ── */}
      {supportNodes.map(n => {
        if (n.supportType === 'fixed')  return <FixedSupport  key={n.id} x={n.x} y={n.y} />
        if (n.supportType === 'pinned') return <PinnedSupport key={n.id} x={n.x} y={n.y} />
        if (n.supportType === 'roller') return <RollerSupport key={n.id} x={n.x} y={n.y} />
        return null
      })}

      {/* ── Deformed shape (conditional) ── */}
      {deformedPts && (
        <BeamTube points={deformedPts} color={DEFORM_GREEN} opacity={0.72} />
      )}
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function Beam3DScene({ state, results }: Beam3DSceneProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [5, 4, 12], fov: 45 }}
        style={{ background: '#111827' }}
        shadows
      >
        <Scene state={state} results={results} />
      </Canvas>
    </div>
  )
}
