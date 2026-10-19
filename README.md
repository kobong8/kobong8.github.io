# Kobong · 자료 허브

DevOps 강의와 SAIF 2026 정리로 연결하는 메인 페이지입니다. 짧은 소개, 주요 자료 카드, 템플릿 저장소 링크, 최근 작업 기록, 만든 사람 소개를 포함합니다.

자료 서재는 **강의 자료 / 학회·포럼 정리**로 분류합니다. 간결한 카드 목록에 제목·설명·태그 검색, 분류·주제 필터, 최근 등록순·업데이트순·제목순 정렬을 제공합니다. 검색은 이 메인 페이지의 자료 소개를 대상으로 하며 각 사이트 내부 슬라이드 본문까지 검색하지는 않습니다.

기존 사이트를 수정하거나 합치지 않고 공개 사이트로 연결합니다. 개인정보와 확인되지 않은 경력·소속·연락처는 넣지 않았습니다. 소개 문구는 실제 프로젝트 주제를 바탕으로 작성한 초안이며 `content/site.json`에서 바꿀 수 있습니다.

## 로컬 실행

Python 3.10 이상에서:

```powershell
cd kobong
.\scripts\install.ps1
.\scripts\start.ps1
```

`http://127.0.0.1:8001`에 접속합니다. DevOps 기본 포트 8000과 분리했습니다. 포트 변경은 `.\scripts\start.ps1 -Port 8002`입니다. 설치는 처음 한 번, 이후 실행은 start만 사용합니다. Node/npm은 필요하지 않습니다.

스크립트 없이 실행하려면:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe build.py
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

## 편집

| 파일 | 역할 |
| --- | --- |
| `content/site.json` | 소개 문구, 자료 설명·주소, 최근 기록, GitHub 링크 |
| `templates/index.html` | 페이지 구조 원본 |
| `assets/style.css` | 색상·타이포그래피·카드·모바일 레이아웃 |
| `assets/library.mjs`, `library-core.mjs` | 서재 검색·필터·정렬과 URL 상태 복원 |
| `build.py` | Python 기본 라이브러리로 정적 HTML 생성 |
| `index.html` | 생성된 배포 파일. 직접 수정하지 않음 |
| `main.py` | FastAPI 로컬 미리보기 |

원고나 구조를 수정한 뒤 `python build.py`를 실행하고 브라우저를 새로고침하세요. `start.ps1`도 시작 시 빌드합니다. 실행 중 JSON 편집은 자동 빌드되지 않습니다. CSS는 빌드 없이 새로고침으로 확인합니다.

### 새 자료 추가

`content/site.json`의 `resources` 배열에 기존 항목을 복사해 아래 정보를 입력합니다. 카드 수·분류 버튼·주제 선택지는 자동 생성되므로 HTML을 수정할 필요가 없습니다.

- `id`: 고유한 영문 소문자·숫자·하이픈 식별자
- `type`: 자료 분류, `topics`: 큰 주제 목록(예: `["DevOps"]`, `["AI"]`)
- `title`, `description`, `tags`: 제목·짧은 설명·검색 태그
- `addedAt`: 서재에 등록한 날짜(`YYYY-MM-DD`)
- `updatedAt`: 실제 자료 업데이트 날짜. 확인되지 않았다면 `null` 유지
- `action`, `url`: 버튼 문구·자료 주소
- `theme`: `blue`, `teal`, `violet` 중 카드 색상

카드에는 확인된 업데이트 날짜가 있으면 업데이트 날짜를, 없으면 등록 날짜를 표시합니다. 업데이트순 정렬도 날짜가 없는 항목은 등록 날짜를 사용합니다. 현재 2개 자료의 등록일은 기존 허브 작성일인 2026-10-18이며 원본 사이트의 업데이트 날짜를 추정하지 않았습니다.

검색어·분류·주제·정렬은 URL 쿼리에 반영되어 새로고침과 링크 공유 후에도 유지됩니다. 별도 검색 API나 검색 이력 저장 기능 없이 필터링은 브라우저 안에서 수행합니다. 기본 목록은 모든 자료를 표시하고 접기·페이지 나누기로 감추지 않습니다. 초기화하면 모든 조건이 해제됩니다.

최근 기록은 GitHub에서 자동 수집하지 않습니다. 실제 작업 기준으로 날짜와 내용을 수동 관리합니다. 현재 기록은 로컬에서 진행한 작업이며 각 링크의 공개 사이트가 같은 시점에 배포됐다는 의미는 아닙니다.

자료 링크는 현재 저장소 remote와 README를 기준으로 설정했습니다. 외부 사이트의 실제 배포 상태는 별도로 확인해야 합니다.

## GitHub Pages

자료 본문과 링크는 정적 HTML에 모두 포함됩니다. JavaScript가 꺼져 있어도 전체 목록을 읽고 이동할 수 있고, JavaScript가 켜지면 검색·필터·정렬이 추가됩니다. FastAPI API 호출은 없으며 `index.html`, `assets/`, `.nojekyll`을 배포하면 됩니다.

- 계정의 대표 주소를 원하면 저장소 이름을 `kobong8.github.io`로 정하고 루트에 파일을 올리는 구성을 사용할 수 있습니다.
- `kobong`이라는 프로젝트 저장소에 올리면 프로젝트 Pages 주소에서 사용할 수 있습니다.
- 실제 저장소 생성·원격 연결·Pages 설정·커밋·푸시는 이번 작업에서 진행하지 않았습니다.

배포 전 `python build.py --check`로 원고와 생성 HTML의 일치를 확인합니다. 전체 저장소 루트를 공개하면 원고 JSON·Python·문서도 함께 공개될 수 있습니다.

## 검사

```powershell
python build.py --check
python -m unittest discover -s tests
node --test tests/library.test.mjs  # 선택적 개발 검사; 실행/배포에는 Node 불필요
```

[검증 기록](docs/verification.md)을 참고하세요.
