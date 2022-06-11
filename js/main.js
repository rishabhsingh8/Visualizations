// Include MetricsGraphics library
//
import { LineChart, HistogramChart, ScatterChart } from "./index.js";
window.isCodeShowing = false;

window.configuration = {
    title: "The Rise of UFO Sightings",
    description: "According to [reuters](https://www.reuters.com/article/us-britain-ufo/ufo-sightings-may-have-been-down-to-x-files-idUSTRE57G2EU20090817), UFO sightings may be correlated with the rise in popularity of television shows like X-Files.",
    width: 650,
    height: 200,
    dataset: "ufosightings.json",
    xAccessor: "year",
    yAccessor: "sightings",
    area: true,
    xAxis: {
        extendedTicks: false,
        label: "Year",
        tickFormat: ".4r"
    },
    yAxis: {
        label: "UFO Sightings"
    },
    colors: ["#5B75CF", "#22C55D", "#A855F7"],
    markers: [{ year: 1993, label: "'X-Files' released" }],
    baselines: [],
    legend: ['UFO Sightings']
}

window.configDescription = {
    title: "Title of the visualization",
    description: "A blurb to describe context",
    width: "Total width of the graph",
    height: "Total height of the graph",
    dataset: "The dataset to plot. (uploaded above)",
    xAccessor: "The name of the field in the dataset that contains the X values",
    yAccessor: "The name of the field in the dataset that contains the Y values",
    area: "Show an area under the line or not",
    xAxis: "-",
    yAxis: "-",
    colors: "Custom color palette for the graph.",
    markers: "Markers that should be added to the chart. Each marker object should be accessible through the xAccessor and contain a label field",
    baselines: "Baselines that should be added to the chart. Each baseline object should be accessible through the yAccessor and contain a label field"
}

// Get a dataset
window.getDataset = function GetDataset(filename) {
    var dataset = null;
    window.datasets.forEach(element => {
        if (element.name == filename) {
            dataset = element;
        }
    });

    return dataset;
}

// Update the graph title
window.setGraphTitle = function SetGraphTitle(title) {
    document.getElementById('graphTitle').innerText = title;
}

// Set the description blurb
window.setGraphDescription = function SetGraphDescription(description) {
    var html = marked.parse(description);
    document.getElementById('graphDescription').innerHTML = html;
}

// Build the file upload zone using FilePond
//
function BuildFileUploadZone() {
    // Get a reference to the file input element
    const inputElement = document.querySelector('input[type="file"]');

    // Register file extension validation plugin
    FilePond.registerPlugin(FilePondPluginFileValidateType);

    // Create a FilePond instance
    var fp = FilePond.create(
        inputElement, {
            // Allow multiple files
            allowMultiple: true,

            // Match the global array
            itemInsertLocation: 'after',

            // Only accept jsons
            acceptedFileTypes: ['application/json'],

            // Handle uploading
            server: {
                process: (fieldName, file, metadata, load, error, progress, abort) => {
                    console.log("Processing file ", file.name, ": ", file);
                    let reader = new FileReader();

                    // Once the file is read, we want to parse it and store
                    // it in memory for the user to use
                    //
                    reader.onloadend = function() {
                        console.log('Contents of ', file.name, ': ', reader.result)

                        // Parse file
                        var json = JSON.parse(reader.result);

                        // Push parsed object into memory
                        window.datasets.push({
                            name: file.name,
                            data: json
                        });

                        // Tell FilePond that we're done.
                        load(json)
                    }

                    // Queue up file read
                    reader.readAsText(file);
                }
            },

            labelIdle: '<span class="filepond--label-action">Upload</span> more json datasets.',
            labelFileProcessingComplete: 'Dataset ready',
            labelTapToUndo: 'tap to remove'
        }
    );

    // Load sample data
    fetch('data/ufosightings.json')
        .then(response => {
            return response.json();
        })
        .then(jsondata => {
            // Add sample data to dataset
            window.datasets.push({
                name: 'ufosightings.json',
                data: jsondata
            });

            // Notify FilePond UI that we have a local file
            //
            fp.addFile('ufosightings.json', {
                type: 'limbo',
                file: {
                    name: 'ufosightings.json',
                    size: 4000,
                    type: 'application/json'
                }
            });

            // Visualize the chart
            //
            Visualize();
        });

    return fp;
}

