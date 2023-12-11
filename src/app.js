console.log(Prism.languages)

// Test nodes
const nodes = [
    { id: "1000", state: { property1: "value1", property2: "value1" } },
    { id: "1001", state: { property1: "value1", property2: "value1" } },
    { id: "1002", state: { property1: "value1", property2: "value1" } },
    { id: "1003", state: { property1: "value1", property2: "value1" } },
    { id: "1004", state: { property1: "value1", property2: "value1" } },
    { id: "1004", state: { property1: "value1", property2: "value1" } },
    { id: "1006", state: { property1: "value1", property2: "value1" } },
    { id: "1007", state: { property1: "value1", property2: "value1" } },
    { id: "1008", state: { property1: "value1", property2: "value1" } },
    { id: "1009", state: { property1: "value1", property2: "value1" } },
    { id: "1010", state: { property1: "value1", property2: "value1", property4: [ { property17: "value2300", property20: "value500" },  "value120", "value400" ] } },
    { id: "1011", state: { property1: "value1", property2: "value1", property3: "value1", property4: "value1", property5: "value1" } }
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
                    .attr("fill", catppuccinMocha.node)
					.on("click", (event, d) => { showModal(d, event); })
                    .call(drag(simulation))
                    .call(node => node.append("title").text(d => d.id)));

            link = link
                .data(links, d => [d.source, d.target])
                .join("line");

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

    modalNodeId.textContent = `ID: ${nodeData.id}`;
    modalState.textContent = JSON.stringify(nodeData.state, null, 2);

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
        .force("charge", d3.forceManyBody())
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

    // Load your data here and call chart.update({nodes, links})

    chart.update({ nodes, links });
});
