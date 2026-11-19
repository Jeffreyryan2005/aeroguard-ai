// ============================================================
// src/test/routing.test.ts
// Unit Tests for Dijkstra Lowest-Exposure Pathfinding Graph
// Tier 2 Validation Suite: Clean Corridor Path Optimization
// ============================================================

import { describe, it, expect } from 'vitest';
import { dijkstraLowestExposure, type GraphEdge } from '../lib/aqiCompute';

describe('Dijkstra Lowest-Exposure Commute Graph Routing', () => {
  it('identifies the clean subterranean path over a shorter high-smog arterial road', () => {
    // Nodes: Origin A, Clean Subterranean Metro B, Smog Highway C, Destination D
    const nodes = ['A', 'B', 'C', 'D'];
    const adjacency = new Map<string, GraphEdge[]>();

    // Route via B (Metro): distance 10km, local AQI 40 (clean subterranean)
    // Route via C (Highway): distance 7km (shorter!), local AQI 450 (toxic smog)
    adjacency.set('A', [
      { target: 'B', distanceKm: 5, localAqi: 40 },
      { target: 'C', distanceKm: 3.5, localAqi: 450 },
    ]);

    adjacency.set('B', [
      { target: 'D', distanceKm: 5, localAqi: 40 },
    ]);

    adjacency.set('C', [
      { target: 'D', distanceKm: 3.5, localAqi: 450 },
    ]);

    adjacency.set('D', []);

    const result = dijkstraLowestExposure(nodes, adjacency, 'A', 'D', 20, 30, 0.0);

    // Despite Highway C being 7km total vs Metro B being 10km total,
    // the exposure-weighted path MUST choose Metro B!
    expect(result.path).toEqual(['A', 'B', 'D']);
    expect(result.totalDistanceKm).toBe(10);
    expect(result.totalInhaledDoseUg).toBeLessThan(100);
  });

  it('handles trivial single-node start equals destination', () => {
    const nodes = ['A'];
    const adjacency = new Map<string, GraphEdge[]>();
    adjacency.set('A', []);

    const result = dijkstraLowestExposure(nodes, adjacency, 'A', 'A');
    expect(result.path).toEqual(['A']);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.totalInhaledDoseUg).toBe(0);
  });
});
