
const $=id=>document.getElementById(id); const val=(id)=>parseFloat($(id).value); const unit=(id)=>$(id).value;
const toM=(x,u)=>u==='mm'?x*1e-3:u==='um'?x*1e-6:u==='nm'?x*1e-9:x;
function fmt(x,n=4){if(!Number.isFinite(x))return '—'; if(x===0)return '0'; return Number(x.toPrecision(n)).toLocaleString('zh-CN',{maximumFractionDigits:12});}
function fmtSci(x){if(!Number.isFinite(x))return '—'; if(Math.abs(x)>=.01&&Math.abs(x)<10000)return fmt(x,4); return x.toExponential(3);}

let spotChart=null;
function drawSpotChart(){
 const st=spotChart,cv=$('spotChart');if(!st)return;
 const W=cv.clientWidth||850,H=cv.clientHeight||320,dpr=window.devicePixelRatio||1;
 cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
 const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
 const m={l:70,r:20,t:30,b:58},pw=W-m.l-m.r,ph=H-m.t-m.b;
 const xmin=st.focus-3*st.zr,xmax=st.focus+3*st.zr,ymax=st.d0*Math.sqrt(10)*1.08;
 const X=x=>m.l+(x-xmin)/(xmax-xmin)*pw,Y=y=>m.t+ph-y/ymax*ph;
 Object.assign(st,{W,H,m,pw,ph,xmin,xmax,X,Y});
 c.fillStyle='rgba(232,144,34,.10)';c.fillRect(X(st.focus-st.zr),m.t,X(st.focus+st.zr)-X(st.focus-st.zr),ph);
 c.font='11px sans-serif';c.textBaseline='middle';
 for(let i=0;i<=4;i++){const v=ymax*i/4,y=Y(v);c.strokeStyle='#dce5ef';c.lineWidth=1;c.beginPath();c.moveTo(m.l,y);c.lineTo(W-m.r,y);c.stroke();c.fillStyle='#607086';c.textAlign='right';c.fillText(fmtSci(v),m.l-7,y);}
 const count=W<500?2:6;
 for(let i=0;i<=count;i++){const x=xmin+(xmax-xmin)*i/count,px=X(x);c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();c.fillStyle='#607086';c.textAlign='center';c.fillText(fmt(x,7),px,m.t+ph+16);}
 c.strokeStyle='#8ea1b7';c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,m.t+ph);c.lineTo(W-m.r,m.t+ph);c.stroke();
 c.fillStyle='#45576d';c.font='12px sans-serif';c.textAlign='left';c.fillText('光斑直径 d（μm，1/e²）',m.l,14);c.textAlign='center';c.fillText('透镜后位置 z（mm）',m.l+pw/2,H-12);
 c.strokeStyle='#e89022';c.setLineDash([5,4]);c.beginPath();c.moveTo(m.l,Y(st.d0));c.lineTo(W-m.r,Y(st.d0));c.stroke();
 for(const x of [st.focus-st.zr,st.focus+st.zr]){c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();}c.setLineDash([]);
 if(st.z>=xmin&&st.z<=xmax){c.strokeStyle='#14804a';c.lineWidth=1.2;c.setLineDash([2,3]);c.beginPath();c.moveTo(X(st.z),m.t);c.lineTo(X(st.z),m.t+ph);c.stroke();c.setLineDash([]);c.fillStyle='#14804a';c.font='11px sans-serif';c.textAlign='left';c.fillText('观察面',X(st.z)+4,m.t+8);}else{c.fillStyle='#14804a';c.font='11px sans-serif';c.textAlign=st.z<xmin?'left':'right';c.fillText(st.z<xmin?'← 观察面在左侧图外':'观察面在右侧图外 →',st.z<xmin?m.l+4:W-m.r-4,m.t+8);}
 c.strokeStyle='#1769e0';c.lineWidth=2;c.beginPath();for(let i=0;i<=300;i++){const x=xmin+(xmax-xmin)*i/300,y=st.d0*Math.hypot(1,(x-st.focus)/st.zr);i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y));}c.stroke();
 if(st.hover!==null){const x=st.hover,y=st.d0*Math.hypot(1,(x-st.focus)/st.zr);c.strokeStyle='#8a97a8';c.lineWidth=1;c.setLineDash([3,3]);c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();c.setLineDash([]);c.fillStyle='#1769e0';c.beginPath();c.arc(X(x),Y(y),4,0,2*Math.PI);c.fill();}
}
function spotHover(e){
 const st=spotChart,cv=$('spotChart'),tip=$('spotTip');if(!st||!st.X)return;
 const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*st.W/r.width,my=(e.clientY-r.top)*st.H/r.height;
 if(mx<st.m.l||mx>st.m.l+st.pw||my<st.m.t||my>st.m.t+st.ph){spotLeave();return;}
 const x=st.xmin+(mx-st.m.l)/st.pw*(st.xmax-st.xmin),def=x-st.focus,d=st.d0*Math.hypot(1,def/st.zr);
 st.hover=x;drawSpotChart();tip.innerHTML='<div class="hd">位置 z = '+fmt(x,8)+' mm</div><div>离焦量 = '+fmtSci(def)+' mm</div><div>光斑直径 = '+fmtSci(d)+' μm</div><div>最小直径 d₀ = '+fmtSci(st.d0)+' μm</div><div>瑞利长度 zR = '+fmtSci(st.zr)+' mm</div>';tip.hidden=false;
 tip.style.left=Math.max(0,Math.min(mx+14,st.W-tip.offsetWidth-8))+'px';tip.style.top=Math.max(0,Math.min(my+12,st.H-tip.offsetHeight-8))+'px';
}
function spotLeave(){if(spotChart){spotChart.hover=null;drawSpotChart();}$('spotTip').hidden=true;}
function besselJ0(x){let ax=Math.abs(x),y,ans;if(ax<8){y=x*x;ans=57568490574.0+y*(-13362590354.0+y*(651619640.7+y*(-11214424.18+y*(77392.33017+y*(-184.9052456)))));let den=57568490411.0+y*(1029532985.0+y*(9494680.718+y*(59272.64853+y*(267.8532712+y*1.0))));return ans/den;}y=8/ax;let z=y*y;let xx=ax-0.785398164;ans=1.0+z*(-0.1098628627e-2+z*(0.2734510407e-4+z*(-0.2073370639e-5+z*0.2093887211e-6)));let ans2=-0.1562499995e-1+z*(0.1430488765e-3+z*(-0.6911147651e-5+z*(0.7621095161e-6-z*0.934945152e-7)));return Math.sqrt(0.636619772/ax)*(Math.cos(xx)*ans-y*Math.sin(xx)*ans2);}
function besselJ1(x){let ax=Math.abs(x),y,ans;if(ax<8){y=x*x;ans=x*(72362614232.0+y*(-7895059235.0+y*(242396853.1+y*(-2972611.439+y*(15704.48260+y*(-30.16036606))))));let den=144725228442.0+y*(2300535178.0+y*(18583304.74+y*(99447.43394+y*(376.9991397+y*1.0))));return ans/den;}y=8/ax;let z=y*y,xx=ax-2.356194491;ans=1+z*(0.183105e-2+z*(-0.3516396496e-4+z*(0.2457520174e-5+z*(-0.240337019e-6))));let ans2=0.04687499995+z*(-0.2002690873e-3+z*(0.8449199096e-5+z*(-0.88228987e-6+z*0.105787412e-6)));let r=Math.sqrt(0.636619772/ax)*(Math.cos(xx)*ans-y*Math.sin(xx)*ans2);return x<0?-r:r;}
function besselI0(x){let y=(x/3.75)**2;return 1+y*(3.5156229+y*(3.0899424+y*(1.2067492+y*(0.2659732+y*(0.0360768+y*0.0045813)))));}
function besselI1(x){let y=(x/3.75)**2;return x*(0.5+y*(0.87890594+y*(0.51498869+y*(0.15084934+y*(0.02658733+y*(0.00301532+y*0.00032411))))));}
function besselK0(x){if(x<=0)return Infinity;if(x<=2){let y=x*x/4;return -Math.log(x/2)*besselI0(x)+(-0.57721566+y*(0.42278420+y*(0.23069756+y*(0.03488590+y*(0.00262698+y*(0.00010750+y*0.00000740))))));}let y=2/x;return Math.exp(-x)/Math.sqrt(x)*(1.25331414+y*(-0.07832358+y*(0.02189568+y*(-0.01062446+y*(0.00587872+y*(-0.00251540+y*0.00053208))))));}
function besselK1(x){if(x<=0)return Infinity;if(x<=2){let y=x*x/4;return Math.log(x/2)*besselI1(x)+(1/x)*(1+y*(0.15443144+y*(-0.67278579+y*(-0.18156897+y*(-0.01919402+y*(-0.00110404+y*(-0.00004686)))))));}let y=2/x;return Math.exp(-x)/Math.sqrt(x)*(1.25331414+y*(0.23498619+y*(-0.03655620+y*(0.01504268+y*(-0.00780353+y*(0.00325614-y*0.00068245))))));}
function besselJ(n,x){/* 整数阶 Jₙ：x>n 用向上递推，x≤n 用 Miller 向下递推（Numerical Recipes bessj，双精度 ACC=160） */n=Math.abs(n);if(n===0)return besselJ0(x);if(n===1)return besselJ1(x);let ax=Math.abs(x),ans;if(ax===0)return 0;
 if(ax>n){let tox=2/ax,bjm=besselJ0(ax),bj=besselJ1(ax);for(let j=1;j<n;j++){let bjp=j*tox*bj-bjm;bjm=bj;bj=bjp}ans=bj;}
 else{let tox=2/ax,m=2*((n+Math.floor(Math.sqrt(160*n)))>>1),jsum=false,bjp=0,sum=0,bj=1;ans=0;for(let j=m;j>0;j--){let bjm=j*tox*bj-bjp;bjp=bj;bj=bjm;if(Math.abs(bj)>1e10){bj*=1e-10;bjp*=1e-10;ans*=1e-10;sum*=1e-10}if(jsum)sum+=bj;jsum=!jsum;if(j===n)ans=bjp}sum=2*sum-bj;ans/=sum;}
 return x<0&&(n&1)?-ans:ans;}
function besselKratio(l,x){/* K_{l−1}(x)/K_l(x)，比值递推不会溢出；K₋₁=K₁ */let k0=besselKs(0,x),k1=besselKs(1,x);if(l===0)return k1/k0;let r=k0/k1;for(let q=1;q<l;q++)r=1/(r+2*q/x);return r;}
function lnBesselK(n,x){/* ln Kₙ(x)，用比值递推避免大阶数/小宗量溢出 */n=Math.abs(n);let lnk=Math.log(besselKs(0,x))-x;if(n===0)return lnk;let r=besselKs(0,x)/besselKs(1,x);lnk-=Math.log(r);for(let q=1;q<n;q++){r=1/(r+2*q/x);lnk-=Math.log(r);}return lnk;}
function besselZeros(n,xmax){/* Jₙ 在 (0,xmax] 内的正零点（Jₙ 的零点均大于 n） */let zs=[],h=0.05,x0=Math.max(n,0.05),g0=besselJ(n,x0);for(let x1=x0+h;x1<=xmax+h;x1+=h){let g1=besselJ(n,x1);if(g0===0)zs.push(x0);else if(g0*g1<0){let a=x0,b=x1,ga=g0;for(let k=0;k<60;k++){let c=(a+b)/2,gc=besselJ(n,c);if(ga*gc<=0)b=c;else{a=c;ga=gc}}zs.push((a+b)/2);}x0=x1;g0=g1;}return zs;}
let lastResults={spot:null,fiber:null,splice:null};
let imgChart=null;/* {f,zr1,s,s2,w01(mm),hover} 单位 mm */
function imgS2(st,x){const d=(x-st.f)**2+st.zr1*st.zr1;return st.f+st.f*st.f*(x-st.f)/d;}
function imgGeo(st,x){const d=x-st.f;return Math.abs(d)<1e-12?NaN:x*st.f/d;}
function drawImgChart(){const st=imgChart,cv=$('imgChart');if(!st||!cv.getContext)return;
 const W=cv.clientWidth||850,H=cv.clientHeight||320,dpr=window.devicePixelRatio||1;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const m={l:70,r:20,t:24,b:46},pw=W-m.l-m.r,ph=H-m.t-m.b,f=st.f;
 /* 横轴覆盖 [−f, 3f]，并保证包含当前 s 与极值点 s = f + zR₁ */
 let xmin=Math.min(-f,st.s-0.2*f),xmax=Math.max(3*f,st.s+0.2*f,Math.min(f+1.3*st.zr1,10*f));
 const N=400,xs=[];for(let i=0;i<=N;i++)xs.push(xmin+(xmax-xmin)*i/N);
 const gs=xs.map(x=>imgS2(st,x));let ymin=Math.min(...gs,0),ymax=Math.max(...gs,2*f);const pad=(ymax-ymin)*0.08;ymin-=pad;ymax+=pad;
 const X=x=>m.l+(x-xmin)/(xmax-xmin)*pw,Y=y=>m.t+(ymax-y)/(ymax-ymin)*ph;Object.assign(st,{W,H,m,pw,ph,xmin,xmax,ymin,ymax,X,Y,xs,gs});
 c.font='11px sans-serif';c.lineWidth=1;
 let ys=niceStep(ymax-ymin,5);c.textAlign='right';c.textBaseline='middle';for(let y=Math.ceil(ymin/ys)*ys;y<=ymax;y+=ys){c.strokeStyle='#dce5ef';c.beginPath();c.moveTo(m.l,Y(y));c.lineTo(m.l+pw,Y(y));c.stroke();c.fillStyle='#607086';c.fillText(fmt(y,4),m.l-6,Y(y));}
 let xsS=niceStep(xmax-xmin,W<500?4:8);c.textAlign='center';c.textBaseline='top';for(let x=Math.ceil(xmin/xsS)*xsS;x<=xmax;x+=xsS){c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();c.fillStyle='#607086';c.fillText(fmt(x,4),X(x),m.t+ph+6);}
 c.strokeStyle='#8ea1b7';c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,m.t+ph);c.lineTo(m.l+pw,m.t+ph);c.stroke();
 c.fillStyle='#45576d';c.font='12px sans-serif';c.textAlign='left';c.textBaseline='alphabetic';c.fillText('像方束腰位置 s″（mm）',m.l,14);c.textAlign='center';c.fillText('入射束腰到透镜距离 s（mm）',m.l+pw/2,H-6);
 c.save();c.beginPath();c.rect(m.l,m.t,pw,ph);c.clip();
 c.strokeStyle='#a9b5c4';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(f),m.t);c.lineTo(X(f),m.t+ph);c.moveTo(m.l,Y(f));c.lineTo(m.l+pw,Y(f));c.stroke();
 /* 几何成像曲线：在 s = f 处断开 */c.strokeStyle='#e89022';c.lineWidth=1.5;c.setLineDash([5,4]);c.beginPath();let prev=null;xs.forEach(x=>{const y=imgGeo(st,x),span=ymax-ymin;if(!Number.isFinite(y)||y<ymin-span||y>ymax+span){prev=null;return}if(prev!==null&&Math.sign(x-f)===Math.sign(prev-f))c.lineTo(X(x),Y(y));else c.moveTo(X(x),Y(y));prev=x;});c.stroke();c.setLineDash([]);
 c.strokeStyle='#1769e0';c.lineWidth=2;c.beginPath();xs.forEach((x,i)=>i?c.lineTo(X(x),Y(gs[i])):c.moveTo(X(x),Y(gs[i])));c.stroke();
 const smx=f+st.zr1;if(smx<=xmax){c.fillStyle='#1769e0';c.beginPath();c.arc(X(smx),Y(imgS2(st,smx)),3.5,0,2*Math.PI);c.fill();c.font='11px sans-serif';c.textAlign='left';c.textBaseline='bottom';c.fillText('s″max',X(smx)+5,Y(imgS2(st,smx))-3);}
 c.strokeStyle='#14804a';c.lineWidth=1.2;c.setLineDash([2,3]);c.beginPath();c.moveTo(X(st.s),m.t);c.lineTo(X(st.s),m.t+ph);c.stroke();c.setLineDash([]);c.fillStyle='#14804a';c.beginPath();c.arc(X(st.s),Y(st.s2),4.5,0,2*Math.PI);c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();
 if(st.hover!==null){const x=st.hover;c.strokeStyle='rgba(24,35,51,.35)';c.lineWidth=1;c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();c.fillStyle='#1769e0';c.beginPath();c.arc(X(x),Y(imgS2(st,x)),4,0,2*Math.PI);c.fill();}
 c.restore();}
