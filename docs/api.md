# HTTP API

Base path: `/api`

All successful responses are JSON. Errors use `{ "error": "message" }` with `400`, `401`, `404`, or `500`.

## Public

### `GET /health`

Service check.

### `GET /agency`

Office profile used by the public pages.

### `GET /stats`

Inventory totals by type.

### `GET /agents`

Advisor cards.

### `GET /properties`

Query parameters:

| Name | Notes |
| --- | --- |
| `loc` | `saadatabad`, `farmanieh`, `niavaran`, `elahieh`, `zaferanieh`, `north` |
| `type` | `villa`, `penthouse`, `apartment` |
| `status` | `sale`, `rent`, `sold` |
| `min` | minimum price number |
| `max` | maximum price number |
| `featured` | `1` to keep featured rows only |
| `page` | default `1` |
| `limit` | default `24`, max `100` |

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 24
}
```

Property object:

```json
{
  "id": 1,
  "title": "Modern Villa with Infinity Pool",
  "location": "Chalus, Kandovan Road",
  "locationKey": "north",
  "type": "villa",
  "status": "sale",
  "price": 185,
  "priceText": "185 Billion Tomans",
  "beds": 5,
  "baths": 4,
  "area": 680,
  "badge": "Featured",
  "image": "/images/villa1.jpg",
  "gallery": ["/images/villa1.jpg"],
  "desc": "…",
  "featured": true,
  "createdAt": "2026-08-28 12:00:00"
}
```

### `GET /properties/:id`

Single listing. Missing ids return `404`.

### `POST /inquiries`

```json
{
  "name": "Nastaran Rafiei",
  "phone": "+989120000000",
  "email": "",
  "propertyId": 2,
  "message": "I would like a private viewing."
}
```

`name`, `phone`, and `message` are required.

## Desk

Send `Authorization: Bearer <token>` on every desk route except login.

### `POST /admin/login`

```json
{ "password": "change-me" }
```

### `GET /admin/inquiries`

Latest viewing requests.

### `POST /admin/properties`

Creates a listing. Required fields: `title`, `location`, `locationKey`, `type`, `price`, `priceText`, `beds`, `baths`, `area`, `image`.

### `PATCH /admin/properties/:id`

Partial update. Same field names as create.

### `DELETE /admin/properties/:id`
