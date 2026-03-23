import { useState, useEffect, useRef, useCallback } from 'react'

const LOGO_SRC = '/fretpractice-logo.png'

// ═══ TWITTER CONFIG ════════════════════════════════════════════════
// 1. Deploy api/tweets.ts to your Vercel project
// 2. Add TWITTER_BEARER_TOKEN to Vercel environment variables
// 3. Set LIVE_MODE: true below — that is all you need!
// ═══════════════════════════════════════════════════════════════════
const TWITTER_CONFIG = {
  LIVE_MODE: false,
  FRETPRACTICE_HANDLE: 'FretPractice',
  FOUNDER_HANDLE: 'rivuchakraborty',
}

// ─── TYPES ───────────────────────────────────────────────────────────
interface Feature    { num:string; title:string; desc:string; icon:string; dim?:boolean }
interface PricingTier{ tier:string; price:string; note:string; features:string[]; hot?:boolean; cta:string }
interface StatItem   { val:string; lbl:string }
interface StepItem   { n:string; title:string; desc:string }
interface SocialItem { label:string; path:string; url?:string }
interface Tweet      { id:string; text:string; date:string; likes:number; retweets:number; author:string; handle:string; avatar:string }
interface ModalState { name:string; email:string; whatsapp:string; countryCode:string; experience:string; featureRequest:string; willingToResearch:boolean; done:boolean; error:boolean }

// ─── MOCK TWEETS ────────────────────────────────────────────────────
const MOCK_TWEETS: Tweet[] = [
  { id:'1', author:'FretPractice', handle:'@FretPractice', avatar:'/fretpractice-logo.png',
    text:'Structured practice > random noodling. Every session in FretPractice has a goal, a feedback loop, and a measurable outcome. Building the system guitarists actually need.',
    date:'Mar 18', likes:24, retweets:8 },
  { id:'2', author:'Rivu Chakraborty', handle:'@rivuchakraborty', avatar:'/rivu.jpeg',
    text:"Been playing guitar for 18 years. Still remember the frustration of not knowing if I was improving. That feeling is exactly why I\'m building @FretPractice.",
    date:'Mar 15', likes:61, retweets:12 },
  { id:'3', author:'FretPractice', handle:'@FretPractice', avatar:'/fretpractice-logo.png',
    text:"Real-time audio feedback is live in internal testing. You play a note — FretPractice tells you if it\'s right instantly. No more guessing. No more bad habits going unnoticed.",
    date:'Mar 12', likes:43, retweets:9 },
  { id:'4', author:'Rivu Chakraborty', handle:'@rivuchakraborty', avatar:'/rivu.jpeg',
    text:'Why do most guitar apps fail? They give you tools but no structure. A metronome is useless without a practice plan. @FretPractice fixes this.',
    date:'Mar 9', likes:89, retweets:21 },
  { id:'5', author:'FretPractice', handle:'@FretPractice', avatar:'/fretpractice-logo.png',
    text:'Dhun — our AI music engine — can now generate backing tracks in any key and tempo. Practice with real music context, not just a click track. Coming soon to early access.',
    date:'Mar 6', likes:55, retweets:14 },
  { id:'6', author:'Rivu Chakraborty', handle:'@rivuchakraborty', avatar:'/rivu.jpeg',
    text:"Progress tracking is the most underrated feature in any practice tool. If you can\'t measure it, you can\'t improve it. @FretPractice shows you exactly where you\'ve grown.",
    date:'Mar 3', likes:37, retweets:7 },
]

// ─── HOOKS ───────────────────────────────────────────────────────────
function useWindowWidth():number {
  const [w,setW]=useState(0)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);fn();window.addEventListener('resize',fn);return ()=>window.removeEventListener('resize',fn)},[])
  return w
}
function useScrollY():number {
  const [y,setY]=useState(0)
  useEffect(()=>{const fn=()=>setY(window.scrollY);window.addEventListener('scroll',fn,{passive:true});return ()=>window.removeEventListener('scroll',fn)},[])
  return y
}
function useInView(threshold=0.1){
  const ref=useRef<HTMLDivElement>(null)
  const [inView,setInView]=useState(false)
  useEffect(()=>{const el=ref.current;if(!el)return;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setInView(true);io.disconnect()}},{threshold,rootMargin:'0px 0px -60px 0px'});io.observe(el);return ()=>io.disconnect()},[threshold])
  return {ref,inView}
}
function useMouse(){
  const [pos,setPos]=useState({x:-100,y:-100})
  useEffect(()=>{const fn=(e:MouseEvent)=>setPos({x:e.clientX,y:e.clientY});window.addEventListener('mousemove',fn);return ()=>window.removeEventListener('mousemove',fn)},[])
  return pos
}
function useTimer(start=23*60+45):string{
  const [s,setS]=useState(start)
  useEffect(()=>{const t=setInterval(()=>setS(x=>x+1),1000);return ()=>clearInterval(t)},[])
  return `${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
}
function useTweets(){
  const [tweets,setTweets]=useState<Tweet[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(false)
  const [lastFetched,setLastFetched]=useState<Date|null>(null)
  const fetch_=useCallback(async()=>{
    if(!TWITTER_CONFIG.LIVE_MODE){
      await new Promise(r=>setTimeout(r,700))
      setTweets(MOCK_TWEETS);setLoading(false);setLastFetched(new Date());return
    }
    try{
      setError(false)
      const res=await fetch('/api/tweets')
      if(!res.ok)throw new Error()
      setTweets(await res.json());setLastFetched(new Date())
    }catch{setError(true);setTweets(MOCK_TWEETS)}
    finally{setLoading(false)}
  },[])
  useEffect(()=>{fetch_();const t=setInterval(fetch_,5*60*1000);return ()=>clearInterval(t)},[fetch_])
  return {tweets,loading,error,lastFetched,refresh:fetch_}
}

// ─── GLOBAL STYLES ──────────────────────────────────────────────────
function GlobalStyles(){
  useEffect(()=>{
    const s=document.createElement('style')
    s.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
      *,*::before,*::after{box-sizing:border-box}
      html{scroll-behavior:smooth}
      body{margin:0;padding:0;background:#000;color:rgba(255,255,255,0.88);font-family:'DM Sans',sans-serif;font-weight:300;overflow-x:hidden;-webkit-font-smoothing:antialiased;cursor:none}
      body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E");opacity:0.28}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:rgba(37,89,244,0.35);border-radius:10px}
      @keyframes riseIn{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
      @keyframes breathePulse{0%,100%{box-shadow:0 0 0 4px rgba(37,89,244,0.2)}50%{box-shadow:0 0 0 8px rgba(37,89,244,0.06)}}
      @keyframes floatA{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(35px,-25px) scale(1.04)}66%{transform:translate(-20px,30px) scale(0.97)}}
      @keyframes floatB{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-28px,18px) scale(1.03)}66%{transform:translate(22px,-32px) scale(0.98)}}
      @keyframes scFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes fbPulse{0%,100%{opacity:1}50%{opacity:0.55}}
      @keyframes wvPump{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.25)}}
      @keyframes marqueeScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
      @keyframes skeletonPulse{0%,100%{opacity:0.35}50%{opacity:0.65}}
    `
    document.head.appendChild(s)
    return ()=>{document.head.removeChild(s)}
  },[])
  return null
}

// ─── CURSOR ──────────────────────────────────────────────────────────
function Cursor(){
  const mouse=useMouse()
  const [smooth,setSmooth]=useState({x:-100,y:-100})
  const [hov,setHov]=useState(false)
  const cur=useRef({x:-100,y:-100})
  const raf=useRef(0)
  useEffect(()=>{const loop=()=>{cur.current.x+=(mouse.x-cur.current.x)*0.12;cur.current.y+=(mouse.y-cur.current.y)*0.12;setSmooth({x:cur.current.x,y:cur.current.y});raf.current=requestAnimationFrame(loop)};raf.current=requestAnimationFrame(loop);return ()=>cancelAnimationFrame(raf.current)},[mouse])
  useEffect(()=>{const on=()=>setHov(true),off=()=>setHov(false);const tgts=document.querySelectorAll('a,button,input,textarea,select,[data-hover]');tgts.forEach(el=>{el.addEventListener('mouseenter',on);el.addEventListener('mouseleave',off)});return ()=>tgts.forEach(el=>{el.removeEventListener('mouseenter',on);el.removeEventListener('mouseleave',off)})})
  const size=hov?44:10
  return <div style={{position:'fixed',top:0,left:0,width:size,height:size,background:'#fff',borderRadius:'50%',pointerEvents:'none',zIndex:99999,transform:`translate(${smooth.x-size/2}px,${smooth.y-size/2}px)`,mixBlendMode:'difference',opacity:hov?0.45:1,transition:'width .3s cubic-bezier(.16,1,.3,1),height .3s cubic-bezier(.16,1,.3,1),opacity .3s',willChange:'transform'}}/>
}

