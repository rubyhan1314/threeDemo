let renderer, scene, camera
let cameraControl, stats, gui
let creeperObj
let walkSpeed = 0
let tween, tweenBack
let invert = 1 // 正反向
let startTracking = false
let musicPlayback = false
let pointLight
const sound = document.querySelector('audio')
let sceneType = 'SNOW'

// points
const particleCount = 15000
let points
let material
const textureLoader = new THREE.TextureLoader()
const snowTexture = textureLoader.load('./imgs/snowflake.png')
const rainTexture = textureLoader.load('./imgs/raindrop.png')

// 苦力怕物件
class Creeper {
	constructor() {
		// 设置头、身体、脚几何体大小
		const headGeo = new THREE.BoxGeometry(4, 4, 4)
		const bodyGeo = new THREE.BoxGeometry(4, 8, 2)
		const footGeo = new THREE.BoxGeometry(2, 3, 2)

		// 苦力怕脸部贴图
		const headMap = textureLoader.load(
			'./imgs/creeper_face.png'
		)
		// 苦力怕皮肤贴图
		const skinMap = textureLoader.load(
			'./imgs/creeper.png'
		)

		// 身体与脚的材质设定
		const skinMat = new THREE.MeshPhongMaterial({
			map: skinMap // 皮肤贴图
		})

		// 准备头部与脸的材质
		const headMaterials = []
		for (let i = 0; i < 6; i++) {
			let map

			if (i === 4) map = headMap
			else map = skinMap

			headMaterials.push(new THREE.MeshPhongMaterial({ map: map }))
		}

		// 头
		this.head = new THREE.Mesh(headGeo, headMaterials)
		this.head.position.set(0, 6, 0)
		// this.head.rotation.y = 0.5 //稍微的摆头

		// 身体
		this.body = new THREE.Mesh(bodyGeo, skinMat)
		this.body.position.set(0, 0, 0)


		// 四只脚
		this.foot1 = new THREE.Mesh(footGeo, skinMat)
		this.foot1.position.set(-1, -5.5, 2)
		this.foot2 = this.foot1.clone()
		this.foot2.position.set(-1, -5.5, -2)
		this.foot3 = this.foot1.clone()
		this.foot3.position.set(1, -5.5, 2)
		this.foot4 = this.foot1.clone()
		this.foot4.position.set(1, -5.5, -2)

		// 将四只脚组合为一个 group
		this.feet = new THREE.Group()
		this.feet.add(this.foot1) // 前脚左
		this.feet.add(this.foot2) // 后脚左
		this.feet.add(this.foot3) // 前脚右
		this.feet.add(this.foot4) // 后脚右

		// 将头、身体、脚组合为一个 group
		this.creeper = new THREE.Group()
		this.creeper.add(this.head)
		this.creeper.add(this.body)
		this.creeper.add(this.feet)

		this.creeper.traverse(function (object) {
			if (object instanceof THREE.Mesh) {
				object.castShadow = true
				object.receiveShadow = true
			}
		})
	}
}

// 生成苦力怕並加到场景
function createCreeper() {
	creeperObj = new Creeper()
	tweenHandler()
	scene.add(creeperObj.creeper)
}

let datGUIControls = new (function () {
	this.startTracking = false
	this.togglePlayMusic = function () {
		if (musicPlayback) {
			sound.pause()
			musicPlayback = false
		} else {
			sound.play()
			musicPlayback = true
		}
	}
	this.changeScene = function () {
		if (sceneType === 'SNOW') {
			material.map = rainTexture
			material.size = 2
			sceneType = 'RAIN'
		} else {
			material.map = snowTexture
			material.size = 5
			sceneType = 'SNOW'
		}
	}
})()

function createPoints() {
	const geometry = new THREE.Geometry()

	material = new THREE.PointsMaterial({
		size: 5,
		map: snowTexture,
		blending: THREE.AdditiveBlending,
		// depthTest: false,
		transparent: true,
		opacity: 0.5
	})

	const range = 300
	for (let i = 0; i < particleCount; i++) {
		const x = THREE.Math.randInt(-range / 2, range / 2)
		const y = THREE.Math.randInt(0, range * 20)
		const z = THREE.Math.randInt(-range / 2, range / 2)
		const point = new THREE.Vector3(x, y, z)
		point.velocityX = THREE.Math.randFloat(-0.16, 0.16)
		point.velocityY = THREE.Math.randFloat(0.1, 0.3)
		geometry.vertices.push(point)
	}

	points = new THREE.Points(geometry, material)
	scene.add(points)
}

function initStats() {
	const stats = new Stats()
	stats.setMode(0)
	document.getElementById('stats').appendChild(stats.domElement)
	return stats
}

