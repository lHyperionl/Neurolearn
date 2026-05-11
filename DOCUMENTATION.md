# NeuroLearn – technická a používateľská dokumentácia

NeuroLearn je prototyp medicínskej vzdelávacej platformy určenej na učenie rozpoznávania mozgových diagnóz z MRI snímok. Aplikácia poskytuje tmavé používateľské rozhranie inšpirované rádiologickou pracovnou stanicou, interaktívny NIfTI viewer, študijný režim, testovací režim, správu prípadov, správu diagnóz a AI študijného asistenta.

Dokument je rozdelený na dve hlavné časti:

1. **Systémová príručka (System Manual)** – pre vývojárov a administrátorov.
2. **Používateľská príručka (User Manual)** – pre koncových používateľov, napríklad študentov a pedagógov.

---

# 1. Systémová príručka (System Manual)

## 1.1 Účel a rozsah systému

NeuroLearn slúži ako edukačná aplikácia na prezeranie, porovnávanie a testovanie znalostí pri práci s mozgovými MRI prípadmi. Systém pracuje najmä so súbormi vo formáte NIfTI (`.nii`, `.nii.gz`) a umožňuje používateľovi analyzovať prípady podľa diagnózy, prezerať MRI dáta v interaktívnom vieweri a následne si overiť znalosti v testovacom režime.

Systém obsahuje:

- webový frontend postavený na Next.js,
- backend API postavené na FastAPI,
- SQLite databázu,
- úložisko MRI prípadov,
- import participantov zo zdrojových dát,
- správu diagnóz,
- správu testov,
- AI študijný chat cez OpenRouter API.

Aplikácia je prototyp určený na vzdelávacie účely. Nie je určená na klinické rozhodovanie.

---

## 1.2 Technický stack

### Frontend

| Oblasť | Technológia |
|---|---|
| Framework | Next.js 16, App Router |
| Jazyk | TypeScript |
| UI runtime | React 19 |
| Štýlovanie | Tailwind CSS 4 |
| UI komponenty | shadcn/ui, @base-ui/react |
| MRI/NIfTI viewer | @niivue/niivue |
| Animácie | Framer Motion |
| Ikony | Lucide React, Material Symbols |
| AI klient | OpenAI SDK použitý s OpenRouter API |

### Backend

| Oblasť | Technológia |
|---|---|
| API framework | FastAPI |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy |
| Databáza | SQLite |
| MRI/NIfTI spracovanie | nibabel, NumPy |
| Upload súborov | python-multipart |
| Kontajner | Python 3.11 slim |

### Kontajnerizácia

| Komponent | Technológia |
|---|---|
| Frontend image | Node.js 20 Alpine |
| Backend image | Python 3.11 slim |
| Orchestrácia | Docker Compose |

---

## 1.3 Systémové požiadavky

### Odporúčané požiadavky pre Docker spustenie

- Docker Desktop s podporou Docker Compose.
- Webový prehliadač s podporou WebGL.
- Minimálne 8 GB RAM pre pohodlnú prácu s MRI dátami.
- Na Windows odporúčané používať WSL2 backend pre Docker.

### Odporúčané požiadavky pre lokálny vývoj bez Dockeru

- Node.js 20 alebo kompatibilná verzia.
- npm.
- Python 3.11.
- pip.
- SQLite.
- Git.

### Sieťové požiadavky

Predvolené lokálne adresy aplikácie:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

Pre AI asistenta je potrebný internetový prístup k OpenRouter API.

---

## 1.4 Základná štruktúra projektu

