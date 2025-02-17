"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[1963],{"./node_modules/@chakra-ui/avatar/dist/chunk-QVBG3QXJ.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>AvatarStylesProvider,d:()=>useAvatarStyles});var _chakra_ui_react_context__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@chakra-ui/react-context/dist/index.mjs"),[AvatarStylesProvider,useAvatarStyles]=(0,_chakra_ui_react_context__WEBPACK_IMPORTED_MODULE_0__.k)({name:"AvatarStylesContext",hookName:"useAvatarStyles",providerName:"<Avatar/>"})},"./node_modules/@chakra-ui/avatar/dist/chunk-WPAIWTI3.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{q:()=>Avatar,O:()=>baseStyle});var chunk_QVBG3QXJ=__webpack_require__("./node_modules/@chakra-ui/avatar/dist/chunk-QVBG3QXJ.mjs"),chunk_3LE6AY5Q=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js");function initials(name){var _a;const names=name.split(" "),firstName=null!=(_a=names.at(0))?_a:"",lastName=names.length>1?names.at(-1):"";return firstName&&lastName?`${firstName.charAt(0)}${lastName.charAt(0)}`:firstName.charAt(0)}function AvatarName(props){const{name,getInitials,...rest}=props,styles=(0,chunk_QVBG3QXJ.d)();return(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.div,{role:"img","aria-label":name,...rest,__css:styles.label,children:name?null==getInitials?void 0:getInitials(name):null})}AvatarName.displayName="AvatarName";var GenericAvatarIcon=props=>(0,jsx_runtime.jsxs)(chunk_3LE6AY5Q.m.svg,{viewBox:"0 0 128 128",color:"#fff",width:"100%",height:"100%",className:"chakra-avatar__svg",...props,children:[(0,jsx_runtime.jsx)("path",{fill:"currentColor",d:"M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 L25,95.2 C25,86.8096 31.981,80 40.6,80 L87.4,80 C96.019,80 103,86.8096 103,95.2 L103,102.1388 Z"}),(0,jsx_runtime.jsx)("path",{fill:"currentColor",d:"M63.9961647,24 C51.2938136,24 41,34.2938136 41,46.9961647 C41,59.7061864 51.2938136,70 63.9961647,70 C76.6985159,70 87,59.7061864 87,46.9961647 C87,34.2938136 76.6985159,24 63.9961647,24"})]}),chunk_HR33I6FK=__webpack_require__("./node_modules/@chakra-ui/image/dist/chunk-HR33I6FK.mjs"),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");function AvatarImage(props){const{src,srcSet,onError,onLoad,getInitials,name,borderRadius,loading,iconLabel,icon=(0,jsx_runtime.jsx)(GenericAvatarIcon,{}),ignoreFallback,referrerPolicy,crossOrigin}=props,status=(0,chunk_HR33I6FK.d)({src,onError,crossOrigin,ignoreFallback});return!src||!("loaded"===status)?name?(0,jsx_runtime.jsx)(AvatarName,{className:"chakra-avatar__initials",getInitials,name}):(0,react.cloneElement)(icon,{role:"img","aria-label":iconLabel}):(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.img,{src,srcSet,alt:name,onLoad,referrerPolicy,crossOrigin:null!=crossOrigin?crossOrigin:void 0,className:"chakra-avatar__img",loading,__css:{width:"100%",height:"100%",objectFit:"cover",borderRadius}})}AvatarImage.displayName="AvatarImage";var chunk_QEVFQ4EU=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),chunk_T2VHL7RE=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-T2VHL7RE.mjs"),dist=__webpack_require__("./node_modules/@chakra-ui/styled-system/dist/index.mjs"),shared_utils_dist=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),baseStyle={display:"inline-flex",alignItems:"center",justifyContent:"center",textAlign:"center",textTransform:"uppercase",fontWeight:"medium",position:"relative",flexShrink:0},Avatar=(0,chunk_QEVFQ4EU.G)(((props,ref)=>{const styles=(0,chunk_T2VHL7RE.jC)("Avatar",props),[isLoaded,setIsLoaded]=(0,react.useState)(!1),{src,srcSet,name,showBorder,borderRadius="full",onError,onLoad:onLoadProp,getInitials=initials,icon=(0,jsx_runtime.jsx)(GenericAvatarIcon,{}),iconLabel=" avatar",loading,children,borderColor,ignoreFallback,crossOrigin,...rest}=(0,dist.Lr)(props),avatarStyles={borderRadius,borderWidth:showBorder?"2px":void 0,...baseStyle,...styles.container};return borderColor&&(avatarStyles.borderColor=borderColor),(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.span,{ref,...rest,className:(0,shared_utils_dist.cx)("chakra-avatar",props.className),"data-loaded":(0,shared_utils_dist.PB)(isLoaded),__css:avatarStyles,children:(0,jsx_runtime.jsxs)(chunk_QVBG3QXJ.Z,{value:styles,children:[(0,jsx_runtime.jsx)(AvatarImage,{src,srcSet,loading,onLoad:(0,shared_utils_dist.v0)(onLoadProp,(()=>{setIsLoaded(!0)})),onError,getInitials,name,borderRadius,icon,iconLabel,ignoreFallback,crossOrigin}),children]})})}));Avatar.displayName="Avatar"},"./node_modules/@chakra-ui/avatar/dist/chunk-ZYO64PFG.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{H:()=>AvatarGroup});var _chunk_WPAIWTI3_mjs__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/@chakra-ui/avatar/dist/chunk-WPAIWTI3.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-T2VHL7RE.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@chakra-ui/styled-system/dist/index.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),_chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),_chakra_ui_react_children_utils__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@chakra-ui/react-children-utils/dist/index.mjs"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js");var AvatarGroup=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__.G)((function AvatarGroup2(props,ref){const styles=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_3__.jC)("Avatar",props),{children,borderColor,max,spacing="-0.75rem",borderRadius="full",...rest}=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_4__.Lr)(props),validChildren=(0,_chakra_ui_react_children_utils__WEBPACK_IMPORTED_MODULE_5__.W)(children),childrenWithinMax=null!=max?validChildren.slice(0,max):validChildren,excess=null!=max?validChildren.length-max:0,clones=childrenWithinMax.reverse().map(((child,index)=>{var _a;const childProps={marginEnd:0===index?0:spacing,size:props.size,borderColor:null!=(_a=child.props.borderColor)?_a:borderColor,showBorder:!0};return(0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(child,function compact(object){const clone=Object.assign({},object);for(let key in clone)void 0===clone[key]&&delete clone[key];return clone}(childProps))})),groupStyles={display:"flex",alignItems:"center",justifyContent:"flex-end",flexDirection:"row-reverse",...styles.group},excessStyles={borderRadius,marginStart:spacing,..._chunk_WPAIWTI3_mjs__WEBPACK_IMPORTED_MODULE_6__.O,...styles.excessLabel};return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_7__.m.div,{ref,role:"group",__css:groupStyles,...rest,className:(0,_chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_8__.cx)("chakra-avatar__group",props.className),children:[excess>0&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_7__.m.span,{className:"chakra-avatar__excess",__css:excessStyles,children:`+${excess}`}),clones]})}));AvatarGroup.displayName="AvatarGroup"},"./node_modules/@chakra-ui/breakpoint-utils/dist/chunk-G72KV6MB.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{AV:()=>breakpoints,XQ:()=>mapResponsive,Yq:()=>arrayToObjectNotation});var _chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),breakpoints=Object.freeze(["base","sm","md","lg","xl","2xl"]);function mapResponsive(prop,mapper){return Array.isArray(prop)?prop.map((item=>null===item?null:mapper(item))):(0,_chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_0__.Kn)(prop)?Object.keys(prop).reduce(((result,key)=>(result[key]=mapper(prop[key]),result)),{}):null!=prop?mapper(prop):null}function arrayToObjectNotation(values,bps=breakpoints){const result={};return values.forEach(((value,index)=>{const key=bps[index];null!=value&&(result[key]=value)})),result}},"./node_modules/@chakra-ui/layout/dist/chunk-5FO2ZLZM.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{r:()=>Grid});var _chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),Grid=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__.G)((function Grid2(props,ref){const{templateAreas,gap,rowGap,columnGap,column,row,autoFlow,autoRows,templateRows,autoColumns,templateColumns,...rest}=props,styles={display:"grid",gridTemplateAreas:templateAreas,gridGap:gap,gridRowGap:rowGap,gridColumnGap:columnGap,gridAutoColumns:autoColumns,gridColumn:column,gridRow:row,gridAutoFlow:autoFlow,gridAutoRows:autoRows,gridTemplateRows:templateRows,gridTemplateColumns:templateColumns};return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__.m.div,{ref,__css:styles,...rest})}));Grid.displayName="Grid"},"./node_modules/@chakra-ui/layout/dist/chunk-B2MGPQRJ.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{X:()=>Heading});var _chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-T2VHL7RE.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@chakra-ui/styled-system/dist/index.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),_chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),Heading=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__.G)((function Heading2(props,ref){const styles=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__.mq)("Heading",props),{className,...rest}=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_3__.Lr)(props);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_4__.m.h2,{ref,className:(0,_chakra_ui_shared_utils__WEBPACK_IMPORTED_MODULE_5__.cx)("chakra-heading",props.className),...rest,__css:styles})}));Heading.displayName="Heading"},"./node_modules/@chakra-ui/layout/dist/chunk-MPFPK3CX.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{k:()=>Flex});var _chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),Flex=(0,_chakra_ui_system__WEBPACK_IMPORTED_MODULE_1__.G)((function Flex2(props,ref){const{direction,align,justify,wrap,basis,grow,shrink,...rest}=props,styles={display:"flex",flexDirection:direction,alignItems:align,justifyContent:justify,flexWrap:wrap,flexBasis:basis,flexGrow:grow,flexShrink:shrink};return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_chakra_ui_system__WEBPACK_IMPORTED_MODULE_2__.m.div,{ref,__css:styles,...rest})}));Flex.displayName="Flex"},"./node_modules/@chakra-ui/media-query/dist/chunk-MG6WC47T.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{a:()=>useMediaQuery});var _chakra_ui_react_env__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/react-env/dist/chunk-23XYWYLU.mjs"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");function useMediaQuery(query,options={}){const{ssr=!0,fallback}=options,{getWindow}=(0,_chakra_ui_react_env__WEBPACK_IMPORTED_MODULE_1__.O)(),queries=Array.isArray(query)?query:[query];let fallbackValues=Array.isArray(fallback)?fallback:[fallback];fallbackValues=fallbackValues.filter((v=>null!=v));const[value,setValue]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)((()=>queries.map(((query2,index)=>({media:query2,matches:ssr?!!fallbackValues[index]:getWindow().matchMedia(query2).matches})))));return(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{const win=getWindow();setValue(queries.map((query2=>({media:query2,matches:win.matchMedia(query2).matches}))));const mql=queries.map((query2=>win.matchMedia(query2))),handler=evt=>{setValue((prev=>prev.slice().map((item=>item.media===evt.media?{...item,matches:evt.matches}:item))))};return mql.forEach((mql2=>{"function"==typeof mql2.addListener?mql2.addListener(handler):mql2.addEventListener("change",handler)})),()=>{mql.forEach((mql2=>{"function"==typeof mql2.removeListener?mql2.removeListener(handler):mql2.removeEventListener("change",handler)}))}}),[getWindow]),value.map((item=>item.matches))}},"./node_modules/@chakra-ui/react-children-utils/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{W:()=>getValidChildren});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");function getValidChildren(children){return react__WEBPACK_IMPORTED_MODULE_0__.Children.toArray(children).filter((child=>(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(child)))}},"./node_modules/@chakra-ui/skeleton/dist/chunk-3GRGLNAR.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{O:()=>Skeleton});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");var dist=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs"),chunk_3LE6AY5Q=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),styled_system_dist=__webpack_require__("./node_modules/@chakra-ui/styled-system/dist/index.mjs"),emotion_react_browser_esm=__webpack_require__("./node_modules/@emotion/react/dist/emotion-react.browser.esm.js"),chunk_QEVFQ4EU=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-QEVFQ4EU.mjs"),chunk_T2VHL7RE=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-T2VHL7RE.mjs"),chunk_7V3ZYTH7=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-7V3ZYTH7.mjs"),jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),StyledSkeleton=(0,chunk_3LE6AY5Q.m)("div",{baseStyle:{boxShadow:"none",backgroundClip:"padding-box",cursor:"default",color:"transparent",pointerEvents:"none",userSelect:"none","&::before, &::after, *":{visibility:"hidden"}}}),$startColor=(0,styled_system_dist.gJ)("skeleton-start-color"),$endColor=(0,styled_system_dist.gJ)("skeleton-end-color"),fade=(0,emotion_react_browser_esm.F4)({from:{opacity:0},to:{opacity:1}}),bgFade=(0,emotion_react_browser_esm.F4)({from:{borderColor:$startColor.reference,background:$startColor.reference},to:{borderColor:$endColor.reference,background:$endColor.reference}}),Skeleton=(0,chunk_QEVFQ4EU.G)(((props,ref)=>{const skeletonProps={...props,fadeDuration:"number"==typeof props.fadeDuration?props.fadeDuration:.4,speed:"number"==typeof props.speed?props.speed:.8},styles=(0,chunk_T2VHL7RE.mq)("Skeleton",skeletonProps),isFirstRender=function useIsFirstRender(){const isFirstRender=(0,react.useRef)(!0);return(0,react.useEffect)((()=>{isFirstRender.current=!1}),[]),isFirstRender.current}(),{startColor="",endColor="",isLoaded,fadeDuration,speed,className,fitContent,...rest}=(0,styled_system_dist.Lr)(skeletonProps),[startColorVar,endColorVar]=(0,chunk_7V3ZYTH7.dQ)("colors",[startColor,endColor]),wasPreviouslyLoaded=function usePrevious(value){const ref=(0,react.useRef)();return(0,react.useEffect)((()=>{ref.current=value}),[value]),ref.current}(isLoaded),_className=(0,dist.cx)("chakra-skeleton",className),cssVarStyles={...startColorVar&&{[$startColor.variable]:startColorVar},...endColorVar&&{[$endColor.variable]:endColorVar}};if(isLoaded){const animation=isFirstRender||wasPreviouslyLoaded?"none":`${fade} ${fadeDuration}s`;return(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.div,{ref,className:_className,__css:{animation},...rest})}return(0,jsx_runtime.jsx)(StyledSkeleton,{ref,className:_className,...rest,__css:{width:fitContent?"fit-content":void 0,...styles,...cssVarStyles,_dark:{...styles._dark,...cssVarStyles},animation:`${speed}s linear infinite alternate ${bgFade}`}})}));Skeleton.displayName="Skeleton"},"./node_modules/@chakra-ui/skeleton/dist/chunk-OJ7ITIQ2.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{s:()=>SkeletonCircle});var _chunk_3GRGLNAR_mjs__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@chakra-ui/skeleton/dist/chunk-3GRGLNAR.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),SkeletonCircle=({size="2rem",...rest})=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_chunk_3GRGLNAR_mjs__WEBPACK_IMPORTED_MODULE_1__.O,{borderRadius:"full",boxSize:size,...rest});SkeletonCircle.displayName="SkeletonCircle"},"./node_modules/@chakra-ui/skeleton/dist/chunk-QTKSMHLN.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{N:()=>SkeletonText});var chunk_3GRGLNAR=__webpack_require__("./node_modules/@chakra-ui/skeleton/dist/chunk-3GRGLNAR.mjs"),chunk_G72KV6MB=__webpack_require__("./node_modules/@chakra-ui/breakpoint-utils/dist/chunk-G72KV6MB.mjs");var chunk_MG6WC47T=__webpack_require__("./node_modules/@chakra-ui/media-query/dist/chunk-MG6WC47T.mjs"),chunk_NLMMK76H=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-NLMMK76H.mjs"),dist=__webpack_require__("./node_modules/@chakra-ui/shared-utils/dist/index.mjs");function useBreakpointValue(values,arg){var _a;const breakpoint=function useBreakpoint(arg){var _a,_b;const opts=(0,dist.Kn)(arg)?arg:{fallback:null!=arg?arg:"base"},breakpoints=(0,chunk_NLMMK76H.F)().__breakpoints.details.map((({minMaxQuery,breakpoint})=>({breakpoint,query:minMaxQuery.replace("@media screen and ","")}))),fallback=breakpoints.map((bp=>bp.breakpoint===opts.fallback)),values=(0,chunk_MG6WC47T.a)(breakpoints.map((bp=>bp.query)),{fallback,ssr:opts.ssr});return null!=(_b=null==(_a=breakpoints[values.findIndex((value=>1==value))])?void 0:_a.breakpoint)?_b:opts.fallback}((0,dist.Kn)(arg)?arg:{fallback:null!=arg?arg:"base"}),theme=(0,chunk_NLMMK76H.F)();if(!breakpoint)return;const breakpoints=Array.from((null==(_a=theme.__breakpoints)?void 0:_a.keys)||[]);return function getClosestValue(values,breakpoint,breakpoints=chunk_G72KV6MB.AV){let index=Object.keys(values).indexOf(breakpoint);if(-1!==index)return values[breakpoint];let stopIndex=breakpoints.indexOf(breakpoint);for(;stopIndex>=0;){const key=breakpoints[stopIndex];if(values.hasOwnProperty(key)){index=stopIndex;break}stopIndex-=1}if(-1!==index)return values[breakpoints[index]]}(Array.isArray(values)?Object.fromEntries(Object.entries((0,chunk_G72KV6MB.Yq)(values,breakpoints)).map((([key,value])=>[key,value]))):values,breakpoint,breakpoints)}var chunk_3LE6AY5Q=__webpack_require__("./node_modules/@chakra-ui/system/dist/chunk-3LE6AY5Q.mjs"),jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js");var defaultNoOfLines=3,SkeletonText=props=>{const{noOfLines=defaultNoOfLines,spacing="0.5rem",skeletonHeight="0.5rem",className,startColor,endColor,isLoaded,fadeDuration,speed,variant,size,colorScheme,children,...rest}=props,noOfLinesValue=useBreakpointValue("number"==typeof noOfLines?[noOfLines]:noOfLines)||defaultNoOfLines,numbers=function range(count){return Array(count).fill(1).map(((_,index)=>index+1))}(noOfLinesValue),getWidth=index=>noOfLinesValue>1&&index===numbers.length?"80%":"100%",_className=(0,dist.cx)("chakra-skeleton__group",className);return(0,jsx_runtime.jsx)(chunk_3LE6AY5Q.m.div,{className:_className,...rest,children:numbers.map(((number,index)=>{if(isLoaded&&index>0)return null;const sizeProps=isLoaded?null:{mb:number===numbers.length?"0":spacing,width:getWidth(number),height:skeletonHeight};return(0,jsx_runtime.jsx)(chunk_3GRGLNAR.O,{startColor,endColor,isLoaded,fadeDuration,speed,variant,size,colorScheme,...sizeProps,children:0===index?children:void 0},numbers.length.toString()+number)}))})};SkeletonText.displayName="SkeletonText"},"./node_modules/react-gtm-module/dist/Snippets.js":(module,__unused_webpack_exports,__webpack_require__)=>{var _warn2=function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}(__webpack_require__("./node_modules/react-gtm-module/dist/utils/warn.js"));var Snippets={tags:function tags(_ref){var id=_ref.id,events=_ref.events,dataLayer=_ref.dataLayer,dataLayerName=_ref.dataLayerName,preview=_ref.preview,gtm_auth="&gtm_auth="+_ref.auth,gtm_preview="&gtm_preview="+preview;return id||(0,_warn2.default)("GTM Id is required"),{iframe:'\n      <iframe src="https://www.googletagmanager.com/ns.html?id='+id+gtm_auth+gtm_preview+'&gtm_cookies_win=x"\n        height="0" width="0" style="display:none;visibility:hidden" id="tag-manager"></iframe>',script:"\n      (function(w,d,s,l,i){w[l]=w[l]||[];\n        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js', "+JSON.stringify(events).slice(1,-1)+"});\n        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';\n        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl+'"+gtm_auth+gtm_preview+"&gtm_cookies_win=x';\n        f.parentNode.insertBefore(j,f);\n      })(window,document,'script','"+dataLayerName+"','"+id+"');",dataLayerVar:this.dataLayer(dataLayer,dataLayerName)}},dataLayer:function dataLayer(_dataLayer,dataLayerName){return"\n      window."+dataLayerName+" = window."+dataLayerName+" || [];\n      window."+dataLayerName+".push("+JSON.stringify(_dataLayer)+")"}};module.exports=Snippets},"./node_modules/react-gtm-module/dist/TagManager.js":(module,__unused_webpack_exports,__webpack_require__)=>{var _Snippets2=function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}(__webpack_require__("./node_modules/react-gtm-module/dist/Snippets.js"));var TagManager={dataScript:function dataScript(dataLayer){var script=document.createElement("script");return script.innerHTML=dataLayer,script},gtm:function gtm(args){var snippets=_Snippets2.default.tags(args);return{noScript:function noScript(){var noscript=document.createElement("noscript");return noscript.innerHTML=snippets.iframe,noscript},script:function script(){var script=document.createElement("script");return script.innerHTML=snippets.script,script},dataScript:this.dataScript(snippets.dataLayerVar)}},initialize:function initialize(_ref){var gtmId=_ref.gtmId,_ref$events=_ref.events,events=void 0===_ref$events?{}:_ref$events,dataLayer=_ref.dataLayer,_ref$dataLayerName=_ref.dataLayerName,dataLayerName=void 0===_ref$dataLayerName?"dataLayer":_ref$dataLayerName,_ref$auth=_ref.auth,auth=void 0===_ref$auth?"":_ref$auth,_ref$preview=_ref.preview,preview=void 0===_ref$preview?"":_ref$preview,gtm=this.gtm({id:gtmId,events,dataLayer:dataLayer||void 0,dataLayerName,auth,preview});dataLayer&&document.head.appendChild(gtm.dataScript),document.head.insertBefore(gtm.script(),document.head.childNodes[0]),document.body.insertBefore(gtm.noScript(),document.body.childNodes[0])},dataLayer:function dataLayer(_ref2){var _dataLayer=_ref2.dataLayer,_ref2$dataLayerName=_ref2.dataLayerName,dataLayerName=void 0===_ref2$dataLayerName?"dataLayer":_ref2$dataLayerName;if(window[dataLayerName])return window[dataLayerName].push(_dataLayer);var snippets=_Snippets2.default.dataLayer(_dataLayer,dataLayerName),dataScript=this.dataScript(snippets);document.head.insertBefore(dataScript,document.head.childNodes[0])}};module.exports=TagManager},"./node_modules/react-gtm-module/dist/index.js":(module,__unused_webpack_exports,__webpack_require__)=>{var _TagManager2=function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}(__webpack_require__("./node_modules/react-gtm-module/dist/TagManager.js"));module.exports=_TagManager2.default},"./node_modules/react-gtm-module/dist/utils/warn.js":(__unused_webpack_module,exports,__webpack_require__)=>{var console=__webpack_require__("./node_modules/console-browserify/index.js");Object.defineProperty(exports,"__esModule",{value:!0});exports.default=function warn(s){console.warn("[react-gtm]",s)}}}]);