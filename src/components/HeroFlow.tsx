import React from 'react';
import { TechNode, DbNode } from './FlowNodes';

// Layout Configuration
const NODE_WIDTH = 120;
const NODE_HEIGHT = 100;

const COL_LANG_X = 0;
const COL_MID_X = 350;
const COL_DB_X = 700;

// Y Positions
const LANG_START_Y = 0;
const GAP_Y = 120;

// Calculate vertical center for the single middle node
const MID_Y = (LANG_START_Y + GAP_Y * 3) / 2; // roughly 240

const nodesData = {
  languages: [
    { id: 'go', label: 'Go', icon: 'logos:go', x: COL_LANG_X, y: LANG_START_Y },
    { id: 'ts', label: 'TypeScript', icon: 'logos:typescript-icon', x: COL_LANG_X, y: LANG_START_Y + GAP_Y },
    { id: 'python', label: 'Python', icon: 'logos:python', x: COL_LANG_X, y: LANG_START_Y + GAP_Y * 2 },
    { id: 'java', label: 'Java', icon: 'logos:java', x: COL_LANG_X, y: LANG_START_Y + GAP_Y * 3 },
  ],
  hub: [
    { id: 'jsonql', label: 'JSONQL', icon: 'jsonql', iconType: 'custom', x: COL_MID_X, y: MID_Y },
  ],
  dbs: [
    { id: 'sqlite', label: 'SQLite', icon: 'logos:sqlite', x: COL_DB_X, y: MID_Y - GAP_Y },
    { id: 'mysql', label: 'MySQL', icon: 'logos:mysql', x: COL_DB_X, y: MID_Y },
    { id: 'postgres', label: 'Postgres', icon: 'logos:postgresql', x: COL_DB_X, y: MID_Y + GAP_Y },
  ]
};

// Line Drawing Helper
const ConnectorParams = {
    stroke: '#37B3FA',
    strokeWidth: 3,
    markerEnd: 'url(#arrow)'
};

const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    // Basic S-curve or straight line? Use simple Bezier roughly
    const controlPointX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${controlPointX} ${y1}, ${controlPointX} ${y2}, ${x2} ${y2}`;
};

export default function HeroFlow() {
  const hubNode = nodesData.hub[0];
  const hubLeftAnchor = { x: hubNode.x, y: hubNode.y + NODE_HEIGHT / 2 };
  const hubRightAnchor = { x: hubNode.x + NODE_WIDTH, y: hubNode.y + NODE_HEIGHT / 2 };

  // Determine required width to avoid cropping: rightmost node X + NODE_WIDTH + padding
  const totalWidth = COL_DB_X + NODE_WIDTH + 10;
  // Determine height: last node Y + NODE_HEIGHT
  const totalHeight = (LANG_START_Y + GAP_Y * 3) + NODE_HEIGHT + 10; 

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '850px', aspectRatio: `${totalWidth}/${totalHeight}`, margin: '0 auto' }}>
        
        {/* SVG Layer for Connections - Ensure viewBox matches the coordinate space to scale properly if container shrinks */}
        <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, overflow: 'visible' }}
        >
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#37B3FA" />
                </marker>
            </defs>
            
            {/* Draw Lines: Languages -> Hub */}
            {nodesData.languages.map(node => {
                const startX = node.x + NODE_WIDTH;
                const startY = node.y + NODE_HEIGHT / 2;
                const path = drawLine(startX, startY, hubNode.x, hubLeftAnchor.y);

                return (
                    <React.Fragment key={`edge-${node.id}-hub`}>
                        <path d={path} fill="none" {...ConnectorParams} />
                    </React.Fragment>
                );
            })}

            {/* Draw Lines: Hub -> DBs */}
            {nodesData.dbs.map(node => {
                const endX = node.x;
                const endY = node.y + NODE_HEIGHT / 2;
                const path = drawLine(hubNode.x + NODE_WIDTH, hubRightAnchor.y, endX, endY);

                return (
                    <React.Fragment key={`edge-hub-${node.id}`}>
                        <path d={path} fill="none" {...ConnectorParams} />
                    </React.Fragment>
                );
            })}
        </svg>

        {/* Nodes Layer - Reposition using percentage or allow container to set scale? 
            Since SVG scales with viewBox, using absolute pixels for nodes might mismatch if container shrinks < totalWidth.
            We should switch the whole container to scale, or use SVG foreignObjects, or just accept scrolling.
            For "Hero", scaling is usually best. 
        */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
             {/* Note: If the container (850px) is smaller than totalWidth (830px), scaling isn't needed yet. 
                 But if the screen is mobile, we need scaling. 
                 For now, let's just render them. 
              */}
             
            {nodesData.languages.map(node => (
                <div key={node.id} style={{ position: 'absolute', left: `${(node.x / totalWidth) * 100}%`, top: `${(node.y / totalHeight) * 100}%`, width: `${(NODE_WIDTH / totalWidth) * 100}%`, height: `${(NODE_HEIGHT / totalHeight) * 100}%` }}>
                    <TechNode label={node.label} icon={node.icon} />
                </div>
            ))}

            {nodesData.hub.map(node => (
                <div key={node.id} style={{ position: 'absolute', left: `${(node.x / totalWidth) * 100}%`, top: `${(node.y / totalHeight) * 100}%`, width: `${(NODE_WIDTH / totalWidth) * 100}%`, height: `${(NODE_HEIGHT / totalHeight) * 100}%` }}>
                    <TechNode label={node.label} icon={node.icon} iconType={node.iconType as any} />
                </div>
            ))}

            {nodesData.dbs.map(node => (
                <div key={node.id} style={{ position: 'absolute', left: `${(node.x / totalWidth) * 100}%`, top: `${(node.y / totalHeight) * 100}%`, width: `${(NODE_WIDTH / totalWidth) * 100}%`, height: `${(NODE_HEIGHT / totalHeight) * 100}%` }}>
                    <DbNode label={node.label} icon={node.icon} />
                </div>
            ))}
        </div>
    </div>
  );
}