// 画面初始化
function init() {
	scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2(0x000000, 0.0008)

	// 相机设置
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		2000
	)
	camera.position.set(-100, 100, 200)
	camera.lookAt(scene.position)

	// let axes = new THREE.AxesHelper(20)
	// scene.add(axes)

	stats = initStats()

	// 渲染器设置
	renderer = new THREE.WebGLRenderer()
	// renderer.setClearColor(0x80adfc, 1.0)
	renderer.setClearColor(0x111111, 1.0)
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap

	// 建立 OrbitControls
	cameraControl = new THREE.OrbitControls(camera, renderer.domElement)
	cameraControl.enableDamping = true // 启用阻尼效果
	cameraControl.dampingFactor = 0.25 // 阻尼系數

	// 简单的地面
	const planeGeometry = new THREE.PlaneGeometry(300, 300)
	const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
	let plane = new THREE.Mesh(planeGeometry, planeMaterial)
	plane.rotation.x = -0.5 * Math.PI
	plane.position.set(0, -7, 0)
	plane.receiveShadow = true
	plane.name = 'floor'
	scene.add(plane)

	// 产生苦力怕物件并加到场景
	createCreeper()

	createPoints()

	// 设置环境光
	let ambientLight = new THREE.AmbientLight(0x404040)
	scene.add(ambientLight)

	// 设置聚光灯 照亮物体
	let spotLight = new THREE.SpotLight(0xf0f0f0)
	spotLight.position.set(-10, 30, 20)
	// spotLight.castShadow = true
	// scene.add(spotLight)

	// 点光源
	pointLight = new THREE.PointLight(0xf0f0f0, 1, 100) // 颜色，强度，距离
	pointLight.castShadow = true // 投影
	pointLight.position.set(-30, 30, 30)
	scene.add(pointLight)

	gui = new dat.GUI()
	gui.add(datGUIControls, 'togglePlayMusic')
	gui.add(datGUIControls, 'changeScene')
	gui.add(datGUIControls, 'startTracking').onChange(function (e) {
		startTracking = e
		if (invert > 0) {
			if (startTracking) {
				tween.start()
			} else {
				tween.stop()
			}
		} else {
			if (startTracking) {
				tweenBack.start()
			} else {
				tweenBack.stop()
			}
		}
	})

	document.body.appendChild(renderer.domElement)
}

function tweenHandler() {
	let offset = { x: 0, z: 0, rotateY: 0 }
	let target = { x: 100, z: 100, rotateY: 0.7853981633974484 } // 目标值

	// 苦力怕走动及转身补间动画
	const onUpdate = () => {
		// 移动
		creeperObj.feet.position.x = offset.x
		creeperObj.feet.position.z = offset.z
		creeperObj.head.position.x = offset.x
		creeperObj.head.position.z = offset.z
		creeperObj.body.position.x = offset.x
		creeperObj.body.position.z = offset.z
		pointLight.position.x = offset.x - 20
		pointLight.position.z = offset.z + 20

		// 转身
		if (target.x > 0) {
			creeperObj.feet.rotation.y = offset.rotateY
			creeperObj.head.rotation.y = offset.rotateY
			creeperObj.body.rotation.y = offset.rotateY
		} else {
			creeperObj.feet.rotation.y = -offset.rotateY
			creeperObj.head.rotation.y = -offset.rotateY
			creeperObj.body.rotation.y = -offset.rotateY
		}
	}

	// 计算新的目标值
	const handleNewTarget = () => {
		// 限制苦力怕走路边界
		const range = 100
		if (camera.position.x > range) target.x = range
		else if (camera.position.x < -range) target.x = -range
		else target.x = camera.position.x
		if (camera.position.z > range) target.z = range
		else if (camera.position.z < -range) target.z = -range
		else target.z = camera.position.z

		const v1 = new THREE.Vector2(0, 1) // 原点面向方向
		const v2 = new THREE.Vector2(target.x, target.z) // 苦力怕面向新相机方向

		// 内积除以标量得两向量 cos 值
		let cosValue = v1.dot(v2) / (v1.length() * v2.length())

		// 防呆，cos 值区间为（-1, 1）
		if (cosValue > 1) cosValue = 1
		else if (cosValue < -1) cosValue = -1

		// cos 值求转身角度
		target.rotateY = Math.acos(cosValue)
	}

	// 计算新的目标值
	const handleNewTweenBackTarget = () => {
		// 限制苦力怕走路边界
		const range = 150
		const tmpX = target.x
		const tmpZ = target.z

		target.x = THREE.Math.randFloat(-range, range)
		target.z = THREE.Math.randFloat(-range, range)

		const v1 = new THREE.Vector2(tmpX, tmpZ)
		const v2 = new THREE.Vector2(target.x, target.z)

		// 内积除以标量得两向量 cos 值
		let cosValue = v1.dot(v2) / (v1.length() * v2.length())

		// 防呆，cos 值区间为（-1, 1）
		if (cosValue > 1) cosValue = 1
		else if (cosValue < -1) cosValue = -1

		// cos 值求转身角度
		target.rotateY = Math.acos(cosValue)
	}

	// 朝相机移动
	tween = new TWEEN.Tween(offset)
		.to(target, 15000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(onUpdate)
		.onComplete(() => {
			handleNewTweenBackTarget()
			invert = -1
			tweenBack.start()
		})

	// 随机移动
	tweenBack = new TWEEN.Tween(offset)
		.to(target, 15000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(onUpdate)
		.onComplete(() => {
			handleNewTarget() // 计算新的目标值
			invert = 1
			tween.start()
		})
}

// 苦力怕原地走动动画
function creeperFeetWalk() {
	walkSpeed += 0.04
	creeperObj.foot1.rotation.x = Math.sin(walkSpeed) / 4 // 前脚左
	creeperObj.foot2.rotation.x = -Math.sin(walkSpeed) / 4 // 后脚左
	creeperObj.foot3.rotation.x = -Math.sin(walkSpeed) / 4 // 前脚右
	creeperObj.foot4.rotation.x = Math.sin(walkSpeed) / 4 // 后脚右
}

function pointsAnimation() {
	points.geometry.vertices.forEach(function (v) {
		if (v.y >= -7) {
			v.x = v.x - v.velocityX
			v.y = v.y - v.velocityY
		}
		if (v.x <= -150 || v.x >= 150) v.velocityX = v.velocityX * -1
		// if (v.y <= -7) {
		//   material.depthTest = true
		// }
	})

	// console.log(points.geometry)
	points.geometry.verticesNeedUpdate = true
}

function render() {
	stats.update()
	cameraControl.update()
	creeperFeetWalk()
	pointsAnimation()
	TWEEN.update()

	requestAnimationFrame(render)
	renderer.render(scene, camera)
}

window.addEventListener('resize', function () {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

init()
render()