```text
maps/
├── app/                         # Next.js App Router stránky a API route
│   ├── api/chat/                # API route pre AI študijný chat
│   ├── dashboard/               # Úvodný dashboard
│   ├── learn/                   # Študijný režim MRI prípadov
│   ├── test/                    # Testovací režim
│   ├── add-case/                # Administrátorské pridanie MRI prípadu
│   └── add-diagnosis/           # Administrátorské pridanie diagnózy
├── backend/                     # FastAPI backend
│   ├── data/                    # MRI prípady vo formáte .nii alebo .nii.gz
│   ├── db/                      # SQLite databáza pri Docker spustení
│   ├── docs/                    # Zdrojové TSV/JSON dáta
│   ├── database.py              # Konfigurácia databázy
│   ├── import_participants.py   # Import participantov a základných diagnóz
│   ├── main.py                  # Hlavný FastAPI entrypoint
│   ├── migrate_schema.py        # Jednorazová migrácia schémy diagnóz
│   ├── migrate_diagnoses.py     # Import detailných diagnóz z JSON do DB
│   ├── models.py                # SQLAlchemy modely
│   └── requirements.txt         # Python závislosti
├── components/                  # React komponenty
│   ├── learn/                   # Komponenty pre študijný režim
│   ├── nav/                     # Navbar a Sidebar
│   ├── test/                    # Komponenty pre testovanie
│   └── ui/                      # Zdieľané UI komponenty
├── lib/                         # Utility a legacy/mock dátové typy
├── public/                      # Statické assety
├── next.config.ts               # Next.js konfigurácia, standalone output a remote image patterns
├── Dockerfile                   # Frontend Docker image
├── docker-compose.yml           # Spoločné spustenie frontendu a backendu
├── package.json                 # npm skripty a frontend závislosti
├── README.md                    # Základný popis projektu
└── DOCUMENTATION.md             # Technická a používateľská dokumentácia
```

---

## 1.5 Dôležité súbory a ich účel

| Súbor | Účel |
|---|---|
| `README.md` | Základný popis projektu, quick start, tech stack a základné príkazy. |
| `docker-compose.yml` | Definícia služieb `frontend` a `backend`, portov, volume mountov a healthchecku. |
| `Dockerfile` | Docker image pre frontend aplikáciu. |
| `backend/Dockerfile` | Docker image pre backend aplikáciu. |
| `backend/entrypoint.sh` | Spustenie importu participantov a následné spustenie Uvicorn servera. |
| `backend/main.py` | Hlavné FastAPI endpointy. |
| `backend/database.py` | Konfigurácia SQLite databázy a SQLAlchemy session. |
| `backend/models.py` | Databázové modely pre participantov, diagnózy, testy, otázky a odpovede. |
| `backend/import_participants.py` | Import participantov z TSV súboru a vytvorenie základných diagnóz. |
| `backend/requirements.txt` | Python závislosti backendu. |
| `package.json` | Frontend závislosti a npm skripty. |
| `next.config.ts` | Next.js konfigurácia so `standalone` outputom a povoleným remote patternom pre `placehold.co`. |
| `app/api/chat/route.ts` | Next.js API route pre AI študijného asistenta. |
| `components/learn/InteractiveMRIViewer.tsx` | Interaktívny NIfTI viewer pre študijný režim. |
| `components/test/MRITestViewer.tsx` | Viewer používaný v testovacom režime. |

---

## 1.6 Konfigurácia prostredia

Je potrebné vytvoriť `.env` manuálne (vzorový súbor `.env.example`).

Odporúčaný obsah `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_SITE_URL=https://neurolearn.app
OPENROUTER_SITE_NAME=NeuroLearn
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free # Replace with your desired model, e.g., "nvidia/nemotron-3-super-120b-a12b:free", but for thesting purposes use free model
```

### Popis premenných

| Premenná | Popis |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend API používaná časťou frontend stránok.|
| `OPENROUTER_API_KEY` | API kľúč pre AI študijného asistenta. |
| `OPENROUTER_MODEL` | Model použitý pre AI odpovede. |
| `OPENROUTER_SITE_URL` | Hodnota HTTP referer hlavičky pre OpenRouter.|
| `OPENROUTER_SITE_NAME` | Názov aplikácie pre OpenRouter. |


Ak `OPENROUTER_API_KEY` nie je nastavený, aplikácia sa môže spustiť, ale AI chat nebude funkčný.

---

## 1.7 Inštalácia a lokálne spustenie cez Docker

Toto je odporúčaný spôsob spustenia projektu.

### Krok 1: Klonovanie repozitára

```bash
git clone https://git.kpi.fei.tuke.sk/david.tkac/maps.git
```

### Krok 2: Vytvorenie `.env`

```bash
cp .env.example .env
```

### Krok 3: Spustenie vývojového prostredia

```bash
docker compose up -d --build
```

Tento príkaz:

