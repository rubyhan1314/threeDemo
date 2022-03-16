let renderer, scene, camera;

let cameraControl, stats, gui;

let creeperObj;

let ambientLight, pointLight, spotLight, directionalLight;

// 苦力怕物件
class Creeper {
	constructor() {
		// 设置头、身体、脚几何体大小
		const headGeo = new THREE.BoxGeometry(4, 4, 4);
		const bodyGeo = new THREE.BoxGeometry(4, 8, 2);
		const footGeo = new THREE.BoxGeometry(2, 3, 2);

		// 苦力怕脸部贴图
		const headMap = new THREE.TextureLoader().load(
			'./imgs/creeper_face.png'
		)
		// 苦力怕皮肤贴图
		const skinMap = new THREE.TextureLoader().load(
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
		this.head = new THREE.Mesh(headGeo, headMaterials);
		this.head.position.set(0, 6, 0);
		this.head.rotation.y = 0.5 //稍微的摆头

		// 身体
		this.body = new THREE.Mesh(bodyGeo, skinMat);
		this.body.position.set(0, 0, 0);


		// 四只脚
		this.foot1 = new THREE.Mesh(footGeo, skinMat)
		this.foot1.position.set(-1, -5.5, 2)
		this.foot2 = this.foot1.clone() // 剩下三只脚都复制第一只的 Mesh
		this.foot2.position.set(-1, -5.5, -2)
		this.foot3 = this.foot1.clone()
		this.foot3.position.set(1, -5.5, 2)
		this.foot4 = this.foot1.clone()
		this.foot4.position.set(1, -5.5, -2)

		// 将四只脚组合为一个 group
		this.feet = new THREE.Group()
		this.feet.add(this.foot1)
		this.feet.add(this.foot2)
		this.feet.add(this.foot3)
		this.feet.add(this.foot4)

		// 将头、身体、脚组合为一个 group
		this.creeper = new THREE.Group()
		this.creeper.add(this.head)
		this.creeper.add(this.body)
		this.creeper.add(this.feet)

		// 苦力怕投影设置，利用 traverse 遍历各個子元件设置阴影
		this.creeper.traverse(function (object) {
			if (object instanceof THREE.Mesh) {
				object.castShadow = true
				object.receiveShadow = true
			}
		})


	}
}

// 生成苦力怕并加到场景
function createCreeper() {
	creeperObj = new Creeper()
	scene.add(creeperObj.creeper)
}

let datGUIControls = new (function () {
	this.AmbientLight = true
	this.PointLight = false
	this.Spotlight = false
	this.DirectionalLight = false
})()

function initStats() {
	const stats = new Stats()
	stats.setMode(0)
	document.getElementById('stats').appendChild(stats.domElement)
	return stats
}

// 画面初始化
function init() {

	scene = new THREE.Scene()

	// 相机设置
	camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	)
	camera.position.set(30, 30, 30)
	camera.lookAt(scene.position)

	// 三轴坐标辅助
	let axes = new THREE.AxesHelper(20) // 参数为坐标轴长度
	// scene.add(axes)

	stats = initStats()

	// 渲染器设置
	renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true // 设置阴影
	renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap

	// 建立 OrbitControls
	cameraControl = new THREE.OrbitControls(camera, renderer.domElement)
	cameraControl.enableDamping = true // 启用阻尼效果
	cameraControl.dampingFactor = 0.25 // 阻尼系數
	cameraControl.autoRotate = true // 啟用自动旋转


	// 简单的地面
	const planeGeometry = new THREE.PlaneGeometry(60, 60)
	const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
	let plane = new THREE.Mesh(planeGeometry, planeMaterial)
	plane.rotation.x = -0.5 * Math.PI // 使平面与 y 轴垂直，并让正面朝上
	plane.position.set(0, -7, 0)
	plane.receiveShadow = true // 地面接收阴影
	scene.add(plane)

	// 产生苦力怕物件并加到场景
	createCreeper()

	// 设置环境光 AmbientLight
	ambientLight = new THREE.AmbientLight(0xeeff00)
	scene.add(ambientLight)
	// ambientLight.visible = false

	// 基本点光源 PointLight
	pointLight = new THREE.PointLight(0xeeff00)
	pointLight.castShadow = true
	pointLight.position.set(-10, 20, 20)
	scene.add(pointLight)
	let pointLightHelper = new THREE.PointLightHelper(pointLight)
	scene.add(pointLightHelper)
	pointLight.visible = false
	pointLightHelper.visible = false


	// 设置聚光灯 SpotLight

	spotLight = new THREE.SpotLight(0xeeff00)
	spotLight.position.set(-10, 20, 20)
	spotLight.castShadow = true
	scene.add(spotLight)
	let spotLightHelper = new THREE.SpotLightHelper(spotLight)
	scene.add(spotLightHelper)
	spotLight.visible = false
	spotLightHelper.visible = false


	// 基本平行光 DirectionalLight
	directionalLight = new THREE.DirectionalLight(0xeeff00)
	directionalLight.position.set(-10, 20, 20)
	directionalLight.castShadow = true
	scene.add(directionalLight)
	let directionalLightHelper = new THREE.DirectionalLightHelper(
		directionalLight
	)


	scene.add(directionalLightHelper)
	directionalLight.visible = false
	directionalLightHelper.visible = false


	gui = new dat.GUI()
	gui.add(datGUIControls, 'AmbientLight').onChange(function (e) {
		ambientLight.visible = e
	})
	gui.add(datGUIControls, 'PointLight').onChange(function (e) {
		pointLight.visible = e
		pointLightHelper.visible = e
	})
	gui.add(datGUIControls, 'Spotlight').onChange(function (e) {
		spotLight.visible = e
		spotLightHelper.visible = e
	})
	gui.add(datGUIControls, 'DirectionalLight').onChange(function (e) {
		directionalLight.visible = e
		directionalLightHelper.visible = e
	})


	document.body.appendChild(renderer.domElement)




}



function render() {
	stats.update();
	cameraControl.update();
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