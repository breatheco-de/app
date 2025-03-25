"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[8804],{"./node_modules/@chakra-ui/button/dist/chunk-NAA7TEES.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{z:()=>Button});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");var dist=__webpack_require__("./node_modules/@chakra-ui/react-context/dist/index.mjs"),[ButtonGroupProvider,useButtonGroup]=(0,dist.k)({strict:!1,name:"ButtonGroupContext"}),chunk_3LE6AY5Q=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),shared_utils_dist=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js");function ButtonIcon(props){const{children,className,...rest}=props,_children=(0,react.isValidElement)(children)?(0,react.cloneElement)(children,{"aria-hidden":!0,focusable:!1}):children,_className=(0,shared_utils_dist.cx)("chakra-button__icon",className);return(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.span,{display:"inline-flex",alignSelf:"center",flexShrink:0,...rest,className:_className,children:_children})}ButtonIcon.displayName="ButtonIcon";var chunk_NO6MRLPK=__webpack_require__("./node_modules/@chakra-ui/spinner/dist/chunk-NO6MRLPK.mjs");function ButtonSpinner(props){const{label,placement,spacing="0.5rem",children=(0,jsx_runtime.jsx)(chunk_NO6MRLPK.$,{color:"currentColor",width:"1em",height:"1em"}),className,__css,...rest}=props,_className=(0,shared_utils_dist.cx)("chakra-button__spinner",className),marginProp="start"===placement?"marginEnd":"marginStart",spinnerStyles=(0,react.useMemo)((()=>({display:"flex",alignItems:"center",position:label?"relative":"absolute",[marginProp]:label?spacing:0,fontSize:"1em",lineHeight:"normal",...__css})),[__css,label,marginProp,spacing]);return(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.div,{className:_className,...rest,__css:spinnerStyles,children})}ButtonSpinner.displayName="ButtonSpinner";var react_use_merge_refs_dist=__webpack_require__("./node_modules/@chakra-ui/react-use-merge-refs/dist/index.mjs"),chunk_QEVFQ4EU=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),chunk_T2VHL7RE=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-T2VHL7RE.mjs"),styled_system_dist=__webpack_require__("./node_modules/@chakra-ui/styled-system/dist/index.mjs"),Button=(0,chunk_QEVFQ4EU.G)(((props,ref)=>{const group=useButtonGroup(),styles=(0,chunk_T2VHL7RE.mq)("Button",{...group,...props}),{isDisabled=null==group?void 0:group.isDisabled,isLoading,isActive,children,leftIcon,rightIcon,loadingText,iconSpacing="0.5rem",type,spinner,spinnerPlacement="start",className,as,...rest}=(0,styled_system_dist.Lr)(props),buttonStyles=(0,react.useMemo)((()=>{const _focus={...null==styles?void 0:styles._focus,zIndex:1};return{display:"inline-flex",appearance:"none",alignItems:"center",justifyContent:"center",userSelect:"none",position:"relative",whiteSpace:"nowrap",verticalAlign:"middle",outline:"none",...styles,...!!group&&{_focus}}}),[styles,group]),{ref:_ref,type:defaultType}=function useButtonType(value){const[isButton,setIsButton]=(0,react.useState)(!value);return{ref:(0,react.useCallback)((node=>{node&&setIsButton("BUTTON"===node.tagName)}),[]),type:isButton?"button":void 0}}(as),contentProps={rightIcon,leftIcon,iconSpacing,children};return(0,jsx_runtime.jsxs)(chunk_3LE6AY5Q.m.button,{ref:(0,react_use_merge_refs_dist.qq)(ref,_ref),as,type:null!=type?type:defaultType,"data-active":(0,shared_utils_dist.PB)(isActive),"data-loading":(0,shared_utils_dist.PB)(isLoading),__css:buttonStyles,className:(0,shared_utils_dist.cx)("chakra-button",className),...rest,disabled:isDisabled||isLoading,children:[isLoading&&"start"===spinnerPlacement&&(0,jsx_runtime.jsx)(ButtonSpinner,{className:"chakra-button__spinner--start",label:loadingText,placement:"start",spacing:iconSpacing,children:spinner}),isLoading?loadingText||(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.span,{opacity:0,children:(0,jsx_runtime.jsx)(ButtonContent,{...contentProps})}):(0,jsx_runtime.jsx)(ButtonContent,{...contentProps}),isLoading&&"end"===spinnerPlacement&&(0,jsx_runtime.jsx)(ButtonSpinner,{className:"chakra-button__spinner--end",label:loadingText,placement:"end",spacing:iconSpacing,children:spinner})]})}));function ButtonContent(props){const{leftIcon,rightIcon,children,iconSpacing}=props;return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[leftIcon&&(0,jsx_runtime.jsx)(ButtonIcon,{marginEnd:iconSpacing,children:leftIcon}),children,rightIcon&&(0,jsx_runtime.jsx)(ButtonIcon,{marginStart:iconSpacing,children:rightIcon})]})}Button.displayName="Button"},"./node_modules/@chakra-ui/layout/dist/chunk-MPFPK3CX.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{k:()=>Flex});var _chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),Flex=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__.G)((function Flex2(props,ref){const{direction,align,justify,wrap,basis,grow,shrink,...rest}=props,styles={display:"flex",flexDirection:direction,alignItems:align,justifyContent:justify,flexWrap:wrap,flexBasis:basis,flexGrow:grow,flexShrink:shrink};return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__.m.div,{ref,__css:styles,...rest})}));Flex.displayName="Flex"},"./src/stories/DottedTimeline.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,default:()=>DottedTimeline_stories});var defineProperty=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/defineProperty.js"),chunk_MPFPK3CX=__webpack_require__("./node_modules/@chakra-ui/layout/dist/chunk-MPFPK3CX.mjs"),chunk_WPAIWTI3=__webpack_require__("./node_modules/@chakra-ui/avatar/dist/chunk-WPAIWTI3.mjs"),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),prop_types=__webpack_require__("./node_modules/prop-types/index.js"),prop_types_default=__webpack_require__.n(prop_types),chunk_6CSUKJP7=__webpack_require__("./node_modules/@chakra-ui/layout/dist/chunk-6CSUKJP7.mjs"),chunk_HEDGDMHJ=__webpack_require__("./node_modules/@chakra-ui/tooltip/dist/chunk-HEDGDMHJ.mjs"),Text=__webpack_require__("./src/common/components/Text.jsx"),useStyle=__webpack_require__("./src/common/hooks/useStyle.js");const hooks_useGrabToScroll=function useGrabToScroll(_ref){var ref=_ref.ref,vertical=_ref.vertical,horizontal=_ref.horizontal,_useState=(0,react.useState)(!1),isScrollable=_useState[0],setIsScrollable=_useState[1],_useState2=(0,react.useState)(!1),isContentScrollable=_useState2[0],setIsContentScrollable=_useState2[1],position={top:0,left:0,x:0,y:0},container=ref.current,rect=null==container?void 0:container.getBoundingClientRect(),isVerticalScrollable=(null==container?void 0:container.scrollHeight)>(null==rect?void 0:rect.height),isHorizontalScrollable=(null==container?void 0:container.scrollWidth)>(null==rect?void 0:rect.width);if((0,react.useEffect)((function(){var scrollable=isVerticalScrollable||isHorizontalScrollable;setIsScrollable(scrollable),setIsContentScrollable(scrollable)}),[isVerticalScrollable,isHorizontalScrollable]),"undefined"!=typeof document){var mouseMoveHandler=function mouseMoveHandler(e){var dx=e.clientX-position.x,dy=e.clientY-position.y;vertical&&isVerticalScrollable&&(container.scrollTop=position.top-dy,container.scrollTop<=(null==container?void 0:container.scrollHeight)-(rect.height+1)?setIsScrollable(!0):setIsScrollable(!1)),horizontal&&isHorizontalScrollable&&(container.scrollLeft=position.left-dx,container.scrollLeft<=(null==container?void 0:container.scrollWidth)-(rect.width+1)?setIsScrollable(!0):setIsScrollable(!1))},mouseUpHandler=function mouseUpHandler(){document.removeEventListener("mousemove",mouseMoveHandler),document.removeEventListener("mouseup",mouseUpHandler),container.style&&(container.style.cursor="grab",container.style.removeProperty("user-select"))};return{grabToScroll:function grabToScroll(e){null!=container&&container.style&&(isContentScrollable?(container.style.cursor="grabbing",container.style.userSelect="none",position={left:container.scrollLeft,top:container.scrollTop,x:e.clientX,y:e.clientY},document.addEventListener("mousemove",mouseMoveHandler),document.addEventListener("mouseup",mouseUpHandler),document.addEventListener("mouseleave",mouseUpHandler)):(container.style.cursor="default",container.style.userSelect="none"))},isScrollable}}return{grabToScroll:function grabToScroll(){},isScrollable}};var esm_extends=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/extends.js"),objectWithoutProperties=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js");function _taggedTemplateLiteral(strings,raw){return raw||(raw=strings.slice(0)),Object.freeze(Object.defineProperties(strings,{raw:{value:Object.freeze(raw)}}))}var _templateObject,_templateObject2,_templateObject3,motion=__webpack_require__("./node_modules/framer-motion/dist/es/render/dom/motion.mjs"),AnimatePresence=__webpack_require__("./node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs"),chunk_NAA7TEES=__webpack_require__("./node_modules/@chakra-ui/button/dist/chunk-NAA7TEES.mjs"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),chunk_TPBRUKW6=__webpack_require__("./node_modules/@chakra-ui/tabs/dist/chunk-TPBRUKW6.mjs"),chunk_YTV6DHKL=__webpack_require__("./node_modules/@chakra-ui/layout/dist/chunk-YTV6DHKL.mjs"),Icon=__webpack_require__("./src/common/components/Icon/index.jsx"),_excluded=["children","isScrollable"],_excluded2=["children","onClick","top","bottom","left","right","style"],_excluded3=["data","style","index","onMouseLeave"],__jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){(0,defineProperty.Z)(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var MotionBox=(0,motion.E)(chunk_6CSUKJP7.xu),MotionButton=(0,motion.E)(chunk_NAA7TEES.z),MotionAvatar=(0,motion.E)(chunk_WPAIWTI3.q),animateShadow=(0,emotion_react_browser_esm.F4)(_templateObject||(_templateObject=_taggedTemplateLiteral(["\n  0% {\n    box-shadow: 0 0 40px 14px rgb(0 0 0 / 25%);\n  }\n  70% {\n    box-shadow: 0 0 80px 24px rgb(0 0 0 / 40%);\n  }\n  100% {\n    box-shadow: 0 0 40px 14px rgb(0 0 0 / 25%);\n  }\n"]))),animateBreathing=(0,emotion_react_browser_esm.F4)(_templateObject2||(_templateObject2=_taggedTemplateLiteral(["\n  0% {\n    right: 0;\n    transform: scale(1);\n  }\n  50% {\n    right: 10px;\n    transform: scale(1.1);\n  }\n  100% {\n    right: 0%;\n    transform: scale(1);\n  }\n"]))),pulseBlue=(0,emotion_react_browser_esm.F4)(_templateObject3||(_templateObject3=_taggedTemplateLiteral(["\n  0% {\n    box-shadow: 0 0 0 0 rgba(64, 166, 250, 0.5), 0 0 0 0 rgba(77, 225, 241, 0.2), 0 0 0 0 rgba(6, 197, 255, 0.14);\n  }\n\n  70% {\n    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0), 0 0 0 18px rgba(255, 82, 82, 0), 0 0 0 22px rgba(255, 82, 82, 0);\n  }\n\n  100% {\n    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0), 0 0 0 25px rgba(255, 82, 82, 0), 0 0 0 25px rgba(255, 82, 82, 0);\n  }\n"]))),pulseAnimation="".concat(pulseBlue," infinite 2s ease-in-out"),breathAnimation={hidden:{opacity:0},show:{opacity:1,transition:{delayChildren:.5}}};function AnimatedContainer(_ref){var children=_ref.children,isScrollable=_ref.isScrollable,rest=(0,objectWithoutProperties.Z)(_ref,_excluded);return __jsx(chunk_6CSUKJP7.xu,rest,children,__jsx(AnimatePresence.M,null,isScrollable&&__jsx(react.Fragment,null,__jsx(MotionBox,{position:"absolute",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},animation:"".concat(animateShadow," 2s infinite"),top:"0px",right:"0px",width:"0px",height:"25px",boxShadow:"0 0 80px 34px rgb(0 0 0 / 75%)",zIndex:"1",background:"#000000"}),__jsx(MotionBox,{initial:"hidden",animate:"show",exit:"hidden",variants:breathAnimation,animation:"".concat(animateBreathing," 2s infinite"),style:{position:"absolute",top:"4.4px",right:"0px"},zIndex:"1"},__jsx(Icon.Z,{icon:"arrowRight",width:"15px",height:"15px"})))))}function AnimatedButton(_ref2){var children=_ref2.children,onClick=_ref2.onClick,toUppercase=_ref2.toUppercase,rest=_ref2.rest;return __jsx(MotionButton,(0,esm_extends.Z)({whileHover:{scale:1.05},whileTap:{scale:1},variant:"default",onClick},rest,{fontSize:"13px",m:"20px 0",width:"fit-content",letterSpacing:"0.05em",textTransform:toUppercase?"uppercase":""}),children)}function AnimatedAvatar(_ref3){var src=_ref3.src,width=_ref3.width,height=_ref3.height,top=_ref3.top,bottom=_ref3.bottom,left=_ref3.left,right=_ref3.right,style=_ref3.style,onClick=_ref3.onClick;return __jsx(MotionAvatar,{whileHover:{scale:1.05},onClick,whileTap:{scale:.95},src,width,height,style:_objectSpread(_objectSpread({},style),{},{userSelect:"none"}),left,right,top,bottom,position:"absolute",bg:"transparent",zIndex:2})}function CustomTab(_ref4){var children=_ref4.children,onClick=_ref4.onClick,top=_ref4.top,bottom=_ref4.bottom,left=_ref4.left,right=_ref4.right,style=_ref4.style,rest=(0,objectWithoutProperties.Z)(_ref4,_excluded2);return __jsx(chunk_TPBRUKW6.O,(0,esm_extends.Z)({className:"pulse-blue",animation:pulseAnimation,_selected:{backgroundColor:"blue.default",color:"white",animation:"none"},style,p:"20px 0",width:"178px",fontSize:"15px",background:"blue.light",color:"blue.default",onClick,textTransform:"uppercase",position:"absolute",left,right,top,bottom,borderRadius:"22px",fontWeight:"700"},rest),children)}function ShadowCard(_ref5){var data=_ref5.data,style=_ref5.style,index=_ref5.index,onMouseLeave=_ref5.onMouseLeave,rest=(0,objectWithoutProperties.Z)(_ref5,_excluded3);return __jsx(MotionBox,(0,esm_extends.Z)({position:"absolute",boxShadow:"lg"},rest,{onMouseLeave,style,display:"flex",flexDirection:"column",borderRadius:"8px",background:"white",zIndex:0,initial:"hidden",animate:"visible",exit:"hidden",layoutId:"".concat(index,"-").concat(data.fullNameSlug),transition:{duration:.4}}),__jsx(MotionBox,{color:"black",fontSize:"15px",fontWeight:"900",textAlign:"center"},data.fullName),__jsx(chunk_6CSUKJP7.xu,{color:"black",fontSize:"15px",fontWeight:"400",textAlign:"center",letterSpacing:"0.05em"},(null==data?void 0:data.workPosition)||"Ceo @ Globant"),__jsx(chunk_YTV6DHKL.r,{href:"#schedule",variant:"default",fontSize:"15px",fontWeight:"700",letterSpacing:"0.05em",textAlign:"center"},"Schedule a mentoring session"))}AnimatedContainer.displayName="AnimatedContainer",AnimatedButton.displayName="AnimatedButton",AnimatedAvatar.displayName="AnimatedAvatar",CustomTab.displayName="CustomTab",ShadowCard.displayName="ShadowCard",AnimatedButton.propTypes={children:prop_types_default().oneOfType([prop_types_default().arrayOf(prop_types_default().node),prop_types_default().node]).isRequired,key:prop_types_default().string,toUppercase:prop_types_default().bool,rest:prop_types_default().arrayOf(prop_types_default().oneOfType([prop_types_default().any])),onClick:prop_types_default().func},AnimatedContainer.propTypes={children:prop_types_default().oneOfType([prop_types_default().arrayOf(prop_types_default().node),prop_types_default().node]).isRequired,rest:prop_types_default().arrayOf(prop_types_default().oneOfType([prop_types_default().any])),isScrollable:prop_types_default().bool},AnimatedAvatar.propTypes={src:prop_types_default().string,height:prop_types_default().string,width:prop_types_default().string,left:prop_types_default().string,right:prop_types_default().string,top:prop_types_default().string,bottom:prop_types_default().string,style:prop_types_default().objectOf(prop_types_default().oneOfType([prop_types_default().any])),onClick:prop_types_default().func},CustomTab.propTypes={children:prop_types_default().oneOfType([prop_types_default().arrayOf(prop_types_default().node),prop_types_default().node]).isRequired,left:prop_types_default().string,right:prop_types_default().string,top:prop_types_default().string,bottom:prop_types_default().string,onClick:prop_types_default().func,style:prop_types_default().objectOf(prop_types_default().oneOfType([prop_types_default().any]))},ShadowCard.propTypes={data:prop_types_default().objectOf(prop_types_default().oneOfType([prop_types_default().any])),style:prop_types_default().objectOf(prop_types_default().oneOfType([prop_types_default().any])),index:prop_types_default().number,onMouseLeave:prop_types_default().func},CustomTab.defaultProps={left:"",right:"",top:"",bottom:"",onClick:function onClick(){},style:{}},AnimatedButton.defaultProps={key:"1",toUppercase:!1,rest:[],onClick:function onClick(){}},AnimatedContainer.defaultProps={rest:[],isScrollable:!1},AnimatedAvatar.defaultProps={src:"",width:"",height:"",left:"",right:"",top:"",bottom:"",style:{},onClick:function onClick(){}},ShadowCard.defaultProps={data:{},style:{},index:0,onMouseLeave:function onMouseLeave(){}},AnimatedContainer.__docgenInfo={description:"",methods:[],displayName:"AnimatedContainer",props:{rest:{defaultValue:{value:"[]",computed:!1},description:"",type:{name:"arrayOf",value:{name:"union",value:[{name:"any"}]}},required:!1},isScrollable:{defaultValue:{value:"false",computed:!1},description:"",type:{name:"bool"},required:!1},children:{description:"",type:{name:"union",value:[{name:"arrayOf",value:{name:"node"}},{name:"node"}]},required:!0}}},AnimatedButton.__docgenInfo={description:"",methods:[],displayName:"AnimatedButton",props:{key:{defaultValue:{value:"'1'",computed:!1},description:"",type:{name:"string"},required:!1},toUppercase:{defaultValue:{value:"false",computed:!1},description:"",type:{name:"bool"},required:!1},rest:{defaultValue:{value:"[]",computed:!1},description:"",type:{name:"arrayOf",value:{name:"union",value:[{name:"any"}]}},required:!1},onClick:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},children:{description:"",type:{name:"union",value:[{name:"arrayOf",value:{name:"node"}},{name:"node"}]},required:!0}}},AnimatedAvatar.__docgenInfo={description:"",methods:[],displayName:"AnimatedAvatar",props:{src:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},width:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},height:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},left:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},right:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},top:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},bottom:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},style:{defaultValue:{value:"{}",computed:!1},description:"",type:{name:"objectOf",value:{name:"union",value:[{name:"any"}]}},required:!1},onClick:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1}}},CustomTab.__docgenInfo={description:"",methods:[],displayName:"CustomTab",props:{left:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},right:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},top:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},bottom:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},onClick:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1},style:{defaultValue:{value:"{}",computed:!1},description:"",type:{name:"objectOf",value:{name:"union",value:[{name:"any"}]}},required:!1},children:{description:"",type:{name:"union",value:[{name:"arrayOf",value:{name:"node"}},{name:"node"}]},required:!0}}},ShadowCard.__docgenInfo={description:"",methods:[],displayName:"ShadowCard",props:{data:{defaultValue:{value:"{}",computed:!1},description:"",type:{name:"objectOf",value:{name:"union",value:[{name:"any"}]}},required:!1},style:{defaultValue:{value:"{}",computed:!1},description:"",type:{name:"objectOf",value:{name:"union",value:[{name:"any"}]}},required:!1},index:{defaultValue:{value:"0",computed:!1},description:"",type:{name:"number"},required:!1},onMouseLeave:{defaultValue:{value:"() => {}",computed:!1},description:"",type:{name:"func"},required:!1}}};var DottedTimeline_jsx=react.createElement;function DottedTimeline(_ref){var label=_ref.label,dots=_ref.dots,emptyDotsMessage=_ref.emptyDotsMessage,helpText=_ref.helpText,width=_ref.width,onClickDots=_ref.onClickDots,_useStyle=(0,useStyle.Z)(),borderColor=_useStyle.borderColor,fontColor3=_useStyle.fontColor3,fontColor2=_useStyle.fontColor2,tooltipBackground=_useStyle.tooltipBackground,backgroundColor2=_useStyle.backgroundColor2,scrollContainerRef=(0,react.useRef)(null),_useGrabToScroll=hooks_useGrabToScroll({ref:scrollContainerRef,horizontal:!0}),grabToScroll=_useGrabToScroll.grabToScroll,isScrollable=_useGrabToScroll.isScrollable;return DottedTimeline_jsx(chunk_MPFPK3CX.k,{borderRadius:"17px",flexDirection:"column",gridGap:"4px",width,padding:"20px 29px",border:"1px solid",borderColor,background:backgroundColor2},DottedTimeline_jsx(chunk_MPFPK3CX.k,{justifyContent:"space-between",fontWeight:700},DottedTimeline_jsx(Text.Z,{size:"15px",color:fontColor2},label&&label),helpText.length>2&&DottedTimeline_jsx(Text.Z,{size:"md",color:fontColor2},helpText)),DottedTimeline_jsx(AnimatedContainer,{isScrollable:(null==dots?void 0:dots.length)>0&&isScrollable,position:"relative",overflow:"hidden"},DottedTimeline_jsx(chunk_MPFPK3CX.k,{ref:scrollContainerRef,alignItems:"center",className:"hideOverflowX__",height:"25px",onMouseDown:grabToScroll,position:"relative",gridGap:"9px",overflowX:"auto"},(null==dots?void 0:dots.length)>0&&dots.map((function(dot,i){return DottedTimeline_jsx(chunk_6CSUKJP7.xu,{key:dot.label,padding:"5px 0",borderBottom:"2px solid",borderColor:dot.highlight?"yellow.default":"transparent"},DottedTimeline_jsx(chunk_HEDGDMHJ.u,{hasArrow:!0,label:dot.label,placement:"top",color:"gray.250",fontWeight:700,fontSize:"13px",padding:"0 6px",bg:tooltipBackground},DottedTimeline_jsx(chunk_6CSUKJP7.xu,{onClick:function onClick(){return onClickDots&&onClickDots(dot,i)},cursor:onClickDots&&"pointer",background:dot.color,border:dot.borderColor&&"2px solid",borderColor:dot.borderColor,borderRadius:"50%",width:"10px",minW:"10px",height:"10px",minH:"10px"})))})),emptyDotsMessage&&0===(null==dots?void 0:dots.length)&&DottedTimeline_jsx(Text.Z,{size:"md",color:fontColor3},emptyDotsMessage))))}DottedTimeline.displayName="DottedTimeline",DottedTimeline.propTypes={label:prop_types_default().bool,dots:prop_types_default().arrayOf(prop_types_default().oneOfType([prop_types_default().any])),helpText:prop_types_default().string,width:prop_types_default().string,onClickDots:prop_types_default().func,emptyDotsMessage:prop_types_default().string},DottedTimeline.defaultProps={label:!1,dots:[],helpText:"",width:"100%",onClickDots:null,emptyDotsMessage:""},DottedTimeline.__docgenInfo={description:"",methods:[],displayName:"DottedTimeline",props:{label:{defaultValue:{value:"false",computed:!1},description:"",type:{name:"bool"},required:!1},dots:{defaultValue:{value:"[]",computed:!1},description:"",type:{name:"arrayOf",value:{name:"union",value:[{name:"any"}]}},required:!1},helpText:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},width:{defaultValue:{value:"'100%'",computed:!1},description:"",type:{name:"string"},required:!1},onClickDots:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"func"},required:!1},emptyDotsMessage:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1}}};const components_DottedTimeline=DottedTimeline;var _Default$parameters,_Default$parameters2,DottedTimeline_stories_jsx=react.createElement;function DottedTimeline_stories_ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function DottedTimeline_stories_objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?DottedTimeline_stories_ownKeys(Object(t),!0).forEach((function(r){(0,defineProperty.Z)(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):DottedTimeline_stories_ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}const DottedTimeline_stories={title:"Components/DottedTimeline",component:components_DottedTimeline,argTypes:{label:{control:{type:"text"}}}};var Component=function Component(args){return DottedTimeline_stories_jsx(components_DottedTimeline,{width:"".concat(args.width),label:args.label||DottedTimeline_stories_jsx(chunk_MPFPK3CX.k,{gridGap:"10px",alignItems:"center"},DottedTimeline_stories_jsx(chunk_WPAIWTI3.q,{src:"static/images/p1.png",width:"25px",height:"25px",style:{userSelect:"none"}}),DottedTimeline_stories_jsx("p",null,"Juan Perez")),helpText:args.helpText||"".concat(function calcDaysAverage(days){var totalDays=days.length,totalDaysCompleted=days.filter((function(day){return"#25BF6C"===day.color})).length;return parseInt(totalDaysCompleted/totalDays*100,10)}(args.dots),"% attendance"),dots:args.dots})};Component.displayName="Component";var Default=Component.bind({});Default.args={width:"70%",label:"",helpText:"",dots:[{label:"Day 1 - 4 Mar",color:"#25BF6C"},{label:"Day 2 - 5 Mar",color:"#25BF6C"},{label:"Day 3 - 6 Mar",color:"#25BF6C"},{label:"Day 4 - 7 Mar",color:"#CD0000"},{label:"Day 5 - 8 Mar",color:"#25BF6C"},{label:"Day 6 - 9 Mar",color:"#25BF6C"},{label:"Day 7 - 10 Mar",color:"#FFB718"},{label:"Day 8 - 11 Mar",color:"#FFB718"},{label:"Day 9 - 12 Mar",color:"#CD0000"},{label:"Day 10 - 13 Mar",color:"#FFB718"},{label:"Day 11 - 14 Mar",color:"#FFB718"},{label:"Day 12 - 15 Mar",color:"#FFB718"},{label:"Day 13 - 16 Mar",color:"#25BF6C"},{label:"Day 14 - 17 Mar",color:"#25BF6C"},{label:"Day 15 - 18 Mar",color:"#25BF6C"},{label:"Day 16 - 19 Mar",color:"#25BF6C"},{label:"Day 17 - 20 Mar",color:"#CD0000"},{label:"Day 18 - 21 Mar",color:"#CD0000"},{label:"Day 19 - 22 Mar",color:"#CD0000"},{label:"Day 20 - 23 Mar",color:"#25BF6C"},{label:"Day 21 - 24 Mar",color:"#25BF6C"},{label:"Day 22 - 25 Mar",color:"#25BF6C"},{label:"Day 23 - 26 Mar",color:"#25BF6C"},{label:"Day 24 - 27 Mar",color:"#25BF6C"},{label:"Day 25 - 28 Mar",color:"#25BF6C"},{label:"Day 26 - 29 Mar",color:"#25BF6C"},{label:"Day 27 - 30 Mar",color:"#25BF6C"},{label:"Day 28 - 31 Mar",color:"#25BF6C"},{label:"Day 29 - 1 Apr",color:"#FFB718"},{label:"Day 30 - 2 Apr",color:"#FFB718"},{label:"Day 31 - 3 Apr",color:"#FFB718"},{label:"Day 32 - 4 Apr",color:"#FFB718"},{label:"Day 33 - 5 Apr",color:"#FFB718"},{label:"Day 34 - 6 Apr",color:"#FFB718"},{label:"Day 35 - 7 Apr",color:"#25BF6C"},{label:"Day 36 - 8 Apr",color:"#25BF6C"},{label:"Day 37 - 9 Apr",color:"#25BF6C"},{label:"Day 38 - 10 Apr",color:"#25BF6C"},{label:"Day 39 - 11 Apr",color:"#25BF6C"},{label:"Day 40 - 12 Apr",color:"#25BF6C"},{label:"Day 41 - 13 Apr",color:"#25BF6C"},{label:"Day 42 - 14 Apr",color:"#25BF6C"},{label:"Day 43 - 15 Apr",color:"#FFB718"},{label:"Day 44 - 16 Apr",color:"#FFB718"},{label:"Day 45 - 17 Apr",color:"#FFB718"},{label:"Day 46 - 18 Apr",color:"#25BF6C"},{label:"Day 47 - 19 Apr",color:"#25BF6C"},{label:"Day 48 - 20 Apr",color:"#25BF6C"},{label:"Day 49 - 21 Apr",color:"#C4C4C4"},{label:"Day 50 - 22 Apr",color:"#C4C4C4"},{label:"Day 51 - 23 Apr",color:"#C4C4C4"},{label:"Day 52 - 23 Apr",color:"#C4C4C4"},{label:"Day 53 - 24 Apr",color:"#C4C4C4"},{label:"Day 54 - 25 Apr",color:"#C4C4C4"},{label:"Day 55 - 26 Apr",color:"#C4C4C4"},{label:"Day 56 - 27 Apr",color:"#C4C4C4"},{label:"Day 57 - 28 Apr",color:"#C4C4C4"},{label:"Day 58 - 29 Apr",color:"#C4C4C4"},{label:"Day 59 - 30 Apr",color:"#C4C4C4"},{label:"Day 60 - 1 May",color:"#C4C4C4"},{label:"Day 61 - 2 May",color:"#C4C4C4"},{label:"Day 62 - 3 May",color:"#C4C4C4"},{label:"Day 63 - 4 May",color:"#C4C4C4"},{label:"Day 64 - 5 May",color:"#C4C4C4"},{label:"Day 65 - 6 May",color:"#C4C4C4"},{label:"Day 66 - 7 May",color:"#C4C4C4"},{label:"Day 67 - 8 May",color:"#C4C4C4"},{label:"Day 68 - 9 May",color:"#C4C4C4"},{label:"Day 69 - 10 May",color:"#C4C4C4"},{label:"Day 70 - 11 May",color:"#C4C4C4"}]},Default.parameters=DottedTimeline_stories_objectSpread(DottedTimeline_stories_objectSpread({},Default.parameters),{},{docs:DottedTimeline_stories_objectSpread(DottedTimeline_stories_objectSpread({},null===(_Default$parameters=Default.parameters)||void 0===_Default$parameters?void 0:_Default$parameters.docs),{},{source:DottedTimeline_stories_objectSpread({originalSource:'args => {\n  const calcDaysAverage = days => {\n    const totalDays = days.length;\n    const totalDaysCompleted = days.filter(day => day.color === \'#25BF6C\').length;\n    const average = parseInt(totalDaysCompleted / totalDays * 100, 10);\n    return average;\n  };\n  return <DottedTimeline width={`${args.width}`} label={args.label || <Flex gridGap="10px" alignItems="center">\n          <Avatar src=\'static/images/p1.png\' width="25px" height="25px" style={{\n      userSelect: \'none\'\n    }} />\n          <p>Juan Perez</p>\n        </Flex>} helpText={args.helpText || `${calcDaysAverage(args.dots)}% attendance`} dots={args.dots} />;\n}'},null===(_Default$parameters2=Default.parameters)||void 0===_Default$parameters2||null===(_Default$parameters2=_Default$parameters2.docs)||void 0===_Default$parameters2?void 0:_Default$parameters2.source)})})},"./src/common/components/Text.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_app_app_node_modules_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_app_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_chakra_ui_react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/tooltip/dist/chunk-HEDGDMHJ.mjs"),_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@chakra-ui/layout/dist/chunk-P74GIWPW.mjs"),prop_types__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/prop-types/index.js"),prop_types__WEBPACK_IMPORTED_MODULE_5___default=__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_5__),_excluded=["children","size","maxWidth","letterSpacing","withLimit","label","withTooltip"],__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement,sizes={l:"15px",md:"14px",sm:"12px",xs:"10px"};function Text(_ref){var children=_ref.children,size=_ref.size,maxWidth=_ref.maxWidth,letterSpacing=_ref.letterSpacing,withLimit=_ref.withLimit,label=_ref.label,withTooltip=_ref.withTooltip,rest=(0,_home_runner_work_app_app_node_modules_babel_runtime_helpers_esm_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__.Z)(_ref,_excluded);return withLimit?__jsx(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_2__.u,{label:withTooltip?label:children,hasArrow:!0,placement:"top-start",openDelay:500},__jsx(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.x,(0,_home_runner_work_app_app_node_modules_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.Z)({className:"text",letterSpacing,textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden",fontSize:sizes[size]||size,width:maxWidth||withTooltip?"auto":"13em",border:"0px"},rest),children&&children)):__jsx(_chakra_ui_react__WEBPACK_IMPORTED_MODULE_3__.x,(0,_home_runner_work_app_app_node_modules_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.Z)({letterSpacing,maxWidth,fontSize:sizes[size]||size},rest),children&&children)}Text.propTypes={size:prop_types__WEBPACK_IMPORTED_MODULE_5___default().oneOfType([prop_types__WEBPACK_IMPORTED_MODULE_5___default().string,prop_types__WEBPACK_IMPORTED_MODULE_5___default().object]),letterSpacing:prop_types__WEBPACK_IMPORTED_MODULE_5___default().string,maxWidth:prop_types__WEBPACK_IMPORTED_MODULE_5___default().string,children:prop_types__WEBPACK_IMPORTED_MODULE_5___default().node,withLimit:prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool,withTooltip:prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool,label:prop_types__WEBPACK_IMPORTED_MODULE_5___default().string},Text.defaultProps={letterSpacing:"0.05em",size:"sm",maxWidth:"",children:null,withLimit:!1,withTooltip:!1,label:""},Text.__docgenInfo={description:"",methods:[],displayName:"Text",props:{letterSpacing:{defaultValue:{value:"'0.05em'",computed:!1},description:"",type:{name:"string"},required:!1},size:{defaultValue:{value:"'sm'",computed:!1},description:"",type:{name:"union",value:[{name:"string"},{name:"object"}]},required:!1},maxWidth:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1},children:{defaultValue:{value:"null",computed:!1},description:"",type:{name:"node"},required:!1},withLimit:{defaultValue:{value:"false",computed:!1},description:"",type:{name:"bool"},required:!1},withTooltip:{defaultValue:{value:"false",computed:!1},description:"",type:{name:"bool"},required:!1},label:{defaultValue:{value:"''",computed:!1},description:"",type:{name:"string"},required:!1}}};const __WEBPACK_DEFAULT_EXPORT__=Text}}]);