- zostaví frontend image,
- zostaví backend image,
- spustí frontend na porte `3000`,
- spustí backend na porte `8000`,
- pripojí backendové priečinky `backend/data` a `backend/db` ako volume,
- spustí import participantov pri štarte backendu.

### Krok 4: Overenie backendu

Otvorte v prehliadači:

```text
http://localhost:8000/APIhealth
```

Očakávaná odpoveď:

```json
{
  "message": "API is running"
}
```

### Krok 5: Overenie frontendu

Otvorte v prehliadači:

```text
http://localhost:3000
```

Aplikácia presmeruje používateľa na dashboard.

### Krok 6: Zobrazenie logov

```bash
docker compose logs -f
```

Pre konkrétnu službu:

```bash
docker compose logs -f backend
```

```bash
docker compose logs -f frontend
```

### Krok 7: Zastavenie prostredia

```bash
docker compose down
```

---

## 1.8 Lokálne spustenie bez Dockeru

Tento postup je vhodný pre vývojárov, ktorí chcú spúšťať frontend a backend samostatne.

### Frontend

1. Nainštalujte závislosti:

```bash
npm install
```

2. Spustite vývojový server:

```bash
npm run dev
```

3. Otvorte:

```text
http://localhost:3000
```

### Backend

1. Vytvorte Python virtuálne prostredie:

```bash
python -m venv .venv
```

2. Aktivujte virtuálne prostredie na Windows:

```powershell
.venv\Scripts\Activate.ps1
```

3. Aktivujte virtuálne prostredie na Linuxe alebo macOS:

```bash
source .venv/bin/activate
```

4. Nainštalujte backend závislosti:

```bash
pip install -r backend/requirements.txt
```

5. Importujte participantov:

```bash
python -m backend.import_participants
```

Tento príkaz spúšťajte z koreňového priečinka projektu. Skript používa cestu odvodenú od vlastného umiestnenia, preto načítava súbor `backend/docs/participants.tsv`.

6. Spustite backend server z koreňového priečinka projektu:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Alternatívne pri spustení priamo z priečinka `backend`:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 1.9 Správa závislostí


### Frontend závislosti

Hlavné frontend závislosti:

- `next`,
- `react`,
- `react-dom`,
- `@niivue/niivue`,
- `framer-motion`,
- `openai`,
- `tailwindcss`,
- `shadcn`,
- `lucide-react`.

### Backend závislosti

Hlavné backend závislosti:

- `fastapi`,
- `uvicorn`,
- `SQLAlchemy`,
- `nibabel`,
- `numpy`,
- `python-multipart`.

Inštalácia backend závislostí:

```bash
pip install -r backend/requirements.txt
```

Po zmene `backend/requirements.txt` pri Docker spustení znovu zostavte backend image:

```bash
docker compose build backend
```

Po zmene `package.json` pri Docker spustení znovu zostavte frontend image:

```bash
docker compose build frontend
```

---

## 1.10 Databáza

Systém používa SQLite databázu cez SQLAlchemy.

### Umiestnenie databázy

Pri Docker spustení:

```text
/app/db/maps.db
```

Táto cesta je mapovaná na lokálny priečinok:

```text
backend/db/
```

Pri spustení mimo Dockeru:

```text
./maps.db
```

### Databázové modely

| Model | Popis |
|---|---|
| `Participant` | Pacient alebo študijný prípad s ID, vekom, pohlavím a diagnózou. |
| `Diagnosis` | Diagnostická jednotka s kódom, názvom, signatúrou, popisom a edukačnými znakmi. |
| `Test` | Uložený test. |
| `Question` | Otázka priradená k testu a participantovi. |
| `Answer` | Odpoveď na otázku s označením správnosti. |

### Inicializácia schémy

Databázová schéma sa vytvára automaticky pri štarte backendu.

### Seed dát

Backend pri Docker štarte spúšťa:

```bash
python -m import_participants
```

Manuálne spustenie importu participantov v kontajneri:

```bash
docker compose exec backend python -m import_participants
```

Import používa súbor:

```text
backend/docs/participants.tsv
```

Základné diagnózy sú vytvorené počas importu, ak ešte neexistujú. Detailnejšie diagnostické údaje sú uložené v súbore:

