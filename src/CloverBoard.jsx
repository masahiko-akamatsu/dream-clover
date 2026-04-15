import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import ExcelExport from './ExcelExport';

const SECTIONS = [
  { id:'be',         label:'Be',         icon:'🌱', sub:'あり方・能力',   color:'#4A7FBF', bg:'#EBF2FC', ph:'例：引き寄せ能力\n　　グランドセルフ\n　　愛される人格...' },
  { id:'contribute', label:'Contribute', icon:'🌟', sub:'貢献・社会へ',   color:'#E8734A', bg:'#FDF0EA', ph:'例：ボランティア\n　　愛情コーチング\n　　パートナーシップコーチ...' },
  { id:'haveget',    label:'Have / Get', icon:'💎', sub:'持つ・得る',     color:'#7B5EA7', bg:'#F1ECF9', ph:'例：中国語\n　　コミュニケーション能力\n　　女性性/男性性...' },
  { id:'doenjoy',    label:'Do / Enjoy', icon:'🎯', sub:'行動・楽しむ',   color:'#C4891A', bg:'#FDF4E3', ph:'例：ホリスティック学習\n　　子どもと楽しむ\n　　旅行...' },
  { id:'resource',   label:'Resource',   icon:'🔑', sub:'資源・源泉',     color:'#3A7D44', bg:'#EAF5EC', ph:'例：YOLO 一度きりの人生\n　　やりたい事がある\n　　仲間...' },
  { id:'experience', label:'Experience', icon:'✨', sub:'体験・経験',     color:'#C74B7B', bg:'#FCEAF3', ph:'例：海外体験\n　　天下山\n　　仲間と旅行...' },
];

const INITIAL = { be:'', contribute:'', haveget:'', doenjoy:'', resource:'', experience:'', mission:'', affirmation:'', feeling:'', date:'' };

export default function CloverBoard({ user, onLogout }) {
  const [data, setData] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setData(d => ({ ...d, date: d.date || today }));
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'clover', user.uid));
        if (snap.exists()) setData(snap.data());
        else setData(d => ({ ...d, date: today }));
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, [user.uid]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'clover', user.uid), { ...data, updatedAt: new Date().toISOString() });
      setSaved(true);
      showToast('✅ 保存しました');
      setTimeout(() => setSaved(false), 2000);
    } catch(e) {
      showToast('❌ 保存に失敗しました');
    }
    setSaving(false);
  }, [data, user.uid]);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  if (loading) return <div style={s.center}><div style={s.spinner}></div></div>;

  return (
    <div style={s.wrap}>
      {/* ヘッダー */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{fontSize:28}}>🍀</span>
          <div>
            <h1 style={s.title}>ドリームクローバー</h1>
            <p style={s.titleSub}>引き寄せボード</p>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.userEmail}>{user.email}</span>
          <button style={s.btnSave} onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : saved ? '✓ 保存済み' : '💾 保存'}
          </button>
          <ExcelExport data={data} onToast={showToast} />
          <button style={s.btnLogout} onClick={onLogout}>ログアウト</button>
        </div>
      </header>

      <div style={s.container}>
        {/* 日付 */}
        <div style={s.dateRow}>
          <label style={s.dateLabel}>記入日</label>
          <input style={s.dateInput} type="date" value={data.date} onChange={e=>set('date',e.target.value)} />
        </div>

        {/* 6カテゴリグリッド + 中央クローバー */}
        <div style={s.grid}>
          {/* Row 1: Be / Contribute */}
          {[SECTIONS[0], SECTIONS[1]].map(sec => (
            <SectionCard key={sec.id} sec={sec} value={data[sec.id]} onChange={v=>set(sec.id,v)} />
          ))}

          {/* 中央クローバー（2列幅） */}
          <div style={s.centerBlock}>
            <div style={s.centerTitle}>🍀 中心のクローバー（核心）</div>
            <div style={s.centerGrid}>
              <CenterField label="使命（Mission）" color="#1D5C8A" bg="#E8F1FB" value={data.mission} onChange={v=>set('mission',v)} ph="あなたの人生の使命・目的を書いてください..." />
              <CenterField label="Affirmation（宣言）" color="#4A7FBF" bg="#EBF2FC" value={data.affirmation} onChange={v=>set('affirmation',v)} ph="私は〜である。\n毎日声に出す宣言を書いてください..." />
              <CenterField label="Feeling（感情・感謝）" color="#3A7D44" bg="#EAF5EC" value={data.feeling} onChange={v=>set('feeling',v)} ph="どんな感情で生きたい？\n感謝することを書いてください..." />
            </div>
          </div>

          {/* Row 2: Have/Get / Do/Enjoy */}
          {[SECTIONS[2], SECTIONS[3]].map(sec => (
            <SectionCard key={sec.id} sec={sec} value={data[sec.id]} onChange={v=>set(sec.id,v)} />
          ))}

          {/* Row 3: Resource / Experience */}
          {[SECTIONS[4], SECTIONS[5]].map(sec => (
            <SectionCard key={sec.id} sec={sec} value={data[sec.id]} onChange={v=>set(sec.id,v)} />
          ))}
        </div>

        <div style={s.footer}>
          <p style={s.footerText}>Copyright © ドリームクローバー | Synergy Plus+</p>
        </div>
      </div>

      {/* トースト */}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}