// ─── HELPERS ─────────────────────────────────────────────────────────
function scrollTo(id:string){const el=document.getElementById(id);if(el)window.scrollTo({top:el.offsetTop-76,behavior:'smooth'})}
function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}){
  const {ref,inView}=useInView()
  return <div ref={ref} style={{opacity:inView?1:0,transform:inView?'translateY(0)':'translateY(40px)',transition:`opacity .85s cubic-bezier(.16,1,.3,1) ${delay}s,transform .85s cubic-bezier(.16,1,.3,1) ${delay}s`}}>{children}</div>
}
function Eyebrow({children,center=false}:{children:React.ReactNode;center?:boolean}){
  return(
    <div style={{display:'inline-flex',alignItems:'center',justifyContent:center?'center':'flex-start',gap:12,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'0.15em',textTransform:'uppercase',color:'#2559F4',marginBottom:22}}>
      <span style={{display:'block',width:24,height:1,background:'#2559F4',flexShrink:0}}/>
      {children}
      {center&&<span style={{display:'block',width:24,height:1,background:'#2559F4',flexShrink:0}}/>}
    </div>
  )
}
function HRule(){return <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)'}}/>}

// ─── BUTTONS ─────────────────────────────────────────────────────────
function BtnBlue({children,onClick,fullWidth=false,style={},disabled=false}:{children:React.ReactNode;onClick?:()=>void;fullWidth?:boolean;style?:React.CSSProperties;disabled?:boolean}){
  const [hov,setHov]=useState(false)
  return(
    <button onClick={onClick} disabled={disabled} data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,background:disabled?'rgba(37,89,244,0.5)':'#2559F4',color:disabled?'rgba(255,255,255,0.7)':'#fff',border:'none',cursor:disabled?'not-allowed':'none',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,padding:'14px 30px',borderRadius:10,width:fullWidth?'100%':'auto',boxShadow:hov&&!disabled?'0 0 0 1px rgba(37,89,244,0.7),0 16px 48px rgba(37,89,244,0.48)':'none',transform:hov&&!disabled?'translateY(-2px)':'none',transition:'box-shadow .35s cubic-bezier(.16,1,.3,1),transform .3s cubic-bezier(.16,1,.3,1)',...style}}>
      {children}
    </button>
  )
}
function BtnOutline({children,onClick,fullWidth=false}:{children:React.ReactNode;onClick?:()=>void;fullWidth?:boolean}){
  const [hov,setHov]=useState(false)
  return(
    <button onClick={onClick} data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',background:hov?'rgba(255,255,255,0.04)':'transparent',color:hov?'#fff':'rgba(255,255,255,0.52)',border:'1px solid rgba(255,255,255,0.14)',cursor:'none',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:400,padding:'14px 26px',borderRadius:10,width:fullWidth?'100%':'auto',transform:hov?'translateY(-1px)':'none',transition:'color .25s,background .25s,transform .3s cubic-bezier(.16,1,.3,1)'}}>
      {children}
    </button>
  )
}

// ─── NAV ─────────────────────────────────────────────────────────────
function NavBtn({label,id,onClick}:{label:string;id:string;onClick?:()=>void}){
  const [hov,setHov]=useState(false)
  return(
    <button onClick={onClick||(()=>scrollTo(id))} data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?'rgba(255,255,255,0.05)':'none',border:'none',cursor:'none',fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,color:hov?'#fff':'rgba(255,255,255,0.5)',padding:'6px 14px',borderRadius:8,transition:'color .2s,background .2s',width:'100%',textAlign:'left' as const}}>
      {label}
    </button>
  )
}
function Nav(){
  const y=useScrollY()
  const w=useWindowWidth()
  const isMobile=w<768
  const stuck=y>20
  const [menuOpen,setMenuOpen]=useState(false)
  const links=[
    {label:'Problem',id:'problem'},{label:'System',id:'system'},
    {label:'How It Works',id:'how'},{label:'Updates',id:'updates'},
    {label:'Pricing',id:'pricing'},{label:'About',id:'founder'},
  ]
  return(
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,height:isMobile?60:68,display:'flex',alignItems:'center',justifyContent:'space-between',padding:`0 ${isMobile?'20px':'52px'}`,background:stuck?'rgba(0,0,0,0.88)':'transparent',backdropFilter:stuck?'blur(24px) saturate(160%)':'none',borderBottom:stuck?'1px solid rgba(255,255,255,0.07)':'1px solid transparent',transition:'background .5s,border-color .5s,backdrop-filter .5s'}}>
      <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} data-hover style={{background:'none',border:'none',cursor:'none',padding:0,display:'flex',alignItems:'center'}}>
        <img src={LOGO_SRC} alt="FretPractice" style={{height:isMobile?40:48,width:'auto',objectFit:'contain',filter:'drop-shadow(0 0 10px rgba(37,89,244,0.5))'}}/>
      </button>
      {!isMobile&&(
        <>
          <ul style={{display:'flex',alignItems:'center',gap:4,listStyle:'none',position:'absolute',left:'50%',transform:'translateX(-50%)',margin:0,padding:0}}>
            {links.map(l=><li key={l.id}><NavBtn label={l.label} id={l.id}/></li>)}
          </ul>
          <BtnBlue onClick={()=>scrollTo('waitlist')} style={{padding:'9px 22px',fontSize:13}}>Join Early Access</BtnBlue>
        </>
      )}
      {isMobile&&(
        <button onClick={()=>setMenuOpen(!menuOpen)} data-hover style={{background:'none',border:'none',cursor:'none',padding:8,display:'flex',flexDirection:'column',gap:4}}>
          <span style={{width:20,height:2,background:'#fff',borderRadius:1,transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none',transition:'transform .3s'}}/>
          <span style={{width:20,height:2,background:'#fff',borderRadius:1,opacity:menuOpen?0:1,transition:'opacity .3s'}}/>
          <span style={{width:20,height:2,background:'#fff',borderRadius:1,transform:menuOpen?'rotate(-45deg) translate(7px,-6px)':'none',transition:'transform .3s'}}/>
        </button>
      )}
      {isMobile&&menuOpen&&(
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'rgba(0,0,0,0.96)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'20px'}}>
          <ul style={{listStyle:'none',margin:0,padding:0,marginBottom:16,display:'flex',flexDirection:'column',gap:4}}>
            {links.map(l=><li key={l.id}><NavBtn label={l.label} id={l.id} onClick={()=>setMenuOpen(false)}/></li>)}
          </ul>
          <BtnBlue onClick={()=>{scrollTo('waitlist');setMenuOpen(false)}} fullWidth style={{fontSize:13}}>Join Early Access</BtnBlue>
        </div>
      )}
    </nav>
  )
}

// ─── WAVEFORM ────────────────────────────────────────────────────────
function WaveformBars({count=20}:{count?:number}){
  const d=useRef(Array.from({length:count},()=>0.6+Math.random()*0.9))
  const dl=useRef(Array.from({length:count},(_,i)=>i*0.04))
  const h=useRef(Array.from({length:count},()=>`${20+Math.random()*70}%`))
  return(
    <div style={{display:'flex',alignItems:'center',gap:3,height:52}}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} style={{flex:1,borderRadius:3,background:'linear-gradient(180deg,#2559F4 0%,rgba(37,89,244,0.25) 100%)',height:h.current[i],animation:`wvPump ${d.current[i]}s ease-in-out infinite`,animationDelay:`${dl.current[i]}s`}}/>
      ))}
    </div>
  )
}

// ─── MOCK CARD ───────────────────────────────────────────────────────
function MockCard({tag,title,children}:{tag:string;title:string;children:React.ReactNode}){
  const [hov,setHov]=useState(false)
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:'rgba(255,255,255,0.025)',border:`1px solid ${hov?'rgba(37,89,244,0.35)':'rgba(255,255,255,0.07)'}`,borderRadius:12,padding:18,position:'relative',overflow:'hidden',transition:'border-color .35s'}}>
      <div style={{position:'absolute',top:0,left:'10%',right:'10%',height:1,background:'linear-gradient(90deg,transparent,rgba(37,89,244,0.45),transparent)',opacity:hov?1:0,transition:'opacity .35s'}}/>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#2559F4',marginBottom:6}}>{tag}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:'0.04em',color:'#fff',marginBottom:14}}>{title}</div>
      {children}
    </div>
  )
}

