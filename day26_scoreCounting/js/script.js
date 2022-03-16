// Creeper and Three.js setting
let renderer, scene, camera
let stats, gui
let controls
let creeperObj = []
let explosion = []
let boxes = []
let boxMeshes = []
let ammos = []
let ammoMeshes = []
let bricks = []
let brickMeshes = []
let walkSpeed = 0

// Cannon.js
let world
let physicsMaterial
let groundBody
let sphereShape = new CANNON.Sphere(1.5)
let playerBody
const dt = 1.0 / 60.0 // seconds
let time = Date.now()
let cannonDebugRenderer

const halfExtents = new CANNON.Vec3(1, 1, 1)
const boxShape = new CANNON.Box(halfExtents)
const boxGeometry = new THREE.BoxGeometry(
	halfExtents.x * 2,
	halfExtents.y * 2,
	halfExtents.z * 2
)

// Game flow
const originData = {
	score: 0,
	remainingTime: 600000 // 10 min
}
let gameData = {}

function initCannon() {
	// 初始化 cannon.js、重力、碰撞监测
	world = new CANNON.World()
	world.gravity.set(0, -20, 0)
	world.broadphase = new CANNON.NaiveBroadphase()

	// 解算器设置
	const solver = new CANNON.GSSolver()
	solver.iterations = 7
	solver.tolerance = 0.1
	const split = false
	if (split) world.solver = new CANNON.SplitSolver(solver)
	else world.solver = solver

	// 接触材质相关设定（摩擦力、恢复系数）
	world.defaultContactMaterial.contactEquationStiffness = 1e9
	world.defaultContactMaterial.contactEquationRelaxation = 4
	physicsMaterial = new CANNON.Material('slipperyMaterial')
	const physicsContactMaterial = new CANNON.ContactMaterial(
		physicsMaterial,
		physicsMaterial,
		0.0,
		0.3
	)
	world.addContactMaterial(physicsContactMaterial)

	// 鼠标控制器刚体
	// const playerShapeVec3 = new CANNON.Vec3(1, 1, 1)
	// const playerShape = new CANNON.Box(playerShapeVec3)
	playerBody = new CANNON.Body({ mass: 5 })
	playerBody.addShape(sphereShape)
	playerBody.position.set(-10, 0, 50)
	playerBody.linearDamping = 0.9
	world.addBody(playerBody)

	// cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world)
}

function initStats() {
	const stats = new Stats()
	stats.setMode(0)
	document.getElementById('stats').appendChild(stats.domElement)
	return stats
}

function initScene() {
	scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2(0x000000, 0.0008)
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	)
	// camera.position.set(20, 20, 20)
	// camera.lookAt(scene.position)
}

function initRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setClearColor(0x80adfc, 1.0)
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap
}

function initLight() {
	// 设置环境光
	let ambientLight = new THREE.AmbientLight(0x404040)
	scene.add(ambientLight)

	// 点光源
	pointLight = new THREE.PointLight(0xf0f0f0, 1, 100) // 颜色，强度，距离
	pointLight.castShadow = true // 投影
	pointLight.position.set(-30, 30, 30)
	// scene.add(pointLight)
	light = new THREE.SpotLight(0xffffff)
	light.position.set(10, 30, 20)
	light.target.position.set(0, 0, 0)
	if (true) {
		light.castShadow = true
		light.shadow.camera.near = 20
		light.shadow.camera.far = 50 //camera.far;
		light.shadow.camera.fov = 40
		light.shadowMapBias = 0.1
		light.shadowMapDarkness = 0.7
		light.shadow.mapSize.width = 2 * 512
		light.shadow.mapSize.height = 2 * 512
		//light.shadowCameraVisible = true;
	}
	scene.add(light)
}

function initHelper() {
	let axes = new THREE.AxesHelper(20)
	// scene.add(axes)
}

function createGround() {
	// 建立地板刚体
	let groundShape = new CANNON.Plane()
	// let groundCM = new CANNON.Material()
	groundBody = new CANNON.Body({
		mass: 0,
		shape: groundShape,
		material: physicsMaterial
	})
	// setFromAxisAngle 旋转 x 轴 -90 度
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
	world.add(groundBody)

	const groundGeometry = new THREE.PlaneGeometry(300, 300, 50, 50)
	const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xa5a5a5 })
	let ground = new THREE.Mesh(groundGeometry, groundMaterial)
	ground.rotation.x = -Math.PI / 2
	ground.receiveShadow = true
	ground.name = 'floor'
	scene.add(ground)
}

