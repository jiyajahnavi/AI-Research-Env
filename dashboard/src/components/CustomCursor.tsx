import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.2 };
  const cursorX = useSpring(mousePosition.x, springConfig);
  const cursorY = useSpring(mousePosition.y, springConfig);
  
  const outerSpringConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const cursorXOuter = useSpring(mousePosition.x, outerSpringConfig);
  const cursorYOuter = useSpring(mousePosition.y, outerSpringConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      cursorXOuter.set(e.clientX);
      cursorYOuter.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button') || target.closest('a') || target.tagName.toLowerCase() === 'input';
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, cursorXOuter, cursorYOuter]);

  // Hide initially until mouse moves on screen
  if (mousePosition.x === -100) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-primary-500 rounded-full pointer-events-none z-[100] transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen shadow-[0_0_8px_#3b82f6]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: 1
        }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-primary-500/50 rounded-full pointer-events-none z-[90] transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        style={{
          x: cursorXOuter,
          y: cursorYOuter,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.5)',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
};