// ─── APP MOCKUP ──────────────────────────────────────────────────────
function AppMockup(){
  const w=useWindowWidth()
  const isMobile=w<768
  const fills=useRef<(HTMLDivElement|null)[]>([])
  const prog:Array<[string,number]>=[['Scales',82],['Chords',65],['Timing',74]]
  const fret=[[0,0,1,0,0,1,0,0],[0,1,0,0,1,0,0,0],[1,0,0,1,0,0,0,1],[0,0,1,0,0,0,1,0],[0,1,0,0,0,1,0,0],[1,0,0,0,1,0,0,0]]
  useEffect(()=>{const t=setTimeout(()=>{fills.current.forEach((el,i)=>{if(el)el.style.width=`${prog[i][1]}%`})},1200);return ()=>clearTimeout(t)},[])
  return(
    <div style={{marginTop:isMobile?60:84,width:'100%',maxWidth:isMobile?'100%':920,position:'relative',animation:'riseIn 1s cubic-bezier(.16,1,.3,1) .7s both'}}>
      <div style={{position:'absolute',bottom:-50,left:'50%',transform:'translateX(-50%)',width:'60%',height:80,background:'radial-gradient(ellipse,rgba(37,89,244,0.32) 0%,transparent 70%)',filter:'blur(20px)',pointerEvents:'none'}}/>
      <div style={{background:'#0f1320',border:'1px solid rgba(255,255,255,0.08)',borderRadius:isMobile?16:20,overflow:'hidden',boxShadow:'0 0 0 1px rgba(255,255,255,0.03),0 4px 16px rgba(0,0,0,0.4),0 24px 80px rgba(0,0,0,0.55)'}}>
        <div style={{background:'rgba(0,0,0,0.55)',padding:isMobile?'10px 14px':'13px 18px',display:'flex',alignItems:'center',gap:7,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c=><span key={c} style={{width:11,height:11,borderRadius:'50%',background:c,display:'block'}}/>)}
          <div style={{margin:'0 auto',background:'rgba(255,255,255,0.06)',borderRadius:5,padding:isMobile?'3px 12px':'4px 18px',fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?9:11,color:'rgba(255,255,255,0.25)'}}>{isMobile?'fretpractice.app':'fretpractice.app — Practice Session'}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:isMobile?12:14,padding:isMobile?16:24}}>
          <MockCard tag="Fretboard" title={isMobile?"G Major":"G Major — Position 1"}>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {fret.map((row,ri)=>(
                <div key={ri} style={{display:'flex',gap:2,height:9}}>
                  {row.map((v,ci)=><div key={ci} style={{flex:1,borderRadius:2,background:v?'#2559F4':'rgba(255,255,255,0.05)',boxShadow:v?'0 0 7px rgba(37,89,244,0.65)':'none',animation:v?'fbPulse 3s ease-in-out infinite':'none'}}/>)}
                </div>
              ))}
            </div>
          </MockCard>
          <MockCard tag="Live Audio" title="Real-time Feedback">
            <WaveformBars count={isMobile?12:18}/>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 6px rgba(34,197,94,0.55)',flexShrink:0}}/>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?9:10.5,color:'#22c55e'}}>{isMobile?'G4 detected':'G4 detected — Accurate'}</span>
            </div>
          </MockCard>
          <MockCard tag="Progress" title="This Week">
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {prog.map(([lbl,pct],i)=>(
                <div key={lbl}>
                  <div style={{display:'flex',justifyContent:'space-between',fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?8.5:9.5,color:'rgba(255,255,255,0.28)',marginBottom:4}}><span>{lbl}</span><span>{pct}%</span></div>
                  <div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden'}}>
                    <div ref={el=>{fills.current[i]=el}} style={{height:'100%',width:0,background:'linear-gradient(90deg,#2559F4,#7eb8ff)',borderRadius:10,transition:'width 1.6s cubic-bezier(.16,1,.3,1)'}}/>
                  </div>
                </div>
              ))}
            </div>
          </MockCard>
        </div>
      </div>
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────
function Hero(){
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <section id="hero" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:isMobile?'100px 20px 60px':'110px 52px 80px',position:'relative',overflow:'hidden',textAlign:'center'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',width:isMobile?600:900,height:isMobile?600:900,top:isMobile?-200:-300,left:isMobile?-150:-250,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,89,244,0.2) 0%,transparent 65%)',filter:'blur(100px)',animation:'floatA 20s ease-in-out infinite'}}/>
        <div style={{position:'absolute',width:isMobile?400:600,height:isMobile?400:600,bottom:isMobile?-100:-200,right:isMobile?-50:-100,borderRadius:'50%',background:'radial-gradient(circle,rgba(20,33,74,0.7) 0%,transparent 65%)',filter:'blur(100px)',animation:'floatB 25s ease-in-out infinite'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.075) 1px,transparent 1px)',backgroundSize:isMobile?'30px 30px':'44px 44px',maskImage:'radial-gradient(ellipse 80% 70% at 50% 42%,black 15%,transparent 72%)',WebkitMaskImage:'radial-gradient(ellipse 80% 70% at 50% 42%,black 15%,transparent 72%)'}}/>
      </div>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(37,89,244,0.4)',background:'rgba(37,89,244,0.08)',borderRadius:100,padding:isMobile?'6px 14px 6px 10px':'7px 16px 7px 11px',marginBottom:isMobile?30:44,animation:'riseIn .9s cubic-bezier(.16,1,.3,1) .1s both'}}>
        <span style={{width:7,height:7,borderRadius:'50%',background:'#2559F4',boxShadow:'0 0 0 4px rgba(37,89,244,0.2)',display:'block',animation:'breathePulse 2.4s ease-in-out infinite'}}/>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?10:11,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.6)'}}>AI-Powered Music Practice Platform</span>
      </div>
      <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isMobile?'clamp(40px,9vw,64px)':'clamp(52px,9vw,120px)',fontWeight:400,lineHeight:0.92,letterSpacing:'0.04em',color:'#fff',maxWidth:isMobile?'100%':900,margin:'0 auto',animation:'riseIn .9s cubic-bezier(.16,1,.3,1) .2s both'}}>
        Practice with<br/><span style={{background:'linear-gradient(130deg,#7eb8ff 0%,#2559F4 45%,#1438b0 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>INTENTION.</span>
      </h1>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?'clamp(14px,3.5vw,16px)':'clamp(15px,1.4vw,18px)',color:'rgba(255,255,255,0.48)',fontWeight:300,lineHeight:1.78,maxWidth:isMobile?'100%':520,margin:isMobile?'20px auto 40px':'28px auto 52px',animation:'riseIn .9s cubic-bezier(.16,1,.3,1) .3s both'}}>
        Structured sessions, real-time feedback, AI tools — one system built to move you forward, not just keep you busy.
      </p>
      <div style={{display:'flex',flexDirection:isMobile?'column':'row',alignItems:'center',gap:12,animation:'riseIn .9s cubic-bezier(.16,1,.3,1) .42s both',width:isMobile?'100%':'auto',maxWidth:isMobile?320:'none'}}>
        <BtnBlue onClick={()=>scrollTo('waitlist')} fullWidth={isMobile}>Join Early Access →</BtnBlue>
        <BtnOutline onClick={()=>scrollTo('system')} fullWidth={isMobile}>Explore the System</BtnOutline>
      </div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?10.5:11.5,color:'rgba(255,255,255,0.22)',letterSpacing:'0.04em',marginTop:18,animation:'riseIn .9s cubic-bezier(.16,1,.3,1) .54s both'}}>Early access for serious guitarists. Limited spots.</p>
      <AppMockup/>
    </section>
  )
}