// Ensure that the code for the graph is updated
//
function RefreshGraphCode() {
    // Copy over default code from the constants section in the html
    // into the textarea
    //
    document.getElementById('codetext').innerHTML =
        `/* The following code generate the chart above */

new LineChart({
    // Which data to plot
    data: ['${window.configuration.dataset}'],
    // Height & Width of the chart
    width: ${window.configuration.width},
    height: ${window.configuration.height},
    // Which div to target
    target: '.visualization',
    // Key to access X values
    xAccessor: '${window.configuration.xAccessor}',
    // Key to access Y values
    yAccessor: '${window.configuration.yAccessor}',
    // Show area under line?
    area: ${window.configuration.area},
    // Customize x-axis
    xAxis: ${JSON.stringify(window.configuration.xAxis)},
    // Customize y-axis
    yAxis: ${JSON.stringify(window.configuration.yAxis)},
    // Customize colors of lines
    colors: ${JSON.stringify(window.configuration.colors)},
    // Highlight values along the x-axis
    markers: ${JSON.stringify(window.configuration.markers)},
    // Highlight values along the y-axis
    baselines: ${JSON.stringify(window.configuration.baselines)},
    // Describe each line
    legend: ${JSON.stringify(window.configuration.legend)},
});
`;

    // Re-highlight the code
    hljs.highlightAll();
}

// Update the chart, and the chart-code blurb
//
function Visualize() {
    var options = JSON.parse(JSON.stringify(window.configuration));
    options.data = [window.getDataset(options.dataset).data];
    options.target = ".visualization";

    window.setGraphDescription(options.description);
    window.setGraphTitle(options.title);

    new LineChart(options);

    // Refresh the code blurb
    //
    RefreshGraphCode();
}

// Set up the graph-code-blurb panel
//
function BuildGraphCodeBlurbPanel() {
    // Set up the refresh button
    // to read the code, and refresh visualization
    //
    $('#showCode').on('click', function() {
        if (window.isCodeShowing) {
            // Code snippet is showing - hide it
            $('#showCode')[0].innerText = '> Show Code';
            $('#codeSnippet').fadeOut();
            window.isCodeShowing = false;
        } else {
            // Code snippet is hidden - show it
            $('#showCode')[0].innerText = '< Hide Code';
            $('#codeSnippet').fadeIn();
            window.isCodeShowing = true;
        }
        return false;
    });
}

// Auto-generate an editable json-table
function CreateGraphBuilderTable() {

    // Start building the table
    var str = '<table class="objecttable">';
    str += "<tr><th>Name</th><th>Value</th>"

    // For each key-value pair in the object
    // we need to construct a row in the table
    //
    var keyVals = Object.entries(window.configuration);
    keyVals.forEach(element => {
        var key = element[0];
        var val = element[1];
        var type = typeof val;

        var valCell = `<td id="val${key}">${val}</td>`;
        if (type == "object") {
            // We don't handle nested objects
            // If we have an object, just flatten it 
            // into JSON, and display it.
            //
            val = JSON.stringify(val);
            valCell = `<td class="objectcode" id="val${key}">${val}</td>`;
        }

        str += `<tr><td><code id="key${key}">${key}</code></td>${valCell}</tr>`
    });
    str += "</table>"

    // Update the DOM
    document.getElementById("graphBuilderForm").innerHTML = str;

    // Post-processing:
    //  -> Adding tooltips to the DOM elements
    //  -> Setting up callbacks for editable `value` cells
    //
    keyVals.forEach(element => {
        var key = element[0];

        // Add tooltips to the key
        tippy(`#key${key}`, {
            content: window.configDescription[key],
            theme: 'light-border',
        });

        // Make the values editable
        $(`#val${key}`).editable({
            save: function(content) {
                var newContent = $(`#val${key}`)[0].innerText;
                var type = typeof window.configuration[key];
                if (type == "object") {
                    newContent = JSON.parse(newContent);
                }

                // Update configuration
                window.configuration[key] = newContent;

                // Refresh chart
                Visualize();
            },
        });
    })
}


// Setup everything
//
(function() {
    'use strict';

    // Set up our datasets global variable
    // This is what we will load user data files into
    //  Format:
    //      name: Filename of user file (example: rowCount.json)
    //      data: Contents of file parsed into a object (using JSON.parse)
    //
    window.datasets = []

    // Build file upload zone
    //
    window.fileUploadZone = BuildFileUploadZone();

    // Create the graph builder table
    //
    CreateGraphBuilderTable();

    // Create the graph builder
    //
    BuildGraphCodeBlurbPanel();

    // Hide the graph code snippet
    //
    $('#codeSnippet').hide();
    window.isCodeShowing = false;
})();