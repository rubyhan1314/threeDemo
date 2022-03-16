let renderer, scene, camera;

class Creeper {
	constructor() {
		// 宣告头、身体、脚几何体大小
		const headGeo = new THREE.BoxGeometry(4, 4, 4);
		const bodyGeo = new THREE.BoxGeometry(4, 8, 2);
		const footGeo = new THREE.BoxGeometry(2, 3, 2);

		// 冯氏材质设为绿色
		const creeperMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

		// 头
		this.head = new THREE.Mesh(headGeo, creeperMat);
		this.head.position.set(0, 6, 0);
		// 身体
		this.body = new THREE.Mesh(bodyGeo, creeperMat);
		this.body.position.set(0, 0, 0);


		// 四只脚
		this.foot1 = new THREE.Mesh(footGeo, creeperMat)
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

	}
}

// 生成苦力怕並加到场景
function createCreeper() {
	const creeperObj = new Creeper()
	scene.add(creeperObj.creeper)
}

// 画面初始化
function init() {

	scene = new THREE.Scene()

	// 相机设置为 OrbitControls
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

	// 渲染器设置
	renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)

	// 简单的地面
	const planeGeometry = new THREE.PlaneGeometry(60, 60)
	const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
	let plane = new THREE.Mesh(planeGeometry, planeMaterial)
	plane.rotation.x = -0.5 * Math.PI // 使平面与 y 轴垂直，并让正面朝上
	plane.position.set(0, -7, 0)
	scene.add(plane)

	// 产生苦力怕物件并加到场景
	createCreeper()

	// 简单的 spotlight 照亮物体
	let spotLight = new THREE.SpotLight(0xffffff)
	spotLight.position.set(-10, 40, 30)
	scene.add(spotLight)
	// let spotHelper = new THREE.SpotLightHelper(spotLight)
	// scene.add(spotHelper)

	// 将渲染出来的画面放到网页上的 DOM
	document.body.appendChild(renderer.domElement)




}



function render() {
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