// ─── NUMBERS STRIP ───────────────────────────────────────────────────
const STATS:StatItem[]=[
  {val:'Early',lbl:'Development Stage'},
  {val:'AI-First',lbl:'Platform Architecture'},
  {val:'200M+',lbl:"Users via founder's past work"},
  {val:'18 yrs',lbl:"Founder's guitar experience"},
]
function StatCell({val,lbl,last}:{val:string;lbl:string;last:boolean}){
  const [hov,setHov]=useState(false)
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:isMobile?'22px 16px':'32px 44px',borderRight:last?'none':'1px solid rgba(255,255,255,0.07)',background:hov?'rgba(37,89,244,0.04)':'transparent',transition:'background .3s',cursor:'none',textAlign:'center'}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isMobile?'clamp(22px,5vw,32px)':'clamp(28px,3.5vw,42px)',letterSpacing:'0.04em',color:'#fff',marginBottom:5}}>{val}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?10:12,color:'rgba(255,255,255,0.28)',lineHeight:1.3}}>{lbl}</div>
    </div>
  )
}
function NumbersStrip(){
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <Reveal>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,borderTop:'1px solid rgba(255,255,255,0.07)',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
        {STATS.map((s,i)=><StatCell key={i} val={s.val} lbl={s.lbl} last={isMobile?(i===1||i===3):(i===3)}/>)}
      </div>
    </Reveal>
  )
}

// ─── PROBLEM SECTION ─────────────────────────────────────────────────
function ProblemSection(){
  const mouse=useMouse()
  const w=useWindowWidth()
  const isMobile=w<768
  const sRef=useRef<HTMLDivElement>(null)
  const cardTx=useCallback((i:number)=>{
    const r=sRef.current?.getBoundingClientRect()
    if(!r)return 'none'
    const cx=(mouse.x-r.left-r.width/2)/r.width
    const cy=(mouse.y-r.top-r.height/2)/r.height
    return `translate(${cx*(i+1)*6}px,${cy*(i+1)*6}px)`
  },[mouse])
  const cards=[
    {label:'Session Focus',val:'94',unit:'%',badge:'↑ 31% this month',extra:null,icon:'◎'},
    {label:'Practice Streak',val:'12',unit:' days',badge:null,extra:'streak',icon:'▦'},
    {label:'Avg Improvement',val:'+28',unit:'% accuracy',badge:null,extra:null,icon:'↗'},
  ]
  return(
    <section id="problem" style={{padding:isMobile?'80px 0':'140px 0',background:'#0a0d17'}}>
      <div ref={sRef} style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`,display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?40:100,alignItems:'center'}}>
        <Reveal>
          <Eyebrow>The Problem</Eyebrow>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isMobile?'clamp(28px,7vw,48px)':'clamp(36px,5vw,68px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff',marginBottom:isMobile?20:36}}>
            Most guitarists<br/>practice.<br/><span style={{color:'#2559F4'}}>Few improve.</span>
          </h2>
          {["You have the chords. You have the tabs. You even have the time. But progress feels random — like you're spinning in place.","The real issue isn't effort. It's structure. Without a system, practice is just playing — and playing isn't progress.",'FretPractice changes that. Every session has a goal, every note has feedback, every week has measurable data.'].map((p,i)=>(
            <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?13:15.5,lineHeight:1.85,color:'rgba(255,255,255,0.46)',fontWeight:300,marginBottom:14}}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={0.18}>
          {isMobile?(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {cards.map((c,i)=>(
                <div key={i} data-hover style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'18px 20px',display:'flex',alignItems:'center',gap:16,cursor:'none'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'rgba(37,89,244,0.12)',border:'1px solid rgba(37,89,244,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#2559F4',flexShrink:0}}>{c.icon}</div>
                  <div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'rgba(255,255,255,0.28)',marginBottom:3,textTransform:'uppercase',letterSpacing:'0.05em'}}>{c.label}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:'0.02em',color:'#fff',lineHeight:1}}>{c.val}<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:300,color:'rgba(255,255,255,0.3)'}}>{c.unit}</span></div>
                    {c.badge&&<div style={{marginTop:6,display:'inline-flex',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:9,fontWeight:500,padding:'2px 8px',borderRadius:100,fontFamily:"'DM Sans',sans-serif"}}>{c.badge}</div>}
                    {c.extra==='streak'&&<div style={{marginTop:8,display:'flex',gap:3}}>{[1,1,1,0.35,0.08,0.08,0.08].map((op,j)=><div key={j} style={{width:12,height:12,borderRadius:3,background:`rgba(37,89,244,${op})`}}/>)}</div>}
                  </div>
                </div>
              ))}
            </div>
          ):(
            <div style={{position:'relative',height:400}}>
              {cards.map((c,i)=>(
                <div key={i} data-hover style={{position:'absolute',top:i===0?0:i===1?65:'auto',left:i===0?0:i===2?45:'auto',right:i===1?0:'auto',bottom:i===2?10:'auto',width:i===0?215:i===1?230:210,background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:18,padding:24,boxShadow:'0 24px 70px rgba(0,0,0,0.55)',transform:cardTx(i),transition:'transform .8s cubic-bezier(.16,1,.3,1)',animation:`scFloat ${9+i*3}s ease-in-out infinite ${i*2}s`,cursor:'none'}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'rgba(37,89,244,0.12)',border:'1px solid rgba(37,89,244,0.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,fontSize:14,color:'#2559F4'}}>{c.icon}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:'rgba(255,255,255,0.28)',marginBottom:4}}>{c.label}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:'0.02em',color:'#fff',lineHeight:1}}>{c.val}<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:300,color:'rgba(255,255,255,0.3)'}}>{c.unit}</span></div>
                  {c.badge&&<div style={{marginTop:10,display:'inline-flex',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:10,fontWeight:500,padding:'3px 9px',borderRadius:100,fontFamily:"'DM Sans',sans-serif"}}>{c.badge}</div>}
                  {c.extra==='streak'&&<div style={{marginTop:10,display:'flex',gap:3}}>{[1,1,1,0.35,0.08,0.08,0.08].map((op,j)=><div key={j} style={{width:14,height:14,borderRadius:3,background:`rgba(37,89,244,${op})`}}/>)}</div>}
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

// ─── SYSTEM SECTION ──────────────────────────────────────────────────
const FEATURES:Feature[]=[
  {num:'01',title:'Structured Practice System',desc:'Guided sessions built around real musical goals. Every minute has a purpose — not random exercises that go nowhere.',icon:'◎'},
  {num:'02',title:'Fretboard Intelligence',desc:'Know the neck, not just the tab. Understand positions, patterns, and notes with real-time validation as you play.',icon:'⬛'},
  {num:'03',title:'Real-time Audio Feedback',desc:"Know if you're right — instantly. Analyzed the moment you play. No more guessing if that note was clean.",icon:'≋'},
  {num:'04',title:'AI Music Tools — Dhun',desc:'Generate backing tracks. Practice musically, not mechanically. Your AI jam partner, always ready.',icon:'✦'},
  {num:'05',title:'Progress Tracking',desc:'Turn feelings into facts. See exactly how you improve — week by week, skill by skill, with real data.',icon:'▲'},
  {num:'06',title:'Teacher-led Programs',desc:'Structured curriculums from real guitar teachers, plus a white-label platform for educators.',icon:'◈',dim:true},
]
function FeatureCard({f}:{f:Feature}){
  const [hov,setHov]=useState(false)
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov&&!f.dim?'#0d1223':f.dim?'#080b14':'#0a0d17',padding:'40px 36px',position:'relative',overflow:'hidden',opacity:f.dim?0.5:1,transition:'background .4s',cursor:'none'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#2559F4,transparent)',transform:hov&&!f.dim?'scaleX(1)':'scaleX(0)',transition:'transform .45s cubic-bezier(.16,1,.3,1)',transformOrigin:'center'}}/>
      {f.dim&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.22)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:100,padding:'2px 10px',display:'inline-block',marginBottom:14}}>Coming soon</div>}
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,letterSpacing:'0.1em',color:'#2559F4',marginBottom:16,opacity:0.7}}>{f.num}</div>
      <div style={{width:44,height:44,borderRadius:11,background:'rgba(37,89,244,0.12)',border:'1px solid rgba(37,89,244,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:22,color:'#2559F4',fontFamily:'monospace'}}>{f.icon}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,letterSpacing:'0.04em',color:f.dim?'rgba(255,255,255,0.28)':'#fff',marginBottom:12,lineHeight:1.1}}>{f.title}</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.78,color:f.dim?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.44)',fontWeight:300}}>{f.desc}</div>
    </div>
  )
}
function SystemSection(){
  const w=useWindowWidth()
  const isMobile=w<768
  const isTablet=w>=768&&w<1024
  const cols=isMobile?1:isTablet?2:3
  return(
    <section id="system" style={{padding:isMobile?'80px 0':'140px 0',background:'#000'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`}}>
        <Reveal>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:64,gap:40,flexWrap:'wrap'}}>
            <div><Eyebrow>The System</Eyebrow><h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(40px,5.5vw,72px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff'}}>Five tools.<br/>One purpose.</h2></div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,lineHeight:1.8,color:'rgba(255,255,255,0.44)',fontWeight:300,maxWidth:360}}>Everything you need to practice with precision — built as one coherent system.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:2,background:'rgba(255,255,255,0.07)',border:'2px solid rgba(255,255,255,0.07)',borderRadius:22,overflow:'hidden'}}>
            {FEATURES.map((f,i)=><FeatureCard key={i} f={f}/>)}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── STOP SWITCHING BANNER ────────────────────────────────────────────
function StopSwitchingBanner(){
  const items=[
    {text:'Stop switching apps while practising',serif:true},
    {text:'FretPractice brings everything you need — in one place',serif:false},
    {text:'Metronome. Fretboard. Audio feedback. AI tracks. Progress.',serif:true},
    {text:'All here. All connected.',serif:false},
  ]
  const rep=[...items,...items,...items,...items]
  return(
    <div style={{background:'#2559F4',overflow:'hidden',borderTop:'1px solid rgba(255,255,255,0.15)',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
      <div style={{display:'flex',alignItems:'center',whiteSpace:'nowrap',padding:'22px 0',animation:'marqueeScroll 30s linear infinite'}}>
        {rep.map((item,i)=>(
          <span key={i} style={{display:'inline-flex',alignItems:'center',gap:20,padding:'0 44px'}}>
            <span style={{fontFamily:item.serif?"'Bebas Neue',sans-serif":"'DM Sans',sans-serif",fontSize:item.serif?'clamp(15px,1.7vw,20px)':16,fontWeight:item.serif?400:300,letterSpacing:item.serif?'0.05em':'0.01em',color:item.serif?'#fff':'rgba(255,255,255,0.65)',fontStyle:item.serif?'normal':'italic'}}>{item.text}</span>
            <span style={{width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,0.35)',flexShrink:0}}/>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────
const STEPS:StepItem[]=[
  {n:'1',title:'Set your goal',desc:'Tell FretPractice exactly what you want to achieve — a scale, a technique, a speed milestone. The system builds your plan.'},
  {n:'2',title:'Practice with guided sessions',desc:'Every session is structured. Real-time audio tells you when you nail it — and when to slow down and reset.'},
  {n:'3',title:'Track progress and improve',desc:'Watch your data move. No plateau, no guessing, no random sessions. Clear, measurable growth every week.'},
]
function StepRow({s,last}:{s:StepItem;last:boolean}){
  const [hov,setHov]=useState(false)
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'flex',gap:22,padding:'28px 0',paddingLeft:hov?8:0,borderBottom:last?'none':'1px solid rgba(255,255,255,0.07)',transition:'padding-left .3s cubic-bezier(.16,1,.3,1)',cursor:'none'}}>
      <div style={{width:36,height:36,borderRadius:'50%',flexShrink:0,background:hov?'#2559F4':'rgba(37,89,244,0.1)',border:`1px solid ${hov?'#2559F4':'rgba(37,89,244,0.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:'0.04em',color:hov?'#fff':'#2559F4',transition:'all .3s cubic-bezier(.16,1,.3,1)'}}>{s.n}</div>
      <div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:'0.04em',color:'#fff',marginBottom:8}}>{s.title}</div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.75,color:'rgba(255,255,255,0.44)',fontWeight:300}}>{s.desc}</div>
      </div>
    </div>
  )
}
function HowSection(){
  const w=useWindowWidth()
  const isMobile=w<768
  const timer=useTimer()
  return(
    <section id="how" style={{padding:isMobile?'80px 0':'140px 0',background:'#0a0d17'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`,display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?40:100,alignItems:'center'}}>
        <Reveal>
          <Eyebrow>How It Works</Eyebrow>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(40px,5.5vw,72px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff',marginBottom:52}}>Three steps.<br/>Zero<br/>guesswork.</h2>
          <div>{STEPS.map((s,i)=><StepRow key={i} s={s} last={i===2}/>)}</div>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{background:'#111827',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,overflow:'hidden',boxShadow:'0 40px 100px rgba(0,0,0,0.65)'}}>
            <div style={{padding:'16px 22px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:'0.04em',color:'#fff'}}>Practice Session</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:'0.04em',color:'#2559F4'}}>{timer}</span>
            </div>
            <div style={{padding:22}}>
              <div style={{background:'rgba(37,89,244,0.1)',border:'1px solid rgba(37,89,244,0.2)',borderRadius:12,padding:'16px 18px',marginBottom:18}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'#2559F4',marginBottom:6}}>Current Exercise</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:'0.04em',color:'#fff'}}>G Major Scale — Position 1</div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.07)',marginBottom:18}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.28)'}}>Tempo</span>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:'0.02em',color:'#fff'}}>96<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:300,color:'rgba(255,255,255,0.3)',marginLeft:3}}>BPM</span></span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:6}}><span>Session Progress</span><span>68%</span></div>
              <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:10,overflow:'hidden',marginBottom:18}}>
                <div style={{height:'100%',width:'68%',background:'linear-gradient(90deg,#2559F4,#7eb8ff)',borderRadius:10}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.07)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:9,padding:'11px 14px'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:'#22c55e'}}>Clean execution. Try 4 BPM faster.</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── TWEET CARD ──────────────────────────────────────────────────────
