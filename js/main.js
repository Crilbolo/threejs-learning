// ============================================================
//  Three.js 初学者教程:加载 FBX 大场景
//  运行方式:在项目根目录启动本地服务器(见 README 或对话说明),
//  然后浏览器打开 http://localhost:8080
//
//  用 UE 的概念来类比 Three.js:
//    Scene          ≈ 关卡(World)
//    PerspectiveCamera ≈ 相机演员(CineCameraActor)
//    Mesh           ≈ StaticMesh 实例
//    OrbitControls  ≈ 编辑器里的"鼠标观察模式"
//    requestAnimationFrame 渲染循环 ≈ Game Loop 的 Tick
// ============================================================

// ---------- 第 1 步:导入需要的"模块" ----------
// THREE 是核心库;带 URL 的 import 会去 importmap 里找对应的网址下载
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// ---------- 第 2 步:创建"三件套":场景、相机、渲染器 ----------

// 场景:所有看得见东西的容器,相当于 UE 的关卡
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1f26); // 背景色(深灰蓝)
// 雾:远处物体逐渐融入背景,增加空间感(可选,注释掉也没有问题)
scene.fog = new THREE.Fog(0x1a1f26, 300, 3000);

// 透视相机。参数含义和 UE 相机类似:
//   75   = 视野角度 FOV(度)
//   宽高比 = 跟随浏览器窗口
//   0.1  = 近裁剪面(比这更近的物体不渲染)
//   5000 = 远裁剪面(比这更远的物体不渲染,要大于场景尺寸)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
// 先随便给个初始位置,等模型加载完后会自动对准模型(见 fitCameraToModel)
camera.position.set(300, 200, 300);

// WebGL 渲染器:负责把场景画到 <canvas> 上
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias 抗锯齿
renderer.setSize(window.innerWidth, window.innerHeight);
// 设备像素比:高分屏(如 125%/150% 缩放)下画面更清晰。
// 上限设为 2,再高会明显影响性能。
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// 开启阴影(场景中至少要有一盏"会投影的灯"才有效果,见下面灯光部分)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影
// renderer.domElement 就是渲染器创建的 <canvas> 元素,塞进页面里
document.body.appendChild(renderer.domElement);

// ---------- 第 3 步:轨道控制器(鼠标旋转/缩放/平移视角) ----------
// target 是"相机盯着哪个点",一开始放在原点,加载完模型后会移到模型中心
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;   // 阻尼:松开鼠标后视角会"滑行"一下,手感更好
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// ---------- 第 4 步:灯光 ----------
// Three.js 里"没有灯就一片漆黑"(除非材质不受光照影响),这点和 UE 一样。

// 环境光:从四面八方均匀照射,负责"垫底",防止阴影处全黑
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 半球光:上方天空色 + 下方地面反射色,让明暗更自然
const hemiLight = new THREE.HemisphereLight(0xbfd4ff, 0x8d6e4a, 0.45);
scene.add(hemiLight);

// 平行光:模拟太阳,光线互相平行,适合照大场景
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(400, 800, 300);
dirLight.castShadow = true; // 这盏灯会产生阴影
// 阴影相机的覆盖范围要包住整个场景,否则阴影会"断"
const s = 1200;
dirLight.shadow.camera.left = -s;
dirLight.shadow.camera.right = s;
dirLight.shadow.camera.top = s;
dirLight.shadow.camera.bottom = -s;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 4000;
dirLight.shadow.mapSize.set(2048, 2048); // 阴影贴图分辨率,越大越清晰越耗性能
scene.add(dirLight);

// ---------- 第 5 步:辅助工具(学习期很有用,上线可删) ----------

// 网格地面:1x1 一格,帮你判断比例和位置
const grid = new THREE.GridHelper(2000, 100, 0x445566, 0x2a3340);
scene.add(grid);

// 坐标轴辅助:红=X,绿=Y,蓝=Z。Three.js 是 Y 轴朝上(UE 是 Z 轴朝上,注意!)
const axes = new THREE.AxesHelper(200);
scene.add(axes);

// ---------- 第 6 步:加载 FBX 模型 ----------
// FBXLoader 在 examples/jsm 里,属于"附加功能",核心库不含它,必须单独 import
const loader = new FBXLoader();

// DOM 元素:进度条相关(获取 index.html 里那几个 div,用来更新文字)
const loadingEl = document.getElementById('loading');
const barFillEl = document.getElementById('barFill');
const percentEl = document.getElementById('loadingPercent');
const loadingTextEl = document.getElementById('loadingText');

