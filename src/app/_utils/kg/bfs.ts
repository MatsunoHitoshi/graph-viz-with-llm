import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";
import { neighborNodes } from "./get-tree-layout-data";

export const nodePathSearch = (
  graphData: GraphDocument,
  startId: number,
  endId: number,
  cutOff?: number,
) => {
  const isReached = (path: GraphDocument) => {
    const firstNode = path.nodes[0];
    const lastNode = path.nodes[path.nodes.length - 1];
    return firstNode?.id === startId && lastNode?.id === endId;
  };
  // const directionalResult = directionalBfs(graphData, startId, endId);
  // console.log("directional:", directionalResult);
  const nonDirectionalResult = nonDirectionalBfs(
    graphData,
    startId,
    endId,
    cutOff,
  );
  console.log("nonDirectional:", nonDirectionalResult);

  return isReached(nonDirectionalResult)
    ? nonDirectionalResult
    : { nodes: [], relationships: [] };

  // if (isReached(directionalResult) && isReached(nonDirectionalResult)) {
  //   return directionalResult.nodes.length <= nonDirectionalResult.nodes.length
  //     ? directionalResult
  //     : nonDirectionalResult;
  // } else if (
  //   !isReached(directionalResult) &&
  //   !isReached(nonDirectionalResult)
  // ) {
  //   return { nodes: [], relationships: [] };
  // } else {
  //   return isReached(directionalResult)
  //     ? directionalResult
  //     : nonDirectionalResult;
  // }
};

const nonDirectionalBfs = (
  graphData: GraphDocument,
  startId: number,
  endId: number,
  cutOff?: number,
) => {
  const visited = new Set<number>();
  const queue: number[][] = [[startId]];
  const nodes: NodeType[] = [];
  const endNode = graphData.nodes.find((n) => n.id === endId);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) continue;

    const node = path[path.length - 1];
    if (!visited.has(node)) {
      visited.add(node);
      const currentNode = graphData.nodes.find((n) => n.id === node);
      if (currentNode) {
        nodes.push(currentNode);
        if (node === endId) {
          return getOptimalPath(graphData, nodes);
        }
        const neighbors = graphData.relationships
          .filter((r) => r.sourceId === node || r.targetId === node)
          .map((r) => (r.sourceId === node ? r.targetId : r.sourceId))
          .filter((id): id is number => id !== undefined);
        if (cutOff && path.length > cutOff) {
          return { nodes: [], relationships: [] };
        }

        if (neighbors.includes(endId) && endNode) {
          const nodesEnd = nodes.concat([endNode]);

          return getOptimalPath(graphData, nodesEnd);
        }
        for (const neighbor of neighbors) {
          queue.push([...path, neighbor]);
        }
      }
    }
  }
  return getOptimalPath(graphData, nodes);
};

// const directionalBfs = (
//   graphData: GraphDocument,
//   startId: number,
//   endId: number,
// ) => {
//   const visited = new Set<number>();
//   const queue: number[][] = [[startId]];
//   const nodes: NodeType[] = [];
//   const endNode = graphData.nodes.find((n) => n.id === endId);

//   while (queue.length > 0) {
//     const path = queue.shift();
//     if (!path) continue;

//     const node = path[path.length - 1]!;
//     if (!visited.has(node)) {
//       visited.add(node);
//       const currentNode = graphData.nodes.find((n) => n.id === node);
//       if (currentNode) {
//         nodes.push(currentNode);
//         if (node === endId) {
//           return getOptimalPath(graphData, nodes);
//         }

//         const neighbors = graphData.relationships
//           .filter((r) => r.sourceId === node)
//           .map((r) => r.targetId)
//           .filter((id): id is number => id !== undefined);

//         for (const neighbor of neighbors) {
//           queue.push([...path, neighbor]);
//         }
//         if (neighbors.includes(endId) && endNode) {
//           const nodesEnd = nodes.concat([endNode]);
//           return getOptimalPath(graphData, nodesEnd);
//         }
//       }
//     }
//   }
//   return getOptimalPath(graphData, nodes);
// };

const getOptimalPath = (graphData: GraphDocument, nodes: NodeType[]) => {
  const optimalPath = {
    nodes: [] as NodeType[],
    relationships: [] as RelationshipType[],
  };
  const shortestPath = [nodes[nodes.length - 1]] as NodeType[];
  const reverseNodes = nodes.reverse();
  reverseNodes.forEach((node, index) => {
    if (node.id !== shortestPath[0]?.id) {
      console.log("skip");
    } else {
      const reachedNodes = reverseNodes.slice(index + 1);
      const neighbors = neighborNodes(graphData, node.id, false) as NodeType[];
      const pathNode = neighbors.find((neighbor) => {
        return reachedNodes.some((reached) => {
          return reached.id === neighbor.id;
        });
      });
      if (pathNode) {
        shortestPath.unshift(pathNode);
      } else {
        console.log("PrevPath Not Found");
      }
    }
  });
  optimalPath.nodes = shortestPath;
  optimalPath.relationships = getPathRelationships(graphData, shortestPath);
  return optimalPath;
};

const getPathRelationships = (
  graphData: GraphDocument,
  pathNodes: NodeType[],
) => {
  const pathRelationships = [] as RelationshipType[];
  pathNodes.forEach((node, index) => {
    if (index !== 0) {
      const prevNode = pathNodes[index - 1];
      const edges = graphData.relationships.filter((relationship) => {
        return (
          (relationship.sourceId === node.id &&
            relationship.targetId === prevNode?.id) ||
          (relationship.sourceId === prevNode?.id &&
            relationship.targetId === node.id)
        );
      });

      pathRelationships.push(...edges);
    }
  });
  return pathRelationships;
};
