import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import CloverBoard from './CloverBoard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login'); // login | register | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(err) {
      setError(getErrMsg(err.code));
    }
    setSubmitting(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch(err) {
      setError(getErrMsg(err.code));
    }
    setSubmitting(false);
  };

  const handleReset = async e => {
    e.preventDefault();
    setError(''); setInfo(''); setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo('パスワードリセットメールを送信しました。');
    } catch(err) {
      setError(getErrMsg(err.code));
    }
    setSubmitting(false);
  };

  const getErrMsg = code => {
    const m = {
      'auth/user-not-found': 'メールアドレスが登録されていません',
      'auth/wrong-password': 'パスワードが間違っています',
      'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています',
      'auth/email-already-in-use': 'このメールアドレスは既に使われています',
      'auth/weak-password': 'パスワードは6文字以上にしてください',
      'auth/invalid-email': 'メールアドレスの形式が正しくありません',
      'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらくお待ちください',
    };
    return m[code] || 'エラーが発生しました: ' + code;
  };

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner}></div>
    </div>
  );

  if (user) return <CloverBoard user={user} onLogout={() => signOut(auth)} />;

  return (
    <div style={styles.loginBg}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.cloverIcon}>🍀</div>
          <h1 style={styles.loginTitle}>ドリームクローバー</h1>
          <p style={styles.loginSub}>引き寄せボード</p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <h2 style={styles.formTitle}>ログイン</h2>
            {error && <div style={styles.errorBox}>{error}</div>}
            <div style={styles.field}>
              <label style={styles.label}>メールアドレス</label>
              <input style={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" required autoComplete="email" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>パスワード</label>
              <input style={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="パスワード" required autoComplete="current-password" />
            </div>
            <button style={{...styles.btnPrimary, opacity: submitting ? 0.7 : 1}} type="submit" disabled={submitting}>
              {submitting ? '処理中...' : 'ログイン'}
            </button>
            <div style={styles.links}>
              <button type="button" style={styles.linkBtn} onClick={()=>{setMode('register');setError('');setInfo('');}}>新規登録</button>
              <span style={{color:'#ccc'}}>｜</span>
              <button type="button" style={styles.linkBtn} onClick={()=>{setMode('reset');setError('');setInfo('');}}>パスワードを忘れた</button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <h2 style={styles.formTitle}>新規登録</h2>
            {error && <div style={styles.errorBox}>{error}</div>}
            <div style={styles.field}>
              <label style={styles.label}>メールアドレス</label>
              <input style={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>パスワード（6文字以上）</label>
              <input style={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="パスワード" required />
            </div>
            <button style={{...styles.btnPrimary, opacity: submitting ? 0.7 : 1}} type="submit" disabled={submitting}>
              {submitting ? '処理中...' : 'アカウント作成'}
            </button>
            <div style={styles.links}>
              <button type="button" style={styles.linkBtn} onClick={()=>{setMode('login');setError('');}}>ログインに戻る</button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} style={styles.form}>
            <h2 style={styles.formTitle}>パスワードリセット</h2>
            {error && <div style={styles.errorBox}>{error}</div>}
            {info && <div style={styles.infoBox}>{info}</div>}
            <div style={styles.field}>
              <label style={styles.label}>登録済みメールアドレス</label>
              <input style={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" required />
            </div>
            <button style={{...styles.btnPrimary, opacity: submitting ? 0.7 : 1}} type="submit" disabled={submitting}>
              {submitting ? '送信中...' : 'リセットメールを送る'}
            </button>
            <div style={styles.links}>
              <button type="button" style={styles.linkBtn} onClick={()=>{setMode('login');setError('');setInfo('');}}>ログインに戻る</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  center: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' },
  spinner: { width:40, height:40, border:'4px solid #e0f0ea', borderTop:'4px solid #1D9E75', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  loginBg: { minHeight:'100vh', background:'linear-gradient(135deg, #e8f5f0 0%, #d4ede4 50%, #c8e8dc 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  loginCard: { background:'#fff', borderRadius:24, boxShadow:'0 8px 40px rgba(29,158,117,0.15)', padding:'2.5rem 2rem', width:'100%', maxWidth:420 },
  loginHeader: { textAlign:'center', marginBottom:'2rem' },
  cloverIcon: { fontSize:56, display:'block', marginBottom:'0.5rem' },
  loginTitle: { fontFamily:"'Zen Kaku Gothic New', sans-serif", fontSize:26, fontWeight:700, color:'#0F6E56', letterSpacing:2 },
  loginSub: { fontSize:13, color:'#5DCAA5', marginTop:4, letterSpacing:3 },
  form: { display:'flex', flexDirection:'column', gap:'1rem' },
  formTitle: { fontSize:18, fontWeight:700, color:'#1a1a1a', textAlign:'center', marginBottom:'0.5rem' },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:500, color:'#444' },
  input: { padding:'10px 14px', border:'1.5px solid #c8e8dc', borderRadius:10, fontSize:15, fontFamily:"'Noto Sans JP', sans-serif", outline:'none', transition:'border-color 0.2s', background:'#fafffe' },
  btnPrimary: { padding:'12px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:12, fontSize:16, fontWeight:700, fontFamily:"'Noto Sans JP', sans-serif", cursor:'pointer', transition:'opacity 0.2s' },
  links: { display:'flex', justifyContent:'center', gap:'1rem', alignItems:'center' },
  linkBtn: { background:'none', border:'none', color:'#1D9E75', fontSize:13, cursor:'pointer', fontFamily:"'Noto Sans JP', sans-serif", textDecoration:'underline' },
  errorBox: { background:'#fff0f0', border:'1px solid #fcc', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#c0392b' },
  infoBox: { background:'#f0fff8', border:'1px solid #9FE1CB', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#0F6E56' },
};
