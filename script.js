(() => {
  "use strict";

  const missions = [
    {title:"The Unnoticed Frame",description:"Photograph something you have never noticed on a familiar route. It could be a tiny architectural detail, a strange shadow, or a colour hiding in plain sight.",time:10,cost:0,difficulty:"Gentle",category:"Observe",xp:25,energy:["Low","Medium","High"],moods:["Bored","Curious","Chill","Creative"]},
    {title:"The New Door",description:"Find a public place you have never entered before. Step inside, stay for a few minutes, and notice the first three things that make it feel different.",time:30,cost:0,difficulty:"Gentle",category:"Explore",xp:50,energy:["Medium","High"],moods:["Curious","Adventurous","Chill"]},
    {title:"A Taste of Elsewhere",description:"Try a food you have never tried before. Ask the person serving it what makes it special, then eat the first bite without looking at your phone.",time:30,cost:50,difficulty:"Easy",category:"Taste",xp:55,energy:["Medium","High"],moods:["Curious","Adventurous","Social"]},
    {title:"The Five-Minute Portrait",description:"Ask someone a harmless, interesting question: “What is one small thing that made today better?” Listen to the whole answer. No fixing, no advice.",time:10,cost:0,difficulty:"Brave",category:"Connect",xp:45,energy:["Medium","High"],moods:["Social","Adventurous"]},
    {title:"Older Than You",description:"Find something older than you within walking distance. It might be a tree, a building, a shop sign, or an object. Discover one fact about its life.",time:30,cost:0,difficulty:"Easy",category:"Explore",xp:45,energy:["Low","Medium","High"],moods:["Curious","Adventurous","Chill"]},
    {title:"The Unwalked Street",description:"Take the next street you have never walked down. Go until you find a detail that makes you stop. Let that detail decide when you turn back.",time:60,cost:0,difficulty:"Wild",category:"Wander",xp:80,energy:["High"],moods:["Adventurous","Bored","Curious"]},
    {title:"Three Lines, Right Now",description:"Sit somewhere with a view and write a three-line poem inspired by what is moving, growing, or changing around you. Keep the first line you write.",time:30,cost:0,difficulty:"Quiet",category:"Create",xp:55,energy:["Low","Medium"],moods:["Creative","Chill","Curious"]},
    {title:"The Fictional History",description:"Find an unusual object in a public place. Invent its fictional history in five sentences: who owned it, what it survived, and why it is here now.",time:30,cost:0,difficulty:"Playful",category:"Create",xp:60,energy:["Low","Medium","High"],moods:["Creative","Bored","Curious"]},
    {title:"The Five Detail Study",description:"Observe one location for five uninterrupted minutes. Record five details you would have missed if you had kept moving. Notice sound as much as sight.",time:10,cost:0,difficulty:"Still",category:"Observe",xp:30,energy:["Low","Medium"],moods:["Chill","Curious","Bored"]},
    {title:"The Long Way Home",description:"Choose a landmark you can see and walk toward it without taking your usual route. Spend a little on something small only if the detour earns it.",time:120,cost:100,difficulty:"Epic",category:"Wander",xp:110,energy:["High"],moods:["Adventurous","Curious"]},
    {title:"Local Lore",description:"Visit a public place you have never explored and ask one person what they would show a friend visiting for the first time.",time:60,cost:50,difficulty:"Brave",category:"Connect",xp:85,energy:["Medium","High"],moods:["Social","Adventurous","Curious"]},
    {title:"The Colour Hunt",description:"Pick a colour before you leave. Find seven different versions of it in the world around you, from the obvious to the almost invisible.",time:10,cost:0,difficulty:"Gentle",category:"Observe",xp:25,energy:["Low","Medium","High"],moods:["Creative","Chill","Bored"]}
  ];
  const defaults = {mood:"Curious",time:"30 min",budget:"Free / ₹0",energy:"Medium"};
  const budgetMax = {"Free / ₹0":0,"₹50":50,"₹100":100,"₹500+":500};
  const timeMax = {"10 min":10,"30 min":30,"1 hour":60,"2+ hours":180};
  const discoveryChoices = [
    ["beautiful","Something beautiful"],["unusual","Something unusual"],["nostalgic","Something nostalgic"],
    ["unexpected","Something unexpected"],["interesting","Someone/something interesting"],
    ["noticed","A place I had never noticed"],["further","Something I want to explore further"]
  ];
  const echoTemplates = {
    beautiful:[
      ["Follow the Light","Find another beautiful detail nearby. Photograph it or describe the colours, textures, and shapes that made you stop.","Observe","25"],
      ["A Small Gallery","Find three colours or textures in your surroundings that echo what caught your attention. Arrange them into a tiny visual story.","Create","45"]
    ],
    unusual:[
      ["Follow the Echo","Find another nearby object that looks like it has a story. Notice three details before you invent anything.","Observe","35"],
      ["The Detail Detective","Look closer at the unusual thing. Find a mark, material, or clue that most people would miss.","Explore","45"]
    ],
    nostalgic:[
      ["The Memory Landmark","Find a public place, sound, or smell that reminds you of another time. Write down the memory it brings back.","Reflect","35"],
      ["A Story Kept Here","Ask yourself what this place might remember. Write a three-line story from its point of view.","Create","50"]
    ],
    unexpected:[
      ["The Second Surprise","Take a safe, public detour from where you are. Find one more thing you did not expect to see.","Wander","45"],
      ["Curiosity, Continued","Follow the most interesting clue from your discovery for ten minutes, staying in familiar public spaces.","Explore","50"]
    ],
    interesting:[
      ["The Quiet Connection","Notice someone or something interesting from a respectful distance. What detail makes it worth remembering?","Observe","35"],
      ["One Good Question","Write one harmless question your discovery made you curious about, then find an answer through your surroundings.","Connect","45"]
    ],
    noticed:[
      ["The Doorway Between","Explore one more public corner you usually pass. Look for the detail that turns a shortcut into a place.","Explore","45"],
      ["Map the Overlooked","Stand still at the place you noticed and record five things that become visible when you stop rushing.","Observe","35"]
    ],
    further:[
      ["The Next Thread","Return to the detail that caught your attention and follow one safe, visible clue it suggests.","Explore","45"],
      ["Make It Yours","Create a tiny response to the discovery: a sketch, title, poem, or photograph with a caption.","Create","45"]
    ]
  };
  const comfortAlternatives = {Create:["Observe","Connect","Explore"],Connect:["Observe","Create","Reflect"],Explore:["Create","Observe","Reflect"],Observe:["Connect","Create","Wander"],Wander:["Observe","Create","Reflect"],Taste:["Observe","Create","Explore"],Reflect:["Explore","Create","Observe"]};
  let state = {constraints:{...defaults}, pending:null, active:null, memories:[], chain:[]};
  let timerId = null;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  function safeLoad() {
    try {
      const saved = JSON.parse(localStorage.getItem("serendipity-state"));
      if (saved) {
        const savedConstraints = {...saved.constraints};
        if (savedConstraints.budget === "₹0") savedConstraints.budget = "Free / ₹0";
        state = {...state, ...saved, constraints:{...defaults,...savedConstraints}, memories:Array.isArray(saved.memories)?saved.memories:[], chain:Array.isArray(saved.chain)?saved.chain:[]};
        save();
      }
    } catch (_) { showToast("Your local memories are still safe for this session."); }
  }
  function save() {
    try { localStorage.setItem("serendipity-state", JSON.stringify(state)); }
    catch (_) { showToast("Storage is unavailable, so this session will not persist."); }
  }
  function optionMarkup(el) {
    const options = el.getAttribute("options").split("|");
    const group=el.getAttribute("name");
    el.outerHTML = `<div class="constraint-group"><label>${el.getAttribute("label")}</label><div class="option-row">${options.map(v => `<button class="option${v===state.constraints[group]?" selected":""}" data-group="${group}" data-value="${v}" type="button">${v}</button>`).join("")}</div></div>`;
  }
  function setupConstraints() {
    $$("constraint-group").forEach(optionMarkup);
    $$(".option").forEach(btn => btn.addEventListener("click", () => {
      const group = btn.dataset.group;
      $$('.option[data-group="' + group + '"]').forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected"); state.constraints[group] = btn.dataset.value; save();
      updatePatternMessage();
    }));
  }
  function navigate(view) {
    $$(".view").forEach(el => el.classList.toggle("active-view", el.id === view));
    $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.nav === view));
    if (view === "memories") renderMemories();
    if (view === "profile") renderProfile();
    if (view === "active") renderActive();
    if (view === "discover" && state.pending) renderMission();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function filteredMissions() {
    const c = state.constraints;
    let list = missions.filter(m => m.time <= timeMax[c.time] && m.cost <= budgetMax[c.budget] && m.energy.includes(c.energy) && m.moods.includes(c.mood));
    if (!list.length) list = missions.filter(m => m.time <= timeMax[c.time] && m.cost <= budgetMax[c.budget]);
    return list.length ? list : missions;
  }
  function categoryCounts() {
    return state.memories.reduce((counts,m) => { counts[m.category]=(counts[m.category]||0)+1; return counts; }, {});
  }
  function pickMission(preferredCategory, echoType) {
    const list = filteredMissions();
    const counts = categoryCounts();
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
    const comfort = top && top[1] >= 3 ? top[0] : null;
    const echoCandidates = echoType ? buildEchoCandidates(echoType, preferredCategory) : [];
    if (echoCandidates.length) return echoCandidates[Math.floor(Math.random()*echoCandidates.length)];
    let candidates = list;
    if (preferredCategory) {
      const preferred = list.filter(m => m.category === preferredCategory);
      if (preferred.length) candidates = preferred;
    }
    if (comfort) {
      const alternatives = comfortAlternatives[comfort] || [];
      const unfamiliar = candidates.filter(m => alternatives.includes(m.category));
      if (unfamiliar.length) candidates = unfamiliar;
      else candidates = candidates.filter(m => m.category !== comfort);
    }
    return (candidates.length ? candidates : list)[Math.floor(Math.random() * (candidates.length ? candidates : list).length)];
  }
  function buildEchoCandidates(type, previousCategory) {
    const templates = echoTemplates[type] || [];
    return templates.map((template, index) => {
      const [title, description, category, xp] = template;
      const time = index === 0 ? 10 : 30;
      const mission = {title,description,time,cost:0,difficulty:"Echo",category,xp:Number(xp),energy:["Low","Medium","High"],moods:["Bored","Curious","Adventurous","Social","Creative","Chill"],echo:true,previousCategory};
      return mission;
    }).filter(m => m.time <= timeMax[state.constraints.time] && m.cost <= budgetMax[state.constraints.budget] && m.energy.includes(state.constraints.energy));
  }
  function updatePatternMessage() {
    const box = $("#patternMessage");
    const counts = categoryCounts();
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
    if (top && top[1] >= 3) { box.hidden=false; box.innerHTML=`<span class="comfort-label">COMFORT ZONE DETECTED</span><strong>You’ve been exploring ${top[0].toLowerCase()} missions a lot.</strong><span>Let’s gently change the pattern.</span><button type="button" data-break-pattern>LET’S BREAK THE PATTERN →</button>`; $('[data-break-pattern]',box).addEventListener("click",()=>{state.pending=pickMission();renderMission();navigate("discover");}); }
    else { box.hidden=true; }
  }
  function stat(label,value){return `<div><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`}
  function missionHTML(m) {
    const echoNote=m.echo?`<div class="echo-context">✳ This mission follows the thread of your last discovery.</div>`:"";
    return `<article class="mission-card"><div class="mission-meta"><span class="tag">${m.category}</span><span class="tag">${m.difficulty}</span>${m.echo?'<span class="tag echo-tag">ECHO</span>':""}</div><h3>${m.title}</h3><p class="mission-desc">${m.description}</p>${echoNote}<div class="mission-stats">${stat("Estimated time",m.time>=60?`${m.time/60} hr${m.time>60?"s":""}`:`${m.time} min`)}${stat("Estimated cost",m.cost===0?"Free":`₹${m.cost}`)}${stat("Reward",`+${m.xp} XP`)}</div><div class="actions"><button class="button" data-action="accept">ACCEPT MISSION</button><button class="button secondary" data-action="roll">ROLL AGAIN</button></div></article>`;
  }
  function generate() { state.pending=pickMission(); save(); renderMission(); navigate("discover"); }
  function renderMission() {
    const box=$("#missionReveal"); if (!state.pending) {box.hidden=true;return;} box.hidden=false; box.innerHTML=missionHTML(state.pending);
    $('[data-action="accept"]',box).addEventListener("click", acceptMission);
    $('[data-action="roll"]',box).addEventListener("click", generate);
  }
  function acceptMission() { state.active={...state.pending,startedAt:Date.now(),elapsed:0}; state.pending=null; save(); updateNavDot(); renderActive(); navigate("active"); showToast("Mission accepted. Go find your unexpected."); }
  function formatTime(seconds) { const m=Math.floor(seconds/60), s=seconds%60; return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; }
  function renderActive() {
    const box=$("#activeMissionContainer");
    if (!state.active) {box.innerHTML='<div class="empty-state"><strong>No active mission.</strong>Your next detour is waiting in Discover.</div>';return;}
    const m=state.active; box.innerHTML=`<article class="active-card"><div><div class="eyebrow">MISSION IN MOTION · ${m.category}</div><h3>${m.title}</h3><p class="instruction">${m.description}</p><div class="progress"><span></span></div><button class="button" data-action="complete">COMPLETE MISSION</button> <button class="button secondary" data-action="abandon">ABANDON</button></div><div class="timer"><div class="timer-value" id="timerValue">${formatTime(m.elapsed||0)}</div><small>time in the wild</small></div></article>`;
    $('[data-action="complete"]',box).addEventListener("click", completeMission);
    $('[data-action="abandon"]',box).addEventListener("click", () => {state.active=null;save();updateNavDot();renderActive();showToast("Mission released. No guilt, just another route.");});
    clearInterval(timerId); timerId=setInterval(()=>{if(state.active){state.active.elapsed=Math.floor((Date.now()-state.active.startedAt)/1000);const t=$("#timerValue");if(t)t.textContent=formatTime(state.active.elapsed);}},1000);
  }
  function renderDiscoveryStep() {
    const box=$("#activeMissionContainer");
    box.innerHTML=`<div class="discovery-step"><div class="eyebrow">SERENDIPITY ECHO · A MOMENT TO KEEP</div><h3>What did you <em>discover?</em></h3><p>Choose the feeling that stayed with you. It will shape your next mission.</p><div class="discovery-choices">${discoveryChoices.map(([value,label])=>`<button type="button" class="discovery-choice" data-discovery="${value}">${label}</button>`).join("")}</div><label class="echo-label" for="echoText">WHAT CAUGHT YOUR ATTENTION?</label><textarea id="echoText" rows="2" maxlength="180" placeholder="An old painted sign..."></textarea><label class="echo-label" for="echoSpent">MONEY SPENT <span>(optional)</span></label><input id="echoSpent" type="number" min="0" step="1" value="${state.active.cost||0}"><div class="actions"><button class="button" data-action="submit-echo" disabled>FOLLOW THE ECHO →</button><button class="button secondary" data-action="cancel-echo">NOT YET</button></div></div>`;
    $$(".discovery-choice",box).forEach(btn=>btn.addEventListener("click",()=>{$$(".discovery-choice",box).forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");$('[data-action="submit-echo"]',box).disabled=false;}));
    $('[data-action="submit-echo"]',box).addEventListener("click",submitEcho);
    $('[data-action="cancel-echo"]',box).addEventListener("click",()=>renderActive());
  }
  function completeMission() { renderDiscoveryStep(); }
  function submitEcho() {
    const m=state.active, selected=$(".discovery-choice.selected"), type=selected?.dataset.discovery;
    if (!type) return;
    const text=$("#echoText").value.trim() || "A quiet discovery.";
    const chainId=m.chainId || `chain-${Date.now()}`;
    const step=(state.memories.filter(memory=>memory.chainId===chainId).length)+1;
    const memory={...m,date:new Date().toISOString(),note:text,discoveryText:text,discoveryType:type,photo:"",spent:Number($("#echoSpent").value)||0,timeSpent:Math.max(1,Math.round((m.elapsed||0)/60)),chainId,chainStep:step};
    state.memories.unshift(memory); state.chain.push(memory);
    state.active=null; updateNavDot(); renderActive(); renderMemories(); renderProfile(); updatePatternMessage(); showToast("Echo saved. Your next detour will follow the thread.");
    state.pending=pickMission(m.category,type); state.pending.chainId=chainId; state.pending.chainStep=step+1; save(); renderMission(); navigate("discover");
  }
  function renderMemories() {
    renderChain();
    const box=$("#memoriesContainer"); if (!state.memories.length) {box.innerHTML='<div class="empty-state"><strong>Your jar is waiting.</strong>Complete a mission and leave a little evidence behind.</div>';return;}
    box.innerHTML=`<div class="memories-grid">${state.memories.map((m,i)=>`<article class="memory-card"><div class="memory-top"><span class="tag">${m.category}</span><button class="delete-memory" data-index="${i}" aria-label="Delete memory">×</button></div><h3>${m.title}</h3><p class="memory-note">“${escapeHTML(m.note)}”</p><div class="memory-footer"><span>${new Date(m.date).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</span><span><b>+${m.xp} XP</b></span><span>${m.timeSpent} min · ₹${m.spent}</span></div></article>`).join("")}</div>`;
    $$(".delete-memory",box).forEach(btn=>btn.addEventListener("click",()=>{state.memories.splice(Number(btn.dataset.index),1);save();renderMemories();renderProfile();updatePatternMessage();showToast("Memory removed.");}));
  }
  function renderChain() {
    const box=$("#chainContainer");
    if (!box) return;
    const grouped = {};
    state.memories.filter(m=>m.chainId).forEach(m=>(grouped[m.chainId] ||= []).push(m));
    const chains=Object.entries(grouped);
    if (!chains.length) { box.innerHTML=""; return; }
    box.innerHTML=chains.map(([id,items],index)=>`<details class="chain-story" ${index===0?"open":""}><summary><span><span class="eyebrow">SERENDIPITY ECHO #${String(chains.length-index).padStart(2,"0")}</span><strong>${items.length} mission${items.length>1?"s":""} · ${items.length===1?"1 discovery":`${items.length} discoveries`} · ${items.reduce((n,m)=>n+(m.timeSpent||0),0)} min · +${items.reduce((n,m)=>n+m.xp,0)} XP</strong></span><span class="chain-toggle">VIEW STORY</span></summary><div class="chain-track">${items.slice().sort((a,b)=>(a.chainStep||0)-(b.chainStep||0)).map((m,i)=>`<div class="chain-node"><span class="chain-index">0${m.chainStep||i+1}</span><strong>${m.title}</strong><small>🔎 ${escapeHTML(m.discoveryText||m.note)}</small></div>${i<items.length-1?'<span class="chain-arrow">↓</span>':""}`).join("")}</div></details>`).join("");
  }
  function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
  function renderProfile() {
    const counts={}; state.memories.forEach(m=>counts[m.category]=(counts[m.category]||0)+1);
    const total=state.memories.length, xp=state.memories.reduce((n,m)=>n+m.xp,0), mins=state.memories.reduce((n,m)=>n+(m.timeSpent||0),0);
    const archetype=total===0?"The Curious":(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"Explore");
    const names={Observe:"The Observer",Explore:"The Explorer",Connect:"The Connector",Create:"The Creator",Wander:"The Adventurer",Taste:"The Chaos Agent",Reflect:"The Observer"};
    const labels=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    $("#profileContainer").innerHTML=`<div class="profile-grid"><div class="profile-hero"><div class="eyebrow">PLAYFUL PROFILE · NOT A TEST</div><h3>${names[archetype]||"The Curious"}</h3><p>Your way of finding wonder, so far.</p></div><div class="profile-stats">${[["Discoveries",total],["Missions",total],["Time outside",mins?`${mins} min`:"0 min"],["Current XP",xp]].map(x=>`<div class="profile-stat"><span class="num">${x[1]}</span><span class="label">${x[0]}</span></div>`).join("")}</div><div class="category-block"><div class="eyebrow">YOUR CURIOSITY MAP</div><div class="category-bars">${labels.length?labels.map(([name,n])=>`<div class="bar-line"><span>${name}</span><div class="bar"><span style="width:${Math.max(12,n/total*100)}%"></span></div><span>${n}</span></div>`).join(""):"<p>No patterns yet. That’s the point.</p>"}</div></div></div>`;
  }
  function updateNavDot(){$$(".nav-dot").forEach(d=>d.hidden=!state.active);}
  let toastTimer; function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),3500);}
  function seedDemo() {
    if (state.memories.length) return;
    state.memories=[
      {title:"The Five Detail Study",category:"Observe",xp:30,date:"2026-09-12T10:30:00",note:"A dog waiting patiently for a bus that never came.",spent:0,timeSpent:10},
      {title:"The Unwalked Street",category:"Wander",xp:80,date:"2026-09-08T17:00:00",note:"Found a tiny blue door behind a wall of bougainvillea.",spent:0,timeSpent:42},
      {title:"Three Lines, Right Now",category:"Create",xp:55,date:"2026-09-03T08:00:00",note:"The morning kept its promise / in the steam above chai / and one open window.",spent:50,timeSpent:28}
    ]; save();
  }
  function init() {
    safeLoad(); seedDemo(); setupConstraints(); updatePatternMessage(); updateNavDot(); renderProfile(); renderMemories(); renderActive();
    $$(".nav-item,[data-nav]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.nav)));
    $("#surpriseButton").addEventListener("click",generate);
  }
  init();
})();
