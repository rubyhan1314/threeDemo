
let renderer, scene, camera
let cameraControl, stats
let creeperObj

// 苦力怕物件
class Creeper {
  constructor() {
    // 设置头、身体、脚几何体大小
    const headGeo = new THREE.BoxGeometry(4, 4, 4)
    const bodyGeo = new THREE.BoxGeometry(4, 8, 2)
    const footGeo = new THREE.BoxGeometry(2, 3, 2)

    // 苦力怕脸部贴图
    const headMap = new THREE.TextureLoader().load(
      './imgs/creeper_face.png')
    // 苦力怕皮肤贴图
    const skinMap = new THREE.TextureLoader().load(
      './imgs/creeper.png')

    // 身体与脚的材质设定
    const skinMat = new THREE.MeshStandardMaterial({
      roughness: 0.3, // 粗糙度
      metalness: 0.8, // 金属感
      transparent: true, // 透明与否
      opacity: 0.9, // 透明度
      side: THREE.DoubleSide, // 双面材质
      map: skinMap // 皮肤贴图
    })

    // 准备头部与脸的材质
    const headMaterials = []
    for (let i = 0; i < 6; i++) {
      let map

      if (i === 4) map = headMap
      else map = skinMap

      headMaterials.push(new THREE.MeshStandardMaterial({ map: map }))
    }

    // 头
    this.head = new THREE.Mesh(headGeo, headMaterials)
    this.head.position.set(0, 6, 0)
    this.head.rotation.y = 0.5 // 稍微的摆头

    // 身体
    this.body = new THREE.Mesh(bodyGeo, skinMat)
    this.body.position.set(0, 0, 0)

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

  let axes = new THREE.AxesHelper(20)
  // scene.add(axes)

  stats = initStats()

  // 渲染器设置
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  // 建立 OrbitControls
  cameraControl = new THREE.OrbitControls(camera, renderer.domElement)
  cameraControl.enableDamping = true // 启用阻尼效果
  cameraControl.dampingFactor = 0.25 // 阻尼系数
  // cameraControl.autoRotate = true // 启用自动旋转

  // 简单的地面
  const planeGeometry = new THREE.PlaneGeometry(60, 60)
  const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
  let plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(0, -7, 0)
  scene.add(plane)

  // 产生苦力怕物件
  createCreeper()

  let ambientLight = new THREE.AmbientLight(0x404040) // soft white light
  scene.add(ambientLight)
  // 简单的 spotlight 照亮物体
  let spotLight = new THREE.SpotLight(0xffffff, 5, 100)
  spotLight.position.set(-10, 20, 20)
  scene.add(spotLight)
  // let spotHelper = new THREE.SpotLightHelper(spotLight)
  // scene.add(spotHelper)

  // 将渲染出来的画面放到网页上的 DOM
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