```text
backend/docs/diagnoses.json
```

Na ich import do databázy slúži:

```bash
docker compose exec backend python -m migrate_diagnoses
```

Ak databáza vznikla pred pridaním rozšírených diagnostických polí, najprv spustite migráciu schémy:

```bash
docker compose exec backend python -m migrate_schema
```

Potom spustite import detailných diagnóz:

```bash
docker compose exec backend python -m migrate_diagnoses
```

---

## 1.11 Správa MRI dát

MRI dáta sú uložené v priečinku:

```text
backend/data/
```

Každý prípad má vlastný podpriečinok. Názvy prípadov typicky používajú formát:

```text
sub-10159
```

Príklad štruktúry:

```text
backend/data/
├── sub-10159/
│   └── T1w.nii.gz
└── sub-[ID]/
    ├── [MRI súbor].nii
    └── [voliteľná segmentácia].nii
```

Podporované formáty:

- `.nii`,
- `.nii.gz`.

Súbory obsahujúce reťazec `seg` v názve sú aplikáciou interpretované ako segmentačný overlay. V študijnom režime sa takéto súbory nezobrazujú ako bežné obrazové sekvencie, ale používajú sa ako voliteľná segmentačná vrstva nad hlavným MRI súborom.

V Docker režime sú MRI dáta perzistentné cez volume:

```text
./backend/data:/app/data
```

To znamená, že súbory vložené do lokálneho `backend/data` sú dostupné backendu v kontajneri ako `/app/data`.

---

## 1.12 Backend API prehľad

### Health check

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/APIhealth` | Overenie, že API beží. |

### Prípady a MRI súbory

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/cases` | Zoznam dostupných prípadov v `backend/data`. |
| GET | `/cases/grouped` | Prípady zoskupené podľa diagnózy. |
| GET | `/cases/{case_id}/files` | Zoznam NIfTI súborov pre prípad. |
| GET | `/metadata/{case_id}/{filename}` | Metadáta konkrétneho NIfTI súboru. |
| POST | `/cases` | Vytvorenie nového prípadu nahraním MRI súboru a metadát. |
| GET | `/files/{case_id}/{filename}` | Streamovanie MRI súboru pre viewer. |

### Participanti

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/participants_count` | Počet participantov. |
| GET | `/participants/all` | Zoznam ID participantov. |
| GET | `/participants/{participant_id}` | Detail participanta. |
| GET | `/participants/{participant_id}/nifti` | URL NIfTI súboru participanta. |

### Diagnózy

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/diagnoses` | Zoznam diagnóz. |
| GET | `/diagnoses/{diagnosis_key}` | Detail diagnózy podľa kódu. |
| GET | `/diagnosis_info/{diagnosis_id}` | Detail diagnózy podľa interného ID. |
| POST | `/diagnoses` | Vytvorenie novej diagnózy. |

### Testy a otázky

| Metóda | Endpoint | Popis |
|---|---|---|
| GET | `/questions/generate_pids` | Vygeneruje participantov pre náhodný test. |
| GET | `/questions/generate/{participant_id}` | Vygeneruje otázku pre konkrétneho participanta. |
| POST | `/tests` | Vytvorí uložený test. |
| GET | `/tests` | Zoznam uložených testov. |
| GET | `/tests/{test_id}` | Detail uloženého testu. |
| PUT | `/tests/{test_id}` | Aktualizácia testu. |
| DELETE | `/tests/{test_id}` | Vymazanie testu. |

---

## 1.13 Frontend moduly

### Dashboard

URL:

```text
/dashboard
```

Dashboard poskytuje vstup do modulov Learn a Test. Koreňová URL `/` používateľa automaticky presmeruje na `/dashboard`.

### Learn

URL:

```text
/learn
```

Funkcie:

- výber diagnózy,
- zobrazenie prípadov podľa kategórie,
- otvorenie detailu prípadu.

Detail prípadu:

```text
/learn/{caseId}
```

Funkcie detailu:

- NIfTI viewer,
- výber MRI súboru alebo sekvencie,
- zobrazenie segmentácie, ak existuje,
- informácie o pacientovi,
- diagnostická karta,
- AI študijný asistent,
- navigácia na ďalší alebo predchádzajúci prípad.

