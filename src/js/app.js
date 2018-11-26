import $ from 'jquery';
import {parseCode, recParse} from './code-analyzer';


function debug()
{
    let notShowTable = false;
    if(notShowTable)
    {
        $('#parsedCode').show();
        $('#resultTable').hide();
    }
    else
    {
        $('#parsedCode').hide();
        $('#resultTable').show();
    }
}

$(document).ready(function () {
    debug();
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        if(!notShowTable){
            $('#resultTable > tbody').empty();
            let list = recParse(parsedCode);
            fillTable(list);
        }

    });
    function fillTable(list) {
        let table = $('#resultTable > tbody');
        for (let i = 0; i < list.length; i++) {
            let tr = document.createElement('TR');
            table.append(tr);
            for (let j = 0; j < list[i].length; j++) {
                let td = document.createElement('TD');
                td.innerHTML = list[i][j];
                tr.appendChild(td);

            }
        }
    }
});