function TweetSkeleton(){
  return(
    <div style={{background:'#0a0d17',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:'24px 26px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.08)',flexShrink:0,animation:'skeletonPulse 1.5s ease-in-out infinite'}}/>
        <div style={{flex:1,height:14,borderRadius:7,background:'rgba(255,255,255,0.08)',animation:'skeletonPulse 1.5s ease-in-out infinite'}}/>
      </div>
      {['80%','100%','65%'].map((w,i)=>(
        <div key={i} style={{width:w,height:11,borderRadius:6,background:'rgba(255,255,255,0.06)',animation:`skeletonPulse 1.5s ease-in-out infinite ${i*0.15}s`}}/>
      ))}
    </div>
  )
}
function TweetCard({tweet}:{tweet:Tweet}){
  const [hov,setHov]=useState(false)
  const [liked,setLiked]=useState(false)
  const renderText=(text:string)=>
    text.split(/(@FretPractice)/g).map((part,i)=>
      part==='@FretPractice'
        ?<span key={i} style={{color:'#2559F4',fontWeight:500}}>@FretPractice</span>
        :<span key={i}>{part}</span>
    )
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?'#0d1223':'#0a0d17',border:`1px solid ${hov?'rgba(37,89,244,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:18,padding:'24px 26px',display:'flex',flexDirection:'column',gap:16,position:'relative',overflow:'hidden',transition:'background .35s,border-color .35s,transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s',transform:hov?'translateY(-4px)':'none',boxShadow:hov?'0 20px 60px rgba(0,0,0,0.5)':'none',cursor:'none'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#2559F4,transparent)',transform:hov?'scaleX(1)':'scaleX(0)',transition:'transform .45s cubic-bezier(.16,1,.3,1)',transformOrigin:'center'}}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src={tweet.avatar} alt={tweet.author} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',border:'1px solid rgba(255,255,255,0.1)',flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,color:'#fff',lineHeight:1.2}}>{tweet.author}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:2}}>{tweet.handle}</div>
          </div>
        </div>
        <svg viewBox="0 0 24 24" style={{width:16,height:16,fill:'rgba(255,255,255,0.2)',flexShrink:0}}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,lineHeight:1.72,color:'rgba(255,255,255,0.72)',fontWeight:300,margin:0,flex:1}}>{renderText(tweet.text)}</p>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:'rgba(255,255,255,0.25)'}}>{tweet.date}</span>
        <div style={{display:'flex',alignItems:'center',gap:18}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <svg viewBox="0 0 24 24" style={{width:14,height:14,fill:'rgba(255,255,255,0.25)'}}>
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46L19.5 20.12l-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
            </svg>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.28)'}}>{tweet.retweets}</span>
          </div>
          <button data-hover onClick={()=>setLiked(l=>!l)} style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'none',padding:0}}>
            <svg viewBox="0 0 24 24" style={{width:14,height:14,fill:liked?'#f43f5e':'rgba(255,255,255,0.25)',transition:'fill .2s'}}>
              <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.582 1.074 1.77 3.252 3.83 6.129 6.05 2.877-2.22 5.055-4.28 6.13-6.05 1.111-1.802 1.03-3.462.477-4.582-.561-1.13-1.666-1.84-2.912-1.91z"/>
            </svg>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:liked?'#f43f5e':'rgba(255,255,255,0.28)',transition:'color .2s'}}>{liked?tweet.likes+1:tweet.likes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── UPDATES SECTION ─────────────────────────────────────────────────
function UpdatesSection(){
  const w=useWindowWidth()
  const isMobile=w<768
  const isTablet=w>=768&&w<1024
  const cols=isMobile?1:isTablet?2:3
  const {tweets,loading,error,lastFetched,refresh}=useTweets()
  const fmt=(d:Date)=>d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
  return(
    <section id="updates" style={{padding:isMobile?'80px 0':'140px 0',background:'#000'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`}}>
        <Reveal>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:64,gap:24,flexWrap:'wrap'}}>
            <div>
              <Eyebrow>Build in Public</Eyebrow>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(40px,5.5vw,72px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff'}}>Latest Updates</h2>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:7,background:TWITTER_CONFIG.LIVE_MODE?'rgba(34,197,94,0.08)':'rgba(37,89,244,0.08)',border:`1px solid ${TWITTER_CONFIG.LIVE_MODE?'rgba(34,197,94,0.2)':'rgba(37,89,244,0.2)'}`,borderRadius:100,padding:'6px 14px'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:TWITTER_CONFIG.LIVE_MODE?'#22c55e':'#2559F4',boxShadow:TWITTER_CONFIG.LIVE_MODE?'0 0 6px rgba(34,197,94,0.6)':'0 0 6px rgba(37,89,244,0.6)',display:'block',animation:'breathePulse 2s ease-in-out infinite'}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:TWITTER_CONFIG.LIVE_MODE?'#22c55e':'rgba(255,255,255,0.6)'}}>
                  {TWITTER_CONFIG.LIVE_MODE?'Live feed':'Demo — set LIVE_MODE:true to go live'}
                </span>
              </div>
              {TWITTER_CONFIG.LIVE_MODE&&(
                <button onClick={refresh} data-hover style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px 14px',cursor:'none',fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.45)'}}>
                  <svg viewBox="0 0 24 24" style={{width:13,height:13,fill:'currentColor'}}><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                  Refresh
                </button>
              )}
              <a href="https://twitter.com/FretPractice" target="_blank" rel="noopener noreferrer" data-hover
                style={{display:'inline-flex',alignItems:'center',gap:6,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.45)',textDecoration:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 16px',cursor:'none',transition:'color .2s,border-color .2s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.color='#fff';el.style.borderColor='rgba(255,255,255,0.25)'}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.color='rgba(255,255,255,0.45)';el.style.borderColor='rgba(255,255,255,0.1)'}}>
                <svg viewBox="0 0 24 24" style={{width:13,height:13,fill:'currentColor'}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Follow @FretPractice
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          {error&&(
            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'12px 18px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(239,68,68,0.8)'}}>Could not reach Twitter API — showing demo tweets</span>
              <button onClick={refresh} data-hover style={{background:'none',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'5px 14px',cursor:'none',fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(239,68,68,0.8)'}}>Try again</button>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:18}}>
            {loading?Array.from({length:6}).map((_,i)=><TweetSkeleton key={i}/>):tweets.map(t=><TweetCard key={t.id} tweet={t}/>)}
          </div>
          <div style={{textAlign:'center',marginTop:40,display:'flex',alignItems:'center',justifyContent:'center',gap:8,flexWrap:'wrap'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:TWITTER_CONFIG.LIVE_MODE?'#22c55e':'#2559F4',display:'block',animation:'breathePulse 2.4s ease-in-out infinite'}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.25)'}}>
              {TWITTER_CONFIG.LIVE_MODE
                ?lastFetched?`Last updated ${fmt(lastFetched)} · Auto-refreshes every 5 minutes`:'Loading...'
                :'Demo mode · Set LIVE_MODE: true in TWITTER_CONFIG after deploying api/tweets.ts'}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── FOR WHO ─────────────────────────────────────────────────────────
function WhoItem({text,last}:{text:string;last:boolean}){
  const [hov,setHov]=useState(false)
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'flex',alignItems:'flex-start',gap:16,padding:'20px 0',paddingLeft:hov?4:0,borderBottom:last?'none':'1px solid rgba(255,255,255,0.07)',fontFamily:"'DM Sans',sans-serif",fontSize:15.5,color:hov?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.46)',lineHeight:1.6,transition:'color .25s,padding-left .3s cubic-bezier(.16,1,.3,1)',cursor:'none'}}>
      <span style={{color:'#2559F4',flexShrink:0,marginTop:3,opacity:hov?1:0.6,transform:hov?'translateX(5px)':'none',transition:'opacity .25s,transform .3s cubic-bezier(.16,1,.3,1)',fontSize:14}}>→</span>
      {text}
    </div>
  )
}
function WhoSection(){
  const w=useWindowWidth()
  const isMobile=w<768
  const items=['Just getting serious and need a real system to follow','Stuck at intermediate despite hours of practice','Trying to break out of a plateau with clarity and structure','Want to understand the fretboard — not just memorize tabs','Serious about tracking and measuring their own growth']
  return(
    <section id="who" style={{padding:isMobile?'80px 0':'140px 0',background:'#0a0d17'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`,display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?40:80,alignItems:'start'}}>
        <Reveal>
          <Eyebrow>Built For</Eyebrow>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(36px,5vw,64px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff',marginBottom:44}}>Guitarists who want<br/>to improve.<br/>Not just play.</h2>
          <div>{items.map((item,i)=><WhoItem key={i} text={item} last={i===4}/>)}</div>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{background:'linear-gradient(150deg,#111827 0%,#0a0d17 100%)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:22,padding:isMobile?32:48,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-16,left:28,fontFamily:"'Bebas Neue',sans-serif",fontSize:160,letterSpacing:'0.02em',color:'rgba(37,89,244,0.08)',lineHeight:1,userSelect:'none',pointerEvents:'none'}}>"</div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:isMobile?15:18,lineHeight:1.72,color:'rgba(255,255,255,0.72)',fontStyle:'italic',fontWeight:300,marginBottom:30,position:'relative'}}>Practicing without structure is like training without a coach. You put in the hours but you can't explain why you're not improving. FretPractice changes that.</p>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:'0.04em',color:'#fff',marginBottom:4}}>Rivu Chakraborty</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.28)'}}>Founder · Guitarist · 18+ years · Student of Amyt Dutta</div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── PRICING ─────────────────────────────────────────────────────────
const PRICING_TIERS:PricingTier[]=[
  {tier:'Free',price:'$0',note:'Core tools, always free',cta:'Join Waitlist',features:['Fretboard exercises','Basic practice sessions','Limited progress tracking','Metronome with feedback']},
  {tier:'Premium',price:'TBD',note:'Structured practice + AI features',cta:'Get Early Access',hot:true,features:['Everything in Free','Structured practice system','Real-time audio feedback','AI backing track generation','Full progress analytics']},
  {tier:'Pro / Ultra',price:'TBD',note:'AI token-based (Dhun model)',cta:'Notify Me',features:['Everything in Premium','Extended AI generation','Teacher-led programs','White-label access']},
]
function PriceCard({t,onCta}:{t:PricingTier;onCta:()=>void}){
  const [hov,setHov]=useState(false)
  return(
    <div data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:t.hot?'linear-gradient(155deg,#101d3d 0%,#111827 100%)':'#111827',border:`1px solid ${t.hot?'rgba(37,89,244,0.4)':hov?'rgba(37,89,244,0.22)':'rgba(255,255,255,0.08)'}`,borderRadius:22,padding:38,position:'relative',overflow:'hidden',transform:hov?'translateY(-5px)':'none',boxShadow:hov?'0 30px 80px rgba(0,0,0,0.45)':'none',transition:'transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s,border-color .35s',cursor:'none'}}>
      {t.hot&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#2559F4,#88b4ff,transparent)'}}/>}
      {t.hot&&<div style={{position:'absolute',top:18,right:18,background:'#2559F4',color:'#fff',fontSize:9.5,fontWeight:500,letterSpacing:'0.09em',textTransform:'uppercase',padding:'3px 10px',borderRadius:100,fontFamily:"'DM Sans',sans-serif"}}>Most Popular</div>}
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'#2559F4',marginBottom:14}}>{t.tier}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:46,letterSpacing:'0.02em',color:'#fff',lineHeight:1,marginBottom:4}}>{t.price} <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:300,color:'rgba(255,255,255,0.28)'}}>/mo</span> </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.28)',marginBottom:30}}>{t.note}</div>
      <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:11,marginBottom:34}}>
        {t.features.map((f,i)=>(
          <li key={i} style={{display:'flex',alignItems:'center',gap:11,fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:'rgba(255,255,255,0.52)',fontWeight:300}}>
            <span style={{width:17,height:17,borderRadius:'50%',background:'rgba(37,89,244,0.12)',border:'1px solid rgba(37,89,244,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:9,color:'#2559F4'}}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      {t.hot?<BtnBlue onClick={onCta} fullWidth>{t.cta}</BtnBlue>:<BtnOutline onClick={onCta} fullWidth>{t.cta}</BtnOutline>}
    </div>
  )
}
function PricingSection({onOpenModal}:{onOpenModal:()=>void}){
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <section id="pricing" style={{padding:isMobile?'80px 0':'140px 0',background:'#0a0d17'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`}}>
        <Reveal>
          <div style={{textAlign:'center',maxWidth:560,margin:'0 auto 72px'}}>
            <Eyebrow center>Pricing</Eyebrow>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(40px,5.5vw,72px)',fontWeight:400,lineHeight:0.96,letterSpacing:'0.04em',color:'#fff',marginBottom:18}}>Simple pricing.<br/>Coming soon.</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,lineHeight:1.8,color:'rgba(255,255,255,0.44)',fontWeight:300}}>Tiered access for every level of commitment. Join early — founding members get the best rates.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:isMobile?16:20,alignItems:'start'}}>
            {PRICING_TIERS.map((t,i)=><PriceCard key={i} t={t} onCta={onOpenModal}/>)}
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:'rgba(255,255,255,0.22)',textAlign:'center',marginTop:40,letterSpacing:'0.03em'}}>Pricing finalised closer to public launch. Early access members get Exclusive Pricing.</p>
        </Reveal>
      </div>
    </section>
  )
}

