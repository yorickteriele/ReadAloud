# ReadAloud Iterative TODO

## MVP Iteratie 1 – Basis PWA met TTS

- [X] Backend: Configureer **ASP.NET Core + Individual Accounts + JWT**
- [X] Backend: Zet **PostgreSQL** op en configureer EF Core
- [X] Frontend: Initieer **React + TypeScript + Tailwind + PWA**
- [X] Frontend: Basis login/register flow (JWT)
- [X] Backend: Endpoint om **tekst naar audio te converteren** (via TTS API)
- [ ] Test end-to-end: upload tekst → luister audio

## Iteratie 2 – Boekbeheer en gebruikerservaring

- [ ] Backend: Sla **boeken / hoofdstukken** op in database
- [ ] Frontend: Boek upload + lijst tonen van boeken
- [ ] Frontend: Luistergeschiedenis opslaan (per gebruiker)
- [ ] Backend: Voeg **Redis caching** toe voor TTS audio
- [ ] Frontend: Audio player uitbreiden met **speed & stem selectie**

## Iteratie 3 – PWA functionaliteit en offline

- [ ] Configureer **service worker** en manifest.json
- [ ] Offline luistergeschiedenis met **IndexedDB**
- [ ] Offline afspelen van eerder gegenereerde audio

## Iteratie 4 – Premium features & betalingen

- [ ] Backend: Voeg **gebruikersrollen** (free / premium) toe
- [ ] Frontend: Betaalpagina integreren (Stripe / Mollie)
- [ ] Beperk bepaalde functies voor free users (bijv. aantal TTS-minuten)

## Iteratie 5 – Extra UX en polish

- [ ] Voeg **search / filter** toe voor boeken
- [ ] Voeg **favorieten / afspeellijsten** toe
- [ ] Branding: logo, kleuren, app icon
- [ ] Schrijf **disclaimer / voorwaarden**

## Iteratie 6 – Testing & Deployment

- [ ] Unit tests voor backend services
- [ ] Test JWT-auth + protected endpoints
- [ ] Test PWA offline functionaliteit
- [ ] Deploy backend + Redis + frontend PWA
- [ ] Test volledige flow in productie
