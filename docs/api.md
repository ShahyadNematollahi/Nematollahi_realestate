# api

Base: /api
JSON in and out. Errors look like {"error":"..."}.

Admin routes need:
Authorization: Bearer <token>
(except login)

## public

GET /health
GET /meta
GET /agency
GET /stats
GET /agents

GET /properties
query:
  q, loc, type, status, min, max, featured=1, page, limit

loc: saadatabad | farmanieh | niavaran | elahieh | zaferanieh | north
type: villa | penthouse | apartment
status: sale | rent | sold

sold items are hidden on the public list unless you pass status=sold

GET /properties/:id

POST /inquiries
{
  "name": "",
  "phone": "",
  "email": "",
  "propertyId": 1,
  "message": ""
}
name, phone, message required

## admin

POST /admin/login
{"password":"change-me"}
-> {"token":"..."}

POST /admin/logout
GET /admin/me
GET /admin/meta

POST /admin/uploads
multipart, images only (jpg/png/webp/gif), max 8mb each
-> {"url":"/uploads/xxx.jpg","urls":["/uploads/xxx.jpg"]}

DELETE /admin/uploads/:filename
409 if the file is still used

GET /admin/properties
GET /admin/properties/:id
POST /admin/properties
PATCH /admin/properties/:id
PUT /admin/properties/:id
DELETE /admin/properties/:id

property body:
title, location, locationKey, type, price, beds, baths, area, image
optional: status, priceText, badge, gallery[], desc, featured

if priceText is empty it becomes something like "150 Billion Tomans"
if gallery is empty, image is copied into gallery[0]

GET /admin/inquiries
DELETE /admin/inquiries/:id

GET /admin/agents
POST /admin/agents
PATCH /admin/agents/:id
DELETE /admin/agents/:id
fields: name, role, phone, whatsapp, email, photo

GET /admin/settings
PATCH /admin/settings
keys: name, phone, mobile, whatsapp, email, address, yearsExperience, dealsClosed
