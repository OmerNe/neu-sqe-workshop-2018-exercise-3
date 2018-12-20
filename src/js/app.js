import $ from 'jquery';
import {parseCode, recParse} from './code-analyzer';
import {prossessLines} from './lineProcessing';

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
        let resultLines = prossessLines(codeToParse,JSON.parse(parseProc[0]),
            JSON.parse(parsedCode[1]),JSON.parse(parseProc[2]));
        $('parsdeCode').html(resultLines);

    });
    // function fillTable(list) {
    //     let table = $('#resultTable > tbody');
    //     for (let i = 0; i < list.length; i++) {
    //         let tr = document.createElement('TR');
    //         table.append(tr);
    //         for (let j = 0; j < list[i].length; j++) {
    //             let td = document.createElement('TD');
    //             td.innerHTML = list[i][j];
    //             tr.appendChild(td);
    //
    //         }
    //     }
    // }
});

