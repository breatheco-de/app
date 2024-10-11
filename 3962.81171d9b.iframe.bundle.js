"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[3962],{"./node_modules/@codemirror/legacy-modes/mode/ttcn-cfg.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function words(str){for(var obj={},words=str.split(" "),i=0;i<words.length;++i)obj[words[i]]=!0;return obj}__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{ttcnCfg:()=>ttcnCfg});const parserConfig={name:"ttcn-cfg",keywords:words("Yes No LogFile FileMask ConsoleMask AppendFile TimeStampFormat LogEventTypes SourceInfoFormat LogEntityName LogSourceInfo DiskFullAction LogFileNumber LogFileSize MatchingHints Detailed Compact SubCategories Stack Single None Seconds DateTime Time Stop Error Retry Delete TCPPort KillTimer NumHCs UnixSocketsEnabled LocalAddress"),fileNCtrlMaskOptions:words("TTCN_EXECUTOR TTCN_ERROR TTCN_WARNING TTCN_PORTEVENT TTCN_TIMEROP TTCN_VERDICTOP TTCN_DEFAULTOP TTCN_TESTCASE TTCN_ACTION TTCN_USER TTCN_FUNCTION TTCN_STATISTICS TTCN_PARALLEL TTCN_MATCHING TTCN_DEBUG EXECUTOR ERROR WARNING PORTEVENT TIMEROP VERDICTOP DEFAULTOP TESTCASE ACTION USER FUNCTION STATISTICS PARALLEL MATCHING DEBUG LOG_ALL LOG_NOTHING ACTION_UNQUALIFIED DEBUG_ENCDEC DEBUG_TESTPORT DEBUG_UNQUALIFIED DEFAULTOP_ACTIVATE DEFAULTOP_DEACTIVATE DEFAULTOP_EXIT DEFAULTOP_UNQUALIFIED ERROR_UNQUALIFIED EXECUTOR_COMPONENT EXECUTOR_CONFIGDATA EXECUTOR_EXTCOMMAND EXECUTOR_LOGOPTIONS EXECUTOR_RUNTIME EXECUTOR_UNQUALIFIED FUNCTION_RND FUNCTION_UNQUALIFIED MATCHING_DONE MATCHING_MCSUCCESS MATCHING_MCUNSUCC MATCHING_MMSUCCESS MATCHING_MMUNSUCC MATCHING_PCSUCCESS MATCHING_PCUNSUCC MATCHING_PMSUCCESS MATCHING_PMUNSUCC MATCHING_PROBLEM MATCHING_TIMEOUT MATCHING_UNQUALIFIED PARALLEL_PORTCONN PARALLEL_PORTMAP PARALLEL_PTC PARALLEL_UNQUALIFIED PORTEVENT_DUALRECV PORTEVENT_DUALSEND PORTEVENT_MCRECV PORTEVENT_MCSEND PORTEVENT_MMRECV PORTEVENT_MMSEND PORTEVENT_MQUEUE PORTEVENT_PCIN PORTEVENT_PCOUT PORTEVENT_PMIN PORTEVENT_PMOUT PORTEVENT_PQUEUE PORTEVENT_STATE PORTEVENT_UNQUALIFIED STATISTICS_UNQUALIFIED STATISTICS_VERDICT TESTCASE_FINISH TESTCASE_START TESTCASE_UNQUALIFIED TIMEROP_GUARD TIMEROP_READ TIMEROP_START TIMEROP_STOP TIMEROP_TIMEOUT TIMEROP_UNQUALIFIED USER_UNQUALIFIED VERDICTOP_FINAL VERDICTOP_GETVERDICT VERDICTOP_SETVERDICT VERDICTOP_UNQUALIFIED WARNING_UNQUALIFIED"),externalCommands:words("BeginControlPart EndControlPart BeginTestCase EndTestCase"),multiLineStrings:!0};var curPunc,keywords=parserConfig.keywords,fileNCtrlMaskOptions=parserConfig.fileNCtrlMaskOptions,externalCommands=parserConfig.externalCommands,multiLineStrings=parserConfig.multiLineStrings,indentStatements=!1!==parserConfig.indentStatements,isOperatorChar=/[\|]/;function tokenBase(stream,state){var ch=stream.next();if('"'==ch||"'"==ch)return state.tokenize=function tokenString(quote){return function(stream,state){for(var next,escaped=!1,end=!1;null!=(next=stream.next());){if(next==quote&&!escaped){var afterNext=stream.peek();afterNext&&("b"!=(afterNext=afterNext.toLowerCase())&&"h"!=afterNext&&"o"!=afterNext||stream.next()),end=!0;break}escaped=!escaped&&"\\"==next}return(end||!escaped&&!multiLineStrings)&&(state.tokenize=null),"string"}}(ch),state.tokenize(stream,state);if(/[:=]/.test(ch))return curPunc=ch,"punctuation";if("#"==ch)return stream.skipToEnd(),"comment";if(/\d/.test(ch))return stream.eatWhile(/[\w\.]/),"number";if(isOperatorChar.test(ch))return stream.eatWhile(isOperatorChar),"operator";if("["==ch)return stream.eatWhile(/[\w_\]]/),"number";stream.eatWhile(/[\w\$_]/);var cur=stream.current();return keywords.propertyIsEnumerable(cur)?"keyword":fileNCtrlMaskOptions.propertyIsEnumerable(cur)?"atom":externalCommands.propertyIsEnumerable(cur)?"deleted":"variable"}function Context(indented,column,type,align,prev){this.indented=indented,this.column=column,this.type=type,this.align=align,this.prev=prev}function pushContext(state,col,type){var indent=state.indented;return state.context&&"statement"==state.context.type&&(indent=state.context.indented),state.context=new Context(indent,col,type,null,state.context)}function popContext(state){var t=state.context.type;return")"!=t&&"]"!=t&&"}"!=t||(state.indented=state.context.indented),state.context=state.context.prev}const ttcnCfg={name:"ttcn",startState:function(){return{tokenize:null,context:new Context(0,0,"top",!1),indented:0,startOfLine:!0}},token:function(stream,state){var ctx=state.context;if(stream.sol()&&(null==ctx.align&&(ctx.align=!1),state.indented=stream.indentation(),state.startOfLine=!0),stream.eatSpace())return null;curPunc=null;var style=(state.tokenize||tokenBase)(stream,state);if("comment"==style)return style;if(null==ctx.align&&(ctx.align=!0),";"!=curPunc&&":"!=curPunc&&","!=curPunc||"statement"!=ctx.type)if("{"==curPunc)pushContext(state,stream.column(),"}");else if("["==curPunc)pushContext(state,stream.column(),"]");else if("("==curPunc)pushContext(state,stream.column(),")");else if("}"==curPunc){for(;"statement"==ctx.type;)ctx=popContext(state);for("}"==ctx.type&&(ctx=popContext(state));"statement"==ctx.type;)ctx=popContext(state)}else curPunc==ctx.type?popContext(state):indentStatements&&(("}"==ctx.type||"top"==ctx.type)&&";"!=curPunc||"statement"==ctx.type&&"newstatement"==curPunc)&&pushContext(state,stream.column(),"statement");else popContext(state);return state.startOfLine=!1,style},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"#"}}}}}]);