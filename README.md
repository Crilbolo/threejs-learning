# Three.js 学习项目:水电站场景

一个零配置(不需要 npm/打包)的 Three.js 入门项目,加载 `fbx/水电站细节场景整理合并.fbx`。

## 如何运行

在项目根目录打开终端,执行:

```bash
npx http-server -p 8080
```

然后浏览器打开 http://localhost:8080

> 为什么必须用本地服务器?浏览器出于安全限制,直接双击打开 html
> (file:// 协议)是不允许读取 fbx 文件的。

## 文件结构

```
index.html      页面 + importmap(告诉浏览器 three 库从哪下载)
js/main.js      全部场景代码,按 8 个步骤组织,每步都有注释
fbx/            你的模型和贴图
```

## 建议的学习路线(按 main.js 里的编号)

1. **三件套**:场景 Scene / 相机 Camera / 渲染器 Renderer —— 一切 Three.js 的起点
2. **OrbitControls**:鼠标交互控制器,先玩转发视角
3. **灯光**:试着注释掉某盏灯,看画面变化,理解每种灯的作用
4. **FBXLoader**:异步加载 + 三个回调(成功/进度/失败)
5. **渲染循环**:requestAnimationFrame,对比 UE 的 Tick
6. **Box3 包围盒**:自动对相机,处理任意大小模型的通用套路

## 可以动手做的练习

- 把 `scene.fog` 的 300/3000 改小,观察雾的效果
- 改 `dirLight.intensity`,看阴影变化
- 用 `model.children` 遍历,给某个子网格换材质:`mesh.material = new THREE.MeshNormalMaterial()`
- 按键盘按键切换线的显示(结合 `window.addEventListener('keydown')`)

## 给 UE 开发者的对照表

| UE | Three.js |
|---|---|
| 关卡 World | Scene |
| CineCameraActor | PerspectiveCamera |
| StaticMeshComponent | Mesh (Geometry + Material) |
| 编辑器视口鼠标观察 | OrbitControls |
| Tick / Game Loop | requestAnimationFrame 循环 |
| Z 轴朝上 | **Y 轴朝上**(最容易踩的坑) |
| World Partition 大场景流送 | 需自己实现/用 GLTF + LOD |
