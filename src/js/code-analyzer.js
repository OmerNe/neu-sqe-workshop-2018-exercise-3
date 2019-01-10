import * as esprima from 'esprima';
//let list;
// let funcArgDic = {};
// let deltLines = [];
// let otherDictDirty = {};
// let otherDict = {};
// let isDirty = false;
// let replaceIfs = {};
let index = 0;
let graph;
let varToInt = {};
let checkV;
let nStack = [];
let tmpCurVer = null;
let tmpGraph = null;
const parseCode = (codeToParse) => {
    //list = [];
    return esprima.parseScript(codeToParse,{loc: true});
    //The "loc: true" attribute saved me a other few people i told them about it :)

};

const recProgram = (parsed, args) => {
    for(let i = 0;i<parsed.body.length;i++)
    {
        recParse(parsed.body[i],args);
    }
    return JSON.stringify(graph);
};


const recIf = (parsed,args) => {
    let vertex = {type:'condition', text:null, child:null, nChild:null, index:index, color:null,final_index:'',check_value:null,while_index:args};
    index++;
    vertex.text= recParse(parsed.test);
    checkV = true;
    vertex.check_value = eval(`${recParse(parsed.test)}`);
    checkV = false;
    let true_child = null;
    let temp = null;
    if(vertex.check_value === true) {
        true_child = recParse(parsed.consequent,args);
        temp = recParse(parsed.alternate);
    } else { 
        temp = recParse(parsed.alternate);
        true_child = recParse(parsed.consequent,args);
    } 
    if (typeof(true_child) === 'object')
        vertex.child = true_child;
    else if (!true_child.includes('text'))
        vertex.child = {type:'operation', text:true_child, child:null, nChild:null, index:index, color:null,final_index:''};
    else 
        vertex.child = JSON.parse(true_child); index++;
    if(parsed.alternate != null)
        try{
            vertex.nChild = JSON.parse(temp);
        } catch(err){
            vertex.nChild = temp;
        } return JSON.stringify(vertex);
};

// const recFor = forParsed => {
//     addToTable(forParsed.loc.start.line, 'For Statement',recParse(forParsed.test),recParse(forParsed.update));
//     recParse(forParsed.body);
// };

const recFuncDec = (funcParsed, argArr) => {
    checkV = false;
    //addToTable(line, 'Function Declaration',funcParsed.id.name,'');
    for (let i = 0; i < funcParsed.params.length; i++) {
        //addToTable(line,'Param',recParse(funcParsed.params[i]),'');
        varToInt[recParse(funcParsed.params[i])] = argArr[i];
    }
    graph = recParse(funcParsed.body);
};

const vDeclirator = vParsed => {
    checkV = true;
    varToInt[vParsed.id.name] = eval(recParse(vParsed.init));
    checkV = false;
    return vParsed.id.name+' = '+recParse(vParsed.init)+'\n';
};

const vDecliration = vParsed => {
    let str = '';
    for (let i = 0; i < vParsed.declarations.length; i++) {
        //the declarators
        str += recParse(vParsed.declarations[i]);
    }
    return str;
};

const recAssign = assParsed => {
    let left = recParse(assParsed.left);
    checkV = true;
    let right  = recParse(assParsed.right);
    varToInt[left] = eval(right);
    checkV = false;
    right = recParse(assParsed.right);

    return left+' = '+right+'\n';

};

const recUnary = uParsed => {
    let op = recParse(uParsed.operator);
    op += recParse(uParsed.argument);
    return op;
};

const recBin = bParsed => {
    let bin = recParse(bParsed.left);
    bin+= bParsed.operator;
    bin += recParse(bParsed.right);
    return bin;
};

const recMemb = memParsed => {
    //console.log(memParsed.object);
    //console.log(memParsed.property);
    return recParse(memParsed.object) + '[' + recParse(memParsed.property) + ']';
};

const retIdent = parsed => {
    if(checkV)
        return varToInt[parsed.name];
    else
        return parsed.name;
};

const retLit = parsed => {return parsed.value;};

