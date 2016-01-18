/* global d3 */

var highlightedNodes = [],
selectedNodes = [],
selectedLinks = [];

var node, link, textNode;

function loadKB(fname) {
    console.log("use file '" + fname + "' ...");
    if (nodes.length > 0) {
        nodes = [];
        links = [];
        clusters = [];
        headNodes = [];
        nodeNumbers = {logicabstraction: 0, valueabstraction: 0, pattern: 0, rawordinal: 0, rawnominal: 0, rawnumeric: 0, context: 0};
    } // if

    d3.xml(fname, "application/xml", readXML);

    var glFile;
    // if (fname === "data/kbta_gdm_LASSIE.xml") 
       // glFile = "data/GDM_inline_GATE.xml";
    if (fname === "data/kbta_diabetes_LASSIE.xml") 
        glFile = "data/Diabetes_inline_LASSIE.xml";
    if (fname === "data/kbta_gdm_LASSIE_final.xml")
        glFile = "data/GDM_inline_GATE_final.xml";
    if (fname === "data/kbta_GDM_LASSIE_newtest.xml")
        glFile = "data/GDM_inline_GATE_newtest.xml";

    if (glFile.length > 0) {
        console.log("Look for the Guideline file ..." + glFile);
        d3.xml(glFile, function (error, xml) {
        // d3.xml("data/GDM_KBTA.xml", function (error, xml) {
            if (error)
                throw error;
            textNode = xml.documentElement.getElementsByTagName('body')[0];
            var guideline = document.getElementById('guideline');
            if (guideline.childNodes.length === 1)
                guideline.removeChild(guideline.childNodes[0]);
            document.getElementById('guideline').appendChild(textNode);
                

        });
    }

} // loadKB () ------------------------

function selectClusters(kbtaElements) {
    console.log(kbtaElements);
}

function writeConceptNumbers() {
    var conceptNumbers = "";
    var totalNums = 0;
    for (var n in nodeNumbers) {
        conceptNumbers += n + ": " + nodeNumbers[n] + " | ";
        totalNums += nodeNumbers[n];
    }
    conceptNumbers += "total: " + totalNums;
    return conceptNumbers;
} // writeConceptNumbers () -----------

var width = 400, // 800,
        height = 300; //700;

var force = d3.layout.force()
        //.nodes(selectedNodes)
        //.links(selectedLinks)
        .charge(-150)
        .linkDistance(70)
        .size([width, height])
        .on("tick", tick);

var svg = d3.select("#chart").append("svg")
        .attr("id", "graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewbox", "0 0 " + width + " " + (height));

    svg.append("defs").selectAll("marker")
        .data(["end"]) // Different link/path types can be defined here
        .enter().append("marker")
        .attr("id", function (d) {
            return d;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 16.5)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

function draw() {

    link = svg.selectAll(".context")
                .data(force.links(), function (d) {
                    return d.source.id + "-" + d.target.id;
                });
    link.exit().remove();


    link = svg.selectAll(".link")
            .data(force.links(), function (d) {
                return d.source.id + "-" + d.target.id;
            });
    link.enter().append("line")
            .attr("class", function (d) {
                return d.type;
            })
            .attr("marker-end", "url(#end)");
    link.exit().remove();

    node = svg.selectAll(".node")
            .data(force.nodes(), function (d) {
                return 'c' + d.id;
            });

    node.enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) {
                return 'c' + d.id;
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousedown", mousedown)
            .call(force.drag);

    node.append("circle")
            .attr("class", function (d) {
                return "node " + d.type;
            })
            .attr("r", 5);

    node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .text(function (d) {
                return (d.name.length > 15) ? d.name.substring(0, 12) + " ..." : d.name;
            });
    node.exit().remove();

    force.start();
} // draw () ----------------------


function tick() {
    link.attr("x1", function (d) {
        return d.source.x;
    })
    .attr("y1", function (d) {
        return d.source.y;
    })
    .attr("x2", function (d) {
        return d.target.x;
    })
    .attr("y2", function (d) {
        return d.target.y;
    });

    node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
} // tick () ----------------------

function linkArc(d) {
    var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
} // linkArc () -------------------


function mouseover() {
    d3.select(this).select("circle").transition()
    .duration(400)
    .attr("r", 9);
    d3.select(this).select('text').transition()
    .style("font-weight", "bold")
    .style("fill", "black")
    .style("font-size", "12");

    var id = d3.select(this).attr("id").substring(1, d3.select(this).attr("id").length);
    for (var i in nodes) {
        var n = nodes[i];
        if (n.id === id) {
            for (var c = 0; c < clusters.length; c++) {
                if (clusters[c].concept === id) {
                    for (var p = 0; p < clusters[c].derivedFrom.length; p++) {
                        var derId = clusters[c].derivedFrom[p];
                        d3.select('#c' + derId).select("text")
                        .transition()
                        .style("font-weight", "bold")
                        .style("fill", "dimgray")
                        .style("font-size", "11");
                        d3.select('#c' + derId).select("circle")
                        .transition()
                        .attr("r", 6);
                        highlightedNodes.push(derId);
                    } // for
                    break;
                } // if
            } // for
        } // if
    } // for
} // mouseover()

function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(500)
        .attr("r", 5);
    d3.select(this).select('text').transition()
        .style("font-weight", "normal")
        .style("fill", "silver")
        .style("font-size", "10");

    for (var i in highlightedNodes) {
        var id = highlightedNodes[i];
        d3.select('#c' + id).select("text")
            .transition()
            .style("font-weight", "normal")
            .style("fill", "silver")
            .style("font-size", "10");
        d3.select('#c' + id).select("circle")
            .transition()
            .attr("r", 5);
    } // for
    highlightedNodes = [];
} // mouseout () ---------------------

