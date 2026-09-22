# Dashboard de Métricas — Socios (rediseño)

Tablero multi-club para el ecosistema **Sistema de Socios** de 4x, construido con [Astro 5](https://astro.build) + [React 18 islands](https://docs.astro.build/en/concepts/islands/) + [Recharts](https://recharts.org/) + [Tailwind CSS v4](https://tailwindcss.com).

Reemplaza al scaffold Next.js anterior (archivado en `legacy/Dashboard de metricas/socios_metrics/`). Multi-tenant con **una DB por club**, queries directas contra las bases operativas y consistencia visual con el sitio corporativo de 4x.

> **Sin datos de prueba.** Todo lo que se muestra sale de la base de un club. Cuando una métrica no se puede calcular —falta la connection string, falla la query, el club no opera canchas— la sección dice "sin datos" y explica por qué. Nunca se rellena con valores inventados.

---

## Foco del tablero

Pensado para responder tres preguntas:

1. **¿Cuál canal de pago funciona mejor?** — Mercado Pago vs Red Link (Cuenta DNI + BNA+) vs Punto de cobro vs Cobrador en calle.
2. **¿Cómo evoluciona el padrón de socios?** — Altas, bajas, retención, distribución por categoría, grupos familiares.
3. **¿Qué tan bien se usan las canchas?** — Reservas, ocupación, hora pico, día más demandado, mix socios/invitados.

Sobre los **7 clubes** que opera 4x, con drill-down por club.

---

## Requisitos

- Node.js 20+ (LTS)
- npm 10+
- Acceso a las DBs SQL Server de cada club (sin credenciales el dashboard levanta igual, pero cada sección aparece vacía).

## Puesta en marcha

```bash
npm install

cp .env.example .env
# completar .env con las connection strings reales
npm run dev
```

Otros comandos:

```bash
npm run build         # build estático en /dist
npm run preview       # preview del build
npm run check         # type-check
```

## Variables de entorno y connection strings

El dashboard se conecta a **una DB por club**. Las DBs pueden vivir en servidores distintos — no se asume host único.

**`src/data/clubs-catalog.ts`** es el catálogo público de clubes. Para cada uno declara un `envVar` que el runtime busca en `import.meta.env`.

**`.env`** (gitignored) provee las connection strings. Se leen **sólo del lado servidor** (`src/db/env.ts` lee `process.env` y, en dev, parsea el `.env`): no se exponen por `import.meta.env` para que ninguna contraseña termine en el bundle del navegador.

```bash
DB_CONN_INDEPENDIENTE=Server=<host>;Database=<base>;User Id=<usuario>;Password=<clave>;Encrypt=True;TrustServerCertificate=True
DB_CONN_SOCIAL=Server=<otro-host>;Database=<base>;...
# ...una por club...

DB_QUERY_TIMEOUT_MS=15000
DB_POOL_MAX=5
```

Si **falta** la env var de un club, ese club se omite en runtime (no rompe — solo no aparece). En producción usar el secret manager del hosting (Vercel/Netlify/Cloudflare Pages tienen UI para esto).

**Para sumar un club nuevo:**

1. Agregar una entrada en `clubsCatalog` con `id`, `name`, `shortName`, `city` y `envVar`.
2. Sumar la env var con la connection string en `.env` local + en el secret manager de prod.
3. Reiniciar el dev server / redeploy.

### Capa de conexión

- `src/db/pools.ts` — pool de conexiones SQL Server (`mssql`) cacheado por club; se reusa entre requests.
- `src/db/channel.ts` — clasificador del canal de pago. **El schema real no tiene una columna `Channel` única**: el canal se infiere combinando `Applications.CollectorIdMP`, `SettingRedLink.CollectorId` y `Receipts.CollectorType` (∈ `Collector` / `CollectorPoint` / `NULL`). Ver el JSDoc del módulo.
- `src/db/queries/collections.ts` — query de referencia que produce el shape `ChannelStat[]` desde SQL real (`getByChannelForPeriod`, `getMPSuccessRate`).

Todas las secciones leen de las bases reales a través del facade `src/db/index.ts`.

---

## Estructura

```
Rediseno/
├── .env.example                    Template de connection strings por club
├── astro.config.mjs                Astro + React + Tailwind v4
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── components/
    │   ├── Sidebar.astro
    │   ├── Topbar.astro
    │   ├── Section.astro
    │   ├── Card.astro
    │   ├── KPICard.astro
    │   ├── Trend.astro
    │   ├── InsightList.astro
    │   └── charts/                  React islands (client:load)
    │       ├── ChannelDonut.tsx
    │       ├── ChannelTrend.tsx
    │       ├── ChannelTable.tsx
    │       ├── CollectionTrend.tsx
    │       ├── MembershipTrend.tsx
    │       ├── CategoryBar.tsx
    │       ├── OverdueAging.tsx
    │       ├── ClubsComparison.tsx
    │       ├── CashierRanking.tsx
    │       ├── BookingsByPlace.tsx       Tabla de canchas con recaudación y ocupación
    │       ├── BookingsHourlyHeatmap.tsx Hora pico (24 franjas)
    │       ├── BookingsWeekday.tsx       Día más reservado (Dom-Sáb)
    │       ├── BookingsTrend.tsx         Reservas + recaudación 12 meses
    │       └── Sparkline.tsx
    ├── data/
    │   ├── types.ts                Schema TS (Partner, Booking, RentalPlace, etc.)
    │   ├── clubs.ts                Clubes del catálogo (sin secretos)
    │   ├── periods.ts              Eje de períodos (yyyy-mm)
    │   ├── clubs-catalog.ts        Catálogo público de clubes con su envVar
    │   └── navigation.ts           Items del sidebar
    ├── db/                          Capa de conexión real (SQL Server)
    │   ├── pools.ts                Pool por club, cacheado entre requests
    │   ├── channel.ts              Clasificador canal de pago (MP/RL/Punto/Cobrador)
    │   ├── env.ts                  Lectura de env vars del lado servidor
    │   └── queries/
    │       ├── aggregate.ts        12 meses de socios, cobranza, canales y categorías
    │       ├── collections.ts      Cobranza por canal de un período
    │       ├── bookings.ts         Reservas de canchas
    │       ├── operations.ts       Cobradores, mora por antigüedad y sincronización MP
    │       └── redlink.ts          Cobros recibidos por Red Link
    ├── lib/
    │   ├── format.ts
    │   └── insights.ts
    ├── layouts/
    │   └── Layout.astro
    ├── pages/
    │   ├── index.astro             Resumen consolidado
    │   ├── cobranza.astro          Cobranza por canal
    │   ├── socios.astro            Métricas del padrón
    │   ├── reservas.astro          Reservas de canchas
    │   ├── clubes.astro            Comparativa multi-club
    │   ├── clubes/[id].astro       Drill-down por club
    │   └── operacional.astro       Cobradores + sincronización
    └── styles/
        └── global.css
```

---

## Acceso al dashboard

El tablero muestra la recaudación de todos los clubes, así que no puede quedar accesible por URL. `middleware.ts` corre en el borde de Vercel antes de servir cualquier página y pide usuario y clave (HTTP Basic) en todas las rutas.

Las credenciales viven en la variable de entorno `DASHBOARD_USERS`, una por persona:

```bash
DASHBOARD_USERS="leandro:una-clave-larga,miguel:otra-clave-larga"
```

Se carga en **Vercel → Settings → Environment Variables → Production** y se aplica al redeployar. Sumar o sacar a alguien es editar esa variable; no hay base de usuarios que mantener.

**Falla cerrado**: si la variable falta o está mal escrita, el middleware rechaza todo. Un deploy mal configurado deja el tablero inaccesible, nunca público.

Limitaciones que conviene tener presentes:

- La clave es compartida por persona, pero no hay identidad real ni registro de quién entró. Para eso hace falta Vercel Authentication sobre un equipo Pro.
- Basic Auth viaja protegido por HTTPS, pero el navegador la recuerda hasta cerrar la sesión: no conviene usarla en una computadora compartida del club.
- El middleware también agrega `X-Robots-Tag: noindex, nofollow`, para que la URL no termine indexada si alguna vez se filtra.

---

## Convención de naming

Identificadores de código en **inglés**, contenido visible al usuario en **español (es-AR)**. Detalle en `../../../CLAUDE.md` § 6.

---

## Métricas implementadas

### Cobranza por canal (la sección estrella)

- **Volumen** (transacciones) y **monto total** por canal.
- **Distribución** por monto (lo que pesa) vs por transacciones (lo que se usa).
- **Ticket promedio** por canal.
- **Tiempo medio de cobranza** (días entre emisión y pago).
- **Tasa de éxito** (relevante sobre todo para Mercado Pago).
- **Tendencia mensual** de cada canal — detecta qué crece y qué cae.
- **Insights automáticos**: canal líder, crecimiento más fuerte, retroceso más fuerte, ticket más alto, canal más rápido.
- **Mejor canal por club** en la tabla comparativa (no es el mismo en todos).

### Cobrabilidad

- **Tasa de cobranza** (% de cuotas pagadas sobre activos).
- **Mora total** y cantidad de cuotas vencidas.
- **Edad de la deuda**: 1-30 / 31-60 / 61-90 / 90+ días.

### Socios

- **Activos / altas / bajas / neto** mensual.
- **Tasa de retención**.
- **Distribución por categoría** (general, premium, familiar, jubilado, cadete).
- **Tasa de cobranza por categoría** (cuál tipo paga mejor).
- **Grupos familiares**: cantidad, tamaño promedio.

### Reservas de canchas (nueva)

- **KPIs**: reservas del mes, recaudado, ocupación promedio, ticket promedio.
- **Highlights**: cancha más rentable, hora pico, día más demandado.
- **Composición**: socios vs invitados, tasa de cancelación.
- **Detalle por cancha**: bookings, recaudación, ocupación y % de socios, tipeado por deporte (Fútbol/Pádel/Tenis/Básquet/Multiuso).
- **Patrones de uso**: distribución por día de la semana y por hora del día.
- **Evolución mensual**: reservas y recaudación de los últimos 12 meses.

Fuente real: `RentalPlaces` + `RentalPlacesAvailable` + `ShiftBooking` + `ShiftBookingDetail`. Los clubes que operan canchas aparecen en la sección; el resto se omite naturalmente; los otros se omiten naturalmente.

### Comparativa multi-club

- Tabla ordenable con KPIs por club.
- **Sparklines** de cobrado por club (tendencia rápida).
- **Canal líder** por club.
- **Drill-down** a página detallada por club.

### Operacional

- **Ranking de cobradores** por recaudación con progress bar.
- **Pagos pendientes de sincronización** entre canal y sistema, con edad del más antiguo.

---

## De dónde sale cada número

Semántica tomada del código de Partners, para no contradecir al sistema:

| Concepto | Definición |
|---|---|
| Recibo emitido | Fila en `Receipts` de la liquidación del período (`Liquidations.PeriodYear`/`PeriodMonth`) |
| Recibo cobrado | `Receipts.Cancelled = 1` con `PaymentDate` y `PaymentAmount` |
| Deuda | `Receipts.Cancelled = 0` |
| Cobrabilidad | Monto cobrado sobre monto facturado (`TotalToPay`) del período |
| Canal | Se deduce del cobrador: `Applications.CollectorIdMP` → Mercado Pago, `SettingRedLink.CollectorId` → Red Link, y si no `Receipts.CollectorType` (`CollectorPoint` / `Collector`) |
| Socio activo | `AdmissionDate` anterior al cierre del mes y sin `DropDate` posterior |
| Tasa de éxito | Sólo Mercado Pago informa intentos (`PaymentMP.Status`); en los demás canales se muestra `—` |

**Validado contra la base** (Club Social, septiembre 2026): socios activos 2.424, recibos emitidos 2.270, pagos 1.902, cobrado $57.534.070, Red Link 1.756 pagos por $52.488.910. Los mismos valores que muestra el dashboard.

### Pendiente de cablear

 el facade `src/db/index.ts` expone `loadDashboard()`, `loadBookings()`, `loadCashiers()`, `loadOverdueBuckets()`, `loadSyncIssues()` y las funciones de Red Link. Cada una devuelve los clubes incluidos y los excluidos con su motivo.

**Schema real**: el script `sql script - database creation.sql` contiene el DDL completo (40 tablas) que se replica idéntico en cada DB de club. Tablas clave para métricas:

- `Partners`, `PartnersTypes`, `PartnersGroups`, `PartnersRelations`, `Collectors`
- `Liquidations`, `Receipts`, `ReceiptsDetail`, `LowReceipts`, `PartnerCredits`
- `PaymentMP` (Mercado Pago: Status, StatusHistory, SynchronizedReceipt)
- `ExtractRedLink` + `ExtractRedLinkDetail` (cobros importados de Red Link)
- `RefreshRedLink` + `RefreshRedLinkDetail` + `RefreshRedLinkReceipts` (deuda enviada a RL)
- `SettingRedLink`, `Applications` (configuración del club, identifica los CollectorId virtuales de MP y RL)
- `RentalPlaces`, `RentalPlacesAvailable`, `ShiftBooking`, `ShiftBookingDetail`
- `Send`, `SendDetail`, `SendGridEvents`, `WhatsAppMessage`

**Estrategia de queries**: directas a las DBs operativas, **sin base consolidada** por ahora. El build completo (32 páginas, 7 clubes) tarda unos 110 segundos. Cuando eso moleste, el paso siguiente es una base de agregados con un job que corra de noche, sin tocar los componentes.

---

## Cómo se mapea con el ecosistema 4x

- **Sitio corporativo 4x** (`../../../Pagina web actual/Rediseno/`): este dashboard NO se promociona desde el sitio público. Es una herramienta interna y para uso de la comisión directiva de cada club.
- **Landing de Socios** (`../../Landing page/Rediseno/`): la página comercial es la que vende el producto. El dashboard es el valor entregado tras la venta.

Paleta navy/slate consistente con el sitio corporativo. Tipografía Inter idem. Tokens duplicados a propósito por ahora (cada proyecto se publica independientemente); más adelante puede hacerse un design-tokens compartido.

---

## Pendientes conocidos

- **Usuario de sólo lectura**: hoy se usa el usuario de la cadena configurada. Antes de dejarlo corriendo seguido conviene un usuario dedicado con permisos de lectura.
- **Pasar a SSR**: el dashboard hoy es estático. Para reflejar datos en vivo hay que cambiar `output: 'server'` o `'hybrid'` en `astro.config.mjs` y agregar un adapter (`@astrojs/node` para hosting propio, o el del proveedor cloud elegido).
- **Filtros del Topbar** (Club y Período): selects sin lógica todavía. Decidir si recargan la página (server-side, requiere SSR) o si se vuelven reactivos del lado cliente.
- **Cierres de caja**: explícitamente fuera de scope. El schema real no tiene tabla específica.
- **Auth**: el dashboard hoy es público. Antes de prod necesita autenticación (probablemente el JWT del Sistema de Socios).
- **Open Graph image** y meta para compartir.
- Conectar a GitHub + deploy.

---

## Referencias

- Scaffold Next.js anterior: `../socios_metrics/`
- Documento maestro del workspace: `../../../CLAUDE.md`
- Sitio corporativo: `../../../Pagina web actual/Rediseno/`
- Landing de Socios: `../../Landing page/Rediseno/`
