// src/data/aeShortcuts.ts

export interface ShortcutItem {
  keys: string[]; // 例如 ["Ctrl", "D"]
  description: string;
}

export interface ShortcutCategory {
  categoryName: string;
  items: ShortcutItem[];
}

export const aeShortcutsData: ShortcutCategory[] = [
  {
    categoryName: "工具栏 (Tools)",
    items: [
      { keys: ["V"], description: "选取工具 (Selection Tool)" },
      { keys: ["H"], description: "抓手工具 (Hand Tool)" },
      { keys: ["Spacebar"], description: "临时抓手工具 (按住不放)" },
      { keys: ["Z"], description: "缩放工具 (Zoom Tool)" },
      { keys: ["W"], description: "旋转工具 (Rotation Tool)" },
      { keys: ["C"], description: "摄像机工具 (Camera Tool)" },
      { keys: ["Y"], description: "锚点工具 (Pan Behind/Anchor Point)" },
      { keys: ["Q"], description: "形状/蒙版工具 (切换)" },
      { keys: ["Ctrl", "T"], description: "文本工具 (Type Tool)" },
      { keys: ["Ctrl", "B"], description: "画笔/图章/橡皮擦工具" },
    ],
  },
  {
    categoryName: "图层属性 (Layer Properties)",
    items: [
      { keys: ["A"], description: "锚点 (Anchor Point)" },
      { keys: ["P"], description: "位置 (Position)" },
      { keys: ["S"], description: "缩放 (Scale)" },
      { keys: ["R"], description: "旋转 (Rotation)" },
      { keys: ["T"], description: "不透明度 (Opacity)" },
      { keys: ["U"], description: "显示所有打了关键帧的属性" },
      { keys: ["U", "U"], description: "显示所有修改过的属性 (双击 U)" },
      { keys: ["E"], description: "显示特效 (Effects)" },
      { keys: ["M"], description: "显示蒙版路径 (Mask Path)" },
      { keys: ["F"], description: "显示蒙版羽化 (Mask Feather)" },
    ],
  },
  {
    categoryName: "时间轴与合成 (Timeline & Comp)",
    items: [
      { keys: ["Spacebar"], description: "播放/暂停预览" },
      { keys: ["Numpad 0"], description: "RAM 预览 (推荐)" },
      { keys: ["Page Up/Down"], description: "上一帧 / 下一帧" },
      { keys: ["Home"], description: "跳转到合成开头" },
      { keys: ["End"], description: "跳转到合成结尾" },
      { keys: ["B"], description: "设置工作区起始点 (Begin)" },
      { keys: ["N"], description: "设置工作区结束点 (End)" },
      { keys: ["I"], description: "跳转到图层入点 (In point)" },
      { keys: ["O"], description: "跳转到图层出点 (Out point)" },
      { keys: ["[", "]"], description: "将图层入点/出点对齐到当前时间" },
    ],
  },
  {
    categoryName: "常用操作 (General Actions)",
    items: [
      { keys: ["Ctrl", "Z"], description: "撤销 (Undo)" },
      { keys: ["Ctrl", "Shift", "Z"], description: "重做 (Redo)" },
      { keys: ["Ctrl", "D"], description: "复制图层/效果 (Duplicate)" },
      { keys: ["Ctrl", "Shift", "D"], description: "拆分图层 (Split Layer)" },
      { keys: ["Ctrl", "K"], description: "合成设置 (Comp Settings)" },
      { keys: ["Ctrl", "M"], description: "添加到渲染队列 (Make Movie)" },
      { keys: ["F9"], description: "缓动关键帧 (Easy Ease)" },
      { keys: ["Shift", "F9"], description: "缓入 (Easy Ease In)" },
      { keys: ["Ctrl", "Shift", "F9"], description: "缓出 (Easy Ease Out)" },
    ],
  },
];

