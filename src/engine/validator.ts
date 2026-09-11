/**
 * ==============================================================================
 * 🌲 HELPDESK RUNBOOK TREE - DAG VALIDATOR ENGINE
 * ==============================================================================
 * Layer: Core Engine (@backend / mowftee-guild)
 * Purpose: Strict validation of Runbook Directed Acyclic Graphs (DAG).
 *          Guarantees cycle-free, orphan-free, deterministic execution.
 * ==============================================================================
 */

import type { Runbook, RunbookNode, DAGValidationError } from '../types/runbook';

/**
 * Kết quả phân tích toàn diện đồ thị của một Runbook.
 */
export interface RunbookValidationResult {
  /** Đồ thị có hoàn toàn hợp lệ để khởi chạy không */
  isValid: boolean;
  /** Danh sách các lỗi cấu trúc nghiêm trọng (Blockers) */
  errors: DAGValidationError[];
  /** Các cảnh báo khuyến nghị cải thiện chất lượng dữ liệu */
  warnings: string[];
  /** Thống kê độ sâu và số lượng node */
  stats: {
    totalNodes: number;
    diagnosticNodes: number;
    actionNodes: number;
    resolvedNodes: number;
    escalationNodes: number;
    reachableNodesCount: number;
    maxDepth: number;
  };
}

/**
 * Kiểm định toàn diện tính toàn vẹn của một Runbook đồ thị DAG.
 * Thuật toán sử dụng:
 * 1. Reachability (BFS/DFS) từ root node để phát hiện node mồ côi (Orphan Nodes).
 * 2. DFS Three-Color Marking (White/Grey/Black) để phát hiện chu trình (Cycles).
 * 3. Kiểm tra tính đóng của các nút kết thúc (Terminal Nodes: Resolved / Escalation).
 * 4. Tính toán độ sâu lớn nhất (Max Depth) từ root tới leaf.
 */