function imgHover(e){const st=imgChart,cv=$('imgChart'),tip=$('imgTip');if(!st||!st.X)return;const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*st.W/r.width,my=(e.clientY-r.top)*st.H/r.height;
 if(mx<st.m.l||mx>st.m.l+st.pw||my<st.m.t||my>st.m.t+st.ph){imgLeave();return;}
 const x=st.xmin+(mx-st.m.l)/st.pw*(st.xmax-st.xmin),y=imgS2(st,x),g=imgGeo(st,x),mg=st.f/Math.sqrt((x-st.f)**2+st.zr1*st.zr1);st.hover=x;drawImgChart();
 tip.innerHTML='<div class="hd">s = '+fmt(x,5)+' mm</div><div>高斯束 s″ = '+fmt(y,5)+' mm</div><div>几何像点 s′ = '+(Number.isFinite(g)?fmt(g,5)+' mm':'∞')+'</div><div>束腰放大率 m = '+fmtSci(mg)+'</div><div>像方束腰直径 = '+fmtSci(2*mg*st.w01*1e3)+' μm</div>';tip.hidden=false;
 tip.style.left=Math.max(0,Math.min(mx+14,st.W-tip.offsetWidth-8))+'px';tip.style.top=Math.max(0,Math.min(my+12,st.H-tip.offsetHeight-8))+'px';}
function imgLeave(){if(imgChart&&imgChart.hover!==null){imgChart.hover=null;drawImgChart();}$('imgTip').hidden=true;}
function gaussLens(w01,s,f,M2,lam){/* Self(1983) 嵌入 M² 的高斯束薄透镜变换；s 为入射束腰到透镜距离（透镜前为正） */const zr1=Math.PI*w01*w01/(M2*lam),den=(s-f)**2+zr1*zr1,mg=f/Math.sqrt(den);return {zr1,s2:f+f*f*(s-f)/den,mg,w02:mg*w01,zr2:mg*mg*zr1};}
function calcSpot(){
 let mode=unit('s_mode'),lam=toM(val('s_lambda'),unit('s_lambda_u')),P=val('s_power')*(unit('s_power_u')==='kW'?1000:1),M2=val('s_m2'),f=toM(val('s_f'),unit('s_f_u')),z=toM(val('s_z'),unit('s_z_u')),ap=toM(val('s_ap'),unit('s_ap_u')),w01,s,fiberIn=null;
 if(!(lam>0&&P>=0&&(M2>=1||mode==='fiber')&&f>0&&z>=0&&ap>0))throw Error('请检查输入：波长、焦距和口径必须为正，功率不能为负，M² 不能小于 1，观察面位置不能为负。');
 if(mode==='waist'){w01=toM(val('s_w0in'),unit('s_w0in_u'))/2;s=toM(val('s_s'),unit('s_s_u'));if(!(w01>0))throw Error('入射束腰直径必须为正。');if(!Number.isFinite(s))throw Error('请填写束腰到透镜的距离 s。');}
 else if(mode==='fiber'){/* 传能光纤输出：端面近场 = 芯径，远场半角 = NA；端面位于准直镜前焦面，准直后束腰 ≈ f_c·NA 位于准直镜后 f_c 处 */
  const fc=val('s_fcore')*1e-6,fna=val('s_fna'),fcf=val('s_fc')*1e-3,gap=val('s_fgap')*1e-3;
  if(!(fc>0&&fna>0&&fna<0.9&&fcf>0&&gap>=0))throw Error('请检查光纤输出参数：芯径、NA（0–0.9）、准直镜焦距必须为正，镜间距不能为负。');
  M2=Math.max(1,Math.PI*(fc/2)*fna/lam);
  const gc=gaussLens(fc/2,fcf,fcf,M2,lam);w01=gc.w02;s=gap-gc.s2;
  fiberIn={core:fc,na:fna,fc:fcf,gap,bpp:fc/2*fna,dc:2*w01};}
 else{w01=toM(val('s_din'),unit('s_din_u'))/2;s=0;if(!(w01>0))throw Error('透镜处光束直径必须为正。');}
 const g=gaussLens(w01,s,f,M2,lam),{zr1,s2,mg,w02,zr2}=g;
 let wL=w01*Math.sqrt(1+(s/zr1)**2),dL=2*wL,thetaIn=M2*lam/(Math.PI*w01),
  def=z-s2,wz=w02*Math.sqrt(1+(def/zr2)**2),wf=w02*Math.sqrt(1+((f-s2)/zr2)**2),theta=M2*lam/(Math.PI*w02),bpp=w02*theta,
  T=1-Math.exp(-2*(ap/2)**2/(wL*wL)),apr=ap/dL,
  s2max=f+f*f/(2*zr1),smax=f+zr1,
  /* 几何参考点：准直光取焦点 f；已知束腰取几何像点 s·f/(s−f)（s = f 时成像于无穷远） */
  geo=mode!=='waist'?f:(Math.abs(s-f)<1e-12*f?Infinity:s*f/(s-f)),gdiff=s2-geo;
 /* 能量分布：高斯峰值 2P/πw²；平顶（多模光纤近场成像）按 1/e² 直径内均匀分布 P/πw² */
 const prof=unit('s_prof'),flat=prof==='flat'||(prof==='auto'&&M2>3),pk=flat?1:2,
  I=pk*P/(Math.PI*wz*wz),I0=pk*P/(Math.PI*w02*w02);
 /* 脉冲 */
 const rep=val('s_rep')*1e3,tauU=unit('s_tau_u'),tau=val('s_tau')*(tauU==='ns'?1e-9:tauU==='ps'?1e-12:1e-15),pulsed=rep>0;
 if(!(rep>=0))throw Error('重频不能为负。');if(pulsed&&!(tau>0))throw Error('脉冲模式下脉宽必须为正。');
 const Ep=pulsed?P/rep:NaN,Ppk=pulsed?Ep/tau:NaN,F0=pulsed?pk*Ep/(Math.PI*w02*w02):NaN,Ipk=pulsed?pk*Ppk/(Math.PI*w02*w02):NaN;
 /* 球差：单片平凸（凸面朝平行光）最佳焦面弥散斑 ≈ 0.067·f/F#³（Melles Griot），与衍射焦斑平方和粗略合成 */
 const sph=unit('s_lens')==='pcx',Fn=f/dL,dSA=sph?0.067*f/Fn**3:0,dEff=Math.hypot(2*w02,dSA);
 $('o_spot').textContent=fmt(w02*2e6);$('o_focus').textContent=fmt(s2*1e3);$('o_zr').textContent=fmt(zr2*1e3);$('o_theta').textContent=fmt(theta*1e3);
 $('o_zspot').textContent=fmt(wz*2e6);$('o_defocus').textContent=fmt(def*1e3);$('o_intensity').textContent=fmt(I/1e10);$('o_intensity2').textContent=fmtSci(I/1e6);
 $('o_bpp').textContent=fmt(bpp*1e6);$('o_zrin').textContent=fmtSci(zr1);$('o_fspot').textContent=fmt(wf*2e6);$('o_aprat').textContent=fmt(apr,3);
 $('o_dl').textContent=fmt(dL*1e3);$('o_thin').textContent=fmtSci(thetaIn*1e3);$('o_mag').textContent=fmtSci(mg);$('o_georef_l').textContent=mode!=='waist'?'几何焦点 f =':'几何像点 s′ = s·f/(s − f) =';
 $('o_georef').textContent=Number.isFinite(geo)?fmt(geo*1e3):'∞';$('o_gdiff').textContent=Number.isFinite(gdiff)?fmtSci(gdiff*1e3):'—';$('o_s2max').textContent=fmt(s2max*1e3);$('o_smax').textContent=fmtSci(smax*1e3);
 $('o_proflbl').textContent=flat?'按平顶分布':'按高斯峰值';
 const more=[];
 if(fiberIn)more.push('光纤输出：BPP = '+fmt(fiberIn.bpp*1e6,4)+' mm·mrad，等效 M² = '+fmt(M2,4)+'；准直光束直径 ≈ '+fmt(fiberIn.dc*1e3,4)+' mm；几何成像焦斑 d_core·f/f_c = '+fmt(fiberIn.core*f/fiberIn.fc*1e6,4)+' μm');
 if(sph)more.push('单片平凸球差弥散斑 ≈ '+fmt(dSA*1e6,4)+' μm（F# = '+fmt(Fn,3)+'），衍射 + 球差合成焦斑 ≈ '+fmt(dEff*1e6,4)+' μm');
 if(pulsed)more.push('脉冲：单脉冲能量 '+fmtSci(Ep*1e3)+' mJ，峰值功率 '+fmtSci(Ppk/1e3)+' kW，焦点能量密度 '+fmtSci(F0/1e4)+' J/cm²，峰值功率密度 '+fmtSci(Ipk/1e4)+' W/cm²');
 $('o_more').innerHTML=more.join('<br>');$('o_more').hidden=!more.length;
 spotChart={focus:s2*1e3,zr:zr2*1e3,d0:w02*2e6,z:z*1e3,hover:null};$('spotTip').hidden=true;drawSpotChart();
 imgChart={f:f*1e3,zr1:zr1*1e3,s:s*1e3,s2:s2*1e3,w01:w01*1e3,hover:null};$('imgTip').hidden=true;drawImgChart();
 /* 口径检查：高斯束通过圆孔的功率透过率 T = 1 − exp(−2a²/w²)；工程上常取口径 ≥ 1.5 × 1/e² 直径 */
 let msgs=[],lvl='good';const warn=()=>{if(lvl==='good')lvl='';};
 if(apr<1){lvl='bad';msgs.push('透镜处光束 1/e² 直径 '+fmt(dL*1e3)+' mm 超过透镜有效口径，几何透过率仅 '+fmt(T*100,4)+'%，截光衍射会使焦斑变大、旁瓣明显，本模型结果不再可靠。');}
 else if(apr<1.5){warn();msgs.push('口径/光束直径 = '+fmt(apr,3)+'，透过率 '+fmt(T*100,5)+'%；低于常用的 1.5 倍余量，截光衍射可能使焦斑变大（高功率下还需关注镜座发热）。');}
 else msgs.push('已通过口径检查：口径/光束直径 = '+fmt(apr,3)+'，高斯透过率 '+fmt(T*100,6)+'%。');
 if(s2<0){lvl='bad';msgs.push('像方束腰位于透镜前 '+fmt(-s2*1e3)+' mm（虚束腰），透镜后光束一直发散，不存在实际焦点。');}
 if(mode!=='waist'){if((f-s2)/f>0.01){warn();msgs.push('高斯束焦移：束腰位于透镜后 '+fmt(s2*1e3)+' mm，比几何焦距提前 '+fmt((f-s2)*1e3)+' mm（f/zR₁ = '+fmt(f/zr1,3)+'），请按束腰位置设置观察面。');}}
 else{
  if(s<0)msgs.push('s < 0：会聚光入射（入射束腰为透镜后 '+fmt(-s*1e3)+' mm 处的虚物）。');
  if(Math.abs(s-f)<=0.02*f)msgs.push('束腰位于前焦面附近（s ≈ f）：像方束腰落在后焦面，w₀₂ ≈ M²λf/(πw₀₁)，为傅里叶变换关系。');
  else if(Number.isFinite(geo)&&Math.abs(gdiff)>0.05*Math.max(Math.abs(geo),f)){warn();msgs.push('高斯束腰与几何像点相差 '+fmt(gdiff*1e3)+' mm（zR₁ = '+fmtSci(zr1*1e3)+' mm 与 |s − f| = '+fmtSci(Math.abs(s-f)*1e3)+' mm 可比），不能按几何成像设置焦面。');}
  if(s>f&&geo>s2max*1.05){warn();msgs.push('几何成像预期像距 '+fmt(geo*1e3)+' mm 超过高斯束可达上限 s″max = '+fmt(s2max*1e3)+' mm；想把焦点推远，应增大入射束腰（减小发散）而不是只调 s。');}
 }
 if(dL/(2*f)>0.25){warn();msgs.push('数值孔径较大（D/2f = '+fmt(dL/(2*f),3)+'），已超出近轴近似的可靠范围，实际焦斑受像差主导。');}
 if(sph&&dSA>0.5*2*w02){warn();msgs.push('单片球面透镜球差弥散斑 '+fmt(dSA*1e6,4)+' μm 达衍射焦斑 '+fmt(w02*2e6,4)+' μm 的 '+fmt(dSA/(2*w02),3)+' 倍，实际焦斑约 '+fmt(dEff*1e6,4)+' μm；建议改用非球面/消球差镜组或增大 F 数。');}
 else if(!sph&&Fn<5)msgs.push('F# = '+fmt(Fn,3)+'：若实际使用单片球面透镜，球差会明显增大焦斑，可在“透镜类型”中选单片平凸估算。');
 if(M2>3&&unit('s_prof')==='gauss'){warn();msgs.push('M² = '+fmt(M2,3)+' 的多模光束在焦点附近接近平顶分布，按高斯峰值 2P/πw² 会高估峰值功率密度约 2 倍。');}
 if(fiberIn)msgs.push('光纤输出模式：按嵌入 M² 高斯束处理，焦斑大小与镜间距无关；实际焦点处为光纤端面的像（近平顶），离焦后分布逐渐变为远场形状。');
 $('spotNotice').className='notice '+lvl;$('spotNotice').textContent=msgs.join(' ');
 const inBeam=mode==='col'?[['入射方式','准直光',''],['透镜处光束直径(1/e²)',fmt(dL*1e3),'mm']]:mode==='fiber'?[['入射方式','传能光纤输出',''],['光纤芯径',fmt(fiberIn.core*1e6),'μm'],['光纤输出 NA',fmt(fiberIn.na),''],['准直镜焦距 f_c',fmt(fiberIn.fc*1e3),'mm'],['准直镜到聚焦镜距离',fmt(fiberIn.gap*1e3),'mm']]:[['入射方式','已知束腰',''],['入射束腰直径 2w01',fmtSci(w01*2e3),'mm'],['束腰到透镜距离 s',fmt(s*1e3),'mm']];
 const extraIn=[['透镜类型',sph?'单片平凸':'已校正',''],['能量分布',flat?'平顶':'高斯','']].concat(pulsed?[['重频',fmt(rep/1e3),'kHz'],['脉宽',fmt(val('s_tau')),tauU]]:[]);
 const extraOut=[].concat(sph?[['球差弥散斑',fmt(dSA*1e6,4),'μm'],['衍射+球差合成焦斑',fmt(dEff*1e6,4),'μm']]:[]).concat(pulsed?[['单脉冲能量',fmtSci(Ep*1e3),'mJ'],['峰值功率',fmtSci(Ppk/1e3),'kW'],['焦点能量密度',fmtSci(F0/1e4),'J/cm²'],['焦点峰值功率密度',fmtSci(Ipk/1e4),'W/cm²']]:[]);
 lastResults.spot={title:'激光光斑与聚焦',inputs:[['波长',fmt(lam*1e9),'nm'],['功率',fmt(P),'W'],['M²',fmt(M2),''],...inBeam,['焦距 f',fmt(f*1e3),'mm'],['观察面位置',fmt(z*1e3),'mm'],['透镜有效口径',fmt(ap*1e3),'mm'],...extraIn],outputs:[['焦斑直径 d0',fmt(w02*2e6),'μm'],['像方束腰位置 s″(透镜后)',fmt(s2*1e3),'mm'],[mode!=='waist'?'几何焦点 f':'几何像点 s′',Number.isFinite(geo)?fmt(geo*1e3):'∞','mm'],['高斯束腰 − 几何参考点',Number.isFinite(gdiff)?fmtSci(gdiff*1e3):'—','mm'],['束腰放大率 m',fmtSci(mg),''],['入射瑞利长度 zR1',fmtSci(zr1*1e3),'mm'],['像距上限 s″max',fmt(s2max*1e3),'mm'],['瑞利长度 zR',fmt(zr2*1e3),'mm'],['焦深 2zR',fmt(2*zr2*1e3),'mm'],['发散半角',fmt(theta*1e3),'mrad'],['BPP',fmt(bpp*1e6),'mm·mrad'],['透镜处光束直径',fmt(dL*1e3),'mm'],['观察面光斑直径',fmt(wz*2e6),'μm'],['观察面离焦量',fmt(def*1e3),'mm'],['观察面峰值功率密度',fmt(I/1e10),'MW/cm²'],['束腰峰值功率密度',fmt(I0/1e10),'MW/cm²'],['口径透过率',fmt(T*100,6),'%'],...extraOut]};
}
function besselKs(n,x){/* 指数缩放 e^x·Kₙ(x)，避免大 W 时下溢 */let k0,k1;if(x<=2){k0=besselK0(x)*Math.exp(x);k1=besselK1(x)*Math.exp(x);}else{let y=2/x,s=1/Math.sqrt(x);k0=s*(1.25331414+y*(-0.07832358+y*(0.02189568+y*(-0.01062446+y*(0.00587872+y*(-0.00251540+y*0.00053208))))));k1=s*(1.25331414+y*(0.23498619+y*(-0.03655620+y*(0.01504268+y*(-0.00780353+y*(0.00325614-y*0.00068245))))));}if(n===0)return k0;if(n===1)return k1;let km=k0,k=k1;for(let q=1;q<n;q++){let kp=km+2*q/x*k;km=k;k=kp}return k;}
function bendLossLog(l,U,W,a,R,lam,n1,eo=1){R*=eo;/* Marcuse(1976) 宏弯功率损耗系数(1/m)：
   α = √π·κ²·exp(−(2/3)·γ³R/β²) / ( e_l·γ^{3/2}·V²·√R·K_{l−1}(W)·K_{l+1}(W) )，κ=U/a，γ=W/a，e₀=2，e_{l≥1}=1；返回 log10(dB/m) */let k=2*Math.PI/lam,kappa=U/a,gamma=W/a,beta2=n1*n1*k*k-kappa*kappa,V2=U*U+W*W,e=l===0?2:1;let lnK=lnBesselK(l-1,W)+lnBesselK(l+1,W);let lnAlpha=0.5*Math.log(Math.PI)+2*Math.log(kappa)-Math.log(e)-1.5*Math.log(gamma)-Math.log(V2)-0.5*Math.log(R)-lnK-(2/3)*Math.pow(gamma,3)*R/beta2;return lnAlpha/Math.LN10+Math.log10(10/Math.LN10);}
