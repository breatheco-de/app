"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[3308],{"./modifyEnv.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _src_utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/utils/index.js"),process=__webpack_require__("./node_modules/process/browser.js");const __WEBPACK_DEFAULT_EXPORT__=function modifyEnv(_ref2){var _ref2$queryString=_ref2.queryString,queryString=void 0===_ref2$queryString?"host":_ref2$queryString,_ref2$env=_ref2.env,host=function handleEnv(_ref){var queryString=_ref.queryString,env=_ref.env,modifiedEnv=env;if(_src_utils__WEBPACK_IMPORTED_MODULE_0__.FJ){var urlHost=new URLSearchParams(window.location.search).get(queryString);"production"!==process.env.VERCEL_ENV&&(urlHost&&"/"===urlHost[urlHost.length-1]&&urlHost.slice(0,-1),urlHost&&localStorage.setItem(queryString,urlHost),localStorage.getItem(queryString)&&(modifiedEnv=localStorage.getItem(queryString)),"reset"===modifiedEnv&&(modifiedEnv=env),"production"===modifiedEnv&&(modifiedEnv="https://breathecode.herokuapp.com"))}return modifiedEnv}({queryString,env:void 0===_ref2$env?process.env.BREATHECODE_HOST:_ref2$env});return host}},"./src/utils/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A$:()=>unSlugify,Cv:()=>devLog,FJ:()=>isWindow,I4:()=>unSlugifyCapitalize,L_:()=>removeStorageItem,NV:()=>decodeBase64,Nh:()=>setStorageItem,S7:()=>getBrowserInfo,T4:()=>formatPrice,Wz:()=>getQueryString,X6:()=>isDevMode,Xm:()=>adjustNumberBeetwenMinMax,_L:()=>getDiscountedPrice,fp:()=>toCapitalize,hj:()=>isNumber,lV:()=>slugify,n4:()=>getNextDateInMonths,oR:()=>lengthOfString,qF:()=>getTimeProps,qb:()=>isValidDate,qn:()=>getStorageItem,rV:()=>slugToTitle,rg:()=>removeURLParameter,sW:()=>cleanObject,tF:()=>getBrowserSize,td:()=>formatBytes,xh:()=>location,zb:()=>syncInterval});var date_fns__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/date-fns/esm/format/index.js"),date_fns_locale__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/date-fns/esm/locale/es/index.js"),process=__webpack_require__("./node_modules/process/browser.js"),console=__webpack_require__("./node_modules/console-browserify/index.js"),isWindow="undefined"!=typeof window,isDevMode=(!!isWindow&&localStorage.getItem("accessToken"),"production"!==process.env.VERCEL_ENV||!1),slugify=function slugify(str){return"string"==typeof str?str.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,""):""},unSlugify=function unSlugify(str){var capitalize=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return"string"==typeof str?str.replace(/-/g," ").replace(/\w\S*/g,(function(txt){return(capitalize?txt.charAt(0).toUpperCase():txt.charAt(0))+txt.substring(1).toLowerCase()})):""},unSlugifyCapitalize=function unSlugifyCapitalize(str){return"string"==typeof str?str.replace(/-/g," ").replace(/\w\S*/g,(function(txt){return txt.charAt(0).toUpperCase()+txt.substring(1).toLowerCase()})):""};function slugToTitle(slug){return void 0===slug?"":slug.split("-").map((function(word,i){return 0===i?word.charAt(0).toUpperCase()+word.slice(1):word.charAt(0)+word.slice(1)})).join(" ").replace(/([A-Z])/g," $1").trim()}var getStorageItem=function getStorageItem(key){return isWindow?localStorage.getItem(key):null},setStorageItem=(String(getStorageItem("accessToken")).length,function setStorageItem(key,value){return isWindow?localStorage.setItem(key,value):null}),removeStorageItem=function removeStorageItem(key){return isWindow?localStorage.removeItem(key):null},devLog=function devLog(msg){for(var _console,_len=arguments.length,params=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++)params[_key-1]=arguments[_key];isDevMode&&(_console=console).log.apply(_console,["[🛠️ DEV LOG] ".concat(msg)].concat(params))};function removeURLParameter(url,parameter){var urlparts=url.split("?");if(urlparts.length>=2){for(var prefix="".concat(encodeURIComponent(parameter),"="),pars=urlparts[1].split(/[&;]/g),i=pars.length;i-- >0;)-1!==pars[i].lastIndexOf(prefix,0)&&pars.splice(i,1);return urlparts[0]+(pars.length>0?"?".concat(pars.join("&")):"")}return url}var getNextDateInMonths=function getNextDateInMonths(){var months=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,today=new Date,nextMonth=new Date;return nextMonth.setMonth(today.getMonth()+months),{date:nextMonth,translation:{en:(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(nextMonth),"MMM do, YYY"),es:(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(nextMonth),"dd 'de' MMMM, YYY",{locale:date_fns_locale__WEBPACK_IMPORTED_MODULE_1__.Z})}}},getTimeProps=function getTimeProps(date){var _date$timeslots,_date$timeslots2,_date$timeslots3,_date$timeslots4,getHours=function getHours(time){return new Date(time).toLocaleTimeString([],{timeZone:"UTC",hour:"2-digit",minute:"2-digit"})};return{kickoffDate:{en:(null==date?void 0:date.kickoff_date)&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(date.kickoff_date),"MMMM do YYY"),es:(null==date?void 0:date.kickoff_date)&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(date.kickoff_date),"d 'de' MMMM YYY",{locale:date_fns_locale__WEBPACK_IMPORTED_MODULE_1__.Z})},weekDays:{en:(null===(_date$timeslots=date.timeslots)||void 0===_date$timeslots?void 0:_date$timeslots.length)>0&&date.timeslots.map((function(l){return l.starting_at&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(l.starting_at),"EEEE")})),es:(null===(_date$timeslots2=date.timeslots)||void 0===_date$timeslots2?void 0:_date$timeslots2.length)>0&&date.timeslots.map((function(l){return l.starting_at&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(l.starting_at),"EEEE",{locale:date_fns_locale__WEBPACK_IMPORTED_MODULE_1__.Z})}))},shortWeekDays:{en:(null===(_date$timeslots3=date.timeslots)||void 0===_date$timeslots3?void 0:_date$timeslots3.length)>0&&date.timeslots.map((function(l){return l.starting_at&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(l.starting_at),"EEE")})),es:(null===(_date$timeslots4=date.timeslots)||void 0===_date$timeslots4?void 0:_date$timeslots4.length)>0&&date.timeslots.map((function(l){return l.starting_at&&(0,date_fns__WEBPACK_IMPORTED_MODULE_0__.Z)(new Date(l.starting_at),"EEE",{locale:date_fns_locale__WEBPACK_IMPORTED_MODULE_1__.Z})}))},availableTime:date.timeslots.length>0&&"".concat(getHours(date.timeslots[0].starting_at)," - ").concat(getHours(date.timeslots[0].ending_at))}},toCapitalize=function toCapitalize(){var input=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return input.charAt(0).toUpperCase()+input.toLowerCase().slice(1)};function formatBytes(bytes){var decimals=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2;if(!+bytes)return"0 Bytes";var dm=decimals<0?0:decimals,i=Math.floor(Math.log(bytes)/Math.log(1024));return"".concat(parseFloat((bytes/Math.pow(1024,i)).toFixed(dm))," ").concat(["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][i])}var isNumber=function isNumber(value){return Number.isFinite(Number(value))},isValidDate=function isValidDate(dateString){return!Number.isNaN(Date.parse(dateString))},getQueryString=function getQueryString(key,def){var urlParams=isWindow&&new URLSearchParams(window.location.search);return urlParams&&(urlParams.get(key)||def)},lengthOfString=function lengthOfString(string){return"string"==typeof string?null==string?void 0:string.replaceAll(/\s/g,"").length:0},syncInterval=function syncInterval(){var callback=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){},secondsToNextMinute=60-(new Date).getSeconds();setTimeout((function(){callback(),setInterval(callback,6e4)}),1e3*secondsToNextMinute)};function getBrowserSize(){return isWindow?{width:window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,height:window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}:{}}function adjustNumberBeetwenMinMax(_ref){var _ref$number=_ref.number,number=void 0===_ref$number?1:_ref$number,_ref$min=_ref.min,min=void 0===_ref$min?1:_ref$min,_ref$max=_ref.max,max=void 0===_ref$max?10:_ref$max,range=max-min;return number>max?max-(number-max)%range:number<min?max-(min-number)%range:number}function getDiscountedPrice(_ref2){var numItems=_ref2.numItems,maxItems=_ref2.maxItems,discountRatio=_ref2.discountRatio,bundleSize=_ref2.bundleSize,pricePerUnit=_ref2.pricePerUnit,_ref2$startDiscountFr=_ref2.startDiscountFrom,startDiscountFrom=void 0===_ref2$startDiscountFr?0:_ref2$startDiscountFr;numItems>maxItems&&console.log("numItems cannot be greater than maxItems");for(var totalDiscountRatio=0,currentDiscountRatio=discountRatio,i=startDiscountFrom;i<Math.floor(numItems/bundleSize);i+=1)totalDiscountRatio+=currentDiscountRatio,currentDiscountRatio-=.1*currentDiscountRatio;totalDiscountRatio>.2&&(totalDiscountRatio=.2);var amount=pricePerUnit*numItems;return{original:amount,discounted:amount-amount*totalDiscountRatio}}var formatPrice=function formatPrice(){var price=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return"$".concat(price%1==0&&arguments.length>1&&void 0!==arguments[1]&&arguments[1]?price.toFixed(0):price.toFixed(2))},location=isWindow&&window.location;isWindow&&new URL(window.location.href);function cleanObject(obj){var cleaned={};return Object.keys(obj).forEach((function(key){if(void 0!==obj[key]&&null!==obj[key]){if(Array.isArray(obj[key])&&0===obj[key].length)return;cleaned[key]=obj[key]}})),cleaned}function decodeBase64(encoded){return new TextDecoder("utf-8").decode(Uint8Array.from(atob(encoded),(function(c){return c.charCodeAt(0)}))).replace(/�/g,"")}var getBrowserInfo=function getBrowserInfo(){var ua=navigator.userAgent.toLowerCase(),browser="unknown",match=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*\d+/i)||[],isIE=/trident/i.test(match[1]),edgeOrOperaMatch="chrome"===match[1]&&ua.match(/\b(opr|edg)\/\d+/i);return isIE?browser="web-ie":edgeOrOperaMatch?browser="web-".concat("edg"===edgeOrOperaMatch[1]?"edge":"opera"):match[1]&&(browser="web-".concat(match[1].toLowerCase())),browser}},"./src/utils/logging.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{ZK:()=>warn,cM:()=>log,vU:()=>error});var _index__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/utils/index.js"),console=__webpack_require__("./node_modules/console-browserify/index.js");function log(){var _console;_index__WEBPACK_IMPORTED_MODULE_0__.X6&&(_console=console).log.apply(_console,arguments)}function warn(){var _console2;_index__WEBPACK_IMPORTED_MODULE_0__.X6&&(_console2=console).warn.apply(_console2,arguments)}function error(){var _console3;_index__WEBPACK_IMPORTED_MODULE_0__.X6&&(_console3=console).error.apply(_console3,arguments)}},"./src/utils/variables.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{C5:()=>RIGOBOT_HOST,G7:()=>WHITE_LABEL_ACADEMY,fh:()=>DOMAIN_NAME,k1:()=>BREATHECODE_HOST,vi:()=>ORIGIN_HOST});var _modifyEnv__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./modifyEnv.js"),process=__webpack_require__("./node_modules/process/browser.js"),DOMAIN_NAME=process.env.DOMAIN_NAME||"",BREATHECODE_HOST=(process.env.BASE_PLAN,(0,_modifyEnv__WEBPACK_IMPORTED_MODULE_0__.Z)({queryString:"host",env:process.env.BREATHECODE_HOST||""})),RIGOBOT_HOST=(0,_modifyEnv__WEBPACK_IMPORTED_MODULE_0__.Z)({queryString:"host_rigo",env:process.env.RIGOBOT_HOST||""}),WHITE_LABEL_ACADEMY=process.env.WHITE_LABEL_ACADEMY||void 0,ORIGIN_HOST="undefined"!=typeof window&&window.location.origin||DOMAIN_NAME}}]);