export function validateRunbook(runbook: Runbook): RunbookValidationResult {
  const errors: DAGValidationError[] = [];
  const warnings: string[] = [];

  const nodes = runbook.nodes || {};
  const nodeEntries = Object.entries(nodes);
  const totalNodes = nodeEntries.length;

  let diagnosticCount = 0;
  let actionCount = 0;
  let resolvedCount = 0;
  let escalationCount = 0;

  // 1. Kiểm tra node xuất phát (startNodeId)
  if (!runbook.startNodeId || !nodes[runbook.startNodeId]) {
    errors.push({
      code: 'MISSING_START_NODE',
      message: `Node xuất phát (startNodeId: "${runbook.startNodeId}") không tồn tại trong danh sách nodes của Runbook "${runbook.id}".`,
      nodeId: runbook.startNodeId,
    });
  }

  // 2. Kiểm tra tính hợp lệ từng node và các nhánh rẽ
  for (const [id, node] of nodeEntries) {
    if (node.id !== id) {
      warnings.push(`Node có key "${id}" nhưng property id bên trong là "${node.id}". Cần đồng bộ.`);
    }

    switch (node.kind) {
      case 'diagnostic_step':
        diagnosticCount++;
        break;
      case 'action_required':
        actionCount++;
        break;
      case 'resolved':
        resolvedCount++;
        break;
      case 'escalation':
        escalationCount++;
        break;
    }

    const isTerminal = node.kind === 'resolved' || node.kind === 'escalation';

    if (isTerminal) {
      // Terminal node không được có nhánh rẽ
      if (node.branches && node.branches.length > 0) {
        errors.push({
          code: 'CYCLE_DETECTED',
          message: `Nút kết thúc "${id}" (kind: ${node.kind}) không được phép có nhánh rẽ (hiện có ${node.branches.length} nhánh).`,
          nodeId: id,
        });
      }

      // Khuyến nghị thông tin chi tiết
      if (node.kind === 'escalation' && !node.escalationDetails) {
        warnings.push(`Nút chuyển tuyến "${id}" chưa có escalationDetails chi tiết.`);
      }
      if (node.kind === 'resolved' && !node.resolutionDetails && !node.resolutionSummary) {
        warnings.push(`Nút giải quyết thành công "${id}" chưa có resolutionDetails hoặc resolutionSummary.`);
      }
    } else {
      // Non-terminal node bắt buộc phải có ít nhất 1 nhánh rẽ
      if (!node.branches || node.branches.length === 0) {
        errors.push({
          code: 'EMPTY_BRANCHES_ON_NON_TERMINAL',
          message: `Nút chẩn đoán/hành động "${id}" (kind: ${node.kind}) không có bất kỳ nhánh rẽ nào (Dead-end node).`,
          nodeId: id,
        });
      } else {
        // Kiểm tra từng target node
        node.branches.forEach((branch, index) => {
          if (!branch.nextNodeId || !nodes[branch.nextNodeId]) {
            errors.push({
              code: 'INVALID_TARGET_NODE',
              message: `Nhánh #${index + 1} ("${branch.label}") của nút "${id}" trỏ tới nextNodeId không tồn tại: "${branch.nextNodeId}".`,
              nodeId: id,
              targetNodeId: branch.nextNodeId,
            });
          }
        });
      }
    }
  }

  // 3. Kiểm tra tính kết nối từ Start Node (Reachable / Orphan Nodes)
  const reachableNodes = new Set<string>();
  if (runbook.startNodeId && nodes[runbook.startNodeId]) {
    const queue: string[] = [runbook.startNodeId];
    reachableNodes.add(runbook.startNodeId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodes[currentId];
      if (currentNode && currentNode.branches) {
        for (const branch of currentNode.branches) {
          if (branch.nextNodeId && nodes[branch.nextNodeId] && !reachableNodes.has(branch.nextNodeId)) {
            reachableNodes.add(branch.nextNodeId);
            queue.push(branch.nextNodeId);
          }
        }
      }
    }
  }

  for (const id of Object.keys(nodes)) {
    if (!reachableNodes.has(id)) {
      errors.push({
        code: 'ORPHAN_NODE',
        message: `Node mồ côi "${id}" ("${nodes[id].title}") không thể đi tới được từ node xuất phát "${runbook.startNodeId}".`,
        nodeId: id,
      });
    }
  }

  // 4. Kiểm tra chu trình (Cycle Detection) bằng DFS 3-Coloring (0=White, 1=Grey, 2=Black)
  const color = new Map<string, number>(); // 0: unvisited, 1: visiting (in stack), 2: visited
  const currentPath: string[] = [];
  const detectedCycles: string[][] = [];

  function dfsCycle(nodeId: string) {
    color.set(nodeId, 1);
    currentPath.push(nodeId);

    const node = nodes[nodeId];
    if (node && node.branches) {
      for (const branch of node.branches) {
        const nextId = branch.nextNodeId;
        if (!nodes[nextId]) continue;

        const nextColor = color.get(nextId) || 0;
        if (nextColor === 1) {
          // Tìm thấy chu trình!
          const cycleStartIndex = currentPath.indexOf(nextId);
          const cycle = currentPath.slice(cycleStartIndex).concat(nextId);
          detectedCycles.push(cycle);
        } else if (nextColor === 0) {
          dfsCycle(nextId);
        }
      }
    }

    currentPath.pop();
    color.set(nodeId, 2);
  }

  if (runbook.startNodeId && nodes[runbook.startNodeId]) {
    dfsCycle(runbook.startNodeId);
  }

  // Nếu còn node chưa duyệt (phòng khi có chu trình trong cụm mồ côi)
  for (const id of Object.keys(nodes)) {
    if ((color.get(id) || 0) === 0) {
      dfsCycle(id);
    }
  }

  for (const cycle of detectedCycles) {
    errors.push({
      code: 'CYCLE_DETECTED',
      message: `Phát hiện chu trình vòng lặp trong đồ thị: ${cycle.join(' -> ')}`,
      cyclePath: cycle,
      nodeId: cycle[0],
    });
  }

  // 5. Tính toán độ sâu lớn nhất (Max Depth) bằng Dynamic Programming (chỉ khi không có cycle)
  let maxDepth = 0;
  if (detectedCycles.length === 0 && runbook.startNodeId && nodes[runbook.startNodeId]) {
    const memoDepth = new Map<string, number>();

    function calculateDepth(nodeId: string): number {
      if (memoDepth.has(nodeId)) return memoDepth.get(nodeId)!;
      const node = nodes[nodeId];
      if (!node || !node.branches || node.branches.length === 0) {
        memoDepth.set(nodeId, 1);
        return 1;
      }
      let maxBranchDepth = 0;
      for (const branch of node.branches) {
        if (nodes[branch.nextNodeId]) {
          const depth = calculateDepth(branch.nextNodeId);
          if (depth > maxBranchDepth) maxBranchDepth = depth;
        }
      }
      const total = 1 + maxBranchDepth;
      memoDepth.set(nodeId, total);
      return total;
    }

    maxDepth = calculateDepth(runbook.startNodeId);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalNodes,
      diagnosticNodes: diagnosticCount,
      actionNodes: actionCount,
      resolvedNodes: resolvedCount,
      escalationNodes: escalationCount,
      reachableNodesCount: reachableNodes.size,
      maxDepth,
    },
  };
}

/**
 * Xác nhận Runbook hợp lệ; nếu có lỗi cấu trúc sẽ ném Exception kèm mô tả chi tiết.
 */
export function assertValidRunbook(runbook: Runbook): void {
  const result = validateRunbook(runbook);
  if (!result.isValid) {
    const details = result.errors.map(e => `[${e.code}] ${e.message}`).join('\n');
    throw new Error(`Runbook "${runbook.id}" không hợp lệ:\n${details}`);
  }
}