function fmtLoss(log10){if(!Number.isFinite(log10))return '—';if(log10<-300)return '<1e-300';if(log10<-12)return Math.pow(10,log10).toExponential(3);return fmt(Math.pow(10,log10),4);} 
function bendLoss(l,U,W,a,R,lam,n1,eo=1){let log10=bendLossLog(l,U,W,a,R,lam,n1,eo);return log10<-323?0:Math.pow(10,log10);}
const MODE_COLORS=['#1769e0','#e89022','#14804a','#ba3030','#7b4fd6','#0f9aa8','#c2408f','#5d6b7d','#a07a12','#2f4fa8'];
let fiberChart=null; /* {D, xs(mm), series:[{name,color,lg[]}], hover:{i,si}} ；lg 为 log10(dB/m) */
function fmtDecade(k){return k>=-3&&k<=4?Number('1e'+k).toLocaleString('zh-CN',{maximumFractionDigits:3}):'1e'+k;}
function niceStep(span,n){let raw=span/n,p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p;return (f<1.5?1:f<3?2:f<7?5:10)*p;}
function drawFiberChart(){const st=fiberChart,cv=$('fiberChart');if(!st||!cv.getContext)return;const dpr=window.devicePixelRatio||1,W=cv.clientWidth||850,H=cv.clientHeight||320;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
const m={l:68,r:18,t:14,b:46},pw=W-m.l-m.r,ph=H-m.t-m.b,xs=st.xs,xmin=xs[0],xmax=xs[xs.length-1];
let all=st.series.flatMap(s=>s.lg).filter(Number.isFinite),hi=Math.ceil(Math.max(...all)),lo=Math.floor(Math.min(...all));if(!Number.isFinite(hi)||!Number.isFinite(lo)){hi=1;lo=0}lo=Math.max(lo,hi-12);if(hi-lo<2)lo=hi-2; /* 对数纵轴，最多显示 12 个数量级 */
const X=x=>m.l+(x-xmin)/(xmax-xmin)*pw,Y=g=>m.t+(hi-g)/(hi-lo)*ph;Object.assign(st,{m,pw,ph,W,H,lo,hi,X,Y});
c.font='11px sans-serif';c.lineWidth=1;c.textBaseline='middle';c.textAlign='right';let ys=(hi-lo)>8?2:1;for(let k=hi;k>=lo;k-=ys){let y=Y(k);c.strokeStyle='#dce5ef';c.beginPath();c.moveTo(m.l,y);c.lineTo(m.l+pw,y);c.stroke();c.fillStyle='#607086';c.fillText(fmtDecade(k),m.l-6,y);}
let step=niceStep(xmax-xmin,8);c.textAlign='center';c.textBaseline='top';for(let x=Math.ceil(xmin/step)*step;x<=xmax+1e-9;x+=step){let px=X(x);c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();c.strokeStyle='#8ea1b7';c.beginPath();c.moveTo(px,m.t+ph);c.lineTo(px,m.t+ph+4);c.stroke();c.fillStyle='#607086';c.fillText(fmt(x,4),px,m.t+ph+6);}
c.strokeStyle='#8ea1b7';c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,m.t+ph);c.lineTo(m.l+pw,m.t+ph);c.stroke();
c.fillStyle='#45576d';c.font='12px sans-serif';c.textAlign='center';c.textBaseline='bottom';c.fillText('绕纤直径 D（mm）',m.l+pw/2,H-4);c.save();c.translate(14,m.t+ph/2);c.rotate(-Math.PI/2);c.textBaseline='middle';c.fillText('弯曲损耗（dB/m，对数坐标）',0,0);c.restore();
if(st.D>=xmin&&st.D<=xmax){let px=X(st.D);c.strokeStyle='#8a97a8';c.setLineDash([4,4]);c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();c.setLineDash([]);c.fillStyle='#607086';c.font='11px sans-serif';c.textAlign='left';c.textBaseline='top';c.fillText('当前 D = '+fmt(st.D,4)+' mm',px+4,m.t+2);}
c.save();c.beginPath();c.rect(m.l,m.t,pw,ph);c.clip();st.series.forEach((s,si)=>{c.strokeStyle=s.color;c.lineWidth=st.hover&&st.hover.si===si?3:1.8;c.beginPath();let pen=false;s.lg.forEach((g,i)=>{if(!Number.isFinite(g)||g<lo){pen=false;return}let px=X(xs[i]),py=Y(g);pen?c.lineTo(px,py):c.moveTo(px,py);pen=true;});c.stroke();});
if(st.hover){let i=st.hover.i,px=X(xs[i]);c.strokeStyle='rgba(24,35,51,.35)';c.lineWidth=1;c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();st.series.forEach((s,si)=>{let g=s.lg[i];if(!Number.isFinite(g)||g<lo)return;c.fillStyle=s.color;c.beginPath();c.arc(px,Y(g),si===st.hover.si?4.5:3,0,2*Math.PI);c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();});}
c.restore();}
function fiberHover(e){const st=fiberChart,cv=$('fiberChart'),tip=$('fiberTip');if(!st||!st.X)return;const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,{m,pw,ph,xs}=st;
if(mx<m.l-4||mx>m.l+pw+4||my<m.t-4||my>m.t+ph+4){fiberLeave();return}
let f=Math.min(1,Math.max(0,(mx-m.l)/pw)),i=Math.round(f*(xs.length-1)),si=-1,best=Infinity;st.series.forEach((s,k)=>{let g=s.lg[i];if(!Number.isFinite(g)||g<st.lo)return;let d=Math.abs(st.Y(g)-my);if(d<best){best=d;si=k}});st.hover={i,si};drawFiberChart();
tip.innerHTML='<div class="hd">D = '+fmt(xs[i],4)+' mm（R = '+fmt(xs[i]/2,4)+' mm）</div>'+st.series.map((s,k)=>'<div class="row'+(k===si?' on':'')+'"><span><i style="background:'+s.color+'"></i>'+s.name+'</span><span>'+fmtLoss(s.lg[i])+' dB/m</span></div>').join('');tip.hidden=false;
let tx=cv.offsetLeft+mx+14,ty=cv.offsetTop+my+12,tw=tip.offsetWidth,th=tip.offsetHeight;if(tx+tw>cv.offsetLeft+r.width)tx=cv.offsetLeft+mx-tw-14;if(ty+th>cv.offsetTop+r.height)ty=Math.max(cv.offsetTop,cv.offsetTop+my-th-12);tip.style.left=tx+'px';tip.style.top=ty+'px';}
function fiberLeave(){if(fiberChart&&fiberChart.hover){fiberChart.hover=null;drawFiberChart();}$('fiberTip').hidden=true;}
function subNum(n){return String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);}
function buildModeDefs(V){/* 截止条件（弱导阶跃）：LP₀ₘ 为 J₁ 第 m−1 个零点（LP₀₁ 为 0）；LPₗₘ(l≥1) 为 Jₗ₋₁ 第 m 个正零点 */let defs=[];for(let l=0;l<=200;l++){let cuts=(l===0?[0].concat(besselZeros(1,V)):besselZeros(l-1,V)).filter(c=>c<V);if(!cuts.length)break;cuts.forEach((c,i)=>defs.push({name:'LP'+subNum(l)+(l>9||i>=9?',':'')+subNum(i+1),l,m:i+1,cut:c}));}return defs.sort((p,q)=>p.cut-q.cut||p.l-q.l);}
function solveModeUW(V,def){if(V<=def.cut+1e-7)return null;const l=def.l;/* LP 特征方程 U·Jₗ₋₁/Jₗ + W·Kₗ₋₁/Kₗ = 0，乘以 Jₗ 后无极点：G = U·Jₗ₋₁ + W·(Kₗ₋₁/Kₗ)·Jₗ；J₋₁=−J₁，K₋₁=K₁。根位于截止值之后、Jₗ 下一个零点之前（相邻零点间距 < π），只扫描 (截止值, 截止值+3.6) */function G(U){let W=Math.sqrt(Math.max(0,V*V-U*U));let jm=l===0?-besselJ1(U):besselJ(l-1,U);return U*jm+W*besselKratio(l,W)*besselJ(l,U);}let lo=Math.max(def.cut+1e-9,1e-9),hi=Math.min(V-1e-9,lo+3.6),N=Math.max(200,Math.ceil((hi-lo)/0.003)),step=(hi-lo)/N,x0=lo,g0=G(x0);for(let i=1;i<=N;i++){let x1=lo+step*i,g1=G(x1);if(Number.isFinite(g0)&&Number.isFinite(g1)&&g0*g1<=0){for(let k=0;k<80;k++){let xm=(x0+x1)/2,gm=G(xm);if(g0*gm<=0){x1=xm;g1=gm}else{x0=xm;g0=gm}}let U=(x0+x1)/2;return {U,W:Math.sqrt(Math.max(1e-15,V*V-U*U))};}x0=x1;g0=g1;}return null;}
function critDiam(row,a,lam,n1,th,eo=1){/* 弯曲损耗随 R 单调下降（∝R^−½·e^(−cR)），对 ln R 二分求 α(R)=阈值 时的绕纤直径 */let t=Math.log10(th),f=R=>bendLossLog(row.l,row.U,row.W,a,R,lam,n1,eo)-t,lo=a,hi=100;if(!(f(lo)>0))return {lt:2*lo};if(f(hi)>0)return {gt:2*hi};let L=Math.log(lo),H=Math.log(hi);for(let k=0;k<70;k++){let M=(L+H)/2;if(f(Math.exp(M))>0)L=M;else H=M}return {d:2*Math.exp((L+H)/2)};}
function fmtCrit(c){return c.d?fmt(c.d*1e3,4):c.lt?'< '+fmt(c.lt*1e3,3):'> '+fmt(c.gt*1e3,3);}
function lp01MFD(U,W,a){/* Petermann II 模场直径（ITU-T G.650 / 厂商规格采用的定义）：w² = 2∫ψ²r dr / ∫(ψ')²r dr，阶跃光纤 LP₀₁ 场 J₀/K₀ 解析积分 */let j0=besselJ0(U),j1=besselJ1(U),j2=besselJ(2,U),k1r=besselKratio(0,W),k2r=1+2/W*k1r,num=(j0*j0+j1*j1)+j0*j0*(k1r*k1r-1),den=U*U*(j1*j1-j0*j2)+W*W*j0*j0*(k2r-k1r*k1r);return 2*a*Math.sqrt(2*num/den);}
const MAX_LP=150,CHART_MODES=10;
function calcFiber(){let a=toM(val('f_core'),unit('f_core_u'))/2,NA=val('f_na'),n2=val('f_n2'),lam=toM(val('f_lambda'),unit('f_lambda_u')),D=toM(val('f_d'),unit('f_d_u')),L=toM(val('f_len'),unit('f_len_u')),th=val('f_th'),eo=val('f_eo'),n0=1;
 if(!(a>0&&NA>0&&n2>1&&lam>0&&D>0&&L>0))throw Error('请检查输入：芯径、NA、折射率、波长、绕纤直径和长度必须为正，n₂ 应大于 1。');if(!(th>0))throw Error('损耗阈值必须为正。');if(!(eo>=1&&eo<=2))throw Error('弹光修正系数应在 1–2 之间（石英约 1.28，填 1 关闭修正）。');if(NA>=n0)throw Error('当前模型要求 NA 小于外部介质折射率 n₀；空气中 NA 应小于 1。');if(D<=2*a)throw Error('绕纤直径必须大于纤芯直径。');
 let n1=Math.sqrt(n2*n2+NA*NA),V=2*Math.PI*a*NA/lam,ang=Math.asin(NA/n0)*180/Math.PI,fnum=1/(2*NA),R=D/2,delta=(n1*n1-n2*n2)/(2*n1*n1),lamC=2*Math.PI*a*NA/2.404826;
 if(V>60)throw Error('V = '+fmt(V)+' 过大（约 '+fmt(V*V/2,3)+' 个导模），逐模求解没有工程意义，请按多模光纤的几何光学模型处理。');
 let defs=buildModeDefs(V),truncated=defs.length>MAX_LP;if(truncated)defs=defs.slice(0,MAX_LP);
 let rows=defs.map(def=>{let uw=solveModeUW(V,def);if(!uw)return null;let log10=bendLossLog(def.l,uw.U,uw.W,a,R,lam,n1,eo),loss=bendLoss(def.l,uw.U,uw.W,a,R,lam,n1,eo),r={...def,...uw,loss,log10,total:loss*L,totalLog:log10+Math.log10(L)};r.crit=critDiam(r,a,lam,n1,th,eo);return r;}).filter(Boolean);
 if(!rows.length)throw Error('当前 V 数未支持可求解的模式。');
 let base=rows.find(x=>x.l===0&&x.m===1)||rows[0],turns=L/(Math.PI*D),nTot=rows.reduce((s,x)=>s+(x.l===0?2:4),0),mfd=lp01MFD(base.U,base.W,a);
 $('o_v').textContent=fmt(V);$('o_angle').textContent=fmt(ang);$('o_fnum').textContent=fmt(fnum);$('o_modes').textContent=(truncated?'≥':'')+fmt(nTot,4);$('o_n1').textContent=fmt(n1,6);$('o_r').textContent=fmt(R*1e3);$('o_reff').textContent=fmt(R*eo*1e3);$('o_turns').textContent=fmt(turns,3);$('o_u').textContent=fmt(base.U);$('o_w').textContent=fmt(base.W);$('o_loss').textContent=fmtLoss(base.log10);$('o_total').textContent=fmtLoss(base.totalLog);
 $('o_lp').textContent=(truncated?'≥':'')+rows.length;$('o_mfd').textContent=fmt(mfd*1e6);$('o_lamc').textContent=fmt(lamC*1e9);$('o_delta').textContent=fmtSci(delta);$('o_th').textContent=fmt(th);
 $('modeRows').innerHTML=rows.map(x=>{let relLog=x.log10-base.log10;return `<tr><td>${x.name}</td><td>${fmt(x.cut,4)}</td><td>${fmt(x.U)}</td><td>${fmt(x.W)}</td><td>${fmtLoss(x.log10)}</td><td>${fmtLoss(x.totalLog)}</td><td>${Number.isFinite(relLog)?(relLog>300?'>1e300':fmt(Math.pow(10,relLog),3)+'×'):'—'}</td><td>${fmtCrit(x.crit)}</td></tr>`}).join('');
 let minD=Math.max(D*.2,2*a*1.1),maxD=D*3,N=240,xs=[];for(let i=0;i<=N;i++)xs.push((minD+(maxD-minD)*i/N)*1e3);
 fiberChart={D:D*1e3,xs,hover:null,series:rows.slice(0,CHART_MODES).map((x,k)=>({name:x.name,color:MODE_COLORS[k%MODE_COLORS.length],lg:xs.map(dmm=>bendLossLog(x.l,x.U,x.W,a,dmm*1e-3/2,lam,n1,eo))}))};
 $('fiberLegend').innerHTML=fiberChart.series.map(s=>'<span><i class="dot" style="background:'+s.color+'"></i>'+s.name+'</span>').join('')+(rows.length>CHART_MODES?'<span>（曲线仅显示截止 V 最低的 '+CHART_MODES+' 个模式，完整数据见上表）</span>':'');$('fiberTip').hidden=true;drawFiberChart();
 let warn=[V<2.404826?'当前为单模（V < 2.405），只有 LP₀₁ 在理想阶跃模型中传播；截止波长 λc = '+fmt(lamC*1e9)+' nm。':'当前为多模光纤（截止波长 λc = '+fmt(lamC*1e9)+' nm），表格列出 V 数超过截止值的全部 LP 模式。'];
 if(truncated)warn.push('模式数超过 '+MAX_LP+'，仅求解截止 V 最低的 '+MAX_LP+' 个 LP 模式。');
 if(delta>0.03)warn.push('Δ = '+fmtSci(delta)+'，已偏离弱导近似（Δ ≪ 1），LP 模式与损耗结果误差增大。');
 if(R/a<50)warn.push('R/a = '+fmt(R/a,4)+' 很小，属于紧弯，渐近公式误差较大，且需关注弯曲断纤风险。');
 /* 弯曲致模场畸变：等效折射率倾斜 n(x)≈n(1+x/R_eff)，倾斜在芯径上的增量与 Δn 可比时模场显著外移、收缩（LMA 光纤尤甚） */
 const tilt=n1*2*a/(R*eo),dn=n1-n2;
 if(V>3&&tilt>0.3*dn)warn.push('弯曲致折射率倾斜量 n·2a/R_eff = '+fmtSci(tilt)+'，为纤芯折射率差 Δn = '+fmtSci(dn)+' 的 '+fmt(tilt/dn,3)+' 倍：LMA 光纤在此弯曲下模场明显外移、MFD 缩小，Marcuse 渐近式只能给趋势，选模绕纤设计请以实测或 FEM 弯曲模式计算为准。');
 if(eo===1)warn.push('弹光修正已关闭（系数 = 1），石英光纤的宏弯损耗会被系统性高估。');
 warn.push('宏弯损耗对芯径和 NA 呈指数敏感（NA 偏差 0.005 可使损耗变化一个数量级），请用规格书曲线或实测校准。');
 if(base.log10<-12)warn.push('LP₀₁ 理论宏弯项仅 '+fmtLoss(base.log10)+' dB/m，实际损耗将由微弯、模式耦合、接续和材料吸收决定。');
 warn.push('各模式损耗是理想均匀恒定弯曲段的宏弯辐射项，不是整根光纤的总损耗；高阶模式对折射率剖面、模式耦合和紧弯条件更敏感。');
 $('fiberNotice').className='notice'+(V<2.404826?' good':'');$('fiberNotice').textContent=warn.join(' ');
 lastResults.fiber={title:'光纤参数与绕纤损耗',inputs:[['纤芯直径',fmt(2*a*1e6),'μm'],['NA',fmt(NA),''],['包层折射率 n₂',fmt(n2,6),''],['波长',fmt(lam*1e9),'nm'],['绕纤直径 D',fmt(D*1e3),'mm'],['弹光修正系数',fmt(eo),''],['绕纤长度 L',fmt(L),'m'],['损耗阈值',fmt(th),'dB/m']],outputs:[['V 数',fmt(V),''],['芯层折射率 n₁',fmt(n1,6),''],['相对折射率差 Δ',fmtSci(delta),''],['截止波长 λc',fmt(lamC*1e9),'nm'],['LP₀₁ 模场直径(Petermann II)',fmt(mfd*1e6),'μm'],['接受半角',fmt(ang),'°'],['F 数',fmt(fnum),''],['LP 模式数',String(rows.length),''],['导模数(含简并)',String(nTot),''],['绕纤圈数',fmt(turns,3),''],['LP₀₁ 弯曲损耗',fmtLoss(base.log10),'dB/m'],['LP₀₁ 本段总损耗',fmtLoss(base.totalLog),'dB']],table:{head:['模式','截止V','U','W','弯曲损耗 dB/m','本段总损耗 dB','相对LP₀₁','临界绕纤直径 mm'],rows:rows.map(x=>[x.name,fmt(x.cut,4),fmt(x.U),fmt(x.W),fmtLoss(x.log10),fmtLoss(x.totalLog),fmt(Math.pow(10,x.log10-base.log10),3),fmtCrit(x.crit)])}};
}
/* ---------- 光纤熔接损耗 ---------- */
function lp01Field(V,a){/* 阶跃光纤 LP₀₁ 归一化场 ψ(r)：芯内 J₀(Ur/a)/J₀(U)，包层 K₀(Wr/a)/K₀(W)（指数缩放避免下溢） */const uw=solveModeUW(V,{l:0,m:1,cut:0});if(!uw)return null;const {U,W}=uw,j0=besselJ0(U),k0s=besselKs(0,W);return {U,W,psi:r=>r<=a?besselJ0(U*r/a)/j0:besselKs(0,W*r/a)/k0s*Math.exp(-W*(r/a-1))};}
function overlapExact(F1,F2,d,rmax){/* η = |∫ψ₁(r)ψ₂(|r−d|)dA|² / (∫ψ₁²dA·∫ψ₂²dA)，极坐标数值积分；ψ 为实函数 */const Nr=360,Nt=d>0?96:1,h=rmax/Nr;let n1=0,n2=0,ov=0;
 for(let i=0;i<Nr;i++){const r=(i+0.5)*h,p1=F1.psi(r),p2=F2.psi(r);n1+=p1*p1*r;n2+=p2*p2*r;
  if(d>0){let s=0;for(let k=0;k<Nt;k++){const t=(k+0.5)*Math.PI/Nt,rr=Math.sqrt(r*r+d*d-2*r*d*Math.cos(t));s+=F2.psi(rr);}ov+=p1*r*s/Nt;}else ov+=p1*p2*r;}
 /* 角向：∫₀²π = 2·∫₀^π，范数同为 2π 因子，比值中消去 */return ov*ov/(n1*n2);}
