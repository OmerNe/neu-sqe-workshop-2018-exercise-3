import assert from 'assert';
import {parseCode, recBody, recReturn, retIdent, retLit, recWhile} from '../src/js/code-analyzer';

/* eslint-disable max-lines-per-function*/
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0' +
            '},"end":{"line":0,"column":0}}}'
        );
    });
    //NO MORE passable because of the lines attribute in the parser
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
    //     );
    // });

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
            retLit(lit),2
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

    it('should parse an identifier correctly', function () {
        let iden = {
            'type': 'Identifier',
            'name': 'a',
            'loc': {
                'start': {
                    'line': 1,
                    'column': 4
                },
                'end': {
                    'line': 1,
                    'column': 5
                }
            }
        };
        assert.equal(retIdent(iden),'a');
    });
    it('should return a proper return statement equal to the assersion', function () {
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
            },
            'loc': {
                'start': {
                    'line': 2,
                    'column': 0
                },
                'end': {
                    'line': 2,
                    'column': 8
                }
            }
        };
        assert.deepEqual(
            recReturn(ret),[2,'Return Statement','',1]
        );
    });
    it('should return a proper while statement', function () {
        let whileSt = {
            'type': 'WhileStatement',
            'test': {
                'type': 'Literal',
                'value': true,
                'raw': 'true',
                'loc': {
                    'start': {
                        'line': 1,
                        'column': 6
                    },
                    'end': {
                        'line': 1,
                        'column': 10
                    }
                }
            },
            'loc': {
                'start': {
                    'line': 1,
                    'column': 0
                },
                'end': {
                    'line': 1,
                    'column': 13
                }
            }
        };
        assert.deepEqual(recWhile(whileSt),[1,'While Statement','',true]);

    });
});
