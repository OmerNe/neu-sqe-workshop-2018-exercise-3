import * as esprima from 'esprima';
let list;
let funcArgDic = {};
let deltLines = [];
let otherDictDirty = {};
let otherDict = {};
let isDirty = false;
let replaceIfs = {};
const parseCode = (codeToParse) => {
    list = [];
    return esprima.parseScript(codeToParse,{loc: true});
    //The "loc: true" attribute saved me a other few people i told them about it :)

};

const recBody = parsed => {
    for(let i = 0;i<parsed.body.length;i++)
    {
        recParse(parsed.body[i]);
    }
    return '';
};

let enterIf = true;
let ifBool = {};
const recIf = parsed => {
    addToTable(parsed.loc.start.line,'If Statement',recParse(parsed.test),'');
    recParse(parsed.consequent);


    isDirty = false;
    let test = recParse(parsed.test);
    isDirty = true;
    replaceIfs[parsed.loc.start.line] = 'if('+test+'){';

    let resultTest = eval(recParse(test))
    if(resultTest && enterIf)
    {
        ifBool[parsed.loc.start.line] = true;
        enterIf = false;
    }
    else
        ifBool[parsed.loc.start.line] = false;

    let tmp_dirty = JSON.parse(JSON.stringify(otherDictDirty));
    let tmp_clean = JSON.parse(JSON.stringify(otherDict));
    recParse(parsed.consequent);
    otherDict = JSON.parse(JSON.stringify(tmp_clean));
    otherDictDirty = JSON.parse(JSON.stringify(tmp_dirty));

    if(parsed.alternate != null)
        recParse(parsed.alternate);
    else
        enterIf = true;
    return replaceIfs[parsed.test.loc.start.line];
};

const recFor = forParsed => {
    addToTable(forParsed.loc.start.line, 'For Statement',recParse(forParsed.test),recParse(forParsed.update));
    recParse(forParsed.body);
};

const recFuncDec = funcParsed => {
    let line = funcParsed.loc.start.line;
    addToTable(line, 'Function Declaration',funcParsed.id.name,'');
    for (let i = 0; i < funcParsed.params.length; i++) {
        addToTable(line,'Param',recParse(funcParsed.params[i]),'');
    }
    recParse(funcParsed.body);
};

const vDeclirator = vParsed => {
    addToTable(vParsed.loc.start.line,'Variable Declarator',vParsed.id.name
        ,recParse(vParsed.init));
};

const vDecliration = vParsed => {
    for (let i = 0; i < vParsed.declarations.length; i++) {
        //the declarators
        recParse(vParsed.declarations[i]);
    }

};

const recAssign = assParsed => {
    let left = assParsed.left.name;
    // let right = recParse(assParsed.right);
    // addToTable(assParsed.loc.start.line, 'Assignment Expression',left,right);
    // return left +'='+right;
    if(left in funcArgDic)
        funcArgDic[left] = recParse(assParsed.right);
    else{
        isDirty = true;
        otherDict[left] = recParse(assParsed.right);
        isDirty = false;
        try {
            otherDict[left] = eval(assParsed.right)
        }
        catch (e) {
            otherDict[left] = recParse(assParsed.right);
        }
        if(!(left in funcArgDic))
            deltLines.push(assParsed.loc.start.line);
        else
            replaceIfs[assParsed.loc.start.line] = left + otherDict[left];
    }
    return otherDict[left];

};

const recUnary = uParsed => {
    let op = recParse(uParsed.left);
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
    let s = recParse(memParsed.object) + '[' + recParse(memParsed.property) + ']';
    return s;
};

const retIdent = parsed => {
    let isInFucnArg = funcArgDic.hasOwnProperty(parsed.name);
    if(!isInFucnArg)
        if(isDirty)
            return otherDictDirty[parsed.name];
        else
            return otherDict[parsed.name];

    if(!isDirty)
        return funcArgDic[parsed.name];
    return parsed.name;
};

const retLit = parsed => {return parsed.value;};

function recWhile(parsed) {
    addToTable(parsed.loc.start.line,'While Statement','',recParse(parsed.test));
    recParse(parsed.body);
    return [parsed.loc.start.line,'While Statement','',recParse(parsed.test)];
}

function recReturn(parsed) {
    addToTable(parsed.loc.start.line,'Return Statement','',recParse(parsed.argument));
    if(parsed.argument == null)
        return [parsed.loc.start.line,'Return Statement','',''];
    return [parsed.loc.start.line,'Return Statement','',recParse(parsed.argument)]; //for testing
}

function initEval(parsed, parameters) {
    let body  = parsed.body;
    let check = '';
    for (let i = 0; i <body.length ; i++) {
        if(body[i].type === 'FunctionDeclaration') {
            for (let j = 0; j < body[j].params.name[j] ; j++) {
                funcArgDic[body[i].params[j].name] = parameters[j];
                check += funcArgDic[body[i].params[j].name]=parameters[j];
            }
        }
        if (body[i].type === 'VariableDeclaration'){
            for (let j = 0; j < body[i].declarations.length; j++) {
                funcArgDic[body[i].declarations[j].id.name] = body[i].declarations[j].init.value;
            }
        }
    }
    return check;
}

/* eslint-disable max-lines-per-function*/
const recParse= (parsed, params = [1, 2, 3]) =>{
    if(parsed == null)
        return '';
    else{
        switch (parsed.type) {
        case 'Program':
        {
            initEval(parsed, params);
            recBody(parsed);
            return list;//the end
        }
        case 'BlockStatement':
            recBody(parsed);
            break;
        case 'IfStatement':
            recIf(parsed);
            break;
        case 'ForStatement':
            recFor(parsed);
            break;
        case 'WhileStatement':
            recWhile(parsed);
            break;
        case 'FunctionDeclaration':
            recFuncDec(parsed);
            break;
        case 'VariableDeclarator':
            vDeclirator(parsed);
            break;
        case 'VariableDeclaration':
            vDecliration(parsed);
            break;
        case 'AssignmentExpression':
            return recAssign(parsed);
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
        default:
            return 'error';
        }
    }
};

const addToTable = (line, type, name, value) => {
    list.push([line,type,name,value]);
};
export {parseCode, recParse,recFor,retLit,retIdent,recBody,recReturn,recWhile,recMemb};