function SectionCard({ sec, value, onChange }) {
  return (
    <div style={{...s.card, borderTop:`4px solid ${sec.color}`, background: sec.bg}}>
      <div style={{...s.cardLabel, color: sec.color}}>
        <span style={{fontSize:18}}>{sec.icon}</span>
        <span style={s.cardLabelText}>{sec.label}</span>
        <span style={s.cardLabelSub}>{sec.sub}</span>
      </div>
      <textarea
        style={s.textarea}
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={sec.ph}
      />
    </div>
  );
}

function CenterField({ label, color, bg, value, onChange, ph }) {
  return (
    <div style={s.centerItem}>
      <label style={{...s.centerItemLabel, color}}>{label}</label>
      <textarea style={{...s.textarea, background: bg, minHeight:90}} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} />
    </div>
  );
}

const s = {
  center: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' },
  spinner: { width:36, height:36, border:'4px solid #e0f0ea', borderTop:'4px solid #1D9E75', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  wrap: { minHeight:'100vh', background:'#f0f7f4' },
  header: { background:'#fff', borderBottom:'2px solid #c8e8dc', padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', position:'sticky', top:0, zIndex:100 },
  headerLeft: { display:'flex', alignItems:'center', gap:'0.75rem' },
  title: { fontFamily:"'Zen Kaku Gothic New', sans-serif", fontSize:20, fontWeight:700, color:'#0F6E56', letterSpacing:1 },
  titleSub: { fontSize:11, color:'#5DCAA5', letterSpacing:2 },
  headerRight: { display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' },
  userEmail: { fontSize:12, color:'#888', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  btnSave: { background:'#1D9E75', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:'pointer' },
  btnLogout: { background:'#f5f5f5', color:'#666', border:'1px solid #ddd', borderRadius:8, padding:'7px 14px', fontSize:13, fontFamily:"'Noto Sans JP',sans-serif", cursor:'pointer' },
  container: { maxWidth:1100, margin:'0 auto', padding:'1rem 1rem 3rem' },
  dateRow: { display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end', padding:'0.5rem 0' },
  dateLabel: { fontSize:13, color:'#666', fontWeight:500 },
  dateInput: { border:'1.5px solid #c8e8dc', borderRadius:8, padding:'5px 10px', fontSize:13, fontFamily:"'Noto Sans JP',sans-serif", background:'#fff', color:'#1a1a1a' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  card: { borderRadius:14, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem' },
  cardLabel: { display:'flex', alignItems:'center', gap:6 },
  cardLabelText: { fontSize:15, fontWeight:700 },
  cardLabelSub: { fontSize:11, color:'#888', marginLeft:2 },
  textarea: { width:'100%', minHeight:160, border:'1.5px solid #ddd', borderRadius:10, padding:'10px 12px', fontFamily:"'Noto Sans JP',sans-serif", fontSize:13, lineHeight:1.8, resize:'vertical', background:'rgba(255,255,255,0.85)', color:'#1a1a1a', outline:'none', transition:'border-color 0.2s' },
  centerBlock: { gridColumn:'1 / -1', background:'linear-gradient(135deg, #e8f5f0, #e8f0fb)', border:'2px solid #5DCAA5', borderRadius:18, padding:'1.2rem' },
  centerTitle: { fontSize:14, fontWeight:700, color:'#0F6E56', letterSpacing:1, marginBottom:'0.9rem', textAlign:'center' },
  centerGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
  centerItem: { display:'flex', flexDirection:'column', gap:6 },
  centerItemLabel: { fontSize:12, fontWeight:700, letterSpacing:0.5 },
  footer: { textAlign:'center', padding:'2rem 0 1rem' },
  footerText: { fontSize:12, color:'#aaa' },
  toast: { position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#1D9E75', color:'#fff', padding:'10px 28px', borderRadius:30, fontSize:14, fontFamily:"'Noto Sans JP',sans-serif", boxShadow:'0 4px 16px rgba(0,0,0,0.15)', zIndex:9999, whiteSpace:'nowrap' },
};
