// src/data/aeExpressions.ts

export interface ExpressionItem {
  title: string;
  code: string;
  description: string;
  usage: string;
  imageSrc?: string; // 可选的演示图片/GIF路径
}

export interface FunctionDocItem {
  name: string;
  syntax: string;
  description: string;
  example: string;
}

// --- 模块 1: 常用表达式案例 (Top 20) ---
export const aeExpressionsData: ExpressionItem[] = [
  {
    title: "1. 万能摆动 (Wiggle)",
    code: `wiggle(freq, amp); \n// 例如: wiggle(2, 50);`,
    description: "让属性值在一定范围内随机摆动。是最常用的表达式之一。",
    usage: "应用在位置、旋转、缩放或不透明度上。`freq` 是每秒摆动的频率，`amp` 是摆动的幅度。",
    imageSrc: "/images/ae/wiggle.gif", // 需替换为实际图片
  },
  {
    title: "2. 持续自转/移动 (Time Loop)",
    code: `time * 速度数值; \n// 例如: time * 360; (每秒转一圈)`,
    description: "利用时间作为驱动力，让属性持续增加。常用于制作风扇旋转、时钟指针或背景持续滚动。",
    usage: "应用在旋转属性上，物体会不停旋转。数值越大，速度越快。",
    imageSrc: "/images/ae/time-rotate.gif",
  },
  {
    title: "3. 循环关键帧 (LoopOut)",
    code: `loopOut("cycle");`,
    description: "让关键帧动画在结束后自动重新开始循环播放。",
    usage: "在做完一段动画后（至少2个关键帧），在最后一个关键帧之后应用此表达式。模式可选：'cycle'(标准循环), 'pingpong'(来回循环), 'continue'(延续最后一个动作)。",
  },
  {
    title: "4. 弹性/惯性效果 (Inertial Bounce)",
    code: `// 这是一个较长的代码片段，通常需要复制粘贴
amp = .1; freq = 2.0; decay = 2.0;
n = 0;
if (numKeys > 0){
  n = nearestKey(time).index;
  if (key(n).time > time){n--;}
}
if (n == 0){ t = 0; }
else{
  t = time - key(n).time;
}
if (n > 0 && t < 1){
  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);
  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);
}else{value}`,
    description: "让物体的运动在停止时产生自然的弹性晃动，增加Q弹感。",
    usage: "应用在任何有运动关键帧的属性上（如位置、旋转、缩放）。通过调整顶部的 amp, freq, decay 变量来控制弹性强度。",
    imageSrc: "/images/ae/bounce.gif",
  },
  {
    title: "5. 属性随机值 (Random)",
    code: `random(min, max); \n// 例如: random(0, 100);`,
    description: "每一帧都生成一个指定范围内的随机数。",
    usage: "常用于不透明度产生闪烁效果，或者用于粒子发射器的随机参数。",
  },
  {
    title: "6. 固定随机值 (SeedRandom)",
    code: `seedRandom(index, true); \nrandom(0, 360);`,
    description: "生成一个随机值，但这个值是固定的，不会随时间变化。`true` 表示不随时间变化。",
    usage: "常用于大量图层的随机初始状态，例如给许多星星设置随机的初始旋转角度。",
  },
  {
    title: "7. 线性映射 (Linear)",
    code: `linear(time, 0, 5, 0, 100);`,
    description: "将一个范围的值映射到另一个范围。例如：随着时间从0到5秒，属性值从0线性增加到100。",
    usage: "非常强大的控制工具。可以将滑块控件的值映射到复杂的动画参数上。",
  },
  {
    title: "8. 缓动映射 (Ease)",
    code: `ease(time, 0, 5, 0, 100);`,
    description: "用法同 linear，但是带有缓入缓出效果，动画更平滑自然。",
    usage: "当你想要丝滑的过渡效果时，用 ease 代替 linear。",
  },
  {
    title: "9. 根据图层层级错位 (Index Stagger)",
    code: `value + (index-1) * 偏移量; \n// 例如位置属性X轴: [value[0] + (index-1)*50, value[1]]`,
    description: "利用图层的索引号 (index) 来创建规律的偏移。第1层偏移0，第2层偏移50，第3层偏移100，以此类推。",
    usage: "快速制作排列整齐的物体阵列，或者阶梯式的动画延迟。",
    imageSrc: "/images/ae/index-stagger.png",
  },
  {
    title: "10. 整数化/定格动画感 (Math.round)",
    code: `Math.round(value); \n// 或者配合时间: Math.round(time)*10;`,
    description: "将数值四舍五入为整数。可以让平滑的动画变成一卡一卡的定格效果，或者用于制作计数器。",
    usage: "应用在位置属性或文本源文本上制作数字跳动动画。",
  },
    {
    title: "11. 正弦波摆动 (Math.sin)",
    code: `// 在位置属性上实现上下浮动
amp = 50; // 振幅
freq = 2; // 频率
y = amp * Math.sin(time * freq * Math.PI * 2);
value + [0, y];`,
    description: "利用正弦函数创建平滑、周期性的往复运动。",
    usage: "制作漂浮的飞船、呼吸效果的水面等。",
    imageSrc: "/images/ae/sin-wave.gif",
  },
  {
    title: "12. 限制数值范围 (Clamp)",
    code: `clamp(value, min, max); \n// 例如: clamp(transform.xPosition, 0, 1920);`,
    description: "确保属性值不会超过指定的最小值和最大值。",
    usage: "防止物体移出屏幕边界，或者限制某个特效参数不爆表。",
  },
  {
    title: "13. 继承父级特定属性但不跟随",
    code: `// 应用于子图层的位置属性，使其不跟随父级移动，但可以跟随旋转/缩放
L = thisLayer;
P = L.toWorld(L.anchorPoint);
parent.fromWorld(P);`,
    description: "一种高级技巧，有时我们需要图层之间有父子关系，但不希望继承所有的变换属性。",
    usage: "解决复杂的绑定问题。",
  },
  {
    title: "14. 自动文本背景框 (sourceRectAtTime)",
    code: `// 应用在形状图层矩形的大小属性上
s = thisComp.layer("我的文本图层");
w = s.sourceRectAtTime().width;
h = s.sourceRectAtTime().height;
padding = 20;
[w + padding*2, h + padding*2];`,
    description: "让形状图层自动根据文本内容的大小调整自己的尺寸。",
    usage: "制作动态的字幕条、UI 按钮背景。",
    imageSrc: "/images/ae/source-rect.gif",
  },
  {
    title: "15. 自动看向目标 (LookAt)",
    code: `// 应用在 3D 图层的方向(Orientation)属性上
target = thisComp.layer("目标图层");
lookAt(transform.position, target.transform.position);`,
    description: "让一个图层始终正面朝向另一个图层。",
    usage: "制作眼球跟随、摄像机跟踪、或者像向日葵一样的物体。",
  },
  {
    title: "16. 链接到合成/图层名称 (Comp/Layer Name)",
    code: `thisComp.name + " - " + thisLayer.name;`,
    description: "在文本图层的“源文本”属性中显示当前合成或图层的名称。",
    usage: "制作模版、烧录信息或者自动化标签。",
  },
  {
    title: "17. 抽帧效果 (PosterizeTime)",
    code: `posterizeTime(12); // 将帧率强制变为12帧/秒
value; // 保持原有属性值不变`,
    description: "降低动画的视觉帧率，创造出定格动画或动漫的感觉，而不改变合成的实际帧率。",
    usage: "应用在任何有动画的属性上，放在表达式最顶端。",
  },
  {
    title: "18. 延迟跟随 (valueAtTime)",
    code: `// 应用在跟随图层的位置上，假设要跟随上一层
delay = 5; // 延迟帧数
thisComp.layer(index-1).transform.position.valueAtTime(time - delay*thisComp.frameDuration);`,
    description: "获取某个属性在过去某个时间点的值，从而制造延迟效果。",
    usage: "制作蛇形跟随队伍、残影拖尾效果。",
    imageSrc: "/images/ae/value-at-time.gif",
  },
  {
    title: "19. 计算两点距离 (Length)",
    code: `p1 = thisComp.layer("点A").transform.position;
p2 = thisComp.layer("点B").transform.position;
length(p1, p2);`,
    description: "计算两个点之间的直线距离。通常配合文本图层显示距离数值，或者用距离来驱动其他效果强度。",
    usage: "制作测量 UI、根据距离产生连线效果。",
  },
  {
    title: "20. 3D坐标转2D屏幕坐标 (toComp)",
    code: `// 应用在 2D 图层的位置上，让它跟随一个 3D 图层
L = thisComp.layer("3D目标图层");
L.toComp([0,0,0]);`,
    description: "将 3D 空间中图层的点转换成 2D 合成视图中的屏幕坐标。",
    usage: "让 2D 的光晕、文字标签完美贴合在 3D 物体上移动。",
    imageSrc: "/images/ae/to-comp.gif",
  },
];

