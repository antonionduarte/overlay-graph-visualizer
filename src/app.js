let currentTimestamp = 0; // Tracks the current timestamp

let currentNodes = new Map(); // Tracks current nodes using a Map for easy access
let currentLinks = new Set(); // Tracks current links using a Set

// Node colors
const featureToHue = {};
let nextHue = 0;

// Colorscheme
const catppuccinMocha = {
    background: "#24273a", // Flora
    node: "#cdd6f4",       // Rosewater
    nodeStroke: "#89b4fa",  // Mauve
    link: "#89b4fa"        // Green
};

// Loads logs from file
async function loadLogs() {
	const response = await fetch("http://127.0.0.1:8080/src/test-logs.json");
	return await response.json();
}

// Function to create the chart
function createChart(svg, simulation) {
    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    let node = svg.append("g")
        .attr("stroke", catppuccinMocha.background)
        .attr("stroke-width", 1.5)
        .selectAll("circle");

    function ticked() {
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    }

    simulation.on("tick", ticked);

    return {
        update({ nodes, links }) {
            // Make a shallow copy to protect against mutation, while
            // recycling old nodes to preserve position and velocity.
            const oldNodes = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => Object.assign(oldNodes.get(d.id) || {}, d));
			links = links.map(d => ({...d}));

            // Update the nodes data
            node = node.data(nodes, d => d.id)
                .join(
					enter => enter.append("circle")
						.attr("r", 5)
						.attr("fill", d => getColorFromFeatures(d.features))
						.call(drag(simulation))
						.call(node => node.append("title").text(d => d.id ))
						.on("click", (event, d) => { showModal(d, event); }),
					update => update
						.attr("fill", d => getColorFromFeatures(d.features))
                );

            // Update the links data
			link = link
				.data(links, d => [d.source, d.target])
				.join("line");

            // Update the simulation with the new data
            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart();
        }
    };
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Modal with node information
function showModal(nodeData, event) {
    var modal = document.getElementById("open-modal");
    var modalNodeId = document.getElementById("modal-node-id");
    var modalState = document.getElementById("modalState");

	const fullState = { state: nodeData.state, features: nodeData.features }

    modalNodeId.textContent = `ID: ${nodeData.id}`;
    modalState.textContent = JSON.stringify(fullState, null, 2);

    Prism.highlightElement(modalState);

    // Show the modal
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';

    // Close when clicking outside the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    }
}

// Function to process and apply a single log entry
// TODO: I need to update the node State and Features in every log process
function processLogEntry(entry) {
    const { timestamp, node, operation, currentState, features } = entry;

    switch (operation.type) {
        case "spawned":
            currentNodes.set(`node${node}`, { id: `node${node}`, ...currentState, features });
            break;
        case "despawned":
            currentNodes.delete(`node${node}`);
            // Remove any links associated with this node
            currentLinks.forEach(link => {
                if (link.source === `node${node}` || link.target === `node${node}`) {
                    currentLinks.delete(link);
                }
            });
            break;
		case "connected":
            currentNodes.set(`node${node}`, { id: `node${node}`, ...currentState, features });
			currentLinks.add({
				source: `node${node}`,
				target: `node${operation.targetNode}`
			})
			break;
		case "disconnected":
            currentNodes.set(`node${node}`, { id: `node${node}`, ...currentState, features });
			currentLinks.forEach(link => {
				// TODO: Bidirectionally check for equality? Or maybe not? Maybe it's preferable
				// to represent the view from within a node.
                if (link.source === `node${node}` && link.target === `node${operation.targetNode}`) {
                    currentLinks.delete(link);
                }
			})
			break;
		}
}

// Function that updates graph based on logs
function updateGraph(newTimestamp, chart, logs) {
    // Process logs in the range from currentTimestamp to newTimestamp
    const logsToProcess = (newTimestamp >= currentTimestamp) 
        ? logs.filter(log => log.timestamp >= currentTimestamp && log.timestamp <= newTimestamp)
        : logs.filter(log => log.timestamp <= newTimestamp);

    logsToProcess.forEach(log => processLogEntry(log));
    currentTimestamp = newTimestamp;

    // Convert the currentNodes and currentLinks to arrays for D3
    const nodes = Array.from(currentNodes.values())
    const links = Array.from(currentLinks);

    // Update the chart with the new nodes and links
    chart.update({ nodes, links });
}

// Initialize the chart
document.addEventListener("DOMContentLoaded", async function() {
	const logs = await loadLogs();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink().id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const svg = d3.select("#chart").append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

    simulation.nodes([]);
    simulation.force("link").links([]);

    function resizeChart() {
        svg.attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .attr("viewBox", [-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight]);

        simulation.force("x", d3.forceX().strength(0.1)).force("y", d3.forceY().strength(0.1));
    }

    resizeChart()
    window.addEventListener('resize', resizeChart)

    const chart = createChart(svg, simulation);

	for (let i = 0; i < 60; i++) {
		updateGraph(i, chart, logs)
		await new Promise(r => setTimeout(r, 1000));
	}
});

// --- Functions related to different hue for different properties ---

// Maps a specific feature to a specific Hue
function mapFeatureToHue(feature) {
    if (!(feature in featureToHue)) {
        featureToHue[feature] = nextHue;
        nextHue = (nextHue + 137) % 360; // Use the golden angle for distribution
    }
    return featureToHue[feature];
}

// Determines the color that the node should have, from the list of features
function getColorFromFeatures(features) {
    if (features.length === 0) return 'hsl(0, 0%, 85%)'; // Default color for no features

    const hues = features.map(mapFeatureToHue);
    const averageHue = hues.reduce((sum, hue) => sum + hue, 0) / hues.length;

    return `hsl(${averageHue}, 70%, 85%)`; // Return HSL color with average hue
}

