// Include MetricsGraphics library
//
import { LineChart, HistogramChart, ScatterChart } from "./index.js";

window.getDataset = function GetDataset(filename) {
    var dataset = null;
    window.datasets.forEach(element => {
        if (element.name == filename) {
            dataset = element;
        }
    });

    return dataset;
}

window.setGraphTitle = function SetGraphTitle(title) {
    document.getElementById('graphTitle').innerText = title;
}

window.setGraphDescription = function SetGraphDescription(description) {
    document.getElementById('graphDescription').innerHTML = description;
}

// Run custom javascript to refresh visualization
//
function Visualize(js) {
    try {
        eval(js);
    } catch (e) {
        console.log("Exception occurred during code execution: ")
        console.log(e.message);
        console.log(e.stack);
        alert("Error: " + e.message);
    }
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

            // Once uploaded, you've uploaded.
            allowRevert: false,
            allowRemove: false,

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

            // Initialize visualization with a chart from the sample
            // data
            //
            var js = document.getElementById('codetext').innerText
            Visualize(js);
        });

    return fp;
}

// Build the coding editor section
// using CodeMirror
//
function BuildCodeEditor() {
    // Copy over default code from the constants section in the html
    // into the textarea
    //
    document.getElementById('codetext').innerHTML = document.getElementById('defaultCodeSnippet').innerHTML;

    // Construct the code mirror instance from the textarea
    //
    return CodeMirror.fromTextArea(
        document.getElementById('codetext'), {
            lineNumbers: true,
            mode: "javascript",
            indentWithTabs: true,
            tabSize: 4,
            indentUnit: 4,
            viewportMargin: 20,
            lineWrapping: true
        }
    );
}

// Set up the visualization panel
//
function BuildVisualizationPanel() {
    // Set up the refresh button
    // to read the code, and refresh visualization
    //
    $('#refreshVisualization').on('click', function() {
        var js = window.cm.getDoc().getValue();
        Visualize(js);
        return false;
    });
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

    // Build code editor
    //
    window.cm = BuildCodeEditor();

    // Build visualization panel
    //
    BuildVisualizationPanel();
})();