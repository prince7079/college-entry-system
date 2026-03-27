import streamlit as st
import streamlit.components.v1 as components
import subprocess
import requests
from pathlib import Path

ROOT = Path.cwd()
BACKEND_DIR = ROOT / 'backend'
FRONTEND_DIR = ROOT / 'frontend'
BACKEND_LOG = ROOT / 'backend.log'
FRONTEND_LOG = ROOT / 'frontend.log'

st.set_page_config(page_title='College Entry System Launcher', layout='wide')

st.title('College Entry System — Streamlit Launcher')

if 'backend_proc' not in st.session_state:
    st.session_state.backend_proc = None
if 'frontend_proc' not in st.session_state:
    st.session_state.frontend_proc = None

col1, col2 = st.columns([1,1])

with col1:
    st.header('Backend (API)')
    if st.button('Start Backend'):
        if st.session_state.backend_proc is None:
            logf = open(str(BACKEND_LOG), 'ab')
            proc = subprocess.Popen(['npm','start'], cwd=str(BACKEND_DIR), stdout=logf, stderr=logf)
            st.session_state.backend_proc = proc
            st.success('Backend started')
        else:
            st.info('Backend already running')

    if st.button('Stop Backend'):
        proc = st.session_state.backend_proc
        if proc:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
            st.session_state.backend_proc = None
            st.success('Backend stopped')
        else:
            st.info('Backend not running')

    st.markdown('**Health check**')
    try:
        r = requests.get('http://localhost:5001/api/health', timeout=1)
        st.write('Backend:', r.json())
    except Exception:
        st.write('Backend: not reachable')

    st.markdown('**Backend log (tail)**')
    if BACKEND_LOG.exists():
        txt = BACKEND_LOG.read_text(errors='ignore').splitlines()[-200:]
        st.code('\n'.join(txt))
    else:
        st.write('No backend log yet.')

with col2:
    st.header('Frontend (Next.js)')
    if st.button('Start Frontend'):
        if st.session_state.frontend_proc is None:
            logf = open(str(FRONTEND_LOG), 'ab')
            proc = subprocess.Popen(['npm','run','dev'], cwd=str(FRONTEND_DIR), stdout=logf, stderr=logf)
            st.session_state.frontend_proc = proc
            st.success('Frontend started')
        else:
            st.info('Frontend already running')

    if st.button('Stop Frontend'):
        proc = st.session_state.frontend_proc
        if proc:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
            st.session_state.frontend_proc = None
            st.success('Frontend stopped')
        else:
            st.info('Frontend not running')

    st.markdown('Open frontend in new tab: [http://localhost:3000](http://localhost:3000)')
    st.markdown('**Frontend log (tail)**')
    if FRONTEND_LOG.exists():
        txt = FRONTEND_LOG.read_text(errors='ignore').splitlines()[-200:]
        st.code('\n'.join(txt))
    else:
        st.write('No frontend log yet.')

st.markdown('---')
st.header('Embedded Frontend')
st.write('If the frontend is running, it will appear below. Use the buttons above to start/stop services.')
components.iframe('http://localhost:3000', height=700)