const dBof=eta=>-10*Math.log10(eta);
function spliceGauss(w1,w2,d,th,n,lam){const S=w1*w1+w2*w2;return {mfd:(2*w1*w2/S)**2,off:Math.exp(-2*d*d/S),tilt:Math.exp(-2*(Math.PI*n*th*w1*w2)**2/(lam*lam*S))};}
let spliceChart=null;
function calcSplice(){
 const lam=toM(val('p_lambda'),unit('p_lambda_u')),d=val('p_off')*1e-6,th=val('p_tilt')*Math.PI/180,n=val('p_n'),B=val('p_budget');
 if(!(lam>0))throw Error('波长必须为正。');if(!(d>=0&&th>=0))throw Error('横向偏移和倾角不能为负。');if(!(n>=1))throw Error('介质折射率应 ≥ 1。');if(!(B>0))throw Error('损耗预算必须为正。');
 if(th>5*Math.PI/180)throw Error('倾角超过 5°，已超出近轴重叠模型的适用范围。');
 const fib=[1,2].map(k=>{const a=val('p'+k+'_core')*1e-6/2,NA=val('p'+k+'_na'),src=unit('p'+k+'_src');if(!(a>0&&NA>0&&NA<1))throw Error('光纤 '+k+'：纤芯直径必须为正，NA 应在 0–1 之间。');
  const V=2*Math.PI*a*NA/lam,uw=solveModeUW(V,{l:0,m:1,cut:0});let w,how;
  if(src==='mfd'){w=val('p'+k+'_mfd')*1e-6/2;if(!(w>0))throw Error('光纤 '+k+'：规格书 MFD 必须为正。');how='规格书';}
  else{if(!uw)throw Error('光纤 '+k+'：无法求解 LP₀₁。');w=lp01MFD(uw.U,uw.W,a)/2;how='Petermann II 计算';}
  return {a,NA,V,w,how,src};});
 const [F1,F2]=fib,{w:w1}=F1,{w:w2}=F2,S=w1*w1+w2*w2;
 const g=spliceGauss(w1,w2,d,th,n,lam),eta=g.mfd*g.off*g.tilt,L={mfd:dBof(g.mfd),off:dBof(g.off),tilt:dBof(g.tilt)},Ltot=L.mfd+L.off+L.tilt;
 /* 允许偏差：在其余两项固定时，令总损耗 = 预算 */
 const LN=Math.LN10/10,cOff=2/S/LN,cTilt=2*(Math.PI*n*w1*w2)**2/(lam*lam*S)/LN; /* L_off = cOff·d²，L_tilt = cTilt·θ²（dB） */
 const dMax=r=>r>0?Math.sqrt(r/cOff):NaN,tMax=r=>r>0?Math.sqrt(r/cTilt):NaN;
 const dAllow=dMax(B-L.mfd-L.tilt),tAllow=tMax(B-L.mfd-L.off),d0=dMax(B-L.mfd),t0=tMax(B-L.mfd);
 const X10=Math.pow(10,B/20),rmax=X10+Math.sqrt(X10*X10-1); /* η_MFD = [2r/(1+r²)]² = 10^(−B/10) ⇒ r² − 2·10^(B/20)·r + 1 = 0 的大根 */
 const fmtA=(v,deg)=>Number.isFinite(v)?fmt(deg?v*180/Math.PI:v*1e6,4):'超出预算';
 $('q_total').textContent=fmt(Ltot,4);$('q_eta').textContent=fmt(eta*100,5);$('q_dmax').textContent=fmtA(dAllow);$('q_tmax').textContent=fmtA(tAllow,true);
 $('q_v1').textContent=fmt(F1.V);$('q_v2').textContent=fmt(F2.V);$('q_m1').textContent=fmt(2*w1*1e6);$('q_m2').textContent=fmt(2*w2*1e6);$('q_s1').textContent=F1.how;$('q_s2').textContent=F2.how;$('q_ratio').textContent=fmt(Math.max(w1,w2)/Math.min(w1,w2),4);
 $('q_rmax').textContent=fmt(rmax,4);$('q_d0').textContent=fmtA(d0);$('q_t0').textContent=fmtA(t0,true);
 const parts=[['模场失配',g.mfd,L.mfd],['横向偏移',g.off,L.off],['轴向倾角',g.tilt,L.tilt]];
 $('q_rows').innerHTML=parts.map(([nm,e,l])=>`<tr><td>${nm}</td><td>${fmt(e*100,6)}%</td><td>${fmt(l,4)}</td><td>${Ltot>0?fmt(l/Ltot*100,3)+'%':'—'}</td></tr>`).join('')+`<tr><td><b>合计</b></td><td><b>${fmt(eta*100,6)}%</b></td><td><b>${fmt(Ltot,4)}</b></td><td>100%</td></tr>`;
 /* 精确 LP₀₁ 重叠：仅当两根光纤都由纤芯/NA 计算时有意义 */
 let exact=NaN,exactFn=null;const both=F1.src==='calc'&&F2.src==='calc';
 if(both){const E1=lp01Field(F1.V,F1.a),E2=lp01Field(F2.V,F2.a);if(E1&&E2){const rm=6*Math.max(w1,w2)+d;exactFn=dd=>dBof(overlapExact(E1,E2,dd,rm+dd));exact=exactFn(d);}}
 const gref=L.mfd+L.off;
 $('q_exact').textContent=both?fmt(exact,4):'—';$('q_gref').textContent=fmt(gref,4);$('q_exact_line').hidden=!both;
 /* 多模满注入几何损耗（双向） */
 const mmRow=(A,Bf,lbl)=>{const lc=A.a>Bf.a?-10*Math.log10((Bf.a/A.a)**2):0,ln=A.NA>Bf.NA?-10*Math.log10((Bf.NA/A.NA)**2):0;return `<tr><td>${lbl}</td><td>${fmt(lc,4)}</td><td>${fmt(ln,4)}</td><td>${fmt(lc+ln,4)}</td></tr>`;};
 $('q_mm').innerHTML=mmRow(F1,F2,'光纤 1 → 光纤 2')+mmRow(F2,F1,'光纤 2 → 光纤 1');
 const mmOK=F1.V>10&&F2.V>10;$('q_mm_note').textContent=mmOK?'两根光纤 V 均 > 10，多模几何模型适用。':'注意：当前 V₁ = '+fmt(F1.V,3)+'、V₂ = '+fmt(F2.V,3)+'，模式数少，几何模型仅作参考，应以上方基模结果为主。';
 /* 图表数据：d 从 0 到 max(3·当前 d, 允许偏移的 1.5 倍, 0.6·w_min) */
 let dEnd=Math.max(3*d,1.5*(Number.isFinite(d0)?d0:0),0.6*Math.min(w1,w2));const N=120,xs=[];for(let i=0;i<=N;i++)xs.push(dEnd*i/N);
 const curve0=xs.map(x=>L.mfd+dBof(Math.exp(-2*x*x/S))),curveT=xs.map((x,i)=>curve0[i]+L.tilt),curveE=exactFn?xs.filter((_,i)=>i%4===0).map(x=>[x,exactFn(x)]):null;
 spliceChart={xs:xs.map(x=>x*1e6),c0:curve0,cT:curveT,cE:curveE?curveE.map(([x,y])=>[x*1e6,y]):null,B,d:d*1e6,tilt:th,hover:null};$('spliceTip').hidden=true;drawSpliceChart();
 /* 提示 */
 let msg=[],lvl='good';const warn=()=>{if(lvl==='good')lvl='';};
 if(Ltot>B){lvl='bad';msg.push('总损耗 '+fmt(Ltot,4)+' dB 超出预算 '+fmt(B)+' dB。');}else msg.push('总损耗 '+fmt(Ltot,4)+' dB，在预算 '+fmt(B)+' dB 以内，余量 '+fmt(B-Ltot,3)+' dB。');
 if(L.mfd>B){lvl='bad';msg.push('仅模场失配就已超出预算（MFD 比 '+fmt(Math.max(w1,w2)/Math.min(w1,w2),4)+' > 允许值 '+fmt(rmax,4)+'），需要锥形过渡、模场适配器或热扩芯（TEC）熔接。');}
 else if(L.mfd>0.5*Ltot&&Ltot>0.05){warn();msg.push('损耗主要来自模场失配（'+fmt(L.mfd/Ltot*100,3)+'%），改善对准精度收效有限。');}
 fib.forEach((F,i)=>{if(F.V>2.405)msg.push('光纤 '+(i+1)+' V = '+fmt(F.V,4)+'，为少模/LMA 光纤，结果为 LP₀₁ → LP₀₁ 基模损耗。');if(F.src==='calc'&&(F.V<1.2))warn(),msg.push('光纤 '+(i+1)+' V = '+fmt(F.V,3)+' 很小，模场大量扩展到包层，对弯曲和包层折射率非常敏感。');});
 if(both&&Number.isFinite(exact)&&Math.abs(exact-gref)>Math.max(0.02,0.1*gref)){warn();msg.push('精确 LP₀₁ 重叠与高斯近似相差 '+fmt(exact-gref,3)+' dB（V 偏离单模最佳区间），请以精确值为准。');}
 if(fib.some(F=>F.src==='mfd'))msg.push('选择了规格书 MFD 的光纤不参与精确重叠计算；规格书 MFD 一般已包含实际折射率剖面影响，通常比理想阶跃模型更可信。');
 $('spliceNotice').className='notice '+lvl;$('spliceNotice').textContent=msg.join(' ');
 lastResults.splice={title:'光纤熔接损耗',inputs:[['波长',fmt(lam*1e9),'nm'],['光纤1 纤芯直径',fmt(2*F1.a*1e6),'μm'],['光纤1 NA',fmt(F1.NA),''],['光纤1 MFD 来源',F1.how,''],['光纤2 纤芯直径',fmt(2*F2.a*1e6),'μm'],['光纤2 NA',fmt(F2.NA),''],['光纤2 MFD 来源',F2.how,''],['横向偏移 d',fmt(d*1e6),'μm'],['轴向倾角 θ',fmt(th*180/Math.PI),'°'],['介质折射率 n',fmt(n),''],['损耗预算',fmt(B),'dB']],
  outputs:[['光纤1 V',fmt(F1.V),''],['光纤1 MFD',fmt(2*w1*1e6),'μm'],['光纤2 V',fmt(F2.V),''],['光纤2 MFD',fmt(2*w2*1e6),'μm'],['模场失配损耗',fmt(L.mfd,4),'dB'],['横向偏移损耗',fmt(L.off,4),'dB'],['轴向倾角损耗',fmt(L.tilt,4),'dB'],['基模熔接总损耗',fmt(Ltot,4),'dB'],['耦合效率',fmt(eta*100,6),'%'],['允许横向偏移(当前θ)',fmtA(dAllow),'μm'],['允许轴向倾角(当前d)',fmtA(tAllow,true),'°'],['允许最大 MFD 比',fmt(rmax,4),''],['精确LP01重叠(无倾角)',both?fmt(exact,4):'—','dB'],['高斯近似(无倾角)',fmt(gref,4),'dB']]};
}
function drawSpliceChart(){const st=spliceChart,cv=$('spliceChart');if(!st||!cv.getContext)return;
 const W=cv.clientWidth||850,H=cv.clientHeight||320,dpr=window.devicePixelRatio||1;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const m={l:62,r:20,t:24,b:46},pw=W-m.l-m.r,ph=H-m.t-m.b,xs=st.xs,xmin=0,xmax=xs[xs.length-1]||1;
 const allY=st.c0.concat(st.cT,st.cE?st.cE.map(p=>p[1]):[]).filter(Number.isFinite),ymax=Math.max(st.B*1.25,...allY)*1.05||1;
 const X=x=>m.l+(x-xmin)/(xmax-xmin)*pw,Y=y=>m.t+ph-y/ymax*ph;Object.assign(st,{W,H,m,pw,ph,xmin,xmax,ymax,X,Y});
 c.font='11px sans-serif';c.lineWidth=1;let ys=niceStep(ymax,5);c.textAlign='right';c.textBaseline='middle';
 for(let y=0;y<=ymax+1e-12;y+=ys){c.strokeStyle='#dce5ef';c.beginPath();c.moveTo(m.l,Y(y));c.lineTo(m.l+pw,Y(y));c.stroke();c.fillStyle='#607086';c.fillText(fmt(y,3),m.l-6,Y(y));}
 let xsS=niceStep(xmax,W<500?4:8);c.textAlign='center';c.textBaseline='top';for(let x=0;x<=xmax+1e-12;x+=xsS){c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();c.fillStyle='#607086';c.fillText(fmt(x,3),X(x),m.t+ph+6);}
 c.strokeStyle='#8ea1b7';c.beginPath();c.moveTo(m.l,m.t);c.lineTo(m.l,m.t+ph);c.lineTo(m.l+pw,m.t+ph);c.stroke();
 c.fillStyle='#45576d';c.font='12px sans-serif';c.textAlign='left';c.textBaseline='alphabetic';c.fillText('熔接损耗（dB）',m.l,14);c.textAlign='center';c.fillText('横向偏移 d（μm）',m.l+pw/2,H-6);
 c.save();c.beginPath();c.rect(m.l,m.t,pw,ph);c.clip();
 c.strokeStyle='#ba3030';c.setLineDash([6,4]);c.beginPath();c.moveTo(m.l,Y(st.B));c.lineTo(m.l+pw,Y(st.B));c.stroke();
 c.strokeStyle='#8a97a8';c.setLineDash([4,4]);c.beginPath();c.moveTo(X(st.d),m.t);c.lineTo(X(st.d),m.t+ph);c.stroke();c.setLineDash([]);
 const line=(ys,col,w,dash)=>{c.strokeStyle=col;c.lineWidth=w;c.setLineDash(dash||[]);c.beginPath();xs.forEach((x,i)=>i?c.lineTo(X(x),Y(ys[i])):c.moveTo(X(x),Y(ys[i])));c.stroke();c.setLineDash([]);};
 line(st.c0,'#1769e0',2);if(st.tilt>0)line(st.cT,'#e89022',2,[5,4]);
 if(st.cE){c.fillStyle='#14804a';st.cE.forEach(([x,y])=>{c.beginPath();c.arc(X(x),Y(y),2.6,0,2*Math.PI);c.fill();});}
 if(st.hover!==null){const i=st.hover,px=X(xs[i]);c.strokeStyle='rgba(24,35,51,.35)';c.lineWidth=1;c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();[[st.c0[i],'#1769e0'],[st.tilt>0?st.cT[i]:NaN,'#e89022']].forEach(([y,col])=>{if(!Number.isFinite(y))return;c.fillStyle=col;c.beginPath();c.arc(px,Y(y),4,0,2*Math.PI);c.fill();});}
 c.restore();}