### Test

URL:

```text
/test
```

Dostupné režimy:

- `Regular Test` – náhodne generované otázky,
- `Browse Tests` – uložené testy.

Súvisiace URL:

```text
/test/regular
/test/list
/test/create
/test/take/{testId}
/test/edit/{testId}
```

### Administrátorské stránky

```text
/add-case
/add-diagnosis
/test/create
/test/edit/{testId}
```

Tieto stránky umožňujú pridávať a upravovať obsah v aplikácii.


### Neimplementované alebo čiastočne implementované navigačné položky

Bočný panel obsahuje aj odkazy `/settings` a `/support`. V aktuálnej štruktúre projektu pre tieto cesty nie sú dostupné zodpovedajúce stránky, preto môžu viesť na štandardnú Next.js stránku nenájdeného obsahu.

---

## 1.14 AI študijný asistent

AI chat je dostupný v Learn detaile prípadu. Frontend odosiela správy na Next.js API route:

```text
/api/chat
```

Route používa OpenAI SDK s OpenRouter endpointom:

```text
https://openrouter.ai/api/v1
```

Odpoveď AI je obmedzená parametrom `max_tokens: 500`. Správy používateľa sa mapujú na rolu `user` a odpovede asistenta na rolu `assistant`.

AI prompt nastavuje asistenta ako neurorádiologického tútora, ktorý:

- pomáha študentovi opisovať MRI nálezy,
- používa kontext pacienta a diagnózy,
- podporuje diagnostické uvažovanie,

Pre funkčnosť je potrebné nastaviť `OPENROUTER_API_KEY`.

---

## 1.15 Upload nového prípadu

Nový prípad sa pridáva cez stránku:

```text
/add-case
```

Formulár vyžaduje:

- MRI súbor `.nii` alebo `.nii.gz`,
- vek,
- pohlavie,
- diagnózu.

Backend validuje:

- príponu súboru,
- NIfTI alebo gzip hlavičku,
- existenciu diagnózy,
- jedinečnosť priečinka participanta.

Backend participant_id vygeneruje automaticky.

---

## 1.16 Pridanie diagnózy

Nová diagnóza sa pridáva cez stránku:

```text
/add-diagnosis
```

Formulár obsahuje:

- kód diagnózy,
- názov,
- signatúru,
- grade,
- tagy,
- popis,
- kľúčové znaky,
- diferenciálne diagnózy.

Kód diagnózy musí byť unikátny.

---

## 1.17 Vytváranie a správa testov

Test sa vytvára cez stránku:

```text
/test/create
```

Každá otázka musí obsahovať:

- priradeného participanta,
- text otázky,
- presne štyri odpovede,
- presne jednu správnu odpoveď.

Uložené testy sú dostupné na:

```text
/test/list
```

Administrátor môže test:

- spustiť,
- upraviť,
- vymazať.

---

## Poznámka
- AI odpovede sú edukačné a nemajú klinickú záväznosť.

---

## Troubleshooting

### Backend neodpovedá

1. Skontrolujte bežiace služby:

```bash
docker compose ps
```

2. Skontrolujte backend logy:

```bash
docker compose logs -f backend
```

3. Overte health endpoint:

```text
http://localhost:8000/APIhealth
```

### Frontend sa nepripája na backend

1. Skontrolujte `NEXT_PUBLIC_API_URL` v `.env`.
2. Overte, že backend beží na porte `8000`.
3. Skontrolujte, či aplikácia nepoužíva rozdielne adresy `localhost` a `127.0.0.1`.
4. Skontrolujte konzolu prehliadača.

### AI chat nefunguje

1. Skontrolujte `OPENROUTER_API_KEY`.
2. Overte internetové pripojenie.
3. Overte dostupnosť zvoleného `OPENROUTER_MODEL`.
4. Skontrolujte logy frontendu.

### MRI súbor sa nezobrazuje

1. Skontrolujte, či súbor má príponu `.nii` alebo `.nii.gz`.
2. Skontrolujte, či je súbor platný NIfTI.
3. Overte endpoint:

```text
/cases/{case_id}/files
```

4. Skontrolujte WebGL podporu v prehliadači.
5. Skontrolujte CORS a sieťové chyby v konzole prehliadača.

