// Example logs
logs = [
    { timestamp: 0, node: 1, operation: { type: "spawned" }, currentState: { property1: "value1" }, features: [] },
    { timestamp: 0, node: 2, operation: { type: "spawned" }, currentState: {}, features: [] },
    { timestamp: 1, node: 3, operation: { type: "spawned" }, currentState: {}, features: [] },

    { timestamp: 2, node: 4, operation: { type: "spawned" }, currentState: {}, features: [] },
    { timestamp: 2, node: 4, operation: { type: "despawned" }, currentState: {}, features: [] },
    { timestamp: 3, node: 4, operation: { type: "spawned" }, currentState: {}, features: [] },

    { timestamp: 4, node: 1, operation: { type: "connected", targetNode: 2 }, currentState: { property1: "value1" }, features: [] },
    { timestamp: 5, node: 2, operation: { type: "disconnected", targetNode: 2 }, currentState: {}, features: [] },
    { timestamp: 5, node: 1, operation: { type: "connected", targetNode: 2 }, currentState: {}, features: [] },

    { timestamp: 6, node: 2, operation: { type: "connected", targetNode: 3 }, currentState: {}, features: [] },
    { timestamp: 7, node: 2, operation: { type: "connected", targetNode: 4 }, currentState: {}, features: [] },
    { timestamp: 8, node: 1, operation: { type: "connected", targetNode: 4 }, currentState: {}, features: [] },
    
    { timestamp: 9, node: 3, operation: { type: "connected", targetNode: 2 }, currentState: {}, features: [] },
    { timestamp: 10, node: 4, operation: { type: "despawned" }, currentState: {}, features: [] },
    { timestamp: 11, node: 1, operation: { type: "connected", targetNode: 3 }, currentState: {}, features: [] },
]

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
        update({nodes, links}) {
            const old = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => ({...old.get(d.id), ...d}));
            links = links.map(d => ({...d}));

            node = node
                .data(nodes, d => d.id)
                .join(enter => enter.append("circle")
                    .attr("r", 5)
					// .attr("fill", catppuccinMocha.node) // Static color
                    .attr("fill", d => getColorFromFeatures(d.features)) // Set color based on score
					.on("click", (event, d) => { showModal(d, event); })
                    .call(drag(simulation))
                    .call(node => node.append("title").text(d => d.id)));

            link = link
                .data(links, d => [d.source, d.target])
                .join("line");

			nodes.forEach(node => {
				node.x = Math.random() * window.width;
				node.y = Math.random() * window.height;
			})

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

// Check if a given time is contained within the bound of start and end time 
function contains ({start, end}, time) {
    return start <= time && time < end
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

// Initialize the chart
document.addEventListener("DOMContentLoaded", function() {
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

    function resizeChart() {
        svg.attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .attr("viewBox", [-window.innerWidth / 2, -window.innerHeight / 2, window.innerWidth, window.innerHeight]);

        simulation.force("x", d3.forceX().strength(0.1)).force("y", d3.forceY().strength(0.1));
    }

    resizeChart()
    window.addEventListener('resize', resizeChart)

    const chart = createChart(svg, simulation);
    chart.update({ nodes: extendedGraph.nodes, links: extendedGraph.links });
});

// --- Functions related to different hue for different properties ---

function mapFeatureToHue(feature) {
    if (!(feature in featureToHue)) {
        featureToHue[feature] = nextHue;
        nextHue = (nextHue + 137) % 360; // Use the golden angle for distribution
    }
    return featureToHue[feature];
}

function getColorFromFeatures(features) {
    if (features.length === 0) return 'hsl(0, 0%, 85%)'; // Default color for no features

    const hues = features.map(mapFeatureToHue);
    const averageHue = hues.reduce((sum, hue) => sum + hue, 0) / hues.length;

    return `hsl(${averageHue}, 70%, 85%)`; // Return HSL color with average hue
}