function spliceHover(e){const st=spliceChart,cv=$('spliceChart'),tip=$('spliceTip');if(!st||!st.X)return;const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*st.W/r.width,my=(e.clientY-r.top)*st.H/r.height;
 if(mx<st.m.l||mx>st.m.l+st.pw||my<st.m.t||my>st.m.t+st.ph){spliceLeave();return;}
 const i=Math.round(Math.min(1,Math.max(0,(mx-st.m.l)/st.pw))*(st.xs.length-1));st.hover=i;drawSpliceChart();
 let ex='';if(st.cE){let best=null;st.cE.forEach(p=>{if(!best||Math.abs(p[0]-st.xs[i])<Math.abs(best[0]-st.xs[i]))best=p;});ex='<div>精确 LP₀₁（d = '+fmt(best[0],3)+' μm）= '+fmt(best[1],4)+' dB</div>';}
 tip.innerHTML='<div class="hd">d = '+fmt(st.xs[i],4)+' μm</div><div>θ = 0：'+fmt(st.c0[i],4)+' dB</div>'+(st.tilt>0?'<div>当前 θ：'+fmt(st.cT[i],4)+' dB</div>':'')+ex+'<div>预算：'+fmt(st.B)+' dB</div>';tip.hidden=false;
 tip.style.left=Math.max(0,Math.min(mx+14,st.W-tip.offsetWidth-8))+'px';tip.style.top=Math.max(0,Math.min(my+12,st.H-tip.offsetHeight-8))+'px';}
function spliceLeave(){if(spliceChart&&spliceChart.hover!==null){spliceChart.hover=null;drawSpliceChart();}$('spliceTip').hidden=true;}
/* ---------- 多透镜 / 反射镜高斯光束传输（单位统一为 mm；反射镜按展开光路处理，x、y 两方向独立追迹） ---------- */
const ML_DEFAULT=[{t:'cc',f:50,d:100,ap:10,th:0,ax:'h',rf:99.5},{t:'cv',f:150,d:100,ap:25,th:0,ax:'h',rf:99.5},{t:'mcc',f:400,d:150,ap:25,th:10,ax:'h',rf:99.5}],ML_MAX=10;
const ML_TYPES={cv:'凸透镜',cc:'凹透镜',mcc:'凹面镜',mcv:'凸面镜'};
const isMir=t=>t==='mcc'||t==='mcv';
function elName(L,i){return (isMir(L.t)?'M':'L')+(i+1);}
function renderLenses(arr){const box=$('lensList');box.innerHTML='';arr.forEach((L,i)=>{const b=document.createElement('div');b.className='lensbox '+L.t;const n=i+1;
  b.innerHTML='<div class="lhd"><b class="lname"></b><button type="button" class="ldel" aria-label="删除元件 '+n+'">删除</button></div><div class="lensgrid">'
  +'<div class="field"><label>类型</label><div class="inputrow"><select data-k="t" class="wide" aria-label="元件 '+n+' 类型"><option value="cv">凸透镜（会聚）</option><option value="cc">凹透镜（发散）</option><option value="mcc">凹面镜（会聚）</option><option value="mcv">凸面镜（发散）</option></select></div></div>'
  +'<div class="field"><label class="flab">焦距 |f|</label><div class="inputrow"><input data-k="f" type="number" min="0.001" step="any" aria-label="元件 '+n+' 焦距或曲率半径绝对值 mm"><span class="unit">mm</span></div></div>'
  +'<div class="field"><label class="dlab"></label><div class="inputrow"><input data-k="d" type="number" min="0" step="any" aria-label="元件 '+n+' 与前一元件间距 mm"><span class="unit">mm</span></div></div>'
  +'<div class="field"><label>有效口径 Ø</label><div class="inputrow"><input data-k="ap" type="number" min="0.001" step="any" aria-label="元件 '+n+' 有效口径 mm"><span class="unit">mm</span></div></div>'
  +'<div class="field mir"><label>入射角 θ <span>相对法线</span></label><div class="inputrow"><input data-k="th" type="number" min="0" max="80" step="any" aria-label="元件 '+n+' 入射角 度"><span class="unit">°</span></div></div>'
  +'<div class="field mir"><label>折叠方向</label><div class="inputrow"><select data-k="ax" class="wide" aria-label="元件 '+n+' 折叠方向"><option value="h">水平面（x 为子午）</option><option value="v">竖直面（y 为子午）</option></select></div></div>'
  +'<div class="field mir"><label>反射率</label><div class="inputrow"><input data-k="rf" type="number" min="0" max="100" step="any" aria-label="元件 '+n+' 反射率 %"><span class="unit">%</span></div></div></div>';
  ['t','f','d','ap','th','ax','rf'].forEach(k=>b.querySelector('[data-k="'+k+'"]').value=L[k]);box.appendChild(b);});updateLensUI();}
function readLenses(){return [...document.querySelectorAll('#lensList .lensbox')].map(b=>{const g=k=>b.querySelector('[data-k="'+k+'"]').value;return {t:g('t'),f:parseFloat(g('f')),d:parseFloat(g('d')),ap:parseFloat(g('ap')),th:parseFloat(g('th')),ax:g('ax'),rf:parseFloat(g('rf'))};});}
function updateLensUI(){const bs=[...document.querySelectorAll('#lensList .lensbox')],arr=readLenses();let z=0;
  bs.forEach((b,i)=>{const L=arr[i],m=isMir(L.t);z+=L.d;b.className='lensbox '+L.t;
   b.querySelector('.lname').textContent=elName(L,i)+' · '+ML_TYPES[L.t]+(m&&L.th>0?' · θ = '+fmt(L.th,4)+'°':'')+' · z = '+(Number.isFinite(z)?fmt(z,6):'—')+' mm';
   b.querySelector('.flab').innerHTML=m?'曲率半径 |R| <span>|f| = |R|/2</span>':'焦距 |f|';b.querySelectorAll('.mir').forEach(el=>el.hidden=!m);
   b.querySelector('.dlab').textContent=i===0?'距起始面 d':'距 '+elName(arr[i-1],i-1)+' 间距 d';b.querySelector('.ldel').disabled=bs.length<=1;});
  $('lensAdd').disabled=bs.length>=ML_MAX;$('lensAdd').textContent=bs.length>=ML_MAX?'已达上限（'+ML_MAX+' 个元件）':'+ 添加元件';}
