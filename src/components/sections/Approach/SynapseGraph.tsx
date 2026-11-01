"use client";

import { Box, chakra } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";

import { useLangContext } from "@/contexts/LangContext";
import { mindLinks, mindNodes, type MindGroup, type MindNode } from "@/data/approach";
import { EASE_OUT } from "@/components/ui/Reveal";

// Drawing space; the svg scales to its container
const W = 800;
const H = 600;
const CORE = { x: W / 2, y: H / 2 };
const RX = 300;
const RY = 215;

export const groupColor: Record<MindGroup, string> = {
  ai: "var(--chakra-colors-lime)",
  product: "var(--chakra-colors-rose)",
};

type Point = { x: number; y: number };

const position = (node: MindNode): Point => {
  const rad = (node.angle * Math.PI) / 180;
  return { x: CORE.x + RX * Math.cos(rad), y: CORE.y - RY * Math.sin(rad) };
};

// Slightly bent link, like a dendrite rather than a ruler line
const curve = (a: Point, b: Point, bend: number) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return `M ${a.x} ${a.y} Q ${mx - dy * bend} ${my + dx * bend} ${b.x} ${b.y}`;
};

const byId = Object.fromEntries(mindNodes.map((n) => [n.id, n]));

// Background neurons: seeded so server and client draw the same field
const neurons = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const anchors = [CORE, ...mindNodes.map(position)];

  return Array.from({ length: 34 }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = 0.35 + rand() * 0.75;
    const p = { x: CORE.x + Math.cos(angle) * (RX + 40) * dist, y: CORE.y + Math.sin(angle) * (RY + 40) * dist };
    const nearest = anchors.reduce((best, a) =>
      Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? a : best
    );
    return { p, nearest, r: 1.5 + rand() * 2 };
  });
})();

type SynapseGraphProps = {
  activeId: string;
  onSelect: (id: string) => void;
};

