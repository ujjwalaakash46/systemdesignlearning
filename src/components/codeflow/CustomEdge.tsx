import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
//   onClick
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        cursor: 'pointer',
        strokeWidth: selected ? 3 : style?.strokeWidth || 2,
      }}
    //   className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
      markerEnd={markerEnd}
    //   onClick={onClick}
    />
  );
}

export default CustomEdge;
