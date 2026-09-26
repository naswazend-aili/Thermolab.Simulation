/* ==========================================================================
   Navigation, Toast, Modal, and UI Interactions
   ========================================================================== */

/* ROUTING SYSTEM */
function goTo(pageId){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if(target){
    target.classList.add('active');
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + pageId);
    if(navBtn) navBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(typeof SFX !== 'undefined') SFX.click();

    // Trigger page-specific updates
    if(pageId === 'progress' && typeof updateProgressDashboard === 'function') updateProgressDashboard();
    if(pageId === 'laporan' && typeof generateLabReport === 'function') generateLabReport();
    if(pageId === 'quiz' && typeof renderQuizTopic === 'function') renderQuizTopic(activeQuizTopic || 0);
  }
}

function scrollToElement(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({ behavior: 'smooth' });
}

/* TOAST NOTIFICATION */
function showToast(msg, type = 'info'){
  const container = document.getElementById('toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = (type === 'error' ? '⚠️ ' : (type === 'success' ? '✅ ' : 'ℹ️ ')) + msg;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3200);
}

/* INPUT VALIDATOR HELPER */
function validateNumericInput(val, min, max, label){
  if(isNaN(val)) return `Masukkan angka yang valid untuk ${label}.`;
  if(val < min) return `${label} tidak boleh kurang dari ${min}.`;
  if(val > max) return `${label} tidak boleh lebih dari ${max}.`;
  return null;
}

/* MODAL WINDOWS */
function openModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.add('open');
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.remove('open');
}

/* MOBILE DRAWER */
function closeDrawer(){
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if(drawer) drawer.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
}

/* THEME TOGGLE */
function toggleTheme(){
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('thermolab_theme', next); } catch(e){}
}
