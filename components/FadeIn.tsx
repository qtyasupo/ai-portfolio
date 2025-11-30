"use client";

import { motion } from "framer-motion";

export default function FadeIn({
  children,
  delay = 0, // 默认延迟 0秒
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // 初始状态：透明，向下偏移 20px
      animate={{ opacity: 1, y: 0 }}  // 结束状态：完全显示，归位
      transition={{ duration: 0.5, delay: delay, ease: "easeOut" }} // 动画参数
      className={className}
    >
      {children}
    </motion.div>
  );
}