// ─── FOUNDER ─────────────────────────────────────────────────────────
function ChipTag({children}:{children:React.ReactNode}){
  const [hov,setHov]=useState(false)
  return(
    <span data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:hov?'rgba(255,255,255,0.65)':'rgba(255,255,255,0.32)',background:'rgba(255,255,255,0.03)',border:`1px solid ${hov?'rgba(37,89,244,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:100,padding:'5px 14px',cursor:'none',transition:'color .25s,border-color .25s'}}>
      {children}
    </span>
  )
}
function FounderSection(){
  const w=useWindowWidth()
  const isMobile=w<768
  const chips=['Student of Amyt Dutta','Google Developer Expert in ANDROID','13+ yrs Engineering','200M+ Users','5+ Unicorn Startups Over SEA','18+ yrs Guitar']
  return(
    <section id="founder" style={{padding:isMobile?'80px 0':'140px 0',background:'#000'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`}}>
        <Reveal>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'350px 1fr',gap:isMobile?40:72,alignItems:'center'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{width:isMobile?'100%':375,height:isMobile?280:400,borderRadius:24,background:'linear-gradient(145deg,#111d36,#0a1020)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 30% 30%,rgba(37,89,244,0.14),transparent 65%)'}}/>
                <img src="/rivu.jpeg" alt="Rivu Chakraborty" style={{width:'100%',height:'100%',objectFit:'cover',position:'relative',zIndex:1}}/>
              </div>
              <div style={{position:'absolute',inset:-12,borderRadius:32,border:'1px solid rgba(37,89,244,0.12)',pointerEvents:'none'}}/>
            </div>
            <div>
              <Eyebrow>The Builder</Eyebrow>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(32px,4vw,52px)',letterSpacing:'0.04em',color:'#fff',marginBottom:6}}>Rivu Chakraborty</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'#2559F4',fontWeight:500,marginBottom:22}}>Founder, FretPractice · India's First Google Developer Expert in Kotlin</div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15.5,lineHeight:1.82,color:'rgba(255,255,255,0.44)',maxWidth:560,marginBottom:30,fontWeight:300}}>
                13+ years in mobile engineering. Systems used by 200M+ users. Worked with 5+ unicorn startups. Built at the exact intersection of deep engineering and a lifelong passion for music — 18 years as a guitarist, student of legendary guitarist Amyt Dutta.
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{chips.map((c,i)=><ChipTag key={i}>{c}</ChipTag>)}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── WAITLIST MODAL ──────────────────────────────────────────────────
function WaitlistModal({open,onClose}:{open:boolean;onClose:()=>void}){
  const w=useWindowWidth()
  const isMobile=w<768
  const [s,setS]=useState<ModalState>({name:'',email:'',whatsapp:'',countryCode:'+91',experience:'',featureRequest:'',willingToResearch:false,done:false,error:false})
  const upd=(k:keyof ModalState,v:any)=>setS(prev=>({...prev,[k]:v}))
  const submit=useCallback(()=>{
    const ok=s.name.trim().length>0&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())
    if(ok){
      upd('done',true);upd('error',false)
      console.log('Waitlist:',{name:s.name,email:s.email,whatsapp:s.whatsapp?`${s.countryCode}${s.whatsapp}`:'',experience:s.experience,featureRequest:s.featureRequest,willingToResearch:s.willingToResearch})
      setTimeout(()=>{onClose();setS({name:'',email:'',whatsapp:'',countryCode:'+91',experience:'',featureRequest:'',willingToResearch:false,done:false,error:false})},3000)
    }else{upd('error',true);setTimeout(()=>upd('error',false),1800)}
  },[s,onClose])
  useEffect(()=>{const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};if(open)document.addEventListener('keydown',fn);return ()=>document.removeEventListener('keydown',fn)},[open,onClose])
  if(!open)return null
  const inp:React.CSSProperties={width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:12,padding:'14px 18px',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:300,color:'#fff',outline:'none',cursor:'none',transition:'border-color .25s'}
  const lbl:React.CSSProperties={fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:'rgba(255,255,255,0.7)',marginBottom:8,display:'block',fontWeight:500}
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:isMobile?16:40,animation:'fadeIn .25s ease'}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:'linear-gradient(145deg,#111827,#0a0d17)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:24,padding:isMobile?28:48,maxWidth:560,width:'100%',maxHeight:'90vh',overflowY:'auto',position:'relative',animation:'slideUp .3s ease',boxShadow:'0 40px 120px rgba(0,0,0,0.6),0 0 60px rgba(37,89,244,0.1)'}}>
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>×</button>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:16,background:'rgba(37,89,244,0.12)',border:'1px solid rgba(37,89,244,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:22}}>🎸</div>
          <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:isMobile?28:34,fontWeight:400,lineHeight:1.1,letterSpacing:'0.04em',color:'#fff',marginBottom:12}}>Join the Waitlist</h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.6,color:'rgba(255,255,255,0.55)',fontWeight:300}}>Be the first to know when FretPractice launches. Get exclusive early access pricing.</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:18,marginBottom:24}}>
          <div><label style={lbl}>Name *</label>
            <input type="text" value={s.name} onChange={e=>upd('name',e.target.value)} placeholder="Your name" autoFocus style={{...inp,borderColor:s.error&&!s.name?'rgba(239,68,68,0.55)':'rgba(255,255,255,0.14)'}}/></div>
          <div><label style={lbl}>Email *</label>
            <input type="email" value={s.email} onChange={e=>upd('email',e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="you@example.com" style={{...inp,borderColor:s.error&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())?'rgba(239,68,68,0.55)':'rgba(255,255,255,0.14)'}}/></div>
          <div><label style={lbl}>WhatsApp (optional)</label>
            <div style={{display:'flex',gap:10}}>
              <select value={s.countryCode} onChange={e=>upd('countryCode',e.target.value)} style={{...inp,width:'auto',minWidth:80,padding:'14px 12px'}}>
                {['+1','+91','+44','+61','+81','+65','+971'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <input type="tel" value={s.whatsapp} onChange={e=>upd('whatsapp',e.target.value.replace(/\D/g,''))} placeholder="Number without country code" style={{...inp,flex:1}}/>
            </div>
          </div>
          <div><label style={lbl}>How long have you been playing? (optional)</label>
            <select value={s.experience} onChange={e=>upd('experience',e.target.value)} style={inp}>
              <option value="">Select experience level</option>
              <option value="starting">Just starting out</option>
              <option value="beginner">Beginner (0–1 year)</option>
              <option value="intermediate">Intermediate (1–5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
            </select>
          </div>
          <div><label style={lbl}>What feature do you wish existed? (optional)</label>
            <textarea value={s.featureRequest} onChange={e=>upd('featureRequest',e.target.value)} placeholder="Tell us about a feature you wish existed..." rows={3} style={{...inp,resize:'vertical',minHeight:80}}/></div>
          <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer'}}>
            <input type="checkbox" checked={s.willingToResearch} onChange={e=>upd('willingToResearch',e.target.checked)} style={{marginTop:2,accentColor:'#2559F4',width:16,height:16}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.65)',fontWeight:300,lineHeight:1.5}}>I'm willing to participate in user research sessions</span>
          </label>
        </div>
        <button onClick={submit} disabled={s.done}
          style={{width:'100%',background:'linear-gradient(135deg,#2559F4,#7eb8ff)',border:'none',borderRadius:12,padding:'16px 24px',fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:500,color:'#fff',cursor:s.done?'not-allowed':'pointer',opacity:s.done?0.7:1,marginBottom:s.done?16:0}}>
          {s.done?"You're on the list 🎸":'Join Waitlist'}
        </button>
        {s.done&&<div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:12,padding:'14px 18px',textAlign:'center'}}><p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'#22c55e',margin:0}}>Check your email for confirmation!</p></div>}
        {s.error&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#ef4444',textAlign:'center',marginTop:10}}>Please fill in Name and Email.</p>}
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(255,255,255,0.25)',textAlign:'center',marginTop:20,lineHeight:1.5}}>We respect your privacy. No spam, ever. Unsubscribe anytime.</p>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}`}</style>
    </div>
  )
}