### Regular Test sa nespustí alebo zostane načítavať

Endpoint `/questions/generate_pids` sa snaží vybrať 10 unikátnych participantov. Databáza preto musí obsahovať aspoň 10 participantov. Ak je v databáze menej prípadov, doplňte dáta.

### Diagnostická karta je prázdna alebo obsahuje málo detailov

Základný import participantov vytvára iba stručné diagnózy. Pre rozšírené polia ako `grade`, `tags`, `description`, `keyFeatures` a `differentials` spustite migráciu detailných diagnóz:

```bash
docker compose exec backend python -m migrate_diagnoses
```

Ak ide o staršiu databázu bez rozšírených stĺpcov, najprv spustite:

```bash
docker compose exec backend python -m migrate_schema
```

---

# 2. Používateľská príručka (User Manual)

## 2.1 Pre koho je aplikácia určená

NeuroLearn je určený pre používateľov, ktorí sa učia pracovať s MRI snímkami mozgu. Typickými používateľmi sú:

- študenti medicíny,
- pedagógovia,
- používatelia trénujúci rozpoznávanie MRI nálezov.

Aplikácia slúži na vzdelávanie. Nie je určená na klinické rozhodovanie ani na stanovenie reálnej diagnózy pacienta.

---

## 2.2 Prvé kroky v aplikácii

1. Otvorte webový prehliadač.
2. Prejdite na adresu:

```text
http://localhost:3000
```

3. Aplikácia vás presmeruje na dashboard.
4. Na dashboarde vyberte jeden z hlavných modulov:
   - **Learn** – štúdium MRI prípadov,
   - **Test** – overenie vedomostí.

---

## 2.3 Popis používateľského rozhrania

### Horná navigácia

V hornej časti aplikácie sa nachádza hlavná navigácia:

- **Learn** – otvorí študijný režim,
- **Test Yourself** – otvorí testovací režim,
- **Add Test** – vytvorenie vlastného testu,
- **Add Case** – pridanie nového MRI prípadu,
- **Add Diagnosis** – pridanie novej diagnózy.

Tieto položky sú dostupné priamo v hornej navigácii bez prihlasovania. V aktuálnom prototype nie je implementované používateľské konto ani roly používateľov.


### Bočný panel

Na väčších obrazovkách sa zobrazuje bočný panel s navigáciou:

- Dashboard,
- Anatomy,
- Simulations,
- Settings,
- Support.

Niektoré položky môžu byť súčasťou prototypu a nemusia mať plnú funkcionalitu.

---

## 2.4 Štúdium MRI prípadov v režime Learn

### Krok 1: Otvorenie režimu Learn

1. Kliknite na **Learn**.
2. Zobrazí sa stránka s kategóriami diagnóz.
3. Vyberte kategóriu diagnózy.
4. Ak chcete vidieť všetky prípady, vyberte kategóriu **ALL**.


### Krok 2: Výber prípadu

1. V zozname prípadov kliknite na ID prípadu, napríklad `sub-10159`.
2. Otvorí sa detail prípadu.
3. Aplikácia načíta MRI súbory, údaje o pacientovi a diagnostické informácie.


### Krok 3: Prezeranie MRI snímky

V detailnom zobrazení prípadu je dostupný NIfTI viewer. Pomocou neho môžete:

1. Prezerať MRI snímku.
2. Prepínať roviny zobrazenia:
   - axial,
   - coronal,
   - sagittal,
   - 3D alebo kombinované zobrazenie.
3. Meniť farebnú mapu.
4. Resetovať pohľad.
5. Zobraziť viewer na celú obrazovku.
6. Zapnúť segmentáciu, ak je pre prípad dostupná.

### Krok 4: Výber MRI sekvencie

Ak má prípad viac MRI súborov, môžete medzi nimi prepínať. 
Napríklad:
- T1ce,
- T1,
- T2,
- FLAIR.


### Krok 5: Práca s informáciami o pacientovi

V detaile prípadu môžu byť zobrazené informácie:

- ID prípadu,
- vek,
- pohlavie,
- diagnóza.

Tieto údaje používajte ako doplnkový kontext pri učení.

### Krok 6: Práca s diagnostickou kartou

