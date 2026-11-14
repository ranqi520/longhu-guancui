import {createImageStudy,IMAGE_PLAN_ROOMS} from './成图动线分析_CODEX.js';

// Image-space paths follow the supplied facade openings and room connections.
// Public rooms share an open route. Wet-room exhaust remains local to each window.
// Three parallel daylight rays per opening end outside the white-model silhouette.
// Each ray endpoint is independently clipped against the supplied image alpha.
// Borrowed light at the entry is described in the text, with no interior red path.
// No compass orientation, wind speed or solar-angle data was supplied.
function daylightTriplet(route){
 const {lines,...meta}=route;
 return lines.map(([x1,y1,x2,y2],index)=>({...meta,id:route.id+'-'+(index+1),movers:1,d:`M ${x1} ${y1} L ${x2} ${y2}`}));
}
export const IMAGE_ENVIRONMENT_ROUTES={
 daylight:{color:'#bd4149',paths:[
  {id:'kitchen-window-west',dashed:true,exterior:true,rooms:['餐厨区'],title:'餐厨窗面引光 / Dining & kitchen window daylight',lines:[[1170.2,69.8,1119.8,175.6],[1154,62,1103.6,167.6],[1137.8,54.2,1087.1,160.5]]},
  {id:'kitchen-window-east',dashed:true,exterior:true,rooms:['餐厨区'],title:'餐厨第二窗段引光 / Second dining & kitchen window bay',lines:[[1259.8,163.6,1228.3,221.8],[1244,155,1211.6,214.8],[1228.2,146.4,1194.9,207.7]]},
  {id:'child-window',dashed:true,exterior:true,rooms:['儿童房'],title:'儿童房侧窗引光 / Children’s room side-window daylight',lines:[[257.9,418.8,345.7,461.9],[250,435,336.6,477.6],[242.1,451.2,327.6,493.2]]},
  {id:'laundry-facade',dashed:true,exterior:true,rooms:['洗衣区'],title:'洗衣区沿阳台窗面引光 / Laundry daylight from the balcony facade',lines:[[263.7,933.4,300.4,854.3],[280,941,316.9,861.4],[296.3,948.6,333.4,868.5]]},
  {id:'balcony-living-west',dashed:true,exterior:true,rooms:['休闲阳台','客厅'],title:'阳台向客厅引光 / Balcony daylight into the living area',lines:[[553.9,1059.9,593.5,981.3],[570,1068,610.2,988.3],[586.1,1076.1,626.8,995.3]]},
  {id:'balcony-living-east',dashed:true,exterior:true,rooms:['休闲阳台','客厅'],title:'客厅连续窗面引光 / Continuous-facade daylight into the living area',lines:[[738.9,1137,776.7,1061.4],[755,1145,793.3,1068.3],[771.1,1153,810,1075.2]]},
  {id:'study-window',dashed:true,exterior:true,rooms:['开放书房'],title:'开放书房前窗引光 / Open-study front-window daylight',lines:[[1047.6,1080.5,1079.2,1011.4],[1064,1088,1095.4,1019.3],[1080.4,1095.5,1112,1026.4]]},
  {id:'main-bedroom-window',dashed:true,exterior:true,rooms:['主卧'],title:'主卧前窗引光 / Main-bedroom front-window daylight',lines:[[1236.3,1151.2,1304.7,1028.3],[1252,1160,1321.5,1035],[1267.7,1168.8,1337.8,1042.9]]},
  {id:'bedroom2-window',dashed:true,exterior:true,rooms:['次卧'],title:'次卧外窗引光 / Second-bedroom window daylight',lines:[[1565.9,282.5,1529,351.8],[1550,274,1512.3,344.8],[1534.1,265.5,1496.2,336.8]]},
  {id:'guest-bath-window',dashed:true,exterior:true,rooms:['公卫'],title:'公卫外窗引光 / Guest-bath window daylight',lines:[[1415.7,181.9,1360.7,278.9],[1400,173,1343.9,272],[1384.3,164.1,1327.4,264.6]]},
  {id:'ensuite-window',dashed:true,exterior:true,rooms:['主卫'],title:'主卫外窗引光 / Ensuite window daylight',lines:[[1806.2,362.9,1762.2,452.7],[1790,355,1745.8,445.3],[1773.8,347.1,1729.5,437.6]]},
 ].flatMap(daylightTriplet)},
 airflow:{color:'#358766',paths:[
  {id:'public-cross-ventilation',dashed:false,movers:3,rooms:['休闲阳台','客厅','餐厨区'],title:'阳台—客厅—餐厨的公共空间对流 / Balcony–living–kitchen cross-ventilation connection',d:'M 651 1008 Q 681 936 692 854 Q 700 776 729 718 Q 764 660 788 591 Q 815 525 823 460 Q 831 410 827 377 Q 815 336 865 300 Q 932 259 1020 257 Q 1075 253 1119 206'},
  {id:'laundry-balcony-connection',dashed:false,rooms:['洗衣区','休闲阳台'],title:'洗衣区窗面进入阳台的空气联系 / Air entry through the laundry balcony facade',d:'M 310 881 Q 326 843 347 801 Q 362 772 383 737 Q 395 716 425 732 Q 489 761 557 809 Q 608 845 672 867'},
  {id:'child-door-window-connection',dashed:false,rooms:['儿童房','玄关衔接'],title:'阳台侧窗进入儿童房并联系房门 / Balcony-side window entry into the children’s room',d:'M 435 680 Q 428 650 441 625 Q 455 600 477 576 Q 509 546 551 535 Q 572 520 573 486 Q 574 452 587 423 Q 611 383 633 343 Q 651 312 678 294 Q 712 270 752 270'},
  {id:'bedroom2-door-window-connection',dashed:false,rooms:['次卧'],title:'次卧门窗开启时的空气联系 / Second-bedroom window-to-door connection',d:'M 1490 365 Q 1453 427 1410 470 Q 1376 500 1357 548 Q 1344 577 1294 599'},
  {id:'main-bedroom-door-window-connection',dashed:false,movers:3,rooms:['主卧'],title:'主卧门窗开启时的空气联系 / Main-bedroom window-to-door connection',d:'M 1350 1022 Q 1412 956 1468 858 Q 1506 800 1510 752 Q 1511 718 1477 699 L 1402 664 Q 1363 646 1319 627'},
  {id:'study-living-connection',dashed:false,rooms:['开放书房','客厅'],title:'书房与公共区的空气联系 / Open-study-to-living air connection',d:'M 1060 958 Q 1090 907 1069 857 Q 1046 815 1075 749 Q 1100 686 1133 615'},
  {id:'guest-bath-local-exhaust',dashed:false,rooms:['公卫'],title:'公卫独立开窗排湿 / Local moisture exhaust at the guest-bath window',d:'M 1240 439 Q 1267 402 1282 361 Q 1295 323 1324 284'},
  {id:'ensuite-local-exhaust',dashed:false,rooms:['主卫'],title:'主卫独立开窗排湿 / Local moisture exhaust at the ensuite window',d:'M 1638 594 Q 1686 550 1710 508 Q 1726 480 1730 461'}
 ]}
};
export function createImageEnvironment({host}){
 return createImageStudy({host,studyId:'environment',routes:IMAGE_ENVIRONMENT_ROUTES,rooms:IMAGE_PLAN_ROOMS,contextLabels:true,
  aria:'全宅白模采光通风分析 / Whole-home daylight and ventilation study',
  title:'光风协同 · 采光通风 / Daylight & ventilation',
  description:'每组红色三线动态虚线仅在窗外表示采光引入，绿色动态曲线穿过窗洞表示开窗条件下的空气联系；卫浴单独排湿，玄关以借光表达。Triplets of moving red dashed arrows remain outside the windows and indicate daylight; green curves show air connections with doors and windows open. Bathrooms exhaust locally; the entry borrows light.'});
}
