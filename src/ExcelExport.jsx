import ExcelJS from 'exceljs';

export default function ExcelExport({ data, onToast }) {
  const handleExport = async () => {
    onToast('Excel を作成中...');
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ドリームクローバー';
    const ws = wb.addWorksheet('ドリームクローバー', {
      pageSetup: { paperSize:9, orientation:'portrait', fitToPage:true, fitToWidth:1, fitToHeight:1,
        margins:{left:0.5,right:0.5,top:0.6,bottom:0.6,header:0.3,footer:0.3} }
    });

    const C = {
      green:'1D9E75', dkGreen:'0F6E56', ltGreen:'E1F5EE',
      be:'4A7FBF', beLt:'EBF2FC',
      cont:'E8734A', contLt:'FDF0EA',
      hg:'7B5EA7', hgLt:'F1ECF9',
      de:'C4891A', deLt:'FDF4E3',
      res:'3A7D44', resLt:'EAF5EC',
      exp:'C74B7B', expLt:'FCEAF3',
      center:'E6F4F1', white:'FFFFFF', gray:'F5F5F0', border:'CCCCCC'
    };

    ws.columns = [{width:2},{width:24},{width:24},{width:24},{width:24},{width:2}];

    const fill = c => ({type:'pattern',pattern:'solid',fgColor:{argb:'FF'+c}});
    const border = (c='CCCCCC',w='thin') => { const s={style:w,color:{argb:'FF'+c}}; return {top:s,bottom:s,left:s,right:s}; };
    const lborder = c => ({top:{style:'thin',color:{argb:'FFCCCCCC'}},bottom:{style:'thin',color:{argb:'FFCCCCCC'}},left:{style:'medium',color:{argb:'FF'+c}},right:{style:'thin',color:{argb:'FFCCCCCC'}}});
    const font = (sz,bold,color) => ({name:'Noto Sans JP',size:sz,bold:bold||false,color:{argb:'FF'+(color||'1a1a1a')}});

    const setH = (r,h) => { ws.getRow(r).height = h; };

    // タイトル行
    ws.mergeCells(1,1,1,6);
    const t=ws.getCell(1,1); t.value='🍀 引き寄せボード／ドリームクローバー';
    t.font=font(15,true,'FFFFFF'); t.fill=fill(C.green); t.alignment={horizontal:'center',vertical:'middle'}; t.border=border(C.green);
    setH(1,36);

    // 日付
    ws.mergeCells(2,1,2,6);
    const d=ws.getCell(2,1); d.value=data.date?'記入日：'+data.date:'';
    d.font=font(10,false,'888888'); d.fill=fill(C.gray); d.alignment={horizontal:'right',vertical:'middle'};
    setH(2,18);

    // セクション描画関数
    const drawSec=(r,c,span,label,val,lc,bg)=>{
      ws.mergeCells(r,c,r+span-1,c+1);
      const cell=ws.getCell(r,c);
      cell.value={richText:[
        {text:label+'\n',font:{bold:true,size:11,color:{argb:'FF'+lc},name:'Noto Sans JP'}},
        {text:val||'',font:{size:10,color:{argb:'FF333333'},name:'Noto Sans JP'}}
      ]};
      cell.fill=fill(bg); cell.alignment={horizontal:'left',vertical:'top',wrapText:true};
      for(let i=r;i<r+span;i++){
        for(let j=c;j<c+2;j++){
          ws.getCell(i,j).border=lborder(lc);
        }
        setH(i,18);
      }
    };

    drawSec(3,2,12,'🌱 Be（あり方・能力）',data.be,C.be,C.beLt);
    drawSec(3,4,12,'🌟 Contribute（貢献）',data.contribute,C.cont,C.contLt);

    // 中央クローバー
    ws.mergeCells(15,2,22,5);
    const cc=ws.getCell(15,2);
    cc.value={richText:[
      {text:'🍀 中心のクローバー\n',font:{bold:true,size:12,color:{argb:'FF'+C.dkGreen},name:'Noto Sans JP'}},
      {text:'【使命】\n',font:{bold:true,size:10,color:{argb:'FF1D5C8A'},name:'Noto Sans JP'}},
      {text:(data.mission||'')+'\n\n',font:{size:10,color:{argb:'FF222222'},name:'Noto Sans JP'}},
      {text:'【Affirmation】\n',font:{bold:true,size:10,color:{argb:'FF4A7FBF'},name:'Noto Sans JP'}},
      {text:(data.affirmation||'')+'\n\n',font:{size:10,color:{argb:'FF222222'},name:'Noto Sans JP'}},
      {text:'【Feeling】\n',font:{bold:true,size:10,color:{argb:'FF3A7D44'},name:'Noto Sans JP'}},
      {text:(data.feeling||''),font:{size:10,color:{argb:'FF222222'},name:'Noto Sans JP'}},
    ]};
    cc.fill=fill(C.center); cc.alignment={horizontal:'left',vertical:'top',wrapText:true};
    const cb={style:'medium',color:{argb:'FF'+C.green}};
    for(let i=15;i<=22;i++){
      for(let j=2;j<=5;j++) ws.getCell(i,j).border={top:cb,bottom:cb,left:cb,right:cb};
      setH(i,20);
    }

    drawSec(23,2,10,'💎 Have/Get（持つ・得る）',data.haveget,C.hg,C.hgLt);
    drawSec(23,4,10,'🎯 Do/Enjoy（行動・楽しむ）',data.doenjoy,C.de,C.deLt);
    drawSec(33,2,9,'🔑 Resource（資源）',data.resource,C.res,C.resLt);
    drawSec(33,4,9,'✨ Experience（体験）',data.exp,C.expLt,C.expLt);

    ws.mergeCells(42,1,42,6);
    const ft=ws.getCell(42,1);
    ft.value='Copyright © ドリームクローバー | Synergy Plus+';
    ft.font=font(9,false,'AAAAAA'); ft.fill=fill(C.gray); ft.alignment={horizontal:'center',vertical:'middle'};
    setH(42,16);

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=`ドリームクローバー_${data.date||'今日'}.xlsx`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    onToast('✅ Excelをダウンロードしました！');
  };

  return (
    <button
      onClick={handleExport}
      style={{background:'#3A7D44',color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:13,fontWeight:700,fontFamily:"'Noto Sans JP',sans-serif",cursor:'pointer'}}
    >
      📥 Excel出力
    </button>
  );
}
