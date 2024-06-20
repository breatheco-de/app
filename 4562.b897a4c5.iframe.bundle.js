"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[4562],{"./node_modules/@codemirror/legacy-modes/mode/modelica.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function words(str){for(var obj={},words=str.split(" "),i=0;i<words.length;++i)obj[words[i]]=!0;return obj}__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{modelica:()=>modelica});var keywords=words("algorithm and annotation assert block break class connect connector constant constrainedby der discrete each else elseif elsewhen encapsulated end enumeration equation expandable extends external false final flow for function if import impure in initial inner input loop model not operator or outer output package parameter partial protected public pure record redeclare replaceable return stream then true type when while within"),builtin=words("abs acos actualStream asin atan atan2 cardinality ceil cos cosh delay div edge exp floor getInstanceName homotopy inStream integer log log10 mod pre reinit rem semiLinear sign sin sinh spatialDistribution sqrt tan tanh"),atoms=words("Real Boolean Integer String"),completions=[].concat(Object.keys(keywords),Object.keys(builtin),Object.keys(atoms)),isSingleOperatorChar=/[;=\(:\),{}.*<>+\-\/^\[\]]/,isDoubleOperatorChar=/(:=|<=|>=|==|<>|\.\+|\.\-|\.\*|\.\/|\.\^)/,isDigit=/[0-9]/,isNonDigit=/[_a-zA-Z]/;function tokenLineComment(stream,state){return stream.skipToEnd(),state.tokenize=null,"comment"}function tokenBlockComment(stream,state){for(var ch,maybeEnd=!1;ch=stream.next();){if(maybeEnd&&"/"==ch){state.tokenize=null;break}maybeEnd="*"==ch}return"comment"}function tokenString(stream,state){for(var ch,escaped=!1;null!=(ch=stream.next());){if('"'==ch&&!escaped){state.tokenize=null,state.sol=!1;break}escaped=!escaped&&"\\"==ch}return"string"}function tokenIdent(stream,state){for(stream.eatWhile(isDigit);stream.eat(isDigit)||stream.eat(isNonDigit););var cur=stream.current();return!state.sol||"package"!=cur&&"model"!=cur&&"when"!=cur&&"connector"!=cur?state.sol&&"end"==cur&&state.level>0&&state.level--:state.level++,state.tokenize=null,state.sol=!1,keywords.propertyIsEnumerable(cur)?"keyword":builtin.propertyIsEnumerable(cur)?"builtin":atoms.propertyIsEnumerable(cur)?"atom":"variable"}function tokenQIdent(stream,state){for(;stream.eat(/[^']/););return state.tokenize=null,state.sol=!1,stream.eat("'")?"variable":"error"}function tokenUnsignedNumber(stream,state){return stream.eatWhile(isDigit),stream.eat(".")&&stream.eatWhile(isDigit),(stream.eat("e")||stream.eat("E"))&&(stream.eat("-")||stream.eat("+"),stream.eatWhile(isDigit)),state.tokenize=null,state.sol=!1,"number"}const modelica={name:"modelica",startState:function(){return{tokenize:null,level:0,sol:!0}},token:function(stream,state){if(null!=state.tokenize)return state.tokenize(stream,state);if(stream.sol()&&(state.sol=!0),stream.eatSpace())return state.tokenize=null,null;var ch=stream.next();if("/"==ch&&stream.eat("/"))state.tokenize=tokenLineComment;else if("/"==ch&&stream.eat("*"))state.tokenize=tokenBlockComment;else{if(isDoubleOperatorChar.test(ch+stream.peek()))return stream.next(),state.tokenize=null,"operator";if(isSingleOperatorChar.test(ch))return state.tokenize=null,"operator";if(isNonDigit.test(ch))state.tokenize=tokenIdent;else if("'"==ch&&stream.peek()&&"'"!=stream.peek())state.tokenize=tokenQIdent;else if('"'==ch)state.tokenize=tokenString;else{if(!isDigit.test(ch))return state.tokenize=null,"error";state.tokenize=tokenUnsignedNumber}}return state.tokenize(stream,state)},indent:function(state,textAfter,cx){if(null!=state.tokenize)return null;var level=state.level;return/(algorithm)/.test(textAfter)&&level--,/(equation)/.test(textAfter)&&level--,/(initial algorithm)/.test(textAfter)&&level--,/(initial equation)/.test(textAfter)&&level--,/(end)/.test(textAfter)&&level--,level>0?cx.unit*level:0},languageData:{commentTokens:{line:"//",block:{open:"/*",close:"*/"}},autocomplete:completions}}}}]);