// --- 模块 2: 核心函数详解 ---
export const aeFunctionsDocs: FunctionDocItem[] = [
    {
        name: "wiggle()",
        syntax: "wiggle(freq, amp, octaves=1, amp_mult=.5, t=time)",
        description: "最常用的随机摆动函数。",
        example: "wiggle(5, 20) // 每秒摆动5次，幅度为20像素（或度数）"
    },
    {
        name: "time",
        syntax: "time",
        description: "返回当前合成的时间（以秒为单位）。这是一个只读变量，不是函数。",
        example: "time * 100 // 随着时间推移，数值不断增加"
    },
    {
        name: "value",
        syntax: "value / value[0] / value[1]",
        description: "返回当前属性在关键帧设置的值（即不加表达式时的值）。对于数组属性（如位置），可以用索引访问。",
        example: "value + [100, 0] // 在原有位置基础上，X轴增加100"
    },
    {
        name: "index",
        syntax: "index",
        description: "返回当前图层在时间轴面板中的层级编号（整数）。",
        example: "index * 10 // 第1层为10，第2层为20..."
    },
    {
        name: "linear() / ease()",
        syntax: "linear(t, tMin, tMax, value1, value2)",
        description: "强大的映射函数。当输入 t 从 tMin 变为 tMax 时，输出结果从 value1 线性（或平滑）变为 value2。",
        example: "linear(transform.opacity, 0, 100, 0, 360) // 当不透明度从0变到100时，让旋转从0变到360度"
    },
    {
        name: "Math 对象",
        syntax: "Math.sin(), Math.cos(), Math.round(), Math.abs()...",
        description: "标准的 JavaScript 数学对象。AE 表达式基于 JS，所以可以使用所有标准的 Math 方法。",
        example: "Math.abs(transform.position[0]) // 获取X位置的绝对值"
    },
    {
        name: "random()",
        syntax: "random() 或 random(max) 或 random(min, max)",
        description: "生成伪随机数。",
        example: "random(50, 100) // 每帧生成一个50到100之间的随机数"
    },
    // 可以继续添加更多...
]