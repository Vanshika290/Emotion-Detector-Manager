import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface ThreeDCardProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export function ThreeDCard({ children, className = "", containerClassName = "" }: ThreeDCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) - width / 2;
        const yPct = (clientY - top) - height / 2;

        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-200, 200], [15, -15]);
    const rotateY = useTransform(mouseX, [-200, 200], [-15, 15]);

    return (
        <div
            className={`perspective-1000 ${containerClassName}`}
            style={{ perspective: "1000px" }}
        >
            <motion.div
                ref={ref}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={`relative transition-all duration-200 ease-out ${className}`}
            >
                <div style={{ transform: "translateZ(20px)" }} className="h-full">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