Diagnostická karta môže obsahovať:

- názov diagnózy,
- kód diagnózy,
- stručný opis,
- typické znaky,
- diferenciálne diagnózy.

Odporúčaný postup:

1. Najprv si prezrite MRI snímku bez čítania diagnózy.
2. Skúste si vlastnými slovami popísať viditeľné znaky.
3. Následne si prečítajte diagnostickú kartu.
4. Porovnajte svoje pozorovanie s uvedenými znakmi.

---

## 2.5 Používanie AI študijného asistenta

AI študijný asistent je dostupný v detailnom zobrazení prípadu. Pomáha používateľovi uvažovať nad MRI nálezom.

### Ako postupovať

1. Otvorte konkrétny prípad v režime Learn.
2. Počkajte, kým sa načíta MRI snímka a diagnostické údaje.
3. Do poľa chatu napíšte otázku.
4. Môžete sa pýtať napríklad:
   - „Čo si mám na tejto snímke všimnúť?“
   - „Ako rozlíšim túto diagnózu od podobnej?“
5. Odošlite otázku.
6. Prečítajte si odpoveď a porovnajte ju s MRI snímkou.

### Upozornenie

AI asistent je určený len na vzdelávanie. Jeho odpovede nemajú klinickú záväznosť.

---

## 2.6 Nahrávanie nového MRI prípadu

Táto funkcia je určená hlavne pre administrátorov alebo pedagógov.

### Postup

1. Kliknite na **Add Case**.
2. Vyberte MRI súbor vo formáte `.nii` alebo `.nii.gz`.
3. Zadajte vek.
4. Vyberte pohlavie.
5. Vyberte diagnózu zo zoznamu.
6. Kliknite na **Submit**.
7. Po úspešnom nahraní sa zobrazí potvrdenie s ID prípadu.

### Možné chyby pri nahrávaní

- Nebol vybraný súbor.
- Súbor nie je vo formáte `.nii` alebo `.nii.gz`.
- Súbor nevyzerá ako platný NIfTI súbor.
- Nebola vybraná diagnóza.

---

## 2.7 Pridanie novej diagnózy

Táto funkcia je určená pre administrátorov a pedagógov.

### Postup

1. Kliknite na **Add Diagnosis**.
2. Zadajte kód diagnózy, napríklad `HGG`.
3. Zadajte názov diagnózy.
4. Zadajte krátku signatúru alebo typický opis.
5. Voliteľne doplňte:
   - grade,
   - tagy,
   - popis,
   - kľúčové znaky,
   - diferenciálne diagnózy.
6. Kliknite na **Create**.
7. Po úspešnom vytvorení bude diagnóza dostupná pri pridávaní prípadov a tvorbe testov.

---

## 2.8 Testovanie vedomostí

Testovací režim otvoríte cez **Test Yourself**.

Dostupné sú dva typy testovania:

1. **Regular Test** – náhodný test z dostupných prípadov.
2. **Browse Tests** – výber z uložených testov.

---

## 2.9 Regular Test

Regular Test slúži na rýchle precvičenie.

### Postup

1. Otvorte **Test Yourself**.
2. Kliknite na **Regular Test**.
3. Aplikácia načíta sériu prípadov.
4. Pri každej otázke si prezrite MRI snímku.
5. Vyberte jednu zo štyroch možností.
6. Po odpovedi aplikácia zobrazí, či bola odpoveď správna.
7. Prečítajte si spätnú väzbu.
8. Kliknite na **Next**.
9. Po poslednej otázke sa zobrazí finálne skóre.

---

## 2.10 Uložené testy

Uložené testy sú vopred pripravené testy s konkrétnymi otázkami.

### Spustenie uloženého testu

1. Otvorte **Test Yourself**.
2. Kliknite na **Browse Tests**.
3. Vyberte test zo zoznamu.
4. Kliknite na **Take Test**.
5. Odpovedajte na otázky.
6. Po dokončení sa zobrazí výsledné skóre.

### Úprava alebo vymazanie testu

Ak máte administrátorský prístup:

1. Otvorte **Browse Tests**.
2. Pri konkrétnom teste kliknite na **Edit**, ak ho chcete upraviť.
3. Pri konkrétnom teste kliknite na **Delete**, ak ho chcete vymazať.
4. Pri vymazaní potvrďte rozhodnutie v dialógu.