function recWhile(parsed) {
    let nVer = {type:'operation', text:'NULL', child:null, nChild:null, index:index,color:null,final_index:''};
    let ver = {type:'condition', text:null, child:null, nChild:null, index:index,color:null,final_index:'',check_value:null};
    index++;
    ver.text = 'while'+ recParse(parsed.test);
    ver.check_value = true;
    nStack.push(nVer);
    let child = recParse(ver.body,ver.index);
    if(typeof ver === 'object')
        ver.child = child;
    else if(!child.includes('text'))
        ver.child = {type:'operation', text:child, child:null, nChild:null, index:index,color:null,final_index:''};
    else
        ver.child = JSON.parse(child);
    index++;
    nVer.child = ver;
    return JSON.stringify(nVer);
}

function recReturn(parsed) {
    return 'return '+recParse(parsed.argument);
}


function recExpres(parsed, args) {
    return recParse(parsed.expression,args);
}



/* eslint-disable max-lines-per-function*/
const recParse= (parsed, args = [1, 2, 3]) =>{
    if(parsed === null || parsed === undefined)
        return '';
    else{
        //console.log(parsed);
        //console.log(parsed.type);
        switch (parsed.type) {
        case 'Program':
            return recProgram(parsed,args);
        case 'BlockStatement':
            return recBlock(parsed,args);
        case 'IfStatement':
            return recIf(parsed,args);
        case 'WhileStatement':
            return recWhile(parsed);
        case 'FunctionDeclaration':
            return recFuncDec(parsed,args);
        case 'VariableDeclarator':
            return vDeclirator(parsed);
        case 'VariableDeclaration':
            return vDecliration(parsed);
        case 'AssignmentExpression':
            return recAssign(parsed,args);
        case 'UnaryExpression':
            return recUnary(parsed);
        case 'BinaryExpression':
            return recBin(parsed);
        case 'MemberExpression':
            return recMemb(parsed);
        case 'Literal':
            return retLit(parsed);
        case 'Identifier':
            return retIdent(parsed);
        case 'ReturnStatement':
            return recReturn(parsed);
        case 'ExpressionStatement':
            return recExpres(parsed,args);
        default:
            return graph;
        }
    }
};

function recBlock(parsed, args) {
    let sum_string = '';
    let temp1 = JSON.stringify(tmpGraph);
    let temp2 = JSON.stringify(tmpCurVer);
    tmpGraph = null;
    tmpCurVer = null;
    for (let i = 0; i < parsed.body.length; i++) {
        let temp = recParse(parsed.body[i],args);
        try{
            temp = JSON.parse(temp);
            if (sum_string !== ''){
                addVertexToGraph({type:'operation',text:sum_string ,child:null , nChild:null,index:index, color:null,final_index:'',while_index:args});
                index++;
                sum_string = '';
            }
            if(tmpCurVer !== undefined && tmpCurVer.type === 'condition')
                tmpGraph = connect_leaves_to_final(temp,tmpGraph);
            else
                addVertexToGraph(temp);
        } catch(err){
            sum_string += temp;
        }
    } if(sum_string !== '') {
        let lastVer = {type:'operation',text:sum_string ,child:null , nChild:null,index:index,color:null,final_index:'',while_index:args};
        tmpGraph = connect_leaves_to_final(lastVer,tmpGraph);
        index++;
    }
    let temp3 = tmpGraph;
    // console.log('tmp graph:');
    // console.log(tmpGraph);
    // console.log('tmp current vertex: ');
    // console.log(tmpCurVer);
    tmpGraph = JSON.parse(temp1);
    tmpCurVer = JSON.parse(temp2);
    return temp3;
}



function addVertexToGraph(vertex) {
    if(tmpGraph === null)
    {
        tmpGraph = vertex;
        tmpCurVer = vertex;
    }
    else {
        tmpCurVer.child = vertex;
        if(vertex.text === 'NULL')
            tmpCurVer = vertex.child;
        else
            tmpCurVer = vertex;
    }
    return vertex;
}
let nVer;
function connect_leaves_to_final(vertex, g) {
    if(g === null)
        return vertex;
    if(g.child === null && g.nChild === null)
        if ((nVer === null && nStack.length === 0) || g.while_index === vertex.while_index)
            g.child = vertex;
        else{
            if(nVer === null)
                try {
                    nVer = nStack.pop();
                }
                catch(err)
                {
                    nVer = null;
                }
            g.child = nVer;
        }
    return g;
}
//
// const addToTable = (line, type, name, value) => {
//     list.push([line,type,name,value]);
// };
export {parseCode, recParse,retLit,retIdent,recProgram,recReturn,recWhile,recMemb};
