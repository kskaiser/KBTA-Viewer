/* global d3 */

var CONCEPT_NAMES = ['DerivedFrom', 'GeneratedFrom', 'NecessaryContext'];

var nodes = [],
        links = [],
        clusters = [],
        headNodes = [],
        docNode;

var nodeNumbers = {logicabstraction: 0,
    valueabstraction: 0,
    pattern: 0,
    rawordinal: 0,
    rawnominal: 0,
    rawnumeric: 0,
    context: 0
};

function readXML(error, xml) {
    if (error)
        console.log("Error: " + error);

    docNode = xml;
    var conceptNodes = xml.documentElement.childNodes;

    for (var i in conceptNodes) {
        var concept = conceptNodes[i];

        if (concept.nodeType !== 1)
            continue;
        var cid = concept.getAttribute('id');
        var cName = concept.getAttribute('name');
        var cType = concept.getAttribute('type');

        nodeNumbers[cType.toLowerCase()]++;
        var cRel = concept.getAttribute('ComponentsRelation');

        var cidList = getDerivedConcepts(concept);

        var usedList = getUsedConcepts(xml.documentElement, cid);

        var node = {id: cid, name: cName, type: cType, rel: cRel, derived: cidList, used: usedList};
        nodes.push(node);
    } // for

    var allDerivedConcepts = [];
    for (var i in conceptNodes) {
        var concept = conceptNodes[i];
        if (concept.nodeType !== 1)
            continue;

        var prevConcepts = getLinks(concept);
        allDerivedConcepts = allDerivedConcepts.concat(prevConcepts);

        if (prevConcepts.length > 0)
            clusters.push({concept: concept.id, derivedFrom: prevConcepts});
    } // for

    var heads = [];
    for (var i in clusters) {
        var cand = clusters[i].concept;
        if (allDerivedConcepts.indexOf(cand) === -1) 
            heads.push(cand);
    }

    var derived = [];
    for (var i in heads) {
        var head = heads[i];
        derived = getAllDerivedConcepts (head, 1);
        // console.log(head + ": " + derived);
        headNodes.push({head: head, derived: derived});
    }
    
    console.log("  Nodes: " + nodes.length + "\tLinks: " + links.length + "\tClusters: " + clusters.length + "\tHead nodes: " + headNodes.length);

    d3.select("#concepts").text(writeConceptNumbers());
    console.log("Start drawing ...");
    draw();
} // readXML () -----------------------

function getAllDerivedConcepts (head, level) {
    console.log ("getAllDerivedConcepts: (head="+head+"; level="+level+")");
    var theDerivedConcepts = [];
    for (var i in clusters) {
        var cluster = clusters[i];
        if (cluster.concept === head) {
            if (cluster.derivedFrom !== null) {
                theDerivedConcepts = theDerivedConcepts.concat(cluster.derivedFrom);
                for (var d in cluster.derivedFrom) 
                    theDerivedConcepts = theDerivedConcepts.concat(getAllDerivedConcepts (cluster.derivedFrom[d], level+1));
            }
        }
    }
    return theDerivedConcepts;
}

function getLinks(concept) {
    var prevConcepts = [];
    for (var id in CONCEPT_NAMES) {
        if (concept.getElementsByTagName(CONCEPT_NAMES[id]).length === 1) {
            var derived = concept.getElementsByTagName(CONCEPT_NAMES[id])[0].getElementsByTagName('ConceptID_Name');
            for (var j = 0; j < derived.length; j++) {
                var s = getSource(derived[j].getAttribute('ConceptID'));
                var t = getSource(concept.id);
                if (s !== undefined && concept !== undefined) {
                    var type = (id === "2") ? 'context' : 'link';
                    var node = {source: s, target: t, type: type};
                    links.push(node);
                    prevConcepts.push(s.id);
                }
            } // for
        } // if
    } // for
    return prevConcepts;
} // getLinks () ----------------------

function getDerivedConcepts(concept) {
    var cidList = [];
    for (var id in CONCEPT_NAMES) {
        var derivConcepts = concept.getElementsByTagName(CONCEPT_NAMES[id]);
        if (derivConcepts.length > 0) {
            for (var j = 0; j < derivConcepts[0].getElementsByTagName('ConceptID_Name').length; j++) {
                var cid = derivConcepts[0].getElementsByTagName('ConceptID_Name')[j].getAttribute('ConceptID');
                if (cidList.indexOf(cid) === -1)
                    cidList.push(cid);
            } // for
        } // if
    } // for
    return cidList;
} // getDerivedConcepts () ------------

function getUsedConcepts(doc, cid) {
    var usedList = [];
    var useConcepts = doc.getElementsByTagName('ConceptID_Name');
    for (var j = 0; j < useConcepts.length; j++) {
        var concept = useConcepts[j];
        if (concept.getAttribute('ConceptID') === cid) {
            var node = useConcepts[j].parentNode;
            var re = /.*Concept$/;
            while (re.exec(node.nodeName) === null)
                node = node.parentNode;
            if (usedList.indexOf(node.getAttribute('id')) === -1)
                usedList.push(node.getAttribute('id'));
        } // if
    } // for
    return usedList;
} // getUsedConcepts () ---------------

function getSource(cid) {
    for (var i in nodes) {
        var node = nodes[i];
        if (node.id === cid)
            return node;
    }
}