---

## 2.11 Vytvorenie vlastného testu

### Postup

1. Kliknite na **Add Test**.
2. Zadajte názov testu.
3. Voliteľne zadajte popis.
4. Kliknite na **Add Question**.
5. Vyberte diagnózu.
6. Vyberte participanta.
7. Napíšte text otázky.
8. Vyplňte štyri odpovede.
9. Označte práve jednu správnu odpoveď.
10. Podľa potreby pridajte ďalšie otázky.
11. Kliknite na **Create Test**.

---

## 2.12 Interpretácia výsledkov testu

Po odpovedi aplikácia zobrazí okamžitú spätnú väzbu:

- **Correct** – odpoveď bola správna.
- **Wrong** – odpoveď bola nesprávna.
- Pri nesprávnej odpovedi aplikácia zobrazí správnu možnosť.
- Po dokončení testu sa zobrazí **Final Score**.

Výsledok používajte ako pomôcku pri učení:

1. Ak máte vysoké skóre, pokračujte náročnejšími alebo uloženými testami.
2. Ak máte nízke skóre, vráťte sa do režimu Learn.
3. Zamerajte sa na diagnózy, pri ktorých ste odpovedali nesprávne.
4. Porovnajte MRI znaky medzi podobnými diagnózami.

---

## 2.13 Odporúčaný študijný workflow

1. Otvorte **Learn**.
2. Vyberte jednu diagnózu alebo kategóriu **ALL**.
3. Otvorte konkrétny MRI prípad.
4. Najprv si prezrite MRI snímku bez čítania detailov diagnózy.
5. Skúste pomenovať hlavné nálezy.
6. Prezrite si diagnostickú kartu.
7. Položte otázku AI asistentovi, ak potrebujete vysvetlenie.
8. Prejdite na ďalší prípad.
9. Po preštudovaní viacerých prípadov otvorte **Regular Test**.
10. Po teste sa vráťte k prípadom, ktoré vám robili problém.

---

## 2.14 Ako pristupovať k MRI snímkam

Pri prezeraní MRI snímok sledujte najmä:

- symetriu mozgových štruktúr,
- veľkosť komôr,
- prítomnosť ložiska alebo masy,
- známky edému,
- nekrózu,
- rozdiely medzi sekvenciami T1, T2, FLAIR alebo T1ce, 
- segmentačný overlay, ak je dostupný.

Nezameriavajte sa iba na jednu snímku alebo jednu rovinu. Pri učení je vhodné prejsť viac rezov a viac pohľadov.

---

## 2.15 Obmedzenia aplikácie

- Aplikácia je edukačný prototyp.
- MRI dáta nemusia obsahovať kompletný klinický kontext.
- AI odpovede môžu byť zjednodušené alebo nepresné.
- Testové skóre slúži na učenie, nie na hodnotenie klinickej spôsobilosti.
- Niektoré časti navigácie môžu byť prítomné v UI, ale nemusia byť plne implementované.

---

## 2.16 Rýchla orientácia

| Chcem... | Kam ísť |
|---|---|
| Prezerať MRI prípady | Learn |
| Vybrať prípad podľa diagnózy | Learn → vybrať kategóriu |
| Otvoriť NIfTI viewer | Learn → vybrať prípad |
| Spýtať sa AI asistenta | Learn → detail prípadu → Study Assistant |
| Precvičiť sa náhodne | Test Yourself → Regular Test |
| Spustiť pripravený test | Test Yourself → Browse Tests |
| Vytvoriť test | Add Test |
| Nahrať nový MRI prípad | Add Case |
| Pridať diagnózu | Add Diagnosis |

---

## 2.17 Záver

NeuroLearn poskytuje prostredie na systematické učenie práce s mozgovými MRI snímkami. Používateľ môže najprv študovať prípady v režime Learn, následne sa pýtať AI asistenta na vysvetlenie a nakoniec si vedomosti overiť v testoch. Najlepší výsledok pri učení vzniká opakovaním cyklu: prezrieť prípad, formulovať vlastný záver, porovnať ho s diagnostickou kartou a overiť si poznatky v teste.