function mlW(s,z){return s.w0*Math.hypot(1,(z-s.zw)/s.zR);}
function mlR(s,z){const dz=z-s.zw;return Math.abs(dz)<1e-12*Math.max(1,s.zR)?Infinity:dz*(1+(s.zR/dz)**2);}
function mlSegAt(t,z){let s=t.segs[0];for(const g of t.segs)if(z>=g.z0)s=g;return s;}
function mlRay(y,u,lenses,zEnd,ax){/* 近轴光线追迹（ax = 'x' | 'y' 方向）：y′ = y，u′ = u − y/f；超出该方向半口径则截止 */const pts=[[0,y]];let z=0;
  for(const L of lenses){y+=u*(L.z-z);z=L.z;pts.push([z,y]);if(Math.abs(y)>L['h'+ax])return {pts,clip:true};u-=y/L['f'+ax];}
  y+=u*(zEnd-z);pts.push([Math.max(zEnd,z),y]);return {pts,clip:false};}
function mlTrace(lam,M2,w0,zw,lenses,ax){/* 单方向 q 参数逐面变换：q₂ = q₁ + d，1/q₂ = 1/q₁ − 1/f；f 取该方向等效焦距 */
  const k=M2*lam/Math.PI,zR0=w0*w0/k,segs=[{z0:0,z1:lenses.length?lenses[0].z:Infinity,zw,zR:zR0,w0}],info=[];
  let A=1,B=0,C=0,D=1,zp=null;
  const w00=mlW(segs[0],0),R00=mlR(segs[0],0),g={y:w00,u:Number.isFinite(R00)?w00/R00:0,z:0};
  lenses.forEach((L,i)=>{const f=L['f'+ax],s=segs[segs.length-1],a=L.z-s.zw,b=s.zR,q2=a*a+b*b,r=a/q2-1/f,si=b/q2,den=r*r+si*si,a2=r/den,b2=si/den;
   const win=mlW(s,L.z),ns={z0:L.z,z1:i+1<lenses.length?lenses[i+1].z:Infinity,zw:L.z-a2,zR:b2,w0:Math.sqrt(b2*k)};segs.push(ns);
   g.y+=g.u*(L.z-g.z);g.z=L.z;g.u-=g.y/f;const zc=Math.abs(g.u)<1e-15*Math.abs(g.y)?Infinity:L.z-g.y/g.u;
   if(zp!==null){const d=L.z-zp;A+=C*d;B+=D*d;}C-=A/f;D-=B/f;zp=L.z;
   info.push({f,win,zw:ns.zw,zR:ns.zR,w0:ns.w0,zc});});
  return {segs,info,sys:{A,B,C,D},k};}
function apT(wx,wy,hx,hy){/* 椭圆高斯光斑通过椭圆口径（半轴 hx、hy）的功率透过率：T = 1 − (1/2π)∫exp[−2/(u²cos²φ + v²sin²φ)]dφ，u = wx/hx，v = wy/hy */
  const u=wx/hx,v=wy/hy;if(Math.abs(u-v)<=1e-12*Math.max(u,v))return 1-Math.exp(-2/(u*u));const N=2000;let s=0;
  for(let j=0;j<N;j++){const p=(j+.5)/N*2*Math.PI,c=Math.cos(p),sn=Math.sin(p);s+=Math.exp(-2/(u*u*c*c+v*v*sn*sn));}return 1-s/N;}
function mlTrace2(lam,M2,w0,zw,lenses){const X=mlTrace(lam,M2,w0,zw,lenses,'x'),Y=mlTrace(lam,M2,w0,zw,lenses,'y');
  const info=lenses.map((L,i)=>{const T=apT(X.info[i].win,Y.info[i].win,L.hx,L.hy),R=isMir(L.t)?L.rf/100:1;return {T,R,eta:T*R};});
  return {x:X,y:Y,info,astig:lenses.some(L=>L.fx!==L.fy)};}
function roundSpot(sx,sy,zmin){/* 解 wx(z) = wy(z)：(z−zwx)²/zRx − (z−zwy)²/zRy + zRx − zRy = 0 */
  const a=1/sx.zR-1/sy.zR,b=-2*(sx.zw/sx.zR-sy.zw/sy.zR),c=sx.zw**2/sx.zR-sy.zw**2/sy.zR+sx.zR-sy.zR;let rs=[];
  if(Math.abs(a)<1e-12*(1/sx.zR+1/sy.zR)){if(b!==0)rs=[-c/b];}else{const D=b*b-4*a*c;if(D>=0){const q=Math.sqrt(D);rs=[(-b-q)/(2*a),(-b+q)/(2*a)];}}
  rs=rs.filter(z=>Number.isFinite(z)&&z>=zmin);if(!rs.length)return null;let best=null,bw=Infinity;rs.forEach(z=>{const w=mlW(sx,z);if(w<bw){bw=w;best=z;}});return {z:best,w:bw};}
