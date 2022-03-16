let renderer, scene, camera;

let cameraControl, stats

// points
const particleCount = 15000
let points


function initStats() {
	const stats = new Stats()
	stats.setMode(0)
	document.getElementById('stats').appendChild(stats.domElement)
	return stats
}

// 创建粒子系统
function createPoints() {
	const geometry = new THREE.Geometry()

	const texture = new THREE.TextureLoader().load('./snowflake.png')
	let material = new THREE.PointsMaterial({
		size: 5,
		map: texture,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		opacity: 0.7
	})

	const range = 250
	for (let i = 0; i < particleCount; i++) {
		const x = THREE.Math.randInt(-range, range)
		const y = THREE.Math.randInt(-range, range)
		const z = THREE.Math.randInt(-range, range)
		const point = new THREE.Vector3(x, y, z)
		geometry.vertices.push(point)
	}

	points = new THREE.Points(geometry, material)
	scene.add(points)
}

function init() {
	scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2(0x000000, 0.0008)
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		1,
		1000
	)
	camera.position.set(0, 0, 100)
	camera.lookAt(scene.position)

	stats = initStats()


	renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)
	// OrbitControls
	cameraControl = new THREE.OrbitControls(camera, renderer.domElement)

	cameraControl.enableDamping = true
	cameraControl.dampingFactor = 0.25

	createPoints()

	document.body.appendChild(renderer.domElement)
}

function render() {
	stats.update()
	requestAnimationFrame(render)
	cameraControl.update()
	renderer.render(scene, camera)
}

window.addEventListener('resize', function () {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

init()
render()
