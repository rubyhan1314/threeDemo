
let scene, renderer, camera;
let cube;

function init() {

	// 1.建立场景
	scene = new THREE.Scene();

	// 2.建立渲染器
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight); // 场景大小
	renderer.setClearColor(0xeeeeee, 1.0); // 预设背景颜色
	renderer.shadowMap.enable = true; // 阴影效果

	// 将渲染器的 DOM 绑到网页上
	document.body.appendChild(renderer.domElement);

	// 3. 建立相机
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);
	camera.position.set(10, 10, 10); // 相机位置
	camera.lookAt(scene.position); // 相机焦点

	// 4. 建立光源
	let pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(10, 10, -10);
	scene.add(pointLight);

	// 5. 建立物体
	const geometry = new THREE.BoxGeometry(1, 1, 1); // 几何体
	const material = new THREE.MeshPhongMaterial({
		color: 0x0000ff
	}); // 材质
	cube = new THREE.Mesh(geometry, material); // 建立网格物件
	cube.position.set(0, 0, 0);
	scene.add(cube);

}

// 6. 建立动画
function animate() {
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
}

// 7. 渲染场景
function render() {
	animate();
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

// 监听屏幕宽高变化来做简单 RWD 设定
window.addEventListener("resize", function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
})

init();
render();