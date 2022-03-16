let tween, tweenBack
let walkSpeed = 0
let scaleHeadOffset = 0

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
  creeperObj.leftFrontLeg.rotation.x = Math.sin(walkSpeed) / 4 // 前脚左
  creeperObj.leftBackLeg.rotation.x = -Math.sin(walkSpeed) / 4 // 后脚左
  creeperObj.rightFrontLeg.rotation.x = -Math.sin(walkSpeed) / 4 // 前脚右
  creeperObj.rightBackLeg.rotation.x = Math.sin(walkSpeed) / 4 // 后脚右
}

// 苦力怕膨胀
function creeperScaleBody() {
  scaleHeadOffset += 0.04
  let scaleRate = Math.abs(Math.sin(scaleHeadOffset)) / 16 + 1
  creeperObj.creeper.scale.set(scaleRate, scaleRate, scaleRate)
}
