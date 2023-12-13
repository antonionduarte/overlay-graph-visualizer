# overlay-graph-visualizer

## TODO

- [ ] Smooth transition when Node State window resizes
- [ ] Slider to go forward in the logs
- [ ] Scary but... allow for the logs to move backward as well 

## Example Log Format

(I know JSON doesn't have comments, this is just to exemplify)
```json
{
    # three different nodes spawn
    { "timestamp": 0, "node": 1, "operation": { "type": "spawned" }, "currentState": { "property1": "value1" }, "features": [] },
    { "timestamp": 0, "node": 2, "operation": { "type": "spawned" }, "currentState": {}, "features": [] },
    { "timestamp": 1, "node": 3, "operation": { "type": "spawned" }, "currentState": {}, "features": [] },

    # node spawns and despawns right after, and then respawns again
    { "timestamp": 2, "node": 4, "operation": { "type": "spawned" }, "currentState": {}, "features": [] },
    { "timestamp": 2, "node": 4, "operation": { "type": "despawned" }, "currentState": {}, "features": [] },
    { "timestamp": 3, "node": 4, "operation": { "type": "spawned" }, "currentState": {}, "features": [] },

    # nodes connect to each other and slowly build a graph, sometimes they disconnect
    # if a node despawns all the connections related with that node are dropped 
    { "timestamp": 4, "node": 1, "operation": { "type": "connected", "targetNode": 2 }, "currentState": { "property1": "value1" }, "features": [] },
    { "timestamp": 5, "node": 2, "operation": { "type": "disconnected", "targetNode": 2 }, "currentState": {}, "features": [] },
    { "timestamp": 5, "node": 1, "operation": { "type": "connected", "targetNode": 2 }, "currentState": {}, "features": [] },

    { "timestamp": 6, "node": 2, "operation": { "type": "connected", "targetNode": 3 }, "currentState": {}, "features": [] },
    { "timestamp": 7, "node": 2, "operation": { "type": "connected", "targetNode": 4 }, "currentState": {}, "features": [] },
    { "timestamp": 8, "node": 1, "operation": { "type": "connected", "targetNode": 4 }, "currentState": {}, "features": [] },
    
    { "timestamp": 9, "node": 3, "operation": { "type": "connected", "targetNode": 2 }, "currentState": {}, "features": [] },
    { "timestamp": 10, "node": 4, "operation": { "type": "despawned" }, "currentState": {}, "features": [] },
    { "timestamp": 11, "node": 1, "operation": { "type": "connected", "targetNode": 3 }, "currentState": {}, "features": [] },
}
```

Hardcoded test logs:
```js
let logs = [
    { timestamp: 0, node: 1, operation: { type: "spawned" }, currentState: { property1: "value1" }, features: ["A"] },
    { timestamp: 0, node: 2, operation: { type: "spawned" }, currentState: {}, features: ["B"] },
    { timestamp: 1, node: 3, operation: { type: "spawned" }, currentState: {}, features: ["B"] },
    { timestamp: 2, node: 4, operation: { type: "spawned" }, currentState: {}, features: ["A"] },
    { timestamp: 3, node: 4, operation: { type: "despawned" }, currentState: {}, features: ["A"] },
    { timestamp: 4, node: 4, operation: { type: "spawned" }, currentState: {}, features: ["A"] },
    { timestamp: 5, node: 1, operation: { type: "connected", targetNode: 2 }, currentState: { property1: "value1" }, features: ["A"] },
    { timestamp: 6, node: 1, operation: { type: "disconnected", targetNode: 2 }, currentState: {}, features: ["A"] },
    { timestamp: 7, node: 3, operation: { type: "connected", targetNode: 4 }, currentState: {}, features: ["B"] },
    { timestamp: 8, node: 1, operation: { type: "connected", targetNode: 2 }, currentState: { property1: "value1" }, features: ["B"] },
    { timestamp: 8, node: 2, operation: { type: "connected", targetNode: 3 }, currentState: {}, features: ["B"] },
    { timestamp: 9, node: 2, operation: { type: "connected", targetNode: 4 }, currentState: {}, features: ["B"] },
    { timestamp: 10, node: 1, operation: { type: "connected", targetNode: 4 }, currentState: {}, features: ["B"] },
    { timestamp: 10, node: 4, operation: { type: "despawned" }, currentState: {}, features: ["A"] },
    { timestamp: 11, node: 1, operation: { type: "connected", targetNode: 3 }, currentState: {}, features: ["C"] },
    { timestamp: 12, node: 4, operation: { type: "spawned" }, currentState: {}, features: ["A"] },
]

```