const sameV=(a,b)=>a===b||Math.abs(a-b)<=1e-9*Math.max(Math.abs(a),Math.abs(b));
const XY=(a,b,f)=>sameV(a,b)?f(a):f(a)+' / '+f(b);
let mlChart=null;/* 光路图状态：{tr,lenses,zEnd,zobs,view,...}，单位 mm */
function segName(lenses,z){const n=lenses.length;let i=0;lenses.forEach((L,j)=>{if(z>=L.z)i=j+1;});return i===0?elName(lenses[0],0)+' 之前':i===n?elName(lenses[n-1],n-1)+' 之后':elName(lenses[i-1],i-1)+' 与 '+elName(lenses[i],i)+' 之间';}
function calcMulti(){
 updateLensUI();
 const lam=toM(val('m_lambda'),unit('m_lambda_u'))*1e3,P=val('m_power')*(unit('m_power_u')==='kW'?1000:1),M2=val('m_m2'),mode=unit('m_mode'),zobs=val('m_zobs'),zEndIn=val('m_zend'),nr=Math.round(val('m_rays')),view=unit('m_view');
 if(!(lam>0&&P>=0&&M2>=1))throw Error('请检查输入：波长必须为正，功率不能为负，M² 不能小于 1。');
 if(!Number.isFinite(zobs)||zobs<0)throw Error('观察面位置必须为不小于 0 的数值。');
 if(!(nr>=1&&nr<=8))throw Error('每侧光线条数应为 1–8 的整数。');
 let w0,zw;if(mode==='col'){w0=toM(val('m_din'),unit('m_din_u'))*1e3/2;zw=0;if(!(w0>0))throw Error('起始面光束直径必须为正。');}
 else{w0=toM(val('m_w0in'),unit('m_w0in_u'))*1e3/2;zw=val('m_zw');if(!(w0>0))throw Error('入射束腰直径必须为正。');if(!Number.isFinite(zw))throw Error('请填写入射束腰位置。');}
 const raw=readLenses();let z=0;
 const lenses=raw.map((L,i)=>{const nm=elName(L,i),m=isMir(L.t);
  if(!(L.f>0))throw Error(nm+' 的'+(m?'曲率半径':'焦距')+'绝对值必须为正。');if(!(L.d>=0))throw Error(nm+' 的间距不能为负。');if(!(L.ap>0))throw Error(nm+' 的口径必须为正。');
  z+=L.d;if(!m)return {t:L.t,f:L.t==='cv'?L.f:-L.f,z,ap:L.ap,th:0,ax:'h',rf:100,fx:L.t==='cv'?L.f:-L.f,fy:L.t==='cv'?L.f:-L.f,hx:L.ap/2,hy:L.ap/2};
  if(!(L.th>=0&&L.th<80))throw Error(nm+' 的入射角应在 0–80° 之间。');if(!(L.rf>=0&&L.rf<=100))throw Error(nm+' 的反射率应在 0–100% 之间。');
  /* 球面镜：f = ±R/2；斜入射 θ：子午 f·cosθ，弧矢 f/cosθ；子午方向口径投影为 Ø·cosθ */
  const f=(L.t==='mcc'?1:-1)*L.f/2,c=Math.cos(L.th*Math.PI/180),ft=f*c,fs=f/c,h=L.ax==='h';
  return {t:L.t,f,z,ap:L.ap,th:L.th,ax:L.ax,rf:L.rf,R:L.f,fx:h?ft:fs,fy:h?fs:ft,hx:h?L.ap/2*c:L.ap/2,hy:h?L.ap/2:L.ap/2*c};});
 if(!lenses.length)throw Error('至少需要一个元件。');
 const tr=mlTrace2(lam,M2,w0,zw,lenses),TX=tr.x,TY=tr.y,lx=TX.segs[TX.segs.length-1],ly=TY.segs[TY.segs.length-1],zL=lenses[lenses.length-1].z;
 /* 图示范围：自动时覆盖末端实束腰之后一段距离，并包含观察面 */
 let zEnd;if(zEndIn>0)zEnd=zEndIn;else{const base=Math.max(0.3*zL,20),zf=Math.max(lx.zw,ly.zw);let ext=zf>zL?Math.min(1.35*(zf-zL)+0.2*base,Math.max(base,2.5*zL)):base;zEnd=Math.max(zL+ext,zobs*1.06);}
 if(zEnd<=zL&&zEndIn>0)throw Error('图示范围终点应大于最后一个元件位置 '+fmt(zL,6)+' mm（或填 0 自动）。');
 const sox=mlSegAt(TX,zobs),soy=mlSegAt(TY,zobs),wx=mlW(sox,zobs),wy=mlW(soy,zobs),Rx=mlR(sox,zobs),Ry=mlR(soy,zobs);
 const eta=tr.info.reduce((p,e)=>p*e.eta,1),etaObs=tr.info.filter((e,i)=>lenses[i].z<=zobs).reduce((p,e)=>p*e.eta,1);
 const Iobs=2*P*etaObs/(Math.PI*(wx/10)*(wy/10)),zrx=lx.zw-zL,zry=ly.zw-zL;
 const fmax=Math.max(...lenses.map(L=>Math.max(Math.abs(L.fx),Math.abs(L.fy)))),sysF=s=>{const af=Math.abs(s.C)*fmax<1e-9;return {af,efl:af?Infinity:-1/s.C,bfl:af?Infinity:-s.A/s.C,A:s.A};},SX=sysF(TX.sys),SY=sysF(TY.sys);
 const fI=v=>Number.isFinite(v)?fmt(v,5):'∞',um=v=>fmt(2*v*1e3),rel=v=>v>=0?'后 '+fmt(v,5):'前 '+fmt(-v,5)+'（虚）';
 $('m_o_dobs').textContent=XY(wx,wy,um);$('m_o_d0').textContent=XY(lx.w0,ly.w0,um);$('m_o_zw').textContent=XY(lx.zw,ly.zw,v=>fmt(v,6));
 $('m_o_zwrel').textContent='mm（末元件'+(sameV(zrx,zry)?rel(zrx):rel(zrx)+' / '+rel(zry))+'）';$('m_o_zr').textContent=XY(lx.zR,ly.zR,v=>fmtSci(v));
 $('m_o_efl').textContent=XY(SX.efl,SY.efl,fI);$('m_o_bfl').textContent=XY(SX.bfl,SY.bfl,fI);$('m_o_T').textContent=fmt(eta*100,5);$('m_o_I').textContent=fmtSci(Iobs/1e6);
 const rs=tr.astig?roundSpot(lx,ly,zL):null;
 $('m_o_astig').textContent=tr.astig?fmtSci(ly.zw-lx.zw):'0（无像散）';$('m_o_zround').textContent=tr.astig?(rs?fmt(rs.z,6):'末元件后无'):'—';$('m_o_dround').textContent=rs?um(rs.w):'—';$('m_o_ell').textContent=fmt(wx/wy,4);
 $('m_o_zobs2').textContent=fmt(zobs,6);$('m_o_seg').textContent=segName(lenses,zobs);$('m_o_dobs2').textContent=XY(wx,wy,um);$('m_o_fwhm').textContent=XY(wx,wy,v=>fmt(2*v*1e3*Math.sqrt(Math.log(2)/2)));
 $('m_o_def').textContent=XY(zobs-sox.zw,zobs-soy.zw,v=>fmtSci(v))+(sox===lx?'':'（按所在段束腰）');$('m_o_R').textContent=XY(Rx,Ry,v=>Number.isFinite(v)?fmtSci(v):'∞');$('m_o_I2').textContent=fmtSci(Iobs);
 const rows=lenses.map((L,i)=>{const a=TX.info[i],b=TY.info[i],e=tr.info[i];return [elName(L,i)+' '+ML_TYPES[L.t]+(isMir(L.t)?' θ='+fmt(L.th,4)+'°'+(L.th>0?(L.ax==='h'?'·水平':'·竖直'):''):''),XY(L.fx,L.fy,v=>fmt(v,6)),fmt(L.z,6),XY(a.win,b.win,v=>fmt(2*v,4)),fmt(e.eta*100,6)+(isMir(L.t)?'（'+fmt(e.T*100,6)+' × '+fmt(L.rf,4)+'）':''),XY(a.zw,b.zw,v=>fmt(v,6)),XY(a.zw-L.z,b.zw-L.z,v=>fmt(v,5)),XY(a.w0,b.w0,v=>fmt(2*v*1e3,4)),XY(a.zR,b.zR,v=>fmtSci(v))];});
 $('m_rows').innerHTML=rows.map(r=>'<tr>'+r.map((v,j)=>'<td'+(j===7?' class="hl"':'')+'>'+v+'</td>').join('')+'</tr>').join('');
 /* 提示信息 */
 const msgs=[];let lvl='good';const warn=()=>{if(lvl==='good')lvl='';};
 lenses.forEach((L,i)=>{const nm=elName(L,i),a=TX.info[i],b=TY.info[i],e=tr.info[i],r=Math.min(L.hx/a.win,L.hy/b.win),pa=Math.max(a.win/Math.abs(L.fx),b.win/Math.abs(L.fy));
  if(e.T<0.9){lvl='bad';msgs.push(nm+' 严重截光：（投影）口径/光斑直径 = '+fmt(r,3)+'，口径透过率仅 '+fmt(e.T*100,4)+'%，衍射会使实际光斑明显变差。');}
  else if(r<1.5){warn();msgs.push(nm+' （投影）口径/光斑直径 = '+fmt(r,3)+'（建议 ≥ 1.5），口径透过率 '+fmt(e.T*100,5)+'%。');}
  if(pa>0.25){warn();msgs.push(nm+' 处 D/(2|f|) = '+fmt(pa,3)+'，超出近轴近似可靠范围，实际光斑受像差主导。');}
  if(isMir(L.t)&&L.th===0){warn();msgs.push(nm+' 为正入射（θ = 0）：反射光沿原路返回，实际需配合分光镜 / 隔离器，或给一个小折转角。');}
  else if(isMir(L.t)&&L.th>20){warn();msgs.push(nm+' 入射角 '+fmt(L.th,4)+'° 较大：fx/fy = '+fmt(L.fx/L.fy,4)+'，像散显著，且彗差等未计入的离轴像差会增大，建议核对或改用离轴抛物面镜。');}});
 if(tr.astig){warn();msgs.push('存在像散：末端 x、y 束腰相距 Δz = '+fmtSci(ly.zw-lx.zw)+' mm'+(rs?'，圆形光斑在 z = '+fmt(rs.z,6)+' mm，直径 '+um(rs.w)+' μm':'')+'。可用另一面镜子的反向折叠或调整入射角做像散补偿。');}
 if(zrx<0||zry<0){warn();msgs.push('末元件后'+(tr.astig?(zrx<0&&zry<0?'x、y 两方向均':(zrx<0?'x 方向':'y 方向')):'')+'为发散光束（虚束腰），不存在实际焦点。');}
 else msgs.push('末端实束腰位于 z = '+XY(lx.zw,ly.zw,v=>fmt(v,6))+' mm，直径 '+XY(lx.w0,ly.w0,um)+' μm，焦深 2zR = '+XY(lx.zR,ly.zR,v=>fmtSci(2*v))+' mm。');
 [['x',TX,lx,zrx],['y',TY,ly,zry]].slice(0,tr.astig?2:1).forEach(([n,T,s,zr])=>{const zc=T.info[T.info.length-1].zc;if(Number.isFinite(zc)&&zc>zL&&zr>0&&Math.abs(zc-s.zw)>0.05*Math.max(zc-zL,1e-9)){warn();msgs.push((tr.astig?n+' 方向':'')+'高斯束腰与几何焦点（z = '+fmt(zc,6)+' mm）相差 '+fmtSci(s.zw-zc)+' mm：入射到末元件的光束瑞利长度与焦距可比，不能按几何焦点设置焦面。');}});
 if(SX.af||SY.af)msgs.push((SX.af&&SY.af?'':'x/y 中'+(SX.af?' x ':' y ')+'方向')+'为无焦（望远/扩束）系统：几何扩束倍率 |A| = '+XY(Math.abs(SX.A),Math.abs(SY.A),v=>fmt(v,5))+'。');
 if(Math.abs(zobs-lx.zw)<=lx.zR&&Math.abs(zobs-ly.zw)<=ly.zR&&zobs>=zL)msgs.push('观察面位于末端束腰 ±zR 范围内。');
 $('multiNotice').className='notice '+lvl;$('multiNotice').textContent=msgs.join(' ');
 mlChart={tr,lenses,zEnd,zobs,nr,view,raymode:unit('m_raymode'),hover:null};drawRayChart();drawSpotMap(wx,wy);
 const inBeam=mode==='col'?[['入射方式','准直光（束腰在 z = 0）',''],['起始面光束直径',fmt(2*w0,6),'mm']]:[['入射方式','已知束腰',''],['入射束腰直径 2w0',fmt(2*w0*1e3),'μm'],['入射束腰位置 z_w',fmt(zw,6),'mm']];
 const elIn=lenses.map((L,i)=>isMir(L.t)?[elName(L,i)+' '+ML_TYPES[L.t]+' |R| / z / 口径 / θ / 折叠 / 反射率',fmt(L.R,6)+' / '+fmt(L.z,6)+' / '+fmt(L.ap,5)+' / '+fmt(L.th,4)+'° / '+(L.ax==='h'?'水平':'竖直')+' / '+fmt(L.rf,5)+'%','']:[elName(L,i)+' '+ML_TYPES[L.t]+' f / z / 口径',fmt(L.f,6)+' / '+fmt(L.z,6)+' / '+fmt(L.ap,5),'mm']);
 lastResults.multi={title:'多透镜 / 反射镜高斯光束传输（展开光路）',inputs:[['波长',fmt(lam*1e6),'nm'],['功率',fmt(P),'W'],['M²',fmt(M2),''],...inBeam,...elIn,['观察面位置',fmt(zobs,6),'mm']],
  outputs:[['观察面光斑直径 x / y',XY(wx,wy,um),'μm'],['观察面 FWHM x / y',XY(wx,wy,v=>fmt(2*v*1e3*Math.sqrt(Math.log(2)/2))),'μm'],['观察面椭圆度 wx/wy',fmt(wx/wy,5),''],['观察面波前曲率半径 x / y',XY(Rx,Ry,v=>Number.isFinite(v)?fmtSci(v):'∞'),'mm'],['观察面峰值功率密度',fmtSci(Iobs/1e6),'MW/cm²'],
   ['末端束腰直径 x / y',XY(lx.w0,ly.w0,um),'μm'],['末端束腰位置 z x / y',XY(lx.zw,ly.zw,v=>fmt(v,6)),'mm'],['末端束腰距末元件 x / y',XY(zrx,zry,v=>fmt(v,6)),'mm'],['末端瑞利长度 x / y',XY(lx.zR,ly.zR,v=>fmtSci(v)),'mm'],['末端发散半角 x / y',XY(lx.w0/lx.zR,ly.w0/ly.zR,v=>fmtSci(v*1e3)),'mrad'],
   ['像散 Δz = z_wy − z_wx',fmtSci(ly.zw-lx.zw),'mm'],['圆形光斑位置 z',rs?fmt(rs.z,6):'—','mm'],['圆形光斑直径',rs?um(rs.w):'—','μm'],['等效焦距 EFL x / y',XY(SX.efl,SY.efl,fI),'mm'],['后截距 BFL x / y',XY(SX.bfl,SY.bfl,fI),'mm'],['总效率（口径 × 反射率）',fmt(eta*100,6),'%']],
  table:{title:'逐元件参数',head:['元件','等效焦距 fx / fy mm','位置 z mm','入射光斑直径 x / y mm','效率 %','出射束腰 z x / y mm','束腰距元件 x / y mm','出射束腰直径 x / y μm','瑞利长度 x / y mm'],rows}};
}
function drawRayChart(){const st=mlChart,cv=$('rayChart');if(!st||!cv.getContext||!cv.clientWidth)return;
 const W=cv.clientWidth,H=cv.clientHeight||380,dpr=window.devicePixelRatio||1;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
 const m={l:62,r:18,t:30,b:42},pw=W-m.l-m.r,ph=H-m.t-m.b,tr=st.tr,xmin=0,xmax=st.zEnd,ax0=st.view==='y'?'y':'x';
 /* 显示的方向：无像散时 x、y 重合只画一条 */
 const axes=st.view==='both'?(tr.astig?['x','y']:['x']):[st.view];st.axes=axes;
 let xs=[];for(let i=0;i<=700;i++)xs.push(xmin+(xmax-xmin)*i/700);st.lenses.forEach(L=>{xs.push(L.z-1e-9,L.z);});
 axes.forEach(a=>tr[a].segs.forEach(s=>{if(s.zw>s.z0&&s.zw<Math.min(s.z1,xmax))xs.push(s.zw);}));
 xs=xs.filter(x=>x>=xmin&&x<=xmax).sort((a,b)=>a-b);const WS={};axes.forEach(a=>WS[a]=xs.map(x=>mlW(mlSegAt(tr[a],x+1e-12),x)));
 const envMax=Math.max(...axes.map(a=>Math.max(...WS[a]))),apMax=Math.max(...st.lenses.map(L=>L.ap/2)),ymax=1.25*Math.max(envMax,Math.min(apMax,2.2*envMax));
 const X=x=>m.l+(x-xmin)/(xmax-xmin)*pw,Y=y=>m.t+ph/2-y/ymax*ph/2;Object.assign(st,{W,H,m,pw,ph,xmin,xmax,ymax,X,Y});
 c.font='11px sans-serif';c.lineWidth=1;
 const ys=niceStep(2*ymax,6);c.textAlign='right';c.textBaseline='middle';for(let y=-Math.floor(ymax/ys)*ys;y<=ymax+1e-12;y+=ys){const py=Y(y);c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(m.l,py);c.lineTo(m.l+pw,py);c.stroke();c.fillStyle='#607086';c.fillText(fmt(y,4),m.l-6,py);}
 const xstp=niceStep(xmax-xmin,W<520?4:8);c.textAlign='center';c.textBaseline='top';for(let x=Math.ceil(xmin/xstp)*xstp;x<=xmax+1e-9;x+=xstp){const px=X(x);c.strokeStyle='#eef2f7';c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();c.fillStyle='#607086';c.fillText(fmt(x,6),px,m.t+ph+5);}
 c.strokeStyle='#8ea1b7';c.strokeRect(m.l,m.t,pw,ph);c.fillStyle='#45576d';c.font='12px sans-serif';c.textAlign='left';c.textBaseline='alphabetic';
 c.fillText((axes.length>1?'横向高度 x / y':axes[0]==='y'&&tr.astig?'竖直高度 y':tr.astig?'水平高度 x':'径向高度')+'（mm）',m.l,16);c.textAlign='center';c.fillText('沿展开光路位置 z（mm）',m.l+pw/2,H-6);
 c.save();c.beginPath();c.rect(m.l,m.t,pw,ph);c.clip();
 c.strokeStyle='#9aa8b9';c.setLineDash([8,4,2,4]);c.beginPath();c.moveTo(m.l,Y(0));c.lineTo(m.l+pw,Y(0));c.stroke();c.setLineDash([]);
 /* 1/e² 包络：x 实线蓝色，y 虚线紫色 */
 const EC={x:['rgba(23,105,224,.13)','#1769e0',[]],y:['rgba(122,63,196,.10)','#7a3fc4',axes.length>1?[6,4]:[]]};
 axes.forEach(a=>{const ws=WS[a],[fc,sc,ds]=EC[a];c.fillStyle=fc;c.beginPath();xs.forEach((x,i)=>i?c.lineTo(X(x),Y(ws[i])):c.moveTo(X(x),Y(ws[i])));for(let i=xs.length-1;i>=0;i--)c.lineTo(X(xs[i]),Y(-ws[i]));c.closePath();c.fill();
  c.strokeStyle=sc;c.lineWidth=1.8;c.setLineDash(ds);[1,-1].forEach(sg=>{c.beginPath();xs.forEach((x,i)=>i?c.lineTo(X(x),Y(sg*ws[i])):c.moveTo(X(x),Y(sg*ws[i])));c.stroke();});c.setLineDash([]);});
 /* 光线：按主显示方向（同时显示时取 x）追迹 */
 if(st.raymode!=='none'){const s0=tr[ax0].segs[0],n=st.nr,rays=[];
  if(st.raymode==='geo'){const w0z=mlW(s0,0),R0=mlR(s0,0);for(let k=-n;k<=n;k++){if(!k)continue;const y=w0z*k/n;rays.push(mlRay(y,Number.isFinite(R0)?y/R0:0,st.lenses,xmax,ax0));}}
  else{const th=s0.w0/s0.zR;for(let j=0;j<2*n;j++){const p=Math.PI*j/(2*n),cs=Math.cos(p),sn=Math.sin(p);rays.push(mlRay(s0.w0*cs+th*(0-s0.zw)*sn,th*sn,st.lenses,xmax,ax0));rays.push(mlRay(-(s0.w0*cs+th*(0-s0.zw)*sn),-th*sn,st.lenses,xmax,ax0));}}
  c.lineWidth=1;rays.forEach(r=>{c.strokeStyle='rgba(232,144,34,.85)';c.beginPath();r.pts.forEach(([x,y],i)=>i?c.lineTo(X(x),Y(y)):c.moveTo(X(x),Y(y)));c.stroke();if(r.clip){const [x,y]=r.pts[r.pts.length-1];c.fillStyle='#ba3030';c.beginPath();c.arc(X(x),Y(y),3,0,2*Math.PI);c.fill();}});}
 /* 束腰与几何焦点（各显示方向） */
 axes.forEach((a,k)=>{const col=a==='y'&&axes.length>1?'#7a3fc4':'#5d6b7d',tag=tr.astig?a+' ':'';
  tr[a].segs.forEach((s,i)=>{if(i===0&&s.zw<=xmin)return;if(s.zw>=s.z0&&s.zw<=Math.min(s.z1,xmax)){const px=X(s.zw),wv=mlW(s,s.zw);c.strokeStyle=col;c.lineWidth=1;c.setLineDash([2,3]);c.beginPath();c.moveTo(px,Y(wv)-14);c.lineTo(px,Y(-wv)+14);c.stroke();c.setLineDash([]);c.fillStyle=col;c.font='11px sans-serif';c.textAlign='center';c.fillText(tag+'束腰 '+fmt(2*s.w0*1e3,3)+' μm',px,Y(-wv)+24+k*13);}});
  const zc=tr[a].info[tr[a].info.length-1].zc;if(Number.isFinite(zc)&&zc>st.lenses[st.lenses.length-1].z&&zc<=xmax){const px=X(zc),py=Y(0);c.strokeStyle=a==='y'&&axes.length>1?'#7a3fc4':'#e89022';c.lineWidth=2;c.beginPath();c.moveTo(px-5,py-5);c.lineTo(px+5,py+5);c.moveTo(px+5,py-5);c.lineTo(px-5,py+5);c.stroke();}});
 if(st.zobs>=xmin&&st.zobs<=xmax){const px=X(st.zobs);c.strokeStyle='#14804a';c.lineWidth=1.5;c.setLineDash([5,3]);c.beginPath();c.moveTo(px,m.t);c.lineTo(px,m.t+ph);c.stroke();c.setLineDash([]);c.fillStyle='#14804a';c.font='11px sans-serif';c.textAlign=px>m.l+pw-60?'right':'left';c.fillText('观察面',px+(c.textAlign==='right'?-4:4),m.t+ph-8);}
 /* 元件：透镜（凸箭头朝外、凹箭头朝内）；反射镜画在展开光路的折返点，弧形表示镜面朝向入射光，右侧短斜线为镜背。口径按主显示方向（子午取投影 Ø·cosθ） */
 st.lenses.forEach(L=>{const px=X(L.z),ha=L['h'+ax0],hr=Math.min(ha,ymax*0.97),top=Y(hr),bot=Y(-hr),mid=(top+bot)/2,cut=ha>ymax*0.97;
  if(isMir(L.t)){const col=L.t==='mcc'?'#0f8a8a':'#b06a12',e=L.t==='mcc'?-6:6;
   c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();c.moveTo(px+e,top);c.quadraticCurveTo(px-e,mid,px+e,bot);c.stroke();
   c.lineWidth=1;c.beginPath();const n=Math.max(4,Math.round((bot-top)/9));for(let j=0;j<=n;j++){const yy=top+(bot-top)*j/n,t=(yy-mid)/((bot-top)/2||1),xx=px+e*t*t;c.moveTo(xx+2,yy);c.lineTo(xx+8,yy-6);}c.stroke();return;}
  const col=L.t==='cv'?'#1769e0':'#c2408f';
  c.fillStyle=L.t==='cv'?'rgba(23,105,224,.10)':'rgba(194,64,143,.10)';c.beginPath();if(L.t==='cv'){c.moveTo(px,top);c.quadraticCurveTo(px+9,mid,px,bot);c.quadraticCurveTo(px-9,mid,px,top);}else{c.moveTo(px-6,top);c.lineTo(px+6,top);c.quadraticCurveTo(px+1,mid,px+6,bot);c.lineTo(px-6,bot);c.quadraticCurveTo(px-1,mid,px-6,top);}c.fill();
  c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.moveTo(px,top);c.lineTo(px,bot);c.stroke();
  if(!cut){c.beginPath();if(L.t==='cv'){c.moveTo(px-6,top+7);c.lineTo(px,top);c.lineTo(px+6,top+7);c.moveTo(px-6,bot-7);c.lineTo(px,bot);c.lineTo(px+6,bot-7);}else{c.moveTo(px-6,top-7);c.lineTo(px,top);c.lineTo(px+6,top-7);c.moveTo(px-6,bot+7);c.lineTo(px,bot);c.lineTo(px+6,bot+7);}c.stroke();}});
 c.restore();
 st.lenses.forEach((L,i)=>{const mr=isMir(L.t);c.fillStyle=mr?(L.t==='mcc'?'#0b6a6a':'#8a520c'):(L.t==='cv'?'#0d4fb5':'#a02d74');c.font='bold 11px sans-serif';c.textAlign='center';c.textBaseline='alphabetic';
  c.fillText(elName(L,i)+' '+(mr?'R'+fmt(L.R,4)+(L.th>0?' '+fmt(L.th,3)+'°'+(L.ax==='h'?'H':'V'):''):(L.f>0?'+':'')+fmt(L.f,4)),X(L.z),m.t-4);});
 if(st.hover!==null){const x=st.hover;c.strokeStyle='rgba(24,35,51,.4)';c.lineWidth=1;c.beginPath();c.moveTo(X(x),m.t);c.lineTo(X(x),m.t+ph);c.stroke();
  axes.forEach(a=>{const w=mlW(mlSegAt(tr[a],x),x);c.fillStyle=a==='y'&&axes.length>1?'#7a3fc4':'#1769e0';[w,-w].forEach(y=>{c.beginPath();c.arc(X(x),Y(y),3.5,0,2*Math.PI);c.fill();});});}}
