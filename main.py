"""FastAPI preview of the same static HTML deployed to GitHub Pages."""
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
app = FastAPI(title='Kobong', docs_url=None, redoc_url=None, openapi_url=None)
app.mount('/assets', StaticFiles(directory=ROOT / 'assets'), name='assets')


@app.get('/')
@app.get('/index.html', include_in_schema=False)
def index():
    return FileResponse(ROOT / 'index.html', headers={'Cache-Control': 'no-cache'})


@app.get('/health')
def health():
    return {'status': 'ok'}