const scoreDOM = document.getElementById('score')
// const remainingTimeDOM = document.getElementById('remainingTime')

function initGameData() {
	gameData = originData
	scoreDOM.textContent = gameData.score
	// remainingTimeDOM.textContent = gameData.remainingTime / 1000
}

function createCreeper() {
	for (let i = 0; i < 10; i++) {
		creeperObj[i] = new Creeper(2, 1, i - 5)
		scene.add(creeperObj[i].creeper)
		world.addBody(creeperObj[i].headBody)
		world.addBody(creeperObj[i].bodyBody)
		world.addBody(creeperObj[i].leftFrontLegBody)
		world.addBody(creeperObj[i].leftBackLegBody)
		world.addBody(creeperObj[i].rightFrontLegBody)
		world.addBody(creeperObj[i].rightBackLegBody)
		world.addConstraint(creeperObj[i].neckJoint)
		world.addConstraint(creeperObj[i].leftFrontKneeJoint)
		world.addConstraint(creeperObj[i].leftBackKneeJoint)
		world.addConstraint(creeperObj[i].rightFrontKneeJoint)
		world.addConstraint(creeperObj[i].rightBackKneeJoint)
	}
}

function createBoxes(count) {
	// Add boxes
	for (let i = 0; i < count; i++) {
		const x = (Math.random() - 0.5) * 60
		const y = 10 + (Math.random() - 0.5) * 1
		const z = (Math.random() - 0.5) * 60
		const boxBody = new CANNON.Body({ mass: 5, material: physicsMaterial })
		boxBody.addShape(boxShape)
		const boxMaterial = new THREE.MeshLambertMaterial({
			color: Math.random() * 0xffffff
		})
		const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
		world.addBody(boxBody)
		scene.add(boxMesh)
		boxBody.position.set(x, y, z)
		boxMesh.position.set(x, y, z)
		boxMesh.castShadow = true
		boxMesh.receiveShadow = true
		boxes.push(boxBody)
		boxMeshes.push(boxMesh)
	}
}

// Three.js init setting
function init() {
	initCannon()
	initScene()
	initCamera()
	initPointerLockControls()
	initRenderer()
	initLight()
	initHelper()
	initGameData()
	// initDatGUI()
	stats = initStats()

	createGround()
	createCreeper()
	createBoxes(20)
	// createPointsScene()

	document.body.appendChild(renderer.domElement)
}

// shooting related settings
const ballShape = new CANNON.Sphere(0.2)
const ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32)
let shootDirection = new THREE.Vector3()
const shootVelo = 15
let raycaster = new THREE.Raycaster() // create once
let mouse = new THREE.Vector2() // create once

function getShootDir(event, targetVec) {
	// 取得鼠标在网页上 (x, y) 位置
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

	// 透过 raycaster 取得目前玩家朝向方向
	raycaster.setFromCamera(mouse, camera)

	// 取得 raycaster 方向并决定发射方向
	targetVec.copy(raycaster.ray.direction)
}
// shooting event
window.addEventListener('click', function (e) {
	if (controls.enabled == true) {
		// 取得目前玩家位置
		let x = playerBody.position.x
		let y = playerBody.position.y
		let z = playerBody.position.z

		// 左键（1）射击与右键（3）叠砖
		if (e.which === 1) {
			// 子弹数量过多时移除旧子弹
			if (ammos.length > 50) {
				for (let i = 0; i < ammos.length; i++) {
					ammoMeshes[i].geometry.dispose()
					scene.remove(ammoMeshes[i])
					world.remove(ammos[i])
				}
				ammos.length = 0
				ammoMeshes.length = 0
			}
			// 子弹刚体与网格
			const ammoBody = new CANNON.Body({ mass: 50 })
			ammoBody.addShape(ballShape)
			const ammoMaterial = new THREE.MeshStandardMaterial({ color: 0x93882f })
			const ammoMesh = new THREE.Mesh(ballGeometry, ammoMaterial)
			world.addBody(ammoBody)
			scene.add(ammoMesh)
			ammoMesh.castShadow = true
			ammoMesh.receiveShadow = true
			ammos.push(ammoBody)
			ammoMeshes.push(ammoMesh)
			getShootDir(e, shootDirection)
			ammoBody.velocity.set(
				shootDirection.x * shootVelo,
				shootDirection.y * shootVelo,
				shootDirection.z * shootVelo
			)
			// Move the ball outside the player sphere
			x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
			y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
			z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
			ammoBody.position.set(x, y, z)
			ammoMesh.position.set(x, y, z)
		} else if (e.which === 3) {
			// 砖块刚体与网格
			const brickBody = new CANNON.Body({ mass: 10 })
			brickBody.addShape(boxShape)
			const brickMaterial = new THREE.MeshStandardMaterial({ color: 0x0f0201 })
			const brickMesh = new THREE.Mesh(boxGeometry, brickMaterial)
			world.addBody(brickBody)
			scene.add(brickMesh)
			brickMesh.castShadow = true
			brickMesh.receiveShadow = true
			bricks.push(brickBody)
			brickMeshes.push(brickMesh)
			getShootDir(e, shootDirection)
			brickBody.velocity.set(
				shootDirection.x,
				shootDirection.y,
				shootDirection.z
			)
			// Move the ball outside the player sphere
			x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
			y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
			z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
			brickBody.position.set(x, y, z)
			brickMesh.position.set(x, y, z)
		}
	}
})

