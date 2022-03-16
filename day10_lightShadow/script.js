let renderer, scene, camera;

let cameraControl, stats;

let creeperObj;

let sphereLightMesh, pointLight
let rotateAngle = 0
let invert = 1

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

// 生成苦力怕並加到场景
function createCreeper() {
	creeperObj = new Creeper()
	scene.add(creeperObj.creeper)
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
	scene.add(axes)

	stats = initStats()

	// 渲染器设置
	renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = 2 // THREE.PCFSoftShadowMap

	// 建立 OrbitControls
	cameraControl = new THREE.OrbitControls(camera, renderer.domElement)
	cameraControl.enableDamping = true // 启用阻尼效果
	cameraControl.dampingFactor = 0.25 // 阻尼系數
	// cameraControl.autoRotate = true // 啟用自动旋转


	// 简单的地面
	const planeGeometry = new THREE.PlaneGeometry(60, 60)
	const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
	let plane = new THREE.Mesh(planeGeometry, planeMaterial)
	plane.rotation.x = -0.5 * Math.PI // 使平面与 y 轴垂直，并让正面朝上
	plane.position.set(0, -7, 0)
	plane.receiveShadow = true
	scene.add(plane)

	// 产生苦力怕物件并加到场景
	createCreeper()

	// 设置环境光提供辅助柔和白光
	let ambientLight = new THREE.AmbientLight(0x404040)
	scene.add(ambientLight)

	// 设置聚光灯 照亮物体
	let spotLight = new THREE.SpotLight(0xf0f0f0)
	spotLight.position.set(-10, 30, 20)
	// spotLight.castShadow = true
	scene.add(spotLight)


	// let spotHelper = new THREE.SpotLightHelper(spotLight)
	// scene.add(spotHelper)


	// 移动点光源
	pointLight = new THREE.PointLight(0xccffcc, 1, 100) // 颜色，强度，距离
	pointLight.castShadow = true // 投影
	scene.add(pointLight)

	// 小球体模拟点光源实体
	const sphereLightGeo = new THREE.SphereGeometry(0.3)
	const sphereLightMat = new THREE.MeshBasicMaterial({ color: 0xccffcc })
	sphereLightMesh = new THREE.Mesh(sphereLightGeo, sphereLightMat)
	sphereLightMesh.castShadow = true
	sphereLightMesh.position.y = 16
	scene.add(sphereLightMesh)

	document.body.appendChild(renderer.domElement)
}

// 点光源绕 Y 轴旋转动画
function pointLightAnimation() {
	if (rotateAngle > 2 * Math.PI) {
		rotateAngle = 0 // 超过 360 度后归零
	} else {
		rotateAngle += 0.03 // 递增角度
	}

	// 光源延椭圆轨道绕 Y 轴旋转
	sphereLightMesh.position.x = 8 * Math.cos(rotateAngle)
	sphereLightMesh.position.z = 4 * Math.sin(rotateAngle)

	// 点光源位置与球体同步
	pointLight.position.copy(sphereLightMesh.position)
}

function render() {
	stats.update()
	cameraControl.update()
	pointLightAnimation()
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