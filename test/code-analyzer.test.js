import assert from 'assert';
import {parseCode, recBody, recReturn, retIdent} from '../src/js/code-analyzer';

/* eslint-disable max-lines-per-function*/
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });

    it('is parsing a literal correctly',()=>{
        let lit = {
            'type': 'Literal',
            'value': 2,
            'raw': '2',
            'loc': {
                'start': {
                    'line': 4,
                    'column': 8
                },
                'end': {
                    'line': 4,
                    'column': 9
                }
            }
        };
        assert.equal(
            retIdent(lit),2
        );
    });

    it('should ignore an empty block statement', function () {
        let block = {
            'type': 'BlockStatement',
            'body': [],
            'loc': {
                'start': {
                    'line': 1,
                    'column': 0
                },
                'end': {
                    'line': 1,
                    'column': 2
                }
            }
        };
        assert.equal(
            recBody(block),''
        );
    });
    it('should return a proper retrun statement equal to the assersion', function () {
        let ret = {
            'type': 'ReturnStatement',
            'argument': {
                'type': 'Literal',
                'value': 1,
                'raw': '1',
                'loc': {
                    'start': {
                        'line': 2,
                        'column': 7
                    },
                    'end': {
                        'line': 2,
                        'column': 8
                    }
                }
            }
        };
        assert.equal(
            recReturn(ret),[2,'Return Statement','',1]
        );
    });
});
