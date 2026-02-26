// Minimal JS: sample data, render featured, search/filters, details modal, countdown
(function(){
  const sample = [
    {
      id:1,
      name:'Fulbright Program',
      country:'USA',
      degree:'Masters/PhD',
      funding:'Fully Funded',
      deadline:'2026-04-15T23:59:59Z',
      description:'Prestigious exchange programme for study and research.',
      noIelts:false,
      type:'Government',
      whoFunds:'U.S. Government / Fulbright Commission',
      purpose:'Cultural and academic exchange for graduate study and research.',
      eligibility:{nationality:'Most countries',cgpa:'3.0/4.0',english:'Required'},
      requiredDocuments:['Passport','Transcripts','CV','Motivation Letter','Recommendation Letter'],
      benefits:{tuition:true,stipend:true,accommodation:false,air:true,insurance:false},
      applyLink:'https://foreign.fulbrightonline.org/'
    },
    {
      id:2,
      name:'Chevening Scholarships',
      country:'UK',
      degree:'Masters',
      funding:'Fully Funded',
      deadline:'2026-03-28T23:59:59Z',
      description:'UK government scholarship for future leaders.',
      noIelts:false,
      type:'Government',
      whoFunds:'UK Foreign & Commonwealth Office',
      purpose:'Develop global leaders with one-year master’s in the UK.',
      eligibility:{nationality:'Eligible countries only',cgpa:'Strong academic record',english:'Required'},
      requiredDocuments:['Passport','Transcripts','CV','Personal Statement','References'],
      benefits:{tuition:true,stipend:true,accommodation:false,air:false,insurance:false},
      applyLink:'https://www.chevening.org/'
    },
    {
      id:3,
      name:'China Scholarship Council',
      country:'China',
      degree:'Masters/PhD',
      funding:'Fully Funded',
      deadline:'2026-05-30T23:59:59Z',
      description:'Chinese government scholarship for international students.',
      noIelts:true,
      type:'Government',
      whoFunds:'China Scholarship Council',
      purpose:'Attract international talent to Chinese universities.',
      eligibility:{nationality:'Most countries',cgpa:'Good academic record',english:'Varies'},
      requiredDocuments:['Passport','Transcripts','CV','Study Plan','Recommendation Letters'],
      benefits:{tuition:true,stipend:true,accommodation:true,air:false,insurance:false},
      applyLink:'http://www.csc.edu.cn/'
    }
  ];

  const $featured = document.getElementById('featuredList');
  const $closing = document.getElementById('closingSoon');
  const $searchForm = document.getElementById('searchForm');

  function timeDiffParts(iso){
    const now = new Date();
    const then = new Date(iso);
    let diff = Math.max(0, then - now);
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days * (1000*60*60*24);
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours * (1000*60*60);
    const minutes = Math.floor(diff / (1000*60));
    diff -= minutes * (1000*60);
    const seconds = Math.floor(diff / 1000);
    return {days,hours,minutes,seconds};
  }

  function formatCountdown(iso){
    const p = timeDiffParts(iso);
    return `${p.days}d ${String(p.hours).padStart(2,'0')}:${String(p.minutes).padStart(2,'0')}:${String(p.seconds).padStart(2,'0')}`;
  }

  function renderCards(list){
    $featured.innerHTML = '';
    list.forEach(s=>{
      const card = document.createElement('article');
      card.className = 'sch-card';
      card.innerHTML = `
        <h3>${s.name}</h3>
        <p class="meta">${s.country} • ${s.degree} • ${s.funding} • Deadline: ${s.deadline.slice(0,10)}</p>
        <p class="desc">${s.description}</p>
        <div class="sch-actions">
          <button class="btn view" data-id="${s.id}">View Details</button>
          <div class="meta countdown" data-deadline="${s.deadline}">${formatCountdown(s.deadline)}</div>
        </div>
      `;
      $featured.appendChild(card);
    });
  }

  function renderClosingSoon(list){
    const soon = list.filter(s=>timeDiffParts(s.deadline).days <= 30).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5);
    $closing.innerHTML = soon.map(s=>`<li>${s.name} — ${s.country} — ${formatCountdown(s.deadline)}</li>`).join('') || '<li>No urgent deadlines</li>';
  }

  function applyFiltersAndSearch(){
    const country = document.getElementById('qCountry').value.trim().toLowerCase();
    const degree = document.getElementById('qDegree').value;
    const subject = document.getElementById('qSubject').value.trim().toLowerCase();
    const full = document.getElementById('filterFull').checked;
    const noIelts = document.getElementById('filterNoIELTS').checked;
    const deadlineSoon = document.getElementById('filterDeadlineSoon').checked;
    const gov = document.getElementById('filterGov').checked;

    let out = sample.filter(s=>{
      if(country && !s.country.toLowerCase().includes(country)) return false;
      if(degree && !s.degree.toLowerCase().includes(degree.toLowerCase())) return false;
      if(subject && !(s.name.toLowerCase().includes(subject) || (s.description||'').toLowerCase().includes(subject))) return false;
      if(full && s.funding.toLowerCase().indexOf('fully')===-1) return false;
      if(noIelts && !s.noIelts) return false;
      if(deadlineSoon && timeDiffParts(s.deadline).days > 30) return false;
      if(gov && s.type.toLowerCase() !== 'government') return false;
      return true;
    });

    renderCards(out);
    renderClosingSoon(out.length?out:sample);
  }

  // details modal
  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalBody');
  let modalOpenId = null;

  document.addEventListener('click', e=>{
    if(e.target.matches('.btn.view') && e.target.hasAttribute('data-id')){
      const id = Number(e.target.getAttribute('data-id'));
      const s = sample.find(x=>x.id===id);
      if(!s) return;
      showDetails(s);
    }
    // allow Official website button inside modal
    if(e.target.matches('#modalBody a.apply') ){
      // default follows link
    }
  });

  function showDetails(s){
    modalOpenId = s.id;
    modal.setAttribute('aria-hidden','false');
    modalBody.innerHTML = `
      <h2>${s.name}</h2>
      <p class="meta">${s.country} • ${s.degree} • ${s.funding}</p>
      <h4>Overview</h4>
      <p><strong>Who funds it:</strong> ${s.whoFunds}</p>
      <p><strong>Purpose:</strong> ${s.purpose}</p>
      <p>${s.description}</p>
      <h4>Benefits</h4>
      <ul>
        <li>Tuition covered: ${s.benefits.tuition? 'Yes':'No'}</li>
        <li>Monthly stipend: ${s.benefits.stipend? 'Yes':'No'}</li>
        <li>Accommodation: ${s.benefits.accommodation? 'Yes':'No'}</li>
        <li>Air ticket: ${s.benefits.air? 'Yes':'No'}</li>
        <li>Health insurance: ${s.benefits.insurance? 'Yes':'No'}</li>
      </ul>
      <h4>Eligibility</h4>
      <ul>
        <li>Nationality: ${s.eligibility.nationality}</li>
        <li>CGPA: ${s.eligibility.cgpa}</li>
        <li>English: ${s.eligibility.english}</li>
      </ul>
      <h4>Required Documents</h4>
      <ul>
        ${s.requiredDocuments.map(d=>`<li>${d}</li>`).join('')}
      </ul>
      <h4>Application Deadline</h4>
      <div id="modalCountdown" data-deadline="${s.deadline}">${formatCountdown(s.deadline)}</div>
      <h4>Application Process</h4>
      <ol>
        <li>Prepare documents listed above.</li>
        <li>Visit the official website and complete the online form.</li>
        <li>Submit before the deadline.</li>
      </ol>
      <p><a class="apply btn view" href="${s.applyLink}" target="_blank" rel="noopener">Apply on official website</a></p>
    `;
  }

  document.getElementById('closeModal').addEventListener('click', ()=>{
    modal.setAttribute('aria-hidden','true');
    modalOpenId = null;
  });

  // live countdown updater
  function updateCountdowns(){
    document.querySelectorAll('.countdown').forEach(el=>{
      const dl = el.getAttribute('data-deadline');
      el.textContent = formatCountdown(dl);
    });
    const mc = document.getElementById('modalCountdown');
    if(mc && modal.getAttribute('aria-hidden') === 'false'){
      const dl = mc.getAttribute('data-deadline');
      mc.textContent = formatCountdown(dl);
    }
    // update closing soon list too
    renderClosingSoon(sample);
  }

  // bind search & filters
  $searchForm.addEventListener('submit', function(e){e.preventDefault(); applyFiltersAndSearch();});
  ['filterFull','filterNoIELTS','filterDeadlineSoon','filterGov'].forEach(id=>{
    document.getElementById(id).addEventListener('change', applyFiltersAndSearch);
  });

  // initial render
  renderCards(sample);
  renderClosingSoon(sample);

  // start interval
  setInterval(updateCountdowns, 1000);
})();
