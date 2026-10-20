// ALL DATA BELOW IS FICTIONAL SAMPLE DATA. Language statuses are illustrative only.
window.STATUS=['Translation Needed','Translation Started','Portions','New Testament','Complete Bible'];
window.STATUS_CLS={'Complete Bible':'cb','New Testament':'nt','Portions':'po','Translation Started':'ts','Translation Needed':'tn'};
const S={n:'Translation Needed',s:'Translation Started',p:'Portions',t:'New Testament',c:'Complete Bible'};
const L=(a)=>a.map(([n,s,pop,note])=>({name:n,status:S[s],people:pop,note:note||''}));
window.COUNTRY_LANGS={
'Mongolia':{region:'East Asia',fbi:true,people:3400000,langs:L([['Khalkha Mongolian','c',2800000,'Mongolian Bible, first draft presented March 2025'],['Buryat','p',45000,'Selections of Gospels'],['Oirat (Kalmyk-Oirat)','t',205000],['Kazakh (Mongolia)','t',100000],['Tuvan','p',4500],['Dukha (Tsaatan)','s',600,'Pilot team formed'],['Evenki','n',1000],['Dariganga','n',40000]])},
'India':{region:'South Asia',langs:L([['Hindi','c',528000000],['Bhili','t',10400000],['Santali','c',7600000],['Gondi','p',2900000],['Korku','s',700000],['Kurukh','t',2000000],['Toto','n',1600],['Great Andamanese','n',50],['Warli','p',630000],['Tulu','p',1800000]])},
'China':{region:'East Asia',langs:L([['Mandarin','c',920000000],['Yi (Nuosu)','t',2000000],['Lisu','c',950000],['Salar','n',140000],['Yugur (Western)','n',4600],['Monguor','s',160000],['Dongxiang','n',620000],['Tibetan (Amdo)','t',1800000]])},
'United States of America':{region:'North America',langs:L([['English','c',240000000],['Navajo','t',170000],['Lakota','t',29000],['Hopi','p',6800],['Cherokee','c',2100],['Yupik (Central)','p',16000],['Gullah','t',200000],['Chinook Jargon','n',100]])},
'Brazil':{region:'South America',langs:L([['Portuguese','c',200000000],['Kaingang','t',37000],['Tikuna','t',34000],['Yanomami','p',22000],['Kayapó','p',10000],['Pirahã','t',800],['Karajá','t',3700],['Tupi (Old)','n',200],['Xavante','p',20000]])},
'Nigeria':{region:'Africa',langs:L([['Hausa','c',55000000],['Yoruba','c',45000000],['Igbo','c',40000000],['Fulfulde','t',18000000],['Kanuri','c',4300000],['Birom','t',600000],['Tiv','c',4000000],['Jukun','p',200000],['Bura','p',250000],['Gwandara','n',100000]])},
'Ethiopia':{region:'Africa',langs:L([['Amharic','c',32000000],['Oromo','c',35000000],['Tigrinya','c',9000000],['Somali','c',6000000],['Gamo','t',1100000],['Hamer','p',50000],['Mursi','s',10000],['Kunama','t',100000]])},
'Indonesia':{region:'Southeast Asia',langs:L([['Indonesian','c',200000000],['Javanese','c',82000000],['Sundanese','c',34000000],['Madurese','t',13000000],['Minangkabau','p',6000000],['Dani (Lower Grand Valley)','c',200000],['Bajau','s',200000],['Tobelo','p',20000],['Asmat','t',60000],['Mentawai','n',60000]])},
'Pakistan':{region:'South Asia',langs:L([['Urdu','c',100000000],['Punjabi','c',76000000],['Pashto','c',26000000],['Sindhi','c',25000000],['Balochi','p',7000000],['Brahui','p',2000000],['Shina','t',700000],['Kalasha','s',4000],['Burushaski','p',100000]])},
'Afghanistan':{region:'Central Asia',langs:L([['Dari','c',12000000],['Pashto','c',14000000],['Uzbek (Southern)','c',3000000],['Turkmen','t',900000],['Nuristani (Kati)','n',20000],['Pashayi','n',500000],['Wakhi','p',10000],['Brahui','n',200000]])},
'Russia':{region:'Europe & Central Asia',langs:L([['Russian','c',140000000],['Tatar','c',5200000],['Chechen','p',1400000],['Sakha (Yakut)','c',450000],['Tuvan','p',280000],['Nenets','t',22000],['Chukchi','p',5000],['Evenki','p',4000],['Ket','n',100]])},
'Egypt':{region:'Middle East & N. Africa',langs:L([['Egyptian Arabic','c',70000000],['Sa\'idi Arabic','t',20000000],['Nubian (Nobiin)','n',500000],['Siwi','n',20000],['Bedawi','p',1500000]])},
'Iran':{region:'Middle East & N. Africa',langs:L([['Persian','c',55000000],['Azerbaijani (South)','c',17000000],['Kurdish (Sorani)','c',4000000],['Luri','p',4000000],['Balochi','p',2000000],['Gilaki','t',3000000],['Mazanderani','p',3000000],['Qashqai','t',900000]])},
'Turkey':{region:'Middle East & N. Africa',langs:L([['Turkish','c',72000000],['Kurmanji Kurdish','c',15000000],['Zazaki','t',2000000],['Laz','p',150000],['Circassian (Kabardian)','p',100000],['Homshetsi','n',50000]])},
'Mexico':{region:'North America',langs:L([['Spanish','c',120000000],['Nahuatl (Huasteca)','t',1100000],['Yucatec Maya','c',800000],['Mixtec (Western)','t',100000],['Zapotec (Isthmus)','t',85000],['Otomi (Mezquital)','t',300000],['Huichol','t',20000],['Seri','t',900],['Tarahumara','t',70000],['Lacandon','p',1000]])},
'Papua New Guinea':{region:'Oceania',langs:L([['Tok Pisin','c',4000000],['Hiri Motu','c',120000],['Enga','c',230000],['Huli','c',150000],['Kuman','t',100000],['Kewa','t',100000],['Dani (Lower Grand)','p',3000],['Wiru','t',30000],['Hamtai','p',45000],['Kombai','s',4000],['Korafe','n',3000]])},
'Philippines':{region:'Southeast Asia',langs:L([['Tagalog','c',28000000],['Cebuano','c',21000000],['Ilocano','c',8000000],['Tausug','t',1000000],['Maranao','t',1100000],['Aeta (Mag-indi)','p',2500],['Ata Manobo','s',16000],['Sama (Abaknon)','n',30000]])},
'Viet Nam':{region:'Southeast Asia',langs:L([['Vietnamese','c',76000000],['Hmong Daw','c',800000],['Jarai','c',350000],['Bahnar','t',200000],['Cham (Eastern)','p',100000],['Rục','n',500],['Brau','n',500]])},
'Thailand':{region:'Southeast Asia',langs:L([['Thai','c',20000000],['Northern Thai','t',6000000],['Isan','p',22000000],['Karen (S\'gaw)','c',700000],['Akha','c',100000],['Mlabri','n',400],['Moken','n',3000],['Lahu','c',100000]])},
'Myanmar':{region:'Southeast Asia',langs:L([['Burmese','c',33000000],['Shan','c',3200000],['Karen (S\'gaw)','c',2000000],['Chin (Hakha)','c',200000],['Kachin','c',900000],['Rohingya','p',1700000],['Wa','t',500000],['Naga (Konyak)','p',100000]])},
'Kazakhstan':{region:'Europe & Central Asia',langs:L([['Kazakh','t',10000000],['Russian','c',4000000],['Uyghur','p',250000],['Dungan','n',50000],['Karakalpak','n',2000],['Uzbek','c',500000]])},
'Mali':{region:'Africa',langs:L([['Bambara','c',4000000],['Fulfulde (Maasina)','c',1200000],['Songhay (Koyra Chiini)','t',200000],['Tamasheq','t',500000],['Dogon (Toro So)','s',100000],['Soninke','p',1100000],['Bozo','n',200000]])},
'Democratic Republic of the Congo':{region:'Africa',langs:L([['Lingala','c',20000000],['Swahili (Congo)','c',20000000],['Tshiluba','c',6000000],['Kikongo','c',7000000],['Mbuti (Kibira)','n',20000],['Lele','p',100000],['Mangbetu','t',700000],['Efe','n',10000]])},
'Saudi Arabia':{region:'Middle East & N. Africa',langs:L([['Najdi Arabic','c',10000000],['Hejazi Arabic','c',6000000],['Gulf Arabic','p',1500000],['Mehri','n',20000],['Baharna Arabic','n',600000]])},
'Canada':{region:'North America',langs:L([['English','c',20000000],['French','c',8000000],['Cree (Plains)','c',34000],['Ojibwe','t',20000],['Inuktitut','c',34000],['Dene Suline','p',9000],['Haida','n',20],['Heiltsuk','n',200]])},
'Australia':{region:'Oceania',langs:L([['English','c',24000000],['Kriol','t',20000],['Warlpiri','p',2500],['Pitjantjatjara','c',3000],['Yolŋu Matha','t',5000],['Tiwi','p',1500],['Arrernte','p',4000],['Murrinh-patha','s',2000]])},
'Colombia':{region:'South America',langs:L([['Spanish','c',45000000],['Wayuu','t',270000],['Nasa Yuwe','t',100000],['Embera Chamí','t',60000],['Tikuna','t',5000],['Arhuaco','p',15000],['Kogi','s',10000],['Nukak','n',500]])},
'Peru':{region:'South America',langs:L([['Spanish','c',27000000],['Quechua (Cusco)','c',1500000],['Aymara','c',450000],['Shipibo-Konibo','t',30000],['Awajún','t',55000],['Matsigenka','t',12000],['Yine','t',3000],['Nanti','s',400]])},
'Kenya':{region:'Africa',langs:L([['Swahili','c',22000000],['Kikuyu','c',8000000],['Luo','c',4000000],['Kalenjin (Nandi)','c',700000],['Maasai','c',1000000],['Turkana','c',1000000],['Rendille','t',60000],['El Molo','p',700],['Sengwer','n',50000],['Sakuye','p',20000]])},
'Tanzania':{region:'Africa',langs:L([['Swahili','c',45000000],['Sukuma','c',9000000],['Hadza','s',1000],['Maasai','c',500000],['Sandawe','t',60000],['Datooga','p',230000],['Iraqw','t',500000],['Ngasa','n',2000]])},
'Bangladesh':{region:'South Asia',langs:L([['Bengali','c',160000000],['Chittagonian','p',13000000],['Chakma','t',300000],['Marma','t',200000],['Garo','c',200000],['Santali','c',200000],['Bawm','c',20000],['Rohingya','p',500000],['Sylheti','t',10000000]])},
'Nepal':{region:'South Asia',langs:L([['Nepali','c',16000000],['Maithili','t',3000000],['Bhojpuri','p',1500000],['Tamang','t',1400000],['Newar','c',900000],['Sherpa','t',100000],['Raute','n',700],['Chepang','t',50000]])},
'Iraq':{region:'Middle East & N. Africa',langs:L([['Iraqi Arabic','c',16000000],['Kurdish (Sorani)','c',4000000],['Turkmen (Iraqi)','t',200000],['Assyrian Neo-Aramaic','c',200000],['Shabaki','n',250000],['Mandaic','n',20000],['Yazidi Kurmanji','p',500000]])}
};
// Fallback generated sample for countries without hand-written data
window.FALLBACK_POOL=['Northern Tribal Tongue','Highland Trade Language','River Valley Language','Coastal Fishing Language','Desert Nomad Language','Mountain Village Language','Forest Edge Language','Island Language','Plateau Language','Border Minority Language'];
window.REGION_BY_LAT=function(cx,cy){return cy<130?'North':cy<260?'Middle':'South'};
// Fictional churches
const first=['Daniel','Ruth','Joel','Anne','Peter','Caleb','Eli','Naomi','Gideon','Lydia','Owen','Tobias','Miriam','Isaac','Carl','Esther','Levi','Hannah','Samuel','Priscilla','Mark','Judith','Aaron','Rebecca','Nathan','Abigail','Silas','Martha','Elias','Deborah'];
const last=['Whitfield','Ellis','Ramsey','Whitaker','Lindgren','Morrow','Brandt','Foster','Hale','Marsh','Parrish','Keller','Doyle','Penn','Dunmore','Cole','Garrison','Reed','Alvarez','Bell','Monroe','Dunn','Holloway','Sutter','Ashby','Pruitt','Kessler','Lang','Harlan','Tate'];
const cn=['Grace Harbor Baptist Church','Riverbend Chapel','Oak Meadow Baptist','Lakeview Gospel Church','Stonebridge Fellowship','Pine Hollow Baptist','Hillcrest Community Church','Willow Creek Bible Church','Fairhaven Baptist','Sunrise Valley Church','Harvest Field Chapel','Bethel Springs Church','Redwood Lane Baptist','Northgate Fellowship','Meadowbrook Church','Compass Road Chapel','Harbor Light Baptist','Cedar Valley Bible Church','Trinity Hill Church','Old Mill Chapel','Maple Ridge Baptist','Cornerstone Fellowship','Pleasant Grove Church','Mount Zion Baptist','Living Waters Chapel','Faith Haven Church','Open Door Baptist','Crossroads Bible Church','Shepherd\'s Rest Chapel','Heritage Baptist','Calvary Springs Church','Lighthouse Gospel Church','Eagle Rock Fellowship','Silver Creek Baptist','Valley View Church','Bridgewater Chapel','Good News Baptist','Rolling Hills Church','Emmaus Road Fellowship','Mission Hill Baptist','Prairie Wind Church','Spring Garden Chapel','Westbrook Baptist','Ebenezer Bible Church','Windmill Hill Church','Clearwater Fellowship','Hope Springs Baptist','Granite Peak Church','Orchard Lane Chapel','Beacon Point Baptist','Fieldstone Church','Gospel Light Chapel','Brookside Baptist','Covenant Pines Church','Sparrow Hill Fellowship','Lantern Hill Baptist','Juniper Creek Church','Anchor Point Chapel','Thornfield Baptist','New Hope Meadows Church'];
const cities=[['Springfield Heights','OH'],['Fairhaven','OH'],['Brookfield','TN'],['Lakemont','GA'],['Pinecrest','NC'],['Millbrook','PA'],['Oakdale','IN'],['Riverton','KY'],['Cedar Falls Junction','IA'],['Harmon','TX'],['Westfield Park','MI'],['Ashford','VA'],['Northvale','MO'],['Elmwood','AL'],['Stonewall Bend','AR']];
const den=['Baptist','Independent Baptist','Bible Church','Non-Denominational','Fundamental Baptist'];
const stages=['New','Emailed','Replied','Called','Interested','Praying','Giving','Not Now','Do Not Contact'];
window.STAGES=stages;
function rnd(seed){let s=seed;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296}}
window.seedData=function(){
 const r=rnd(42);const ch=[];
 const w=[14,14,8,7,6,4,2,3,2];
 cn.forEach((name,i)=>{
  const fn=first[(i*7)%first.length],ln=last[(i*11+3)%last.length];const c=cities[i%cities.length];
  const slug=name.toLowerCase().replace(/[^a-z]/g,'').slice(0,14);
  let k=r()*w.reduce((a,b)=>a+b),st=0;for(;st<w.length-1&&k>w[st];st++)k-=w[st];
  const tier=i<12?'A':i<38?'B':'C';
  const rec={id:'c'+(i+1),name,city:c[0],state:c[1],tier,denom:den[i%den.length],pastor:tier==='C'?'':'Pastor '+fn+' '+ln,pastorFirst:tier==='C'?'':fn,
   email:(tier==='C'?'office':fn.toLowerCase())+'@'+slug+'.example',phone:'(555) 010-0'+String(100+((i*13)%100)).slice(0,3).padStart(3,'0').replace(/^1/,'1'),
   stage:i===0?'Interested':stages[st],missions:i%5===0?'Missions Committee Chair: '+first[(i+3)%30]+' '+last[(i+9)%30]:'',nextStep:'',nextDue:'',dnc:false,adopted:[],timeline:[]};
  rec.phone='(555) 010-'+String(100+((i*7)%100)).padStart(4,'0').slice(-4);
  if(rec.stage==='Do Not Contact')rec.dnc=true;
  const d=(n)=>new Date(Date.now()-n*864e5).toISOString();
  if(rec.stage!=='New'){rec.timeline.push({t:d(8+i%5),type:'email',title:'Email sent: Introduction from Dr. Keen',detail:'Delivered (simulated)'});}
  if(['Replied','Called','Interested','Praying','Giving'].includes(rec.stage))rec.timeline.push({t:d(6),type:'email',title:'Reply received: "Please call me next week"',detail:'Logged automatically (example)'});
  if(['Called','Interested','Praying','Giving'].includes(rec.stage))rec.timeline.push({t:d(3),type:'call',title:'Call: Interested',detail:'Outcome: Interested · 6:12'});
  if(i%6===0)rec.timeline.push({t:d(2),type:'note',title:'Note: Missions committee meets first Tuesday. Send update before.',detail:''});
  rec.timeline.sort((a,b)=>b.t.localeCompare(a.t));
  ch.push(rec);
 });
 ch[0].adopted=[{country:'Mongolia',lang:'Khalkha Mongolian',status:'Complete Bible',commit:'Pray',date:new Date(Date.now()-7*864e5).toISOString()},{country:'Mongolia',lang:'Buryat',status:'Portions',commit:'Pray',date:new Date(Date.now()-7*864e5).toISOString()}];
 ch[0].name='Grace Harbor Baptist Church';ch[0].pastor='Pastor Daniel Whitfield';ch[0].pastorFirst='Daniel';ch[0].email='daniel@graceharbor.example';ch[0].phone='(555) 010-0142';ch[0].missions='Missions Committee Chair: Ruth Ellis';
 ch[0].timeline.push({t:new Date(Date.now()-3*864e5).toISOString(),type:'note',title:'Note: Missions committee meets first Tuesday. Send update before.',detail:''});
 const dnc=['Redwood Lane Baptist','Bethel Springs Church','Old Mill Chapel'];
 ch.forEach(c=>{if(dnc.includes(c.name)){c.stage='Do Not Contact';c.dnc=true}});
 return {
  churches:ch,
  adoptions:[{church:'Grace Harbor Baptist Church',churchId:'c1',country:'Mongolia',lang:'Khalkha Mongolian',commit:'Pray',date:new Date(Date.now()-7*864e5).toISOString()},{church:'Grace Harbor Baptist Church',churchId:'c1',country:'Mongolia',lang:'Buryat',commit:'Pray',date:new Date(Date.now()-7*864e5).toISOString()},{church:'Hillcrest Community Church',churchId:'c7',country:'Mongolia',lang:'Dukha (Tsaatan)',commit:'Give',date:new Date(Date.now()-5*864e5).toISOString()},{church:'Oak Meadow Baptist',churchId:'c3',country:'Mongolia',lang:'Evenki',commit:'Pray',date:new Date(Date.now()-4*864e5).toISOString()}],
  settings:{sentToday:62,dailyLimit:75,hardCap:150,twoFA:{keen:true,rachel:true,thomas:false,priscilla:true},requireTwoFA:false,autoOptOut:true,optOutFooter:true,pauseSending:false,warmup:true},
  users:[{id:'keen',name:'Dr. Charles Keen',role:'Super Admin',active:'Today'},{id:'rachel',name:'Rachel Monroe',role:'Church Admin',active:'Yesterday'},{id:'thomas',name:'Thomas Bell',role:'Staff',active:'Oct 12'},{id:'priscilla',name:'Priscilla Dunn',role:'Volunteer',active:'Oct 10'}],
  dns:{spf:true,dkim:true,dmarc:true},
  dncList:[{name:'Redwood Lane Baptist',reason:'Asked to be removed',added:'Oct 13'},{name:'Bethel Springs Church',reason:'Unsubscribed',added:'Oct 11'},{name:'Old Mill Chapel',reason:'Church closed',added:'Oct 8'}],
  audit:[{t:'2:31 PM',who:'Rachel Monroe',what:'Logged call: Grace Harbor Baptist'},{t:'1:58 PM',who:'Dr. Charles Keen',what:'Changed daily limit 60 to 75'},{t:'11:12 AM',who:'Dr. Charles Keen',what:'Imported churches_batch_07.csv'},{t:'9:40 AM',who:'Thomas Bell',what:'Signed in (no 2FA)'}],
  templates:[{id:'t1',name:'Introduction from Dr. Keen',subject:'A short note from Dr. Keen, {Pastor First Name}',body:'Dear {Pastor Name},\n\nMy name is Charles Keen. I am writing to you as a fellow servant of Christ at {Church Name} in {City}. For over twenty years FirstBible International has labored to put the Scriptures in the heart language of Bibleless peoples, beginning with the Mongolian Bible.\n\nWould your church pray with us for these peoples? May I send you a short update?\n\nIn Christ,\nCharles Keen'},
   {id:'t2',name:'Follow-Up After Call',subject:'Thank you, {Pastor First Name}',body:'Dear {Pastor Name},\n\nThank you for talking with me. It was a joy to hear how {Church Name} in {City} already prays for the nations. As I mentioned, the Mongolian Bible needs your prayers. {Adopted Language}\n\nIn Christ,\nCharles Keen'},
   {id:'t3',name:'Day 10 Follow-Up',subject:'Following up, {Pastor First Name}',body:'Dear {Pastor Name},\n\nI wanted to follow up on my note to {Church Name}. Could I have ten minutes by phone this week?\n\nIn Christ,\nCharles Keen'}],
  sentToday:62
 };
};
