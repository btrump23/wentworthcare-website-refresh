/* Wentworth Care — Concept v4 interactions (temporary concept, not live) */
(function(){
  var d=document, root=d.documentElement, reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var chrome=d.querySelector('.chrome');
  function chromeH(){return chrome?chrome.getBoundingClientRect().height:0}
  function setChromeVar(){root.style.setProperty('--chrome',Math.round(chromeH())+'px')}
  setChromeVar(); window.addEventListener('resize',setChromeVar);
  requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('loaded')})});

  /* scroll progress + shrink header */
  var bar=d.querySelector('.progress');
  function onScroll(){
    var h=d.documentElement.scrollHeight-innerHeight; bar.style.setProperty('--p',h>0?(scrollY/h):0);
    d.body.classList.toggle('is-scrolled',scrollY>40);
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* reveals */
  var rv=d.querySelectorAll('.rv,.wipe');
  if('IntersectionObserver' in window && !reduce.matches){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});

  /* counters */
  var cs=d.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window && !reduce.matches){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);
      var el=e.target,to=+el.dataset.count,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'',t0=null;
      function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1400),v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=pre+v+suf;if(k<1)requestAnimationFrame(step)}
      requestAnimationFrame(step);})},{threshold:.6});
    cs.forEach(function(c){co.observe(c)});
  }

  /* manifesto word highlight */
  var mt=d.querySelector('[data-words]');
  if(mt){
    mt.innerHTML=mt.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
    var ws=mt.querySelectorAll('.w');
    function lightWords(){var r=mt.getBoundingClientRect(),vh=innerHeight;var k=(vh*.85-r.top)/(r.height+vh*.35);k=Math.max(0,Math.min(1,k));var n=Math.round(k*ws.length);ws.forEach(function(w,i){w.classList.toggle('on',i<n)})}
    if(!reduce.matches){addEventListener('scroll',lightWords,{passive:true});lightWords()}
  }

  /* parallax */
  var px=[].slice.call(d.querySelectorAll('[data-parallax]'));
  function parallax(){if(reduce.matches)return;px.forEach(function(el){var r=el.parentElement.getBoundingClientRect();var c=r.top+r.height/2-innerHeight/2;el.style.translate='0 '+(-c*parseFloat(el.dataset.parallax)).toFixed(1)+'px'})}
  addEventListener('scroll',parallax,{passive:true}); parallax();

  /* pinned horizontal rooms */
  var rooms=d.querySelector('.rooms'),track=d.querySelector('.rooms-track');
  var mqPin=window.matchMedia('(min-width:981px)');
  function pinSetup(){
    var on=mqPin.matches&&!reduce.matches;
    root.classList.toggle('pin-on',on);
    track.style.transform='';
    if(!on){rooms.style.removeProperty('--pinH');return}
    var dist=track.scrollWidth-innerWidth+40;
    rooms.style.setProperty('--pinH',(innerHeight+Math.max(0,dist))+'px');
    pinMove();
  }
  function pinMove(){
    if(!root.classList.contains('pin-on'))return;
    var r=rooms.getBoundingClientRect(),total=rooms.offsetHeight-innerHeight;
    var k=Math.max(0,Math.min(1,-r.top/Math.max(1,total)));
    var dist=track.scrollWidth-innerWidth+40;
    track.style.transform='translate3d('+(-k*Math.max(0,dist))+'px,0,0)';
  }
  addEventListener('scroll',pinMove,{passive:true});
  addEventListener('resize',pinSetup); addEventListener('load',pinSetup); pinSetup();

  /* mega menu */
  var dd=d.querySelector('.dd'),ddb=dd.querySelector('.dd-top'),closeT;
  function mega(open){dd.classList.toggle('open',open);ddb.setAttribute('aria-expanded',open)}
  ddb.addEventListener('click',function(){mega(!dd.classList.contains('open'))});
  dd.addEventListener('mouseenter',function(){if(matchMedia('(hover:hover)').matches){clearTimeout(closeT);mega(true)}});
  dd.addEventListener('mouseleave',function(){closeT=setTimeout(function(){mega(false)},180)});
  dd.addEventListener('focusout',function(){setTimeout(function(){if(!dd.contains(d.activeElement))mega(false)},0)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){mega(false);closeIndex()}});
  d.addEventListener('click',function(e){if(!dd.contains(e.target))mega(false)});

  /* index overlay */
  var ix=d.getElementById('index'),ib=d.querySelector('.index-btn'),peek=ix.querySelector('.index-peek img');
  function openIndex(){ix.hidden=false;d.body.classList.add('lock');ib.setAttribute('aria-expanded','true');requestAnimationFrame(function(){requestAnimationFrame(function(){ix.classList.add('open');ix.querySelector('.index-close').focus()})})}
  function closeIndex(){if(ix.hidden)return;ix.classList.remove('open');d.body.classList.remove('lock');ib.setAttribute('aria-expanded','false');setTimeout(function(){ix.hidden=true},reduce.matches?0:650)}
  ib.addEventListener('click',openIndex);
  ix.querySelector('.index-close').addEventListener('click',function(){closeIndex();ib.focus()});
  ix.querySelectorAll('.index-list a').forEach(function(a){a.addEventListener('mouseenter',function(){peek.src=a.dataset.img});a.addEventListener('focus',function(){peek.src=a.dataset.img})});

  /* in-page anchor nav, offset by sticky chrome */
  d.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(!id||id==='#')return;
      var el=d.querySelector(id); if(!el)return;
      e.preventDefault(); mega(false);
      var inIndex=ix.contains(a); if(inIndex){ix.classList.remove('open');ix.hidden=true;d.body.classList.remove('lock');ib.setAttribute('aria-expanded','false')}
      var y=el.getBoundingClientRect().top+scrollY-chromeH()-10;
      // targets inside the pinned rooms section: jump to the section start
      window.scrollTo({top:Math.max(0,y),behavior:reduce.matches?'auto':'smooth'});
      history.replaceState(null,'',id);
    });
  });

  /* reviews */
  var rev=d.querySelector('.rev');
  if(rev){
    var qs=[].slice.call(rev.querySelectorAll('.rq')),bs=[].slice.call(rev.querySelectorAll('.rev-names button')),i=0,timer=null,DUR=6500;
    rev.style.setProperty('--dur',DUR+'ms');
    if(reduce.matches)rev.classList.add('no-auto');
    function show(n){i=(n+qs.length)%qs.length;qs.forEach(function(q,k){q.classList.toggle('is-on',k===i);q.setAttribute('aria-hidden',k===i?'false':'true')});
      bs.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');var bar=b.querySelector('i');bar.style.animation='none';void bar.offsetWidth;bar.style.animation=''})}
    function stop(){clearInterval(timer);timer=null}
    function start(){stop();if(reduce.matches||rev.classList.contains('paused'))return;timer=setInterval(function(){show(i+1)},DUR)}
    bs.forEach(function(b,k){b.addEventListener('click',function(){show(k);start()})});
    rev.addEventListener('mouseenter',function(){rev.classList.add('paused');stop()});
    rev.addEventListener('mouseleave',function(){rev.classList.remove('paused');show(i);start()});
    rev.addEventListener('focusin',function(){rev.classList.add('paused');stop()});
    rev.addEventListener('focusout',function(){if(!rev.contains(d.activeElement)){rev.classList.remove('paused');start()}});
    rev.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(i+1);bs[i].focus()}else if(e.key==='ArrowLeft'){show(i-1);bs[i].focus()}});
    d.addEventListener('visibilitychange',function(){d.hidden?stop():start()});
    show(0);start();
  }

  /* project hover peek */
  var hp=d.querySelector('.hover-peek'),hpi=hp&&hp.querySelector('img');
  if(hp&&matchMedia('(hover:hover)').matches){
    d.querySelectorAll('.proj-list li[data-img]').forEach(function(li){
      li.addEventListener('mouseenter',function(){hpi.src=li.dataset.img;hp.classList.add('on')});
      li.addEventListener('mouseleave',function(){hp.classList.remove('on')});
      li.addEventListener('mousemove',function(e){hp.style.left=(e.clientX+150)+'px';hp.style.top=e.clientY+'px'});
    });
  }

  /* enquiry form -> mailto (concept only, nothing sent from the page) */
  var f=d.getElementById('enq');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();
    var v=function(n){return (f.elements[n].value||'').trim()},err=f.querySelector('.enq-err');
    var ok=v('name')&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email'))&&v('phone').replace(/\D/g,'').length>=8;
    err.hidden=!!ok; if(!ok)return;
    var body='Name: '+v('name')+'\nEmail: '+v('email')+'\nPhone: '+v('phone')+'\nFacility / organisation: '+v('org')+'\n\n'+v('msg');
    location.href='mailto:info@wentworthcare.com.au?subject='+encodeURIComponent('Website enquiry — '+v('name'))+'&body='+encodeURIComponent(body);
  })}
})();