function render() {
	requestAnimationFrame(render)
	stats.update()
	// pointsSceneAnimation()

	if (controls.enabled) {
		world.step(dt)
		// cannonDebugRenderer.update() // Update the debug renderer
		// Update box mesh positions
		for (let i = 0; i < boxes.length; i++) {
			boxMeshes[i].position.copy(boxes[i].position)
			boxMeshes[i].quaternion.copy(boxes[i].quaternion)
		}
		// Update shooting ball positions
		for (let i = 0; i < ammos.length; i++) {
			ammoMeshes[i].position.copy(ammos[i].position)
			ammoMeshes[i].quaternion.copy(ammos[i].quaternion)
		}
		// Update shooting brick positions
		for (let i = 0; i < bricks.length; i++) {
			brickMeshes[i].position.copy(bricks[i].position)
			brickMeshes[i].quaternion.copy(bricks[i].quaternion)
		}
		// update creepers
		for (let i = 0; i < creeperObj.length; i++) {
			creeperObj[i].updateMesh()
			// creeperObj[i].creeperScaleBody()
			// creeperObj[i].creeperFeetWalk(
			if (creeperObj[i].head.position.y < 7 && !creeperObj[i].isKnockOut) {
				for (let j = 0; j < scene.children.length; j++) {
					const object = scene.children[j]
					// 场景内有苦力怕才爆炸
					if (object.name === 'creeper') {
						// 清除之前爆炸粒子
						if (explosion) {
							const len = explosion.length
							if (len > 0) {
								for (let i = 0; i < len; i++) {
									explosion[i].destroy()
								}
							}
							explosion.length = 0
						}

						// 场景内有苦力怕才爆炸
						scene.remove(creeperObj[i].creeper)
						world.remove(creeperObj[i].headBody)
						world.remove(creeperObj[i].bodyBody)
						world.remove(creeperObj[i].leftFrontLegBody)
						world.remove(creeperObj[i].leftBackLegBody)
						world.remove(creeperObj[i].rightFrontLegBody)
						world.remove(creeperObj[i].rightBackLegBody)

						// 第一次倒地避免重复计分
						creeperObj[i].isKnockOut = true

						const x = creeperObj[i].body.position.x
						const y = creeperObj[i].body.position.y
						const z = creeperObj[i].body.position.z

						// 产生爆炸
						explosion[0] = new Explosion(x, y, z, 0x000000)
						explosion[1] = new Explosion(x + 5, y + 5, z + 5, 0x333333)
						explosion[2] = new Explosion(x - 5, y + 5, z + 10, 0x666666)
						explosion[3] = new Explosion(x - 5, y + 5, z + 5, 0x999999)
						explosion[4] = new Explosion(x + 5, y + 5, z - 5, 0xcccccc)
					}
				}
				// 计分并显示到画面上
				gameData.score += 10000
				scoreDOM.textContent = gameData.score
			}
		}
	}
	controls.update(Date.now() - time)
	time = Date.now()

	// TWEEN.update()
	// explosion
	if (explosion) {
		const len = explosion.length
		if (len > 0) {
			for (let i = 0; i < len; i++) {
				explosion[i].update()
			}
		}
	}

	renderer.render(scene, camera)
}

window.addEventListener('resize', function () {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

init()
render()