// ─── WAITLIST SECTION ────────────────────────────────────────────────
function WaitlistSection({onOpen}:{onOpen:()=>void}){
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <section id="waitlist" style={{padding:isMobile?'120px 0':'180px 0',textAlign:'center',position:'relative',overflow:'hidden',background:'#000'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 55% at 50% 50%,rgba(37,89,244,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{maxWidth:1100,margin:'0 auto',padding:`0 ${isMobile?'20px':'52px'}`,position:'relative',zIndex:2}}>
        <Reveal>
          <Eyebrow center>Early Access</Eyebrow>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(44px,7vw,96px)',fontWeight:400,lineHeight:0.92,letterSpacing:'0.04em',color:'#fff',marginBottom:22}}>Start practicing<br/>with intention.</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,color:'rgba(255,255,255,0.44)',marginBottom:52,fontWeight:300}}>Join the waitlist. Get early access. Move forward.</p>
          <BtnBlue onClick={onOpen} style={{maxWidth:280,margin:'0 auto'}}>Join Waitlist →</BtnBlue>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:'rgba(255,255,255,0.22)',marginTop:16,letterSpacing:'0.03em'}}>No spam. Unsubscribe anytime. Early access = founder pricing.</p>
        </Reveal>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────
const SOCIALS:SocialItem[]=[
  {label:'X',path:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',url:'https://x.com/fretpracticenow'},
  {label:'Instagram',path:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',url:'https://www.instagram.com/fretpractice/'},
  {label:'LinkedIn',path:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',url:'https://linkedin.com/company/fretpractice'},
  {label:'YouTube',path:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',url:'https://youtube.com/@fretpractice'},
]
function SocialBtn({s}:{s:SocialItem}){
  const [hov,setHov]=useState(false)
  return(
    <a href={s.url||'#'} target="_blank" rel="noopener noreferrer" aria-label={s.label} data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:36,height:36,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',background:hov?'rgba(37,89,244,0.12)':'rgba(255,255,255,0.04)',border:`1px solid ${hov?'rgba(37,89,244,0.3)':'rgba(255,255,255,0.08)'}`,color:hov?'#fff':'rgba(255,255,255,0.38)',transform:hov?'translateY(-2px)':'none',transition:'all .3s cubic-bezier(.16,1,.3,1)',cursor:'none',textDecoration:'none'}}>
      <svg viewBox="0 0 24 24" style={{width:14,height:14,fill:'currentColor'}}><path d={s.path}/></svg>
    </a>
  )
}
function FLink({children,id,href}:{children:React.ReactNode;id?:string;href?:string}){
  const [hov,setHov]=useState(false)
  return(
    <a href={href||'#'} onClick={id?(e)=>{e.preventDefault();scrollTo(id)}:undefined} data-hover onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:hov?'rgba(255,255,255,0.88)':'rgba(255,255,255,0.38)',textDecoration:'none',transition:'color .22s',cursor:'none'}}>
      {children}
    </a>
  )
}
function Footer(){
  const w=useWindowWidth()
  const isMobile=w<768
  return(
    <footer style={{background:'#000',borderTop:'1px solid rgba(255,255,255,0.07)',padding:isMobile?'50px 20px 30px':'70px 52px 42px'}}>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'280px 1fr 1fr 1fr',gap:isMobile?32:60,maxWidth:1100,margin:'0 auto',marginBottom:60}}>
        <div style={{gridColumn:isMobile?'1/-1':'auto'}}>
          <img src={LOGO_SRC} alt="FretPractice" style={{height:44,width:'auto',objectFit:'contain',marginBottom:16,filter:'drop-shadow(0 0 7px rgba(37,89,244,0.4))'}}/>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,0.28)',lineHeight:1.65,maxWidth:220,marginBottom:22}}>AI-powered guitar practice. Structured sessions. Real progress.</p>
          <div style={{display:'flex',gap:8}}>{SOCIALS.map(s=><SocialBtn key={s.label} s={s}/>)}</div>
        </div>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.28)',marginBottom:18}}>Product</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:12}}>
            <li><FLink id="system">Features</FLink></li>
            <li><FLink id="how">How It Works</FLink></li>
            <li><FLink id="updates">Updates</FLink></li>
            <li><FLink id="pricing">Pricing</FLink></li>
          </ul>
        </div>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.28)',marginBottom:18}}>Company</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:12}}>
            <li><FLink id="founder">About</FLink></li>
            <li><FLink href="mailto:fretpractice@mobrio.studio">fretpractice@mobrio.studio</FLink></li>
            <li><FLink href="#">Privacy Policy</FLink></li>
            <li><FLink href="#">Terms of Use</FLink></li>
          </ul>
        </div>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.28)',marginBottom:18}}>Platform</div>
          <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:12}}>
            <li><FLink href="#">FretPractice</FLink></li>
            <li><FLink href="#">Dhun — AI Music</FLink></li>
            <li><FLink href="#">Mobrio Studio</FLink></li>
          </ul>
        </div>
      </div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:28,display:'flex',justifyContent:'space-between',alignItems:'center',maxWidth:1100,margin:'0 auto',flexWrap:'wrap',gap:14}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,0.22)'}}>© 2025 FretPractice · A Mobrio Studio product · Built by Team FretPractice</span>
        <div style={{display:'flex',gap:20}}>
          <FLink href="#">Privacy</FLink>
          <FLink href="#">Terms</FLink>
          <FLink href="mailto:fretpractice@mobrio.studio">fretpractice@mobrio.studio</FLink>
        </div>
      </div>
    </footer>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────
export default function App(){
  const [modalOpen,setModalOpen]=useState(false)
  return(
    <>
      <GlobalStyles/>
      <Cursor/>
      <Nav/>
      <Hero/>
      <NumbersStrip/>
      <HRule/>
      <ProblemSection/>
      <HRule/>
      <SystemSection/>
      <StopSwitchingBanner/>
      <HRule/>
      <HowSection/>
      <HRule/>
      <UpdatesSection/>
      <HRule/>
      <WhoSection/>
      <HRule/>
      <PricingSection onOpenModal={()=>setModalOpen(true)}/>
      <HRule/>
      <FounderSection/>
      <HRule/>
      <WaitlistSection onOpen={()=>setModalOpen(true)}/>
      <Footer/>
      <WaitlistModal open={modalOpen} onClose={()=>setModalOpen(false)}/>
    </>
  )
}
