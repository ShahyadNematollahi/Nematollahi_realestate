# Nematollahi real estate

Simple listing site + admin API.
Needs Node 22+ because of node:sqlite.

## run

Windows:
```
copy .env.example .env
npm start
```

Linux/mac:
```
cp .env.example .env
npm start
```

Then open http://127.0.0.1:4000
Admin page: http://127.0.0.1:4000/admin.html

Default password is `change-me` (see ADMIN_PASSWORD in .env).

To reset demo listings:
```
npm run seed
```

DB file is backend/data/app.db
Uploaded photos go to backend/uploads

API notes are in docs/api.md