function mousedown() {
    var id = d3.select(this).attr("id").substring(1, d3.select(this).attr("id").length);
    console.log(id);
    for (var i in nodes) {
        var n = nodes[i];
        if (n.id === id) {
            drawFormCircle(d3.select('#c-img').selectAll("circle")
                .data([n]));

            writeText(d3.select('#cid').selectAll("span")
                .data([n]), 'id');

            writeText(d3.select('#cname').selectAll("span")
                .data([n]), 'name');

            writeText(d3.select('#cvalues').selectAll("span")
                .data([n]), 'values');

            //writeText (d3.select(''))
            console.log("Derived Concepts: " + n.derived.join());
            d3.select('#cderiv').selectAll("span").remove();
            writeLinkedConcepts(d3.select('#cderiv').selectAll("span")
                    .data(n.derived)); // attr("value", text);

            console.log("Used by Concepts: " + n.used.join());
            d3.select('#cused').selectAll("span").remove();
            writeLinkedConcepts(d3.select('#cused').selectAll("span")
                .data(n.used));

        }
    }
} // mousedown () -------------------

function writeLinkedConcepts(t) {
    t.exit().remove();
    var der = t.enter().append("span");
    der.append("svg")
        .attr('width', 20).attr('height', 15)
        .attr('style', 'margin-top: 3px; margin-right: 5px')
        .append("circle")
        .attr('r', 5).attr("cx", 10).attr("cy", 8)
        .attr("class", function (d) {
            var type = docNode.getElementById(d).getAttribute('type');
            return "node " + type;
        });
    der.append('span').text(function (d) {
        var name = docNode.getElementById(d).getAttribute('name');
        return d + " " + name;
    });
    der.append('br');
}

/**
 *	t 	the data that is dealt with
 *	value 	the name of the value that is written: 'id', 'name'
 **/
 function writeText(t, value) {
    t.exit().remove();
    t.enter().append("span");
    t.text(function (d) {

        var text = d[value];
        if (value === 'id') {
            text += " (" + d.type;
                if (d.type === 'LogicAbstraction')
                    text += " - " + d.rel;
                text += ")";
        }
        if (value === 'values') {
            if (d.type === 'RawNominal') {
                var tagName = "", valueName = "";
                if (d.type === 'RawNominal') {
                    tagName = 'NominalAllowedValues';
                    valueName = 'NominalStringValue';
                } // if
                if (d.type === 'RawOrdinal') {
                    tagName = 'OrdinalAllowedValues';
                    valueName = 'OrdinalStringValue';
                } // if
                console.log("id=" + d.id);
                var possValues = docNode.getElementById(d.id).getElementsByTagName(tagName)[0].getElementsByTagName(valueName);
                var values = "";
                console.log("possValues: " + possValues.length);
                for (var t in possValues) {
                    console.log("possValue = " + possValues[t]);
                    if (possValues[t].nodeType === 1) // instanceof Element)
                        values += possValues[t].getAttribute('value') + ", ";
                } // for
                console.log("possible values of rawNominal/Ordinal Concept: " + values);
                text += values;
            } // if
        } // if
        return text;
    });
} // writeText () ---------------------

function drawFormCircle(circle) {
    circle.exit().remove();
    circle.enter().append("circle")
    .attr("r", 6);

    circle.attr("cx", 10).attr("cy", 8)
    .attr("class", function (d) {
        return "node " + d.type;
    });
}

