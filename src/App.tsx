import { Canvas } from "@react-three/fiber"
import UI from "./components/UI"
import Experience from "./components/Experience"
import { Loader } from "@react-three/drei"
import { Suspense } from "react"

function App() {

  return (
    <div className="w-full h-screen">
		<UI />
		<Loader />
		<Canvas
			camera={{
				position: [0, 1, 3],
				fov: 45,
			}}
			shadows
		>
			<group position-y={0}>
				<Suspense fallback={null}>
					<Experience />
				</Suspense>
			</group>
		</Canvas>
	</div>
  )
}

export default App