// 注意:只能对"文件名"做转义,路径分隔符 / 必须保留!
// 如果对整条路径用 encodeURIComponent,'fbx/' 里的 / 会变成 %2F,
// FBXLoader 就识别不出模型所在目录,导致模型引用的贴图(纹理)全部 404,画面发黑。
const fbxUrl = 'fbx/' + encodeURIComponent('水电站细节场景整理合并.fbx');

loader.load(
  fbxUrl,

  // 回调 1:加载成功。model 就是整个 fbx 的根对象(一个 Object3D)
  (model) => {
    console.log('FBX 加载完成:', model);

    // 遍历模型里所有网格(Mesh),打开阴影的"投射"和"接收"
    // 默认情况下模型既不投影也不接收阴影,必须手动开启
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    scene.add(model);

    // 把相机对准模型(详见函数注释)
    fitCameraToModel(model);

    // 隐藏加载界面
    loadingEl.style.display = 'none';
  },

  // 回调 2:下载进度。xhr.total 是文件总字节数(本地服务器一般会提供)
  (xhr) => {
    if (xhr.total > 0) {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      barFillEl.style.width = percent + '%';
      percentEl.textContent =
        percent + '%  (' + (xhr.loaded / 1024 / 1024).toFixed(1) + ' MB / ' +
        (xhr.total / 1024 / 1024).toFixed(0) + ' MB)';
    } else {
      percentEl.textContent = (xhr.loaded / 1024 / 1024).toFixed(1) + ' MB 已下载';
    }
  },

  // 回调 3:加载出错
  (error) => {
    console.error('FBX 加载失败:', error);
    loadingTextEl.textContent = '加载失败!请确认:1) 用的是本地服务器 2) fbx 文件路径正确';
    loadingTextEl.style.color = '#e06c6c';
  }
);

/**
 * 【工具函数】让相机自动框住整个模型
 * 大场景最怕"加载完了但视角不对,眼前一片黑"。
 * 原理:
 *  1. Box3.setFromObject 算出模型的"包围盒"(能装下模型的最小长方体)
 *  2. 取包围盒中心,把 OrbitControls 的注视点(target)放到那
 *  3. 根据包围盒大小推算一个够远、够高的相机位置
 */
function fitCameraToModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // 场景的最大尺寸(米)。打印出来,方便你了解这个场景到底有多大
  console.log('模型尺寸 宽x高x深:', size.x.toFixed(1), size.y.toFixed(1), size.z.toFixed(1));
  console.log('模型中心位置:', center.x.toFixed(1), center.y.toFixed(1), center.z.toFixed(1));

  const maxDim = Math.max(size.x, size.y, size.z);

  // 把网格地面缩放到和场景差不多大
  grid.scale.setScalar(maxDim / 600);

  // 阴影相机范围也按场景大小自动放大
  dirLight.shadow.camera.far = maxDim * 6;
  dirLight.position.copy(center).add(new THREE.Vector3(maxDim, maxDim * 1.5, maxDim * 0.8));
  dirLight.target.position.copy(center); // 平行光照射目标点对准模型中心
  scene.add(dirLight.target);
  dirLight.shadow.camera.updateProjectionMatrix();

  // 相机放在中心斜上方,距离约为场景最大尺寸的 1.2 倍
  controls.target.copy(center);
  camera.position.copy(center).add(
    new THREE.Vector3(maxDim * 0.8, maxDim * 0.6, maxDim * 0.9)
  );
  // 远裁剪面拉大到场景尺寸的 20 倍,保证远处的东西不被裁掉
  camera.far = maxDim * 20;
  camera.updateProjectionMatrix();
  controls.update();
}

// ---------- 第 7 步:渲染循环 ----------
// 和 UE 的 Tick 一样:每一帧都执行一次 draw()
const clock = new THREE.Clock(); // 计时器,用来算两帧之间的时间差

function draw() {
  requestAnimationFrame(draw); // 请求下一帧继续调用自己(约 60 次/秒)

  const delta = clock.getDelta(); // 本帧耗时(秒),和帧率无关的动画都乘它

  // 给坐标轴辅助器做一个缓慢自转,证明"循环真的在跑"
  axes.rotation.y += delta * 0.5;

  controls.update(); // 有阻尼时必须每帧更新控制器
  renderer.render(scene, camera); // 核心一行:把场景从相机视角画出来
}
draw(); // 启动循环(模型没加载完也会先跑,你能先看到网格和坐标轴)

// ---------- 第 8 步:处理浏览器窗口大小变化 ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; // 新宽高比
  camera.updateProjectionMatrix();                        // 让改动生效
  renderer.setSize(window.innerWidth, window.innerHeight); // 画布跟随窗口
});