function whichElement(e) {
    var ALLOWED_ELEMENT = 'TAK_Condition';
    var targ;
    if (!e) {
        var e = window.event;
    }
    if (e.target) {
        targ = e.target;
    } else if (e.srcElement) {
        targ = e.srcElement;
    }
    var tname;
    tname = targ.tagName;
    var allowedElements = ['ValueAbstraction', 'Context', 'RawNominalConcept', 'RawOrdinalConcept', 'RawNumericConcept', 'LogicAbstraction', 'TAK_Condition', 'PatternAbstraction'];
    if (targ.tagName === ALLOWED_ELEMENT) {
        if (targ.getAttribute('takIds')) {
            console.log(targ.tagName + " has tak concept ids " + targ.getAttribute('takIds'));
            var ids = targ.getAttribute('takIds').split(";");
            var mySelectedNodes = [];
            for (var i in ids) {
                var id = ids[i];
                mySelectedNodes = mySelectedNodes.concat(getClusterNodes(id)).sort();
            }
            mySelectedNodes = removeDuplicates (mySelectedNodes);
            console.log ("My selected nodes: " + mySelectedNodes.join());
            selectedNodes = [];
            for (var i in mySelectedNodes) {
                var sNode = mySelectedNodes[i];
                for (var j in nodes) {
                    var myNode = nodes[j];
                    if (myNode.id === sNode)
                        selectedNodes.push(myNode);
                } // for
            } // for
            console.log("Selected nodes: " + nodesToString (selectedNodes));
            force.nodes(selectedNodes);
            selectedLinks = getSelectedLinks (mySelectedNodes);
            console.log("Selected links: " + linksToString(selectedLinks));
            force.links(selectedLinks);
            draw();
        } else {
            console.log("No concepts found in this particular condition.");
            // nodes = [];
            // links = [];
            force.nodes([]);
            force.links([]);
            draw();
        }

    }
}

function removeDuplicates (arr) {
    var temp = {};
    for (var i = 0; i < arr.length; i++)
        temp[arr[i]] = true;
 
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}
function linksToString (myLinks) {
    var s = [];
    for (var i in myLinks) {
        s.push (myLinks[i].source.id + " - " + myLinks[i].target.id + " ("+myLinks[i].type+")");
    }
    return s.join(";\t");
}
function nodesToString (myNodes) {
    var s = [];
    for (var i in myNodes) {
        s.push(myNodes[i].id);
    }
    return s.join (";\t");
}
function getSelectedLinks (myNodes) {
    var myLinks = [];
    for (var i in myNodes) {
        var myNode = myNodes[i];
        for (var j in links) {
            var myLink = links[j];
            var sid = myLink.source.id;
            var tid = myLink.target.id;
            if (sid === myNode || tid === myNode) {
                if (myLinks.indexOf (myLink) === -1 && notContainsLink (myLinks, myLink))
                    myLinks.push(myLink);
            }
        }
    }
    return myLinks;
} // getSelectedLinks () --------------


function notContainsLink (myLinks, myLink) {
    var sid = myLink.source.id;
    var tid = myLink.target.id;
    for (var i in myLinks) {
        var thisLink = myLinks[i];
        var thisSid = thisLink.source.id;
        var thisTid = thisLink.target.id;
        if (sid === thisSid && tid === thisTid)
            return false;
        if (tid === thisSid && sid === thisTid)
            return false;
    }
    return true;
}

function getClusterNodes(id) {
    var clusterNodes = getClusterNodesToLeaves (id);
    var rootNodes = getClusterNodesToRoot(id);
    for (var i in rootNodes)
        if (clusterNodes.indexOf (rootNodes[i]) === -1)
            clusterNodes.push(rootNodes[i]);
        return clusterNodes;
} // getClusterNodes () ---------------

function getClusterNodesToRoot (id) {
    // console.log("Get all nodes from " + id + " to root");
    var clusterNodes = [];
    // get tree up to root
    for (var i in headNodes) {
        var headNode = headNodes[i];
        if (headNode.derived.indexOf (id) !== -1) {
            for (var j in headNode.derived) {
                if (clusterNodes.indexOf (headNode.derived[j]) === -1)
                    clusterNodes.push(headNode.derived[j]);                
            } // for
            if (clusterNodes.indexOf(headNode.head) === -1)
                clusterNodes.push(headNode.head);
            var newNodes = getClusterNodesToRoot (headNode.head);
            for (var j in newNodes) 
                if (clusterNodes.indexOf(newNodes[j]) === -1)
                    clusterNodes.push(newNodes[j]);
        } // if
    } // for
    if (clusterNodes.indexOf (id) === -1)
        clusterNodes.push(id);
    return clusterNodes;
} // getClusterNodesToRoot () ---------

function getClusterNodesToLeaves (id) {
    // console.log("Get all nodes from " + id + " to leaves");
    var clusterNodes = [];
    // get tree down to leaves
    for (var i in headNodes) {
        var headNode = headNodes[i];
        if (headNode.head === id) {
            if (clusterNodes.indexOf(id) === -1)
                clusterNodes.push(id);
            for (var j in headNode.derived) {
                var derivedNodes = getClusterNodesToLeaves(headNode.derived[j]);
                clusterNodes = clusterNodes.concat(derivedNodes);
            }
            return clusterNodes;
        }
    }
    if (clusterNodes.indexOf (id) === -1)
        clusterNodes.push(id);
    return clusterNodes;
}