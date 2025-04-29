import { Environment, Float, Html, OrbitControls } from "@react-three/drei"
import { Book } from "./Book"


const Experience = () => {
  return (
    <>
        <OrbitControls />
        {/* <Environment preset="studio" ></Environment> */}
        <ambientLight intensity={0.2} color={'white'} />
        <directionalLight
            position={[2, 6, 3]}
            intensity={2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
        />

        <Float
            rotation-x={-Math.PI / 4}
            floatIntensity={1}
            speed={1}
            rotationIntensity={1}
        >
            <Book />
        </Float>
        
        
        <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.2} />
        </mesh>
    </>
  )
}

export default Experience;