export const SynapseGraph = ({ activeId, onSelect }: SynapseGraphProps) => {
  const reduce = useReducedMotion();
  const { getTranslation } = useLangContext();

  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1.4, ease: EASE_OUT, delay },
  });

  return (
    <Box position="relative">
      <chakra.svg
        viewBox={`0 0 ${W} ${H}`}
        w="full"
        h="auto"
        overflow="visible"
        // Labels are unreadable once the graph is phone-sized: the chips below take over
        css={{ "@media (max-width: 47.99em)": { "& .node-label": { display: "none" } } }}
      >
        <defs>
          <radialGradient id="core-glow">
            <stop offset="0%" stopColor="#fbd52b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fbd52b" stopOpacity="0" />
          </radialGradient>
        </defs>
  
        {/* Background neurons */}
        {neurons.map(({ p, nearest, r }, i) => (
          <g key={i}>
            <motion.path d={curve(p, nearest, 0.2)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" {...draw(0.2 + i * 0.02)} />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill="rgba(255,255,255,0.25)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 1, 0.4] }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.03 }}
            />
          </g>
        ))}
  
        {/* Synapses between nodes */}
        {mindLinks.map(([from, to], i) => {
          const lit = from === activeId || to === activeId;
          return (
            <motion.path
              key={`${from}-${to}`}
              d={curve(position(byId[from]), position(byId[to]), i % 2 ? 0.18 : -0.18)}
              fill="none"
              stroke={lit ? groupColor[byId[activeId].group] : "rgba(255,255,255,0.14)"}
              strokeWidth={lit ? 2 : 1}
              strokeDasharray={i >= 6 ? "4 6" : undefined}
              style={{ transition: "stroke 0.4s ease, stroke-width 0.4s ease" }}
              {...draw(0.6 + i * 0.08)}
            />
          );
        })}
  
        {/* Links to the core, with travelling impulses */}
        {mindNodes.map((node, i) => {
          const d = curve(CORE, position(node), i % 2 ? 0.12 : -0.12);
          const active = node.id === activeId;
          const color = groupColor[node.group];
  
          return (
            <g key={node.id}>
              <motion.path
                d={d}
                fill="none"
                stroke={active ? color : "rgba(255,255,255,0.2)"}
                strokeWidth={active ? 2.5 : 1.2}
                style={{ transition: "stroke 0.4s ease, stroke-width 0.4s ease" }}
                {...draw(0.3 + i * 0.06)}
              />
              {!reduce && (
                <circle key={active ? "on" : "off"} r={active ? 4.5 : 2.5} fill={color} opacity={active ? 1 : 0.5}>
                  <animateMotion
                    dur={active ? "1.4s" : `${2.8 + (i % 3) * 0.6}s`}
                    begin={`${(i % 4) * 0.5}s`}
                    repeatCount="indefinite"
                    path={d}
                  />
                </circle>
              )}
            </g>
          );
        })}
  
        {/* Core */}
        <circle cx={CORE.x} cy={CORE.y} r="110" fill="url(#core-glow)" />
        <motion.circle
          cx={CORE.x}
          cy={CORE.y}
          r="52"
          fill="none"
          stroke="rgba(251,213,43,0.4)"
          animate={reduce ? undefined : { r: [52, 64, 52], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={CORE.x} cy={CORE.y} r="48" fill="#1d1c1f" stroke="rgba(255,255,255,0.15)" />
        <image href="/assets/images/logo.png" x={CORE.x - 32} y={CORE.y - 32} width="64" height="64" />
  
        {/* Nodes */}
        {mindNodes.map((node, i) => {
          const { x, y } = position(node);
          const active = node.id === activeId;
          const color = groupColor[node.group];
          const title = getTranslation(`approach--${node.id}-title`);
  
          return (
            <motion.g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={title}
              aria-pressed={active}
              style={{ cursor: "pointer", outline: "none" }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.8 + i * 0.07 }}
              onMouseEnter={() => onSelect(node.id)}
              onFocus={() => onSelect(node.id)}
              onClick={() => onSelect(node.id)}
            >
              <g transform={`translate(${x} ${y})`}>
                {active && !reduce && (
                  <motion.circle
                    r="30"
                    fill={color}
                    initial={{ opacity: 0.35, scale: 1 }}
                    animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <circle
                  r="26"
                  fill={active ? color : "#111013"}
                  stroke={color}
                  strokeWidth="2"
                  style={{ transition: "fill 0.3s ease" }}
                />
                <text
                  className="node-label"
                  y="50"
                  textAnchor="middle"
                  fill={active ? "#fff" : "rgba(255,255,255,0.6)"}
                  fontSize="18"
                  fontWeight="700"
                  style={{ transition: "fill 0.3s ease" }}
                >
                  {title}
                </text>
              </g>
            </motion.g>
          );
        })}
      </chakra.svg>

      {/* Icons as HTML on top of the nodes: nested <svg> elements (what react-icons
          renders) are not drawn reliably inside an SVG, notably by iOS Safari */}
      {mindNodes.map((node, i) => {
        const { x, y } = position(node);
        const Icon = node.icon;
        const active = node.id === activeId;

        return (
          <Box
            asChild
            key={node.id}
            aria-hidden
            position="absolute"
            left={`${(x / W) * 100}%`}
            top={`${(y / H) * 100}%`}
            transform="translate(-50%, -50%)"
            display="flex"
            pointerEvents="none"
            fontSize={{ base: "11px", sm: "14px", md: "20px", xl: "22px" }}
            transition="color 0.3s ease"
            style={{ color: active ? "#111013" : groupColor[node.group] }}
          >
            {/* Appears with its node (same delay as the node's spring above) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 1 + i * 0.07 }}
            >
              <Icon />
            </motion.div>
          </Box>
        );
      })}
    </Box>
  );
};

export default SynapseGraph;
