import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import ExcelExport from './ExcelExport';

const SECTIONS = [
  { id:'be',         label:'Be',         icon:'🌱', sub:'あり方・能力',   color:'#4A7FBF', bg:'#EBF2FC' },
  { id:'contribute', label:'Contribute', icon:'🌟', sub:'貢献・社会へ',   color:'#E8734A', bg:'#FDF0EA' },
  { id:'haveget',    label:'Have / Get', icon:'💎', sub:'持つ・得る',     color:'#7B5EA7', bg:'#F1ECF9' },
  { id:'doenjoy',    label:'Do / Enjoy', icon:'🎯', sub:'行動・楽しむ',   color:'#C4891A', bg:'#FDF4E3' },
  { id:'resource',   label:'Resource',   icon:'🔑', sub:'資源・源泉',     color:'#3A7D44', bg:'#EAF5EC' },
  { id:'experience', label:'Experience', icon:'✨',    sub:'体験・経験',     color:'#C74B7B', bg:'#FCEAF3' },
];
const PH = {
  be:'例）引き寄せ能力、グランドセルフ、愛される人格...',
  contribute:'例）ボランティア、愛情コーチング、パートナーシップコーチ...',
  haveget:'例）中国語、コミュニケーション能力、女性性/男性性...',
  doenjoy:'例）ホリスティック学習、子どもと楽しむ、旅行...',
  resource:'例）YOLO 一度きりの人生、やりたい事がある、仲間...',
  experience:'例）海外体験、天下山、仲間と旅行...',
};
const INITIAL={be:'',contribute:'',haveget:'',doenjoy:'',resource:'',experience:'',mission:'',affirmation:'',feeling:'',date:''};
export default function CloverBoard({user,onLogout}){
  const [data,setData]=useState(INITIAL);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState('');
  useEffect(()=>{
    const today=new Date().toISOString().split('T')[0];
    (async()=>{
      try{
        const snap=await getDoc(doc(db,'clover',user.uid));
        if(snap.exists()){setData({...INITIAL,...snap.data()});}
        else{setData(d=>({...d,date:today}));}
      }catch(e){console.error(e);setData(d=>({...d,date:today}));}
      setLoading(false);
    })();
  },[user.uid]);
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(''),2800);};
  const handleSave=useCallback(async()=>{
    setSaving(true);
    try{
      await setDoc(doc(db,'clover',user.uid),{...data,updatedAt:new Date().toISOString()});
      setSaved(true);showToast('✅ 保存しました');
      setTimeout(()=>setSaved(false),2000);
    }catch(e){showToast('❌ 保存失敗: '+e.message);}
    setSaving(false);
  },[data,user.uid]);
  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  const css='@keyframes spin{to{transform:rotate(360deg)}} textarea::placeholder{color:#aaa;font-size:12px} textarea:focus{outline:none;border-color:#5DCAA5!important;box-shadow:0 0 0 2px rgba(93,202,165,.2)} @media(max-width:600px){.clover-grid{grid-template-columns:1fr!important}.center-cols{grid-template-columns:1fr!important}}';
  if(loading)return(<div style={s.center}><div style={s.spinner}></div><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>);
  return(
    <div style={s.wrap}>
      <style>{css}</style>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{fontSize:26}}>🍀</span>
          <div><h1 style={s.title}>ドリームクローバー</h1><p style={s.titleSub}>引き寄せボード</p></div>
        </div>
        <div style={s.headerRight}>
          <span style={s.userEmail}>{user.email}</span>
          <button style={{...s.btnSave,opacity:saving?0.7:1}} onClick={handleSave} disabled={saving}>
            {saving?'保存中...':saved?'✓ 保存済み':'💾 保存'}
          </button>
          <ExcelExport data={data} onToast={showToast} />
          <button style={s.btnLogout} onClick={onLogout}>ログアウト</button>
        </div>
      </header>
      <div style={s.container}>
        <div style={s.dateRow}>
          <label style={s.dateLabel}>記入日</label>
          <input style={s.dateInput} type='date' value={data.date||''} onChange={e=>set('date',e.target.value)} />
        </div>
        <div style={s.grid} className='clover-grid'>
          {[SECTIONS[0],SECTIONS[1]].map(sec=>(<SectionCard key={sec.id} sec={sec} ph={PH[sec.id]} value={data[sec.id]} onChange={v=>set(sec.id,v)} />))}
          <div style={s.centerBlock}>
            <div style={s.centerTitle}>🍀 中心のクローバー（核心）</div>
            <div style={s.centerGrid} className='center-cols'>
              <CenterField label='使命（Mission）' color='#1D5C8A' bg='#E8F1FB' value={data.mission} onChange={v=>set('mission',v)} ph='あなたの人生の使命・目的を書いてください...' />
              <CenterField label='Affirmation（宣言）' color='#4A7FBF' bg='#EBF2FC' value={data.affirmation} onChange={v=>set('affirmation',v)} ph='私は～である。毎日声に出す宣言を書いてください...' />
              <CenterField label='Feeling（感情・感謝）' color='#3A7D44' bg='#EAF5EC' value={data.feeling} onChange={v=>set('feeling',v)} ph='どんな感情で生きたい？感謝を書いてください...' />
            </div>
          </div>
          {[SECTIONS[2],SECTIONS[3],SECTIONS[4],SECTIONS[5]].map(sec=>(<SectionCard key={sec.id} sec={sec} ph={PH[sec.id]} value={data[sec.id]} onChange={v=>set(sec.id,v)} />))}
        </div>
        <div style={s.footer}><p style={s.footerText}>Copyright © ドリームクローバー | Synergy Plus+</p></div>
      </div>
      {toast&&<div style={s.toast}>{toast}</div>}
    </div>
  );
}
function SectionCard({sec,ph,value,onChange}){
  return(<div style={{...s.card,borderTop:`4px solid ${sec.color}`,background:sec.bg}}>
    <div style={{...s.cardLabel,color:sec.color}}>
      <span style={{fontSize:18}}>{sec.icon}</span>
      <span style={s.cardLabelText}>{sec.label}</span>
      <span style={s.cardLabelSub}>{sec.sub}</span>
    </div>
    <textarea style={s.textarea} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} />
  </div>);
}
function CenterField({label,color,bg,value,onChange,ph}){
  return(<div style={s.centerItem}>
    <label style={{...s.centerItemLabel,color}}>{label}</label>
    <textarea style={{...s.textarea,background:bg,minHeight:90,border:'1.5px solid #ddd'}} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} />
  </div>);
}
const s={
  center:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:12},
  spinner:{width:36,height:36,border:'4px solid #e0f0ea',borderTop:'4px solid #1D9E75',borderRadius:'50%',animation:'spin 0.8s linear infinite'},
  wrap:{minHeight:'100vh',background:'#f0f7f4'},
  header:{background:'#fff',borderBottom:'2px solid #c8e8dc',padding:'0.7rem 1.2rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.6rem',position:'sticky',top:0,zIndex:100},
  headerLeft:{display:'flex',alignItems:'center',gap:'0.6rem'},
  title:{fontFamily:"'Zen Kaku Gothic New',sans-serif",fontSize:18,fontWeight:700,color:'#0F6E56'},
  titleSub:{fontSize:10,color:'#5DCAA5'},
  headerRight:{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'},
  userEmail:{fontSize:11,color:'#999',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  btnSave:{background:'#1D9E75',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontSize:13,fontWeight:700,fontFamily:"'Noto Sans JP',sans-serif",cursor:'pointer'},
  btnLogout:{background:'#f5f5f5',color:'#666',border:'1px solid #ddd',borderRadius:8,padding:'7px 12px',fontSize:12,cursor:'pointer'},
  container:{maxWidth:1100,margin:'0 auto',padding:'0.8rem 1rem 3rem'},
  dateRow:{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end',padding:'0.4rem 0 0.8rem'},
  dateLabel:{fontSize:13,color:'#666',fontWeight:500},
  dateInput:{border:'1.5px solid #c8e8dc',borderRadius:8,padding:'5px 10px',fontSize:13,background:'#fff',color:'#1a1a1a'},
  grid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12},
  card:{borderRadius:14,padding:'0.9rem',display:'flex',flexDirection:'column',gap:'0.5rem'},
  cardLabel:{display:'flex',alignItems:'center',gap:6},
  cardLabelText:{fontSize:14,fontWeight:700},
  cardLabelSub:{fontSize:11,color:'#888'},
  textarea:{width:'100%',minHeight:155,border:'1.5px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'9px 11px',fontSize:13,lineHeight:1.8,resize:'vertical',background:'rgba(255,255,255,0.85)',color:'#1a1a1a'},
  centerBlock:{gridColumn:'1 / -1',background:'linear-gradient(135deg,#e8f5f0,#e8f0fb)',border:'2px solid #5DCAA5',borderRadius:16,padding:'1rem'},
  centerTitle:{fontSize:13,fontWeight:700,color:'#0F6E56',marginBottom:'0.8rem',textAlign:'center'},
  centerGrid:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10},
  centerItem:{display:'flex',flexDirection:'column',gap:5},
  centerItemLabel:{fontSize:12,fontWeight:700},
  footer:{textAlign:'center',padding:'2rem 0 1rem'},
  footerText:{fontSize:12,color:'#bbb'},
  toast:{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1D9E75',color:'#fff',padding:'10px 28px',borderRadius:30,fontSize:14,boxShadow:'0 4px 16px rgba(0,0,0,0.15)',zIndex:9999,whiteSpace:'nowrap'},
};