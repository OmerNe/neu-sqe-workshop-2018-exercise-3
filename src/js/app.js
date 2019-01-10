import $ from 'jquery';
import {parseCode, recParse} from './code-analyzer';
//import {prossessLines} from './lineProcessing';

// let notShowTable = true;
// // function debug()
// // {
// //     notShowTable = false;
// //     if(notShowTable)
// //     {
// //         $('#parsedCode').show();
// //         $('#resultTable').hide();
// //     }
// //     else
// //     {
// //         $('#parsedCode').hide();
// //         $('#resultTable').show();
// //     }
// // }

$(document).ready(function () {
    //debug();
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let argArr = $('#inputArgs').val();
        let parseProc = recParse(parsedCode, JSON.parse('['+argArr+']'));
        //let resultLines = prossessLines(codeToParse,JSON.parse(parseProc[0]),
        //    JSON.parse(parsedCode[1]),JSON.parse(parseProc[2]));
        $('#markedCode').empty();
        let bla = recParse(parseProc,argArr);
        //let flowChart = JSON.parse(bla);
        let flowChart = printFlowChart(bla);
        printPath(flowChart);
        draw();
        //$('parsdeCode').html(resultLines);
    });

});
let i = 1;
let vEdges = {};
const printFlowChart = (vertex) =>{
    if(vertex === null)
        return null;
    vertex.color = 'green';
    if(!(`${vertex.type}${vertex.index}` in vEdges))
        vEdges[vertex.type+vertex.index] = i;
    i++;
    if(vertex.type === 'operation'){
        if(vertex.child !== undefined &&!(vertex.child.type+vertex.child.index in vEdges))
            vertex.child = printFlowChart(vertex.child);}
    else {
        if (vertex.cVal === true)
            vertex.child = printFlowChart(vertex.child);
        if (vertex.cVal === false || vertex.text.includes('while'))
            vertex.nChild = printFlowChart(vertex.nChild);
    }
    return vertex;

};
let strToCDict = {};

function updateDict(str, c) {
    if(str in strToCDict && strToCDict[str] === null)
        strToCDict = c;
    else
        strToCDict[str] = c;
}


let strToEdg = '';
const printPath = (ver) =>{
    let curVer = '';
    if (ver != null)
    {
        if(ver.type === 'operation')
            if (Object.keys(strToCDict).length === 0)
            {
                updateDict(`st=>start: ${ver.text}`,ver.color,'st');
                vEdges['st'] = vEdges[`operation${ver.index}`];curVer = 'st';
            }
            else {
                updateDict(`operation${ver.index}=>operation: ${ver.text}`,ver.color,`operation${ver.index}`); curVer = `operation${ver.index}`;
            }
        else{
            updateDict(`condition${ver.index}=>condition: ${ver.text}`, ver.color,`condition${ver.index}`);
            curVer = `condition${ver.index}`;
        }
        if(ver.type === 'operation'){
            if(ver.child != null) strToEdg += `${curVer}->${ver.child.type}${ver.child.index} \n`;
        }
        else{
            if(ver.child !== null && ver.child !== '' && ver.child !== undefined)
                strToEdg += `${curVer}(yes)->${ver.child.type}${ver.child.index} \n`;
            if(ver.nChild !== null && ver.nChild !== '' && ver.nChild !== undefined)
                strToEdg += `${curVer}(no)->${ver.nChild.type}${ver.nChild.index} \n`;
        }
        printPath(ver.child);
        printPath(ver.nChild);
    }
};
//import {parse} from '../../flowchart';
const draw = () =>{
    let strC = '';
    for (let key in strToCDict)
    {
        let num = vEdges[key.substring(0,key.indexOf('=>'))];
        if(num !== undefined)
            strC += key + ' \n--'+num+'--\n|'+strToCDict[key]+'\n';
        else
            strC += key+'|'+strToCDict[key]+'\n';
    }
    let prntStr = strC+' \n'+strToEdg;
    while (prntStr.indexOf('\n \n') > -1)
        prntStr=prntStr.replace('\n \n', '\n');
    let flowchart = parse(prntStr);

    flowchart.drawSVG('diagram',
        {'x': 0,'y': 0,'line-width': 1,'line-length': 100,'text-margin': 10,'font-size': 10,'font-color': 'black','line-color': 'black',
            'element-color': 'black','fill': 'white','yes-text': 'T','no-text': 'F','arrow-end': 'block','scale': 1,
            'flowstate' : {
                'green' : { 'fill' : 'green'},
                'null' : {'fill' : 'white'}
            }
        }
    );

};