function heatColor(t){/* 类 inferno 色标：0 黑 → 紫 → 红 → 橙 → 浅黄 */const S=[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]],p=Math.min(.9999,Math.max(0,t))*(S.length-1),i=Math.floor(p),f=p-i,a=S[i],b=S[i+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}
let spotMapW=[0,0];
function drawSpotMap(wx,wy){const cv=$('spotMap');if(!cv.getContext)return;if(wx===undefined)[wx,wy]=spotMapW;if(wy===undefined)wy=wx;spotMapW=[wx,wy];if(!(wx>0&&wy>0))return;
 const S=cv.clientWidth||240,dpr=window.devicePixelRatio||1,N=Math.round(S*dpr);cv.width=N;cv.height=N;const c=cv.getContext('2d'),img=c.createImageData(N,N),half=2*Math.max(wx,wy);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=((i+.5)/N*2-1)*half,y=((j+.5)/N*2-1)*half,I=Math.exp(-2*(x*x/(wx*wx)+y*y/(wy*wy))),[r,g,b]=heatColor(Math.pow(I,0.8)),k=4*(j*N+i);img.data[k]=r;img.data[k+1]=g;img.data[k+2]=b;img.data[k+3]=255;}
 c.putImageData(img,0,0);c.setTransform(dpr,0,0,dpr,0,0);const cx=S/2,sc=S/2/half;
 c.strokeStyle='rgba(255,255,255,.75)';c.setLineDash([4,3]);c.lineWidth=1;c.beginPath();c.ellipse(cx,cx,wx*sc,wy*sc,0,0,2*Math.PI);c.stroke();c.setLineDash([]);
 c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(0,cx);c.lineTo(S,cx);c.moveTo(cx,0);c.lineTo(cx,S);c.stroke();
 /* 水平截面（白，底部基线）与竖直截面（青，左侧基线） */
 c.strokeStyle='#fff';c.lineWidth=1.5;c.beginPath();for(let i=0;i<=200;i++){const x=(i/200*2-1)*half,px=cx+x*sc,py=S-8-Math.exp(-2*x*x/(wx*wx))*(S*0.42);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();
 c.strokeStyle='#4fd6e0';c.beginPath();for(let i=0;i<=200;i++){const y=(i/200*2-1)*half,py=cx+y*sc,px=8+Math.exp(-2*y*y/(wy*wy))*(S*0.42);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();
 const w=Math.max(wx,wy);let bar=niceStep(w,1);if(bar*sc>S*0.4)bar/=2;const um=bar*1e3;
 c.fillStyle='#fff';c.fillRect(S-10-bar*sc,S-22,bar*sc,3);c.font='11px sans-serif';c.textAlign='right';c.textBaseline='top';c.fillText(um>=1000?fmt(bar,3)+' mm':fmt(um,3)+' μm',S-10,S-17);
 c.textAlign='right';c.fillText('Ø '+(sameV(wx,wy)?fmtSci(2*wx*1e3):fmtSci(2*wx*1e3)+' × '+fmtSci(2*wy*1e3))+' μm',S-8,8);}
function rayHover(e){const st=mlChart,cv=$('rayChart'),tip=$('rayTip');if(!st||!st.X)return;const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*st.W/r.width,my=(e.clientY-r.top)*st.H/r.height;
 if(mx<st.m.l||mx>st.m.l+st.pw||my<st.m.t||my>st.m.t+st.ph){rayLeave();return;}
 const x=st.xmin+(mx-st.m.l)/st.pw*(st.xmax-st.xmin),tr=st.tr,sx=mlSegAt(tr.x,x),sy=mlSegAt(tr.y,x),wx=mlW(sx,x),wy=mlW(sy,x),Rx=mlR(sx,x),Ry=mlR(sy,x);st.hover=x;drawRayChart();
 const R=v=>Number.isFinite(v)?fmtSci(v):'∞';
 tip.innerHTML='<div class="hd">z = '+fmt(x,6)+' mm（'+segName(st.lenses,x)+'）</div><div>光斑直径 x / y = '+XY(wx,wy,v=>fmtSci(2*v*1e3))+' μm</div>'+(tr.astig?'<div>椭圆度 wx/wy = '+fmt(wx/wy,4)+'</div>':'')
  +'<div>该段束腰 z x / y = '+XY(sx.zw,sy.zw,v=>fmt(v,6))+' mm</div><div>该段束腰 Ø x / y = '+XY(sx.w0,sy.w0,v=>fmtSci(2*v*1e3))+' μm</div><div>离该段束腰 x / y = '+XY(x-sx.zw,x-sy.zw,v=>fmtSci(v))+' mm</div><div>波前曲率半径 R x / y = '+XY(Rx,Ry,R)+' mm</div><div style="color:#607086">双击设为观察面</div>';tip.hidden=false;
 tip.style.left=Math.max(0,Math.min(mx+14,st.W-tip.offsetWidth-8))+'px';tip.style.top=Math.max(0,Math.min(my+12,st.H-tip.offsetHeight-8))+'px';}
function rayLeave(){if(mlChart&&mlChart.hover!==null){mlChart.hover=null;drawRayChart();}$('rayTip').hidden=true;}
const LENS_KEY='optToolkit.public.v1.elements';/* 与多透镜版分开存储 */
function saveLenses(){try{localStorage.setItem(LENS_KEY,JSON.stringify(readLenses()));}catch(e){}}
function loadLenses(){try{const a=JSON.parse(localStorage.getItem(LENS_KEY)||'null');if(Array.isArray(a)&&a.length&&a.length<=ML_MAX&&a.every(L=>L&&ML_TYPES[L.t]))return a.map(L=>{const n=(v,d)=>Number.isFinite(v)?v:d;return {t:L.t,f:n(L.f,100),d:n(L.d,50),ap:n(L.ap,25),th:n(L.th,0),ax:L.ax==='v'?'v':'h',rf:n(L.rf,99.5)};});}catch(e){}return null;}

const FORMS={spot:{form:'spotForm',err:'spotErr',calc:()=>calcSpot()},multi:{form:'multiForm',err:'multiErr',calc:()=>calcMulti()},fiber:{form:'fiberForm',err:'fiberErr',calc:()=>calcFiber()},splice:{form:'spliceForm',err:'spliceErr',calc:()=>calcSplice()}};
const FORM_KEY=id=>Object.keys(FORMS).find(k=>FORMS[k].form===id);
function applyShow(){/* 按 data-show 属性（格式 id=值 或 id!=值）显示/隐藏字段；数字输入按数值比较 */document.querySelectorAll('[data-show]').forEach(el=>{const m=el.dataset.show.match(/^(\w+)(!?=)(.*)$/);if(!m)return;const e=$(m[1]),eq=e.type==='number'?parseFloat(e.value||'0')===parseFloat(m[3]):e.value===m[3];el.hidden=m[2]==='='?!eq:eq;});}
const STORE_KEY='optToolkit.public.v1';/* v2 新增字段，与旧版分开存储，互不覆盖 */
renderLenses(loadLenses()||ML_DEFAULT);
const fieldsOf=f=>[...$(f).querySelectorAll('input[id],select[id]')];
const defaults={};Object.values(FORMS).forEach(o=>fieldsOf(o.form).forEach(el=>defaults[el.id]=el.value));
function saveState(){try{const s={tab:document.querySelector('.tab.active').dataset.tab,v:{}};Object.values(FORMS).forEach(o=>fieldsOf(o.form).forEach(el=>s.v[el.id]=el.value));localStorage.setItem(STORE_KEY,JSON.stringify(s));saveLenses();}catch(e){/* file:// 或隐私模式下 localStorage 可能不可用，忽略 */}}
function loadState(){try{const s=JSON.parse(localStorage.getItem(STORE_KEY)||'null');if(!s)return null;Object.entries(s.v||{}).forEach(([id,v])=>{const el=$(id);if(el&&defaults[id]!==undefined&&(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===v)))el.value=v;});return s.tab;}catch(e){return null}}
function run(key){const o=FORMS[key],result=$(key).querySelector(':scope > div.panel');$(o.err).textContent='';try{for(const e of $(o.form).querySelectorAll('input,select')){if(e.type==='number'&&!e.closest('[hidden]')&&(e.value.trim()===''||!Number.isFinite(Number(e.value))||!e.validity.valid))throw Error('请检查输入范围与单位：'+(e.closest('.field')?.querySelector('label')?.textContent||e.id));}if(key==='fiber'){const V=Math.PI*toM(val('f_core'),unit('f_core_u'))*val('f_na')/toM(val('f_lambda'),unit('f_lambda_u'));if(V>60)throw Error('公开测试版暂限 V ≤ 60，避免大量模式求解阻塞浏览器。');}if(result)result.hidden=false;o.calc();}catch(x){lastResults[key]=null;if(result)result.hidden=true;$(o.err).textContent=x.message;}}
function selectTab(name,focus){document.querySelectorAll('.tab').forEach(x=>{const on=x.dataset.tab===name;x.classList.toggle('active',on);x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;if(on&&focus)x.focus();});document.querySelectorAll('section.layout').forEach(x=>x.classList.toggle('hidden',x.id!==name));spotLeave();imgLeave();spliceLeave();rayLeave();drawSpotChart();drawImgChart();drawFiberChart();drawSpliceChart();drawRayChart();drawSpotMap();}
function toTSV(r){const L=[r.title,'','输入参数'];r.inputs.forEach(x=>L.push(x.join('\t')));L.push('','计算结果');r.outputs.forEach(x=>L.push(x.join('\t')));if(r.table){L.push('',r.table.title||'模式明细',r.table.head.join('\t'));r.table.rows.forEach(x=>L.push(x.join('\t')));}return L.join('\n');}
async function copyResult(key,btn){const r=lastResults[key];const err=$(FORMS[key].err);if(!r){err.textContent='当前没有有效结果可复制。';return}const text=toTSV(r);let ok=false;try{await navigator.clipboard.writeText(text);ok=true;}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy')}catch(_){}ta.remove();}const t=btn.textContent;btn.textContent=ok?'已复制':'复制失败';setTimeout(()=>btn.textContent=t,1400);}
document.querySelectorAll('.tabs').forEach(n=>n.setAttribute('role','tablist'));
document.querySelectorAll('.tab').forEach(b=>{b.setAttribute('role','tab');b.setAttribute('aria-controls',b.dataset.tab);b.type='button';b.addEventListener('click',()=>{selectTab(b.dataset.tab);saveState();});b.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const tabs=[...document.querySelectorAll('.tab')],i=tabs.indexOf(b),n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];selectTab(n.dataset.tab,true);saveState();e.preventDefault();});});
document.querySelectorAll('section.layout').forEach(s=>s.setAttribute('role','tabpanel'));
Object.entries(FORMS).forEach(([key,o])=>{const f=$(o.form);let timer=0;f.addEventListener('submit',e=>{e.preventDefault();run(key);saveState();});f.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{applyShow();run(key);saveState();},250);});f.addEventListener('change',()=>{clearTimeout(timer);applyShow();run(key);saveState();});
 /* 为字段补充 label 关联，便于读屏与点击聚焦 */fieldsOf(o.form).forEach(el=>{const lb=el.closest('.field')&&el.closest('.field').querySelector('label');if(lb&&!lb.htmlFor&&el.tagName==='INPUT'){lb.htmlFor=el.id}else if(el.tagName==='SELECT'&&!el.getAttribute('aria-label')&&!(lb&&lb.htmlFor===el.id))el.setAttribute('aria-label',(lb?lb.firstChild.textContent.trim():'')+'单位');});});
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copyResult(b.dataset.copy,b)));
document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.reset;fieldsOf(id).forEach(el=>el.value=defaults[el.id]);if(id==='multiForm')renderLenses(ML_DEFAULT);applyShow();run(FORM_KEY(id));saveState();}));
$('spotChart').addEventListener('mousemove',spotHover);$('spotChart').addEventListener('click',spotHover);$('spotChart').addEventListener('mouseleave',spotLeave);$('fiberChart').addEventListener('mousemove',fiberHover);$('fiberChart').addEventListener('click',fiberHover);$('fiberChart').addEventListener('mouseleave',fiberLeave);
[['imgChart',imgHover,imgLeave],['spliceChart',spliceHover,spliceLeave]].forEach(([id,h,l])=>{$(id).addEventListener('mousemove',h);$(id).addEventListener('click',h);$(id).addEventListener('mouseleave',l);});
let rz=0;window.addEventListener('resize',()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{spotLeave();imgLeave();spliceLeave();rayLeave();drawImgChart();drawSpliceChart();drawFiberChart();drawRayChart();drawSpotMap();});});
/* 多透镜 / 反射镜页：光路图交互、添加/删除元件、观察面设为末端束腰 */
$('rayChart').addEventListener('mousemove',rayHover);$('rayChart').addEventListener('click',rayHover);$('rayChart').addEventListener('mouseleave',rayLeave);
$('rayChart').addEventListener('dblclick',e=>{const st=mlChart;if(!st||st.hover===null)return;$('m_zobs').value=Number(st.hover.toPrecision(6));run('multi');saveState();rayHover(e);});
$('lensAdd').addEventListener('click',()=>{const a=readLenses();if(a.length>=ML_MAX)return;const p=a[a.length-1]||{ap:25};a.push({t:'cv',f:100,d:50,ap:p.ap,th:0,ax:'h',rf:99.5});renderLenses(a);run('multi');saveState();});
$('lensList').addEventListener('click',e=>{const b=e.target.closest('.ldel');if(!b||b.disabled)return;const bs=[...document.querySelectorAll('#lensList .lensbox')],i=bs.indexOf(b.closest('.lensbox')),a=readLenses();a.splice(i,1);renderLenses(a);run('multi');saveState();});
$('m_toWaist').addEventListener('click',()=>{const st=mlChart;if(!st)return;const tr=st.tr,zL=st.lenses[st.lenses.length-1].z,lx=tr.x.segs[tr.x.segs.length-1],ly=tr.y.segs[tr.y.segs.length-1];let z;if(st.view==='both'&&tr.astig){const rs=roundSpot(lx,ly,zL);if(!rs){$('multiErr').textContent='末元件后不存在 wx = wy 的圆形光斑位置。';return;}z=rs.z;}else{const s=st.view==='y'?ly:lx;if(s.zw<s.z0){$('multiErr').textContent='末端为虚束腰（光束在末元件后发散），没有可设置的实际焦点。';return;}z=s.zw;}$('m_zobs').value=Number(z.toPrecision(7));run('multi');saveState();});
const savedTab=loadState();applyShow();selectTab(savedTab&&FORMS[savedTab]?savedTab:'spot');Object.keys(FORMS).forEach(run);
