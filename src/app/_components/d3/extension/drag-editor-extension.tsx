import { drag, type Simulation } from "d3";
import type { D3DragEvent } from "d3";
import * as d3 from "d3";
import type { CustomLinkType, CustomNodeType } from "../force/graph";
import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";

export interface DragState {
  isDragging: boolean;
  sourceNode: CustomNodeType | null;
  targetNode: CustomNodeType | null;
}

export const dragEditorExtension = ({
  tempLineRef,
  simulation,
  graphDocument,
  dragState,
  setDragState,
  onGraphUpdate,
}: {
  tempLineRef: React.RefObject<SVGLineElement>;
  simulation: Simulation<CustomNodeType, CustomLinkType>;
  graphDocument: GraphDocument;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  onGraphUpdate?: (updatedGraph: GraphDocument) => void;
}) => {
  let dragStateInExtension = dragState;
  const dragReset = () => {
    dragStateInExtension = {
      isDragging: false,
      sourceNode: null,
      targetNode: null,
    };
    setDragState(dragStateInExtension);
  };
  const dragSet = (newDragState: DragState) => {
    dragStateInExtension = newDragState;
    setDragState(dragStateInExtension);
  };

  // 新しいノードを追加する関数
  const addNewNode = (x: number, y: number, sourceNode: CustomNodeType) => {
    if (!onGraphUpdate) return;

    const newNodeId = Math.max(...graphDocument.nodes.map((n) => n.id)) + 1;
    const newRelationshipId =
      Math.max(...graphDocument.relationships.map((r) => r.id)) + 1;

    const newNode: NodeType = {
      id: newNodeId,
      name: `新しいノード${newNodeId}`,
      label: "Entity",
      properties: {},
    };

    const newRelationship: RelationshipType = {
      id: newRelationshipId,
      sourceName: sourceNode.name,
      sourceId: sourceNode.id,
      type: "connects",
      targetName: newNode.name,
      targetId: newNode.id,
      properties: {},
    };

    const updatedGraph: GraphDocument = {
      nodes: [...graphDocument.nodes, newNode],
      relationships: [...graphDocument.relationships, newRelationship],
    };

    onGraphUpdate(updatedGraph);
  };

  // 既存のノードに接続する関数
  const connectToExistingNode = (
    sourceNode: CustomNodeType,
    targetNode: CustomNodeType,
  ) => {
    if (!onGraphUpdate) return;

    console.log("sourceNode", sourceNode);
    console.log("targetNode", targetNode);

    const newRelationshipId =
      Math.max(...graphDocument.relationships.map((r) => r.id)) + 1;

    const newRelationship: RelationshipType = {
      id: newRelationshipId,
      sourceName: sourceNode.name,
      sourceId: sourceNode.id,
      type: "connects",
      targetName: targetNode.name,
      targetId: targetNode.id,
      properties: {},
    };

    const updatedGraph: GraphDocument = {
      nodes: graphDocument.nodes,
      relationships: [...graphDocument.relationships, newRelationship],
    };

    console.log("connectToExistingNode", newRelationship);

    onGraphUpdate(updatedGraph);
  };

  function dragStarted(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragStarted");
    simulation.stop();

    console.log("event", event);

    // ドラッグ開始時のノードを特定
    const sourceNode = graphDocument.nodes.find((node) => {
      if (node.id === dragStateInExtension.sourceNode?.id) return false;

      // 位置情報がない場合はスキップ
      if (!("x" in node) || !("y" in node)) return false;

      const nodeX = (node as CustomNodeType).x ?? 0;
      const nodeY = (node as CustomNodeType).y ?? 0;
      const distance = Math.sqrt(
        (event.x - nodeX) ** 2 + (event.y - nodeY) ** 2,
      );
      return distance < 5;
    });

    if (!sourceNode) {
      return;
    }

    console.log("sourceNode", sourceNode);

    dragSet({
      isDragging: true,
      sourceNode: sourceNode,
      targetNode: null,
    });

    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;

    // 一時的な線を表示
    if (tempLineRef.current) {
      tempLineRef.current.style.display = "block";
      tempLineRef.current.setAttribute("x1", String(event.subject.x));
      tempLineRef.current.setAttribute("y1", String(event.subject.y));
      tempLineRef.current.setAttribute("x2", String(event.subject.x));
      tempLineRef.current.setAttribute("y2", String(event.subject.y));
    }
  }

  function dragged(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragged");
    event.subject.fx = event.x;
    event.subject.fy = event.y;

    simulation.stop();

    // targetNodeを更新
    const targetNode = graphDocument.nodes.find((node) => {
      if (node.id === dragStateInExtension.sourceNode?.id) return false;

      // 位置情報がない場合はスキップ
      if (!("x" in node) || !("y" in node)) return false;

      const nodeX = (node as CustomNodeType).x ?? 0;
      const nodeY = (node as CustomNodeType).y ?? 0;
      const distance = Math.sqrt(
        (event.x - nodeX) ** 2 + (event.y - nodeY) ** 2,
      );
      return distance < 10;
    });
    if (targetNode) {
      dragSet({
        isDragging: true,
        sourceNode: dragStateInExtension.sourceNode,
        targetNode: targetNode,
      });
    }

    // 一時的な線を更新
    if (tempLineRef.current) {
      tempLineRef.current.setAttribute("x2", String(event.x));
      tempLineRef.current.setAttribute("y2", String(event.y));
    }
  }

  function dragEnded(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragEnded");

    // 一時的な線を非表示
    if (tempLineRef.current) {
      console.log("to none");
      tempLineRef.current.style.display = "none";
    }

    simulation.restart();

    if (!dragStateInExtension.isDragging || !dragStateInExtension.sourceNode) {
      // ドラッグ状態をリセット
      dragReset();
      return;
    }

    if (dragStateInExtension.targetNode) {
      // 既存のノードに接続
      connectToExistingNode(
        dragStateInExtension.sourceNode,
        dragStateInExtension.targetNode,
      );
    } else {
      // 新しいノードを作成
      addNewNode(event.x, event.y, dragStateInExtension.sourceNode);
    }

    // ドラッグ状態をリセット
    dragReset();

    event.subject.fx = null;
    event.subject.fy = null;
  }

  d3.selectAll<Element, unknown>(".node").call(
    drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded),
  );
};
