import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { LayoutDashboard, Receipt, Tags, ChartNoAxesCombined, Settings, Plus, Download, Trash2, Pencil, Search, Moon, Sun, Wallet, TrendingDown, Sparkles, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const starterCategories = [
  {name:'Food',color:'#ff8a65'},{name:'Travel',color:'#7c83fd'},
  {name:'Shopping',color:'#e879f9'},{name:'Bills',color:'#38bdf8'},
  {name:'Education',color:'#34d399'},{name:'Other',color:'#fbbf24'}
];
const starterExpenses = [
  {id:1,title:'Coffee & snacks',amount:180,category:'Food',date:'2026-11-10',note:'Cafe'},
  {id:2,title:'Bus pass',amount:450,category:'Travel',date:'2026-11-09',note:''},
  {id:3,title:'Notebook',amount:120,category:'Education',date:'2026-11-08',note:'College'},
  {id:4,title:'Lunch',amount:220,category:'Food',date:'2026-11-07',note:''},
  {id:5,title:'Recharge',amount:299,category:'Bills',date:'2026-11-05',note:''}
];
const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
const read = (key, fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const today = new Date().toISOString().slice(0,10);

function App(){
  const [page,setPage]=useState('Dashboard');
  const [expenses,setExpenses]=useState(()=>read('ef-expenses',starterExpenses));
  const [categories,setCategories]=useState(()=>read('ef-categories',starterCategories));
  const [dark,setDark]=useState(()=>read('ef-dark',true));
  const [style,setStyle]=useState(()=>read('ef-style','Bestie'));
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('All');
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({title:'',amount:'',category:'Food',date:today,note:''});
  const [catForm,setCatForm]=useState({name:'',color:'#8b5cf6'});
  useEffect(()=>localStorage.setItem('ef-expenses',JSON.stringify(expenses)),[expenses]);
  useEffect(()=>localStorage.setItem('ef-categories',JSON.stringify(categories)),[categories]);
  useEffect(()=>localStorage.setItem('ef-dark',JSON.stringify(dark)),[dark]);
  useEffect(()=>localStorage.setItem('ef-style',JSON.stringify(style)),[style]);

  const monthExpenses=expenses.filter(e=>e.date?.slice(0,7)===today.slice(0,7));
  const total=expenses.reduce((s,e)=>s+Number(e.amount),0);
  const monthTotal=monthExpenses.reduce((s,e)=>s+Number(e.amount),0);
  const categoryData=categories.map(c=>({name:c.name,value:expenses.filter(e=>e.category===c.name).reduce((s,e)=>s+Number(e.amount),0),color:c.color})).filter(c=>c.value>0);
  const monthlyData=Array.from({length:6},(_,i)=>{
    const d=new Date();d.setMonth(d.getMonth()-5+i);
    const key=d.toISOString().slice(0,7);
    return {month:d.toLocaleDateString('en-IN',{month:'short'}),amount:expenses.filter(e=>e.date?.slice(0,7)===key).reduce((s,e)=>s+Number(e.amount),0)};
  });
  const filtered=expenses.filter(e=>(filter==='All'||e.category===filter)&&(`${e.title} ${e.category} ${e.note}`.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>b.date.localeCompare(a.date));
  const nav=[['Dashboard',LayoutDashboard],['Expenses',Receipt],['Categories',Tags],['Analytics',ChartNoAxesCombined],['Settings',Settings]];
  const greeting=style==='Professional'?'Welcome back, Nidhi.':style==='Minimal'?'Hi Nidhi.':'Hiii Nidhi! ✨';

  function openExpense(item=null){setForm(item?{...item,amount:String(item.amount)}:{title:'',amount:'',category:categories[0]?.name||'Other',date:today,note:''});setModal({type:'expense',item});}
  function saveExpense(e){e.preventDefault();if(!form.title.trim()||Number(form.amount)<=0)return;
    if(modal.item)setExpenses(prev=>prev.map(x=>x.id===modal.item.id?{...form,amount:Number(form.amount),id:x.id}:x));
    else setExpenses(prev=>[{...form,amount:Number(form.amount),id:Date.now()},...prev]);setModal(null);}
  function exportCSV(){const rows=[['Title','Amount (INR)','Category','Date','Note'],...expenses.map(e=>[e.title,e.amount,e.category,e.date,e.note||''])];
    const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nidhi-expenses.csv';a.click();URL.revokeObjectURL(a.href);}
  function exportPDF(){const doc=new jsPDF();doc.setFontSize(20);doc.text("Nidhi's ExpenseFlow",14,18);doc.setFontSize(11);doc.text(`Expense report • Total: ${money(total)}`,14,27);
    let y=38;doc.text('Date',14,y);doc.text('Title',42,y);doc.text('Category',115,y);doc.text('Amount',165,y);y+=8;
    expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).forEach(e=>{if(y>275){doc.addPage();y=20;}doc.text(String(e.date||''),14,y);doc.text(String(e.title).slice(0,35),42,y);doc.text(String(e.category).slice(0,20),115,y);doc.text(money(Number(e.amount)),165,y);y+=7;});doc.save('nidhi-expenses.pdf');}
  function addCategory(e){e.preventDefault();if(!catForm.name.trim()||categories.some(c=>c.name.toLowerCase()===catForm.name.toLowerCase()))return;
    setCategories([...categories,{...catForm,name:catForm.name.trim()}]);setCatForm({name:'',color:'#8b5cf6'});}
  function renameCategory(oldName){const name=prompt('New category name:',oldName);if(!name?.trim()||name===oldName)return;
    setCategories(cs=>cs.map(c=>c.name===oldName?{...c,name:name.trim()}:c));setExpenses(es=>es.map(e=>e.category===oldName?{...e,category:name.trim()}:e));}
  function removeCategory(name){if(!confirm(`Remove "${name}"? Its expenses will move to Other.`))return;
    setCategories(cs=>cs.filter(c=>c.name!==name));setExpenses(es=>es.map(e=>e.category===name?{...e,category:'Other'}:e));if(!categories.some(c=>c.name==='Other'))setCategories(cs=>[...cs,{name:'Other',color:'#fbbf24'}]);}
  const tooltipStyle={background:dark?'#17172b':'#fff',border:`1px solid ${dark?'#30304a':'#e5e7eb'}`,borderRadius:12,color:dark?'#fff':'#111'};
  return <div className={`app ${dark?'dark':'light'}`}>
    <aside className="sidebar"><div className="brand"><div className="brandmark"><Wallet size={22}/></div><div><b>ExpenseFlow</b><small>PERSONAL FINANCE</small></div></div>
      <div className="nav-label">WORKSPACE</div>{nav.map(([n,Icon])=><button key={n} className={`navitem ${page===n?'active':''}`} onClick={()=>setPage(n)}><Icon size={18}/>{n}{n==='Expenses'&&<span className="navcount">{expenses.length}</span>}</button>)}
      <div className="sidebar-bottom"><div className="mini-profile"><div className="avatar">N</div><div><b>Nidhi N D</b><small>Personal account</small></div><Sparkles size={16}/></div><div className="side-note">✨ Small steps, smarter spending.</div></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><button className="iconbtn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><div className="avatar small">N</div></div></header>
    <div className="content">
      <div className="welcome"><div><div className="eyebrow">THURSDAY, NOVEMBER 12, 2026</div><h1>{greeting}</h1><p className="muted">Here's your money story at a glance. Keep shining 🌷</p></div><button className="primary" onClick={()=>openExpense()}><Plus size={17}/> Add expense</button></div>
      {page==='Dashboard'&&<><div className="stats">
        <div className="stat-card featured"><div className="stat-top"><span>Total expenses</span><span className="stat-icon"><Wallet size={17}/></span></div><strong>{money(total)}</strong><small>Across all recorded entries</small><div className="sparkline">↗ <span>Every rupee has a story</span></div></div>
        <div className="stat-card"><div className="stat-top"><span>This month</span><span className="stat-icon peach"><TrendingDown size={17}/></span></div><strong>{money(monthTotal)}</strong><small>{monthExpenses.length} transactions this month</small><div className="progress"><i style={{width:`${Math.min(100,monthTotal/(total||1)*100)}%`}}/></div></div>
        <div className="stat-card"><div className="stat-top"><span>Transactions</span><span className="stat-icon blue"><Receipt size={17}/></span></div><strong>{expenses.length}</strong><small>Expense entries saved</small><div className="sparkline purple">✦ <span>Stay mindful, not stressed</span></div></div>
      </div><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Spending overview</h2><p>Monthly expenses · last 6 months</p></div><span className="tag">₹ INR</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark?'#292941':'#edf0f5'}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:dark?'#9696b5':'#85899a',fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:dark?'#9696b5':'#85899a',fontSize:12}}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Bar dataKey="amount" fill="#8b5cf6" radius={[7,7,0,0]} animationDuration={1200}/></BarChart></ResponsiveContainer></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Where it goes</h2><p>Expense split by category</p></div><span className="tag">All time</span></div><div className="donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4} animationDuration={1200}>{categoryData.map((c,i)=><Cell key={i} fill={c.color}/>)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize:12,color:dark?'#b5b5ce':'#666'}}/></PieChart></ResponsiveContainer></div></section></div>
      <section className="panel"><div className="panel-head"><div><h2>Recent expenses</h2><p>Your latest activity</p></div><button className="textbtn" onClick={()=>setPage('Expenses')}>View all →</button></div><ExpenseTable items={expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)} categories={categories} onEdit={openExpense} onDelete={id=>setExpenses(es=>es.filter(e=>e.id!==id))}/></section></>}
      {page==='Expenses'&&<section className="panel"><div className="panel-head"><div><h2>Expense tracker</h2><p>Add, edit and organize every expense.</p></div><div className="buttonrow"><button className="outline" onClick={exportCSV}><Download size={15}/> CSV</button><button className="outline" onClick={exportPDF}><Download size={15}/> PDF</button><button className="primary" onClick={()=>openExpense()}><Plus size={16}/> Add new</button></div></div><div className="filters"><div className="searchbox"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></div><ExpenseTable items={filtered} categories={categories} onEdit={openExpense} onDelete={id=>setExpenses(es=>es.filter(e=>e.id!==id))}/><div className="table-foot">{filtered.length} entries <span>Total shown: {money(filtered.reduce((s,e)=>s+Number(e.amount),0))}</span></div></section>}
      {page==='Categories'&&<><section className="panel"><div className="panel-head"><div><h2>Your categories</h2><p>Customize the labels that make sense to you.</p></div></div><form className="category-add" onSubmit={addCategory}><input required placeholder="New category name" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})}/><input aria-label="Category color" type="color" value={catForm.color} onChange={e=>setCatForm({...catForm,color:e.target.value})}/><button className="primary"><Plus size={16}/> Add category</button></form><div className="category-grid">{categories.map(c=><div className="category-card" key={c.name}><div className="category-dot" style={{background:c.color}}/><div className="category-info"><b>{c.name}</b><small>{expenses.filter(e=>e.category===c.name).length} expenses · {money(expenses.filter(e=>e.category===c.name).reduce((s,e)=>s+Number(e.amount),0))}</small></div><button className="iconbtn" onClick={()=>renameCategory(c.name)} title="Rename"><Pencil size={15}/></button><button className="iconbtn danger" onClick={()=>removeCategory(c.name)} title="Remove"><Trash2 size={15}/></button></div>)}</div></section><p className="hint">Tip: renaming a category also updates the expenses linked to it.</p></>}
      {page==='Analytics'&&<><div className="stats"><div className="stat-card"><span className="muted">Total spent</span><strong>{money(total)}</strong><small>All time</small></div><div className="stat-card"><span className="muted">Monthly average</span><strong>{money(monthTotal)}</strong><small>Current month</small></div><div className="stat-card"><span className="muted">Top category</span><strong className="topcat">{categoryData.sort((a,b)=>b.value-a.value)[0]?.name||'—'}</strong><small>By total amount</small></div></div><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Monthly trend</h2><p>Animated spending bars</p></div><span className="tag">6 months</span></div><div className="chart tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark?'#292941':'#edf0f5'}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Bar dataKey="amount" fill="#a78bfa" radius={[8,8,0,0]} animationDuration={1800}/></BarChart></ResponsiveContainer></div></section><section className="panel"><div className="panel-head"><div><h2>Category analysis</h2><p>Spending distribution</p></div></div><div className="chart tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{left:8}}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={dark?'#292941':'#edf0f5'}/><XAxis type="number" hide/><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={75}/><Tooltip contentStyle={tooltipStyle} formatter={v=>money(v)}/><Bar dataKey="value" radius={[0,7,7,0]} animationDuration={1600}>{categoryData.map((c,i)=><Cell key={i} fill={c.color}/>)}</Bar></BarChart></ResponsiveContainer></div></section></div><section className="panel"><h2>Smart little insight 💡</h2><p className="insight">{categoryData.length?`${categoryData.sort((a,b)=>b.value-a.value)[0].name} is your highest-spending category at ${money(categoryData.sort((a,b)=>b.value-a.value)[0].value)}. Review your entries regularly to understand your habits—no judgment, just clarity!`:'Add a few expenses to unlock your spending insights.'}</p></section></>}
      {page==='Settings'&&<section className="panel settings"><div className="panel-head"><div><h2>Personalize your space</h2><p>Make ExpenseFlow feel like yours.</p></div></div><div className="settingrow"><div><b>Appearance</b><small>Choose your workspace theme</small></div><button className="outline" onClick={()=>setDark(!dark)}>{dark?<Sun size={16}/>:<Moon size={16}/>} {dark?'Dark mode':'Light mode'}</button></div><div className="settingrow"><div><b>Greeting style</b><small>How should ExpenseFlow say hello?</small></div><select value={style} onChange={e=>setStyle(e.target.value)}><option>Bestie</option><option>Professional</option><option>Minimal</option></select></div><div className="settingrow"><div><b>Export your data</b><small>Download your expenses anytime</small></div><div className="buttonrow"><button className="outline" onClick={exportCSV}>CSV</button><button className="outline" onClick={exportPDF}>PDF</button></div></div><div className="settingrow"><div><b>Reset demo data</b><small>Restore sample expenses and categories</small></div><button className="outline" onClick={()=>{if(confirm('Restore demo data?')){setExpenses(starterExpenses);setCategories(starterCategories)}}}>Reset</button></div></section>}
      <footer>Made with 💜 for mindful money moments <span>ExpenseFlow · v1.0</span></footer>
    </div></main>
    {modal?.type==='expense'&&<div className="overlay" onClick={()=>setModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><h2>{modal.item?'Edit expense':'Add an expense'}</h2><p>Every little detail counts.</p></div><button className="iconbtn" onClick={()=>setModal(null)}><X size={18}/></button></div><form onSubmit={saveExpense} className="expense-form"><label>Expense title<input required autoFocus placeholder="e.g. Lunch with friends" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Amount (₹)<input required type="number" min="1" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label>Date<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label className="full">Note (optional)<input placeholder="Add a small note..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><div className="modalactions"><button type="button" className="outline" onClick={()=>setModal(null)}>Cancel</button><button className="primary"><Plus size={16}/>{modal.item?'Save changes':'Add expense'}</button></div></form></div></div>}
  </div>;
}
function ExpenseTable({items,categories,onEdit,onDelete}){
  return <div className="tablewrap"><table><thead><tr><th>Expense</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{items.map(e=><tr key={e.id}><td><div className="expense-name"><span className="tiny-icon" style={{background:(categories.find(c=>c.name===e.category)?.color||'#aaa')+'22',color:categories.find(c=>c.name===e.category)?.color||'#aaa'}}>{e.title?.slice(0,1).toUpperCase()}</span><div><b>{e.title}</b>{e.note&&<small>{e.note}</small>}</div></div></td><td><span className="category-pill"><i style={{background:categories.find(c=>c.name===e.category)?.color||'#aaa'}}/>{e.category}</span></td><td className="date">{e.date}</td><td className="amount">− {money(Number(e.amount))}</td><td><div className="actions"><button className="iconbtn" title="Edit" onClick={()=>onEdit(e)}><Pencil size={14}/></button><button className="iconbtn danger" title="Delete" onClick={()=>{if(confirm('Delete this expense?'))onDelete(e.id)}}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>{items.length===0&&<div className="empty">No expenses found. Add one to get started ✨</div>}</div>;
}
export default App;