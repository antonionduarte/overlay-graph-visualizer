// Test nodes
const nodes = [
    { id: "1000", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1001", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1002", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1003", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1004", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1004", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1006", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1007", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1008", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1009", state: { property1: "value1", property2: "value1" }, features: ['A'] },
    { id: "1010", state: { property1: "value1", property2: "value1", property4: [ { property17: "value2300", property20: "value500" },  "value120", "value400" ] }, features:['A', 'B'] },
    { id: "1011", state: { property1: "value1", property2: "value1", property3: "value1", property4: "value1", property5: "value1" }, features: ['A'] }
];

// Test links
const links = [
    { source: "1000", target: "1001" },
    { source: "1001", target: "1002" },
    { source: "1002", target: "1003" },
    { source: "1003", target: "1000" },
    { source: "1010", target: "1008" },
    { source: "1009", target: "1006" },
    { source: "1010", target: "1011" }
];

// --- Functions to generate additional nodes in the graph ---

// Function to generate random features
function getRandomFeatures() {
    const allFeatures = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const count = Math.floor(Math.random() * 4) + 1; // Random number of features (1 to 4)
    const features = [];
    for (let i = 0; i < count; i++) {
        const feature = allFeatures[Math.floor(Math.random() * allFeatures.length)];
        if (!features.includes(feature)) {
            features.push(feature);
        }
    }
    return features;
}

// Function to generate additional nodes and links
function generateAdditionalNodesAndLinks(existingNodes, existingLinks, additionalCount) {
    let lastId = existingNodes.length > 0 ? parseInt(existingNodes[existingNodes.length - 1].id) : 0;
    const newNodes = [];
    const newLinks = existingLinks.slice(); // Copy existing links

    for (let i = 1; i <= additionalCount; i++) {
        lastId++;
        const newNode = {
            id: lastId.toString(),
            state: { 'property1': 'value1' },
			features: getRandomFeatures()
        };
        newNodes.push(newNode);

        // Create random links with some existing nodes to form clusters
        if (i % 3 === 0 && existingNodes.length > 0) {
            const targetNode = existingNodes[Math.floor(Math.random() * existingNodes.length)];
            newLinks.push({ source: lastId.toString(), target: targetNode.id });
        }
    }
    
    return { nodes: existingNodes.concat(newNodes), links: newLinks };
}
