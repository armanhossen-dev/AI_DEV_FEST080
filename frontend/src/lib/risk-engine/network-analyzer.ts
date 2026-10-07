import { Transaction, NetworkNode, NetworkEdge } from "@/types";
import { NetworkRiskAssessment } from "./types";
import { networkNodes as defaultNodes, networkEdges as defaultEdges } from "@/lib/data";

export class NetworkGraphIntelligence {
  private nodes: Map<string, NetworkNode> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();

  constructor(initialNodes: NetworkNode[] = defaultNodes, initialEdges: NetworkEdge[] = defaultEdges) {
    this.rebuildGraph(initialNodes, initialEdges);
  }

  public rebuildGraph(nodes: NetworkNode[], edges: NetworkEdge[]) {
    this.nodes.clear();
    this.adjacency.clear();

    nodes.forEach((n) => {
      this.nodes.set(n.id, n);
      this.adjacency.set(n.id, new Set());
    });

    edges.forEach((e) => {
      if (!this.adjacency.has(e.source)) this.adjacency.set(e.source, new Set());
      if (!this.adjacency.has(e.target)) this.adjacency.set(e.target, new Set());
      this.adjacency.get(e.source)!.add(e.target);
      this.adjacency.get(e.target)!.add(e.source); // Undirected proximity
    });
  }

  public addTransactionEdge(customer: string, recipient: string, amount: number, isHot = false) {
    if (!this.adjacency.has(customer)) this.adjacency.set(customer, new Set());
    if (!this.adjacency.has(recipient)) this.adjacency.set(recipient, new Set());
    this.adjacency.get(customer)!.add(recipient);
    this.adjacency.get(recipient)!.add(customer);
  }

  public addDeviceEdge(device: string, wallet: string) {
    if (!this.adjacency.has(device)) this.adjacency.set(device, new Set());
    if (!this.adjacency.has(wallet)) this.adjacency.set(wallet, new Set());
    this.adjacency.get(device)!.add(wallet);
    this.adjacency.get(wallet)!.add(device);
  }

  /**
   * BFS search to find shortest path / hop distance from a start node to any flagged node in a suspicious cluster
   */
  public findDistanceToFlaggedCluster(startId: string, maxHops = 3): { distance: number; reachedNode?: string; clusterId?: number } {
    if (!startId || !this.adjacency.has(startId)) {
      return { distance: 99 };
    }

    const startNode = this.nodes.get(startId);
    if (startNode && (startNode.risk === "Critical" || startNode.clusterId)) {
      return { distance: 0, reachedNode: startId, clusterId: startNode.clusterId };
    }

    const visited = new Set<string>([startId]);
    const queue: Array<{ id: string; hops: number }> = [{ id: startId, hops: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.hops >= maxHops) break;

      const neighbors = this.adjacency.get(current.id) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const neighborNode = this.nodes.get(neighbor);
          if (neighborNode && (neighborNode.risk === "Critical" || neighborNode.clusterId)) {
            return {
              distance: current.hops + 1,
              reachedNode: neighbor,
              clusterId: neighborNode.clusterId,
            };
          }
          queue.push({ id: neighbor, hops: current.hops + 1 });
        }
      }
    }

    return { distance: 99 };
  }

  /** Check how many distinct accounts share this hardware device */
  public getDeviceSharedAccounts(deviceId: string): string[] {
    if (!deviceId || !this.adjacency.has(deviceId)) return [];
    return Array.from(this.adjacency.get(deviceId) || []);
  }

  public assessTransaction(txn: Partial<Transaction>): NetworkRiskAssessment {
    const customer = txn.customer || "";
    const recipient = txn.recipient || "";
    const device = txn.device || "";

    const recipDistance = this.findDistanceToFlaggedCluster(recipient);
    const custDistance = this.findDistanceToFlaggedCluster(customer);
    const sharedAccounts = this.getDeviceSharedAccounts(device);

    const minDistance = Math.min(recipDistance.distance, custDistance.distance);
    const activeClusterId = recipDistance.clusterId || custDistance.clusterId;

    let hubProximity = 10;
    let riskScore = 15;
    const connectedFlaggedNodes: string[] = [];

    if (recipDistance.reachedNode) connectedFlaggedNodes.push(recipDistance.reachedNode);
    if (custDistance.reachedNode && custDistance.reachedNode !== recipDistance.reachedNode) {
      connectedFlaggedNodes.push(custDistance.reachedNode);
    }

    if (minDistance === 0) {
      hubProximity = 98;
      riskScore = 95;
    } else if (minDistance === 1) {
      hubProximity = 85;
      riskScore = 88;
    } else if (minDistance === 2) {
      hubProximity = 60;
      riskScore = 65;
    } else if (minDistance === 3) {
      hubProximity = 35;
      riskScore = 40;
    }

    // Shared device bonus penalty
    if (sharedAccounts.length >= 2) {
      riskScore = Math.max(riskScore, 85);
      hubProximity = Math.max(hubProximity, 80);
      connectedFlaggedNodes.push(`Device shared by ${sharedAccounts.length} accounts: ${device}`);
    }

    return {
      hubProximity,
      hopDistance: minDistance === 99 ? -1 : minDistance,
      clusterId: activeClusterId,
      isMuleCluster: Boolean(activeClusterId) || minDistance <= 1,
      connectedFlaggedNodes,
      riskScore,
    };
  }
}

export const globalNetworkIntelligence = new NetworkGraphIntelligence();
