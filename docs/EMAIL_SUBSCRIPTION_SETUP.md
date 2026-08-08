# Email subscription setup (Google Sheets + Apps Script)

The subscribe form (`EmailCapture`) and the contact form both POST to
`/api/leads`. That route forwards to a **Google Apps Script Web App**, which:

- appends new subscribers to a Google Sheet (deduplicated),
- logs contact messages to a separate tab,
- emails you (`abdurrahman19011@gmail.com`) on every new subscriber/message.

It is completely free within Google's normal quotas and uses no third-party
email service. No Sheet ID, Gmail access, or secret ever lives in the website
code or the browser — it all stays inside the Apps Script on Google's side.

**The form intentionally errors until you finish the steps below.** With
`LEADS_WEBHOOK_URL` unset, `/api/leads` returns an error instead of falsely
telling someone they subscribed.

---

## 1. Create the Google Sheet

1. Go to <https://sheets.google.com> and create a blank spreadsheet.
2. Name it something like **PDF Studio — Subscribers**.
3. Leave it empty. The script creates the `Subscribers` and `Messages` tabs
   (with headers) automatically on the first submission.

## 2. Create the Apps Script (bound to the Sheet)

1. In that spreadsheet: **Extensions → Apps Script**. (Creating it from inside
   the Sheet is what lets the script use the Sheet with no ID.)
2. Delete the default `myFunction` stub and paste the code from
   [section 3](#3-apps-script-code).
3. Change nothing — `ADMIN_EMAIL` is already `abdurrahman19011@gmail.com`.
4. **Save** (💾).

### Optional but recommended: a shared secret

The Web App must be public so the site can call it, so add a secret both sides
share:

1. In the Apps Script editor: **Project Settings (⚙) → Script Properties →
   Add script property**.
2. Property `SHARED_TOKEN`, value = a long random string (e.g. run
   `openssl rand -hex 24`). Save.
3. Put the **same** value in `LEADS_WEBHOOK_TOKEN` (see [section 6](#6-set-the-environment-variables)).

If you skip this, the script still works; it just won't reject unknown callers.

## 3. Apps Script code

```javascript
/**
 * PDF Studio — newsletter + contact webhook.
 * Bound to the subscriber Google Sheet (Extensions -> Apps Script).
 * Deploy as a Web App: Execute as "Me", Access "Anyone".
 */
var ADMIN_EMAIL = 'abdurrahman19011@gmail.com';
var SUBSCRIBERS_SHEET = 'Subscribers';
var MESSAGES_SHEET = 'Messages';

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    // Optional shared secret. Enforced only if a SHARED_TOKEN script property exists.
    var expected = PropertiesService.getScriptProperties().getProperty('SHARED_TOKEN');
    if (expected && body.token !== expected) {
      return json({ success: false, error: 'unauthorized' });
    }

    var email = String(body.email || '').trim().toLowerCase();
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254 || !emailRe.test(email)) {
      return json({ success: false, error: 'invalid_email' });
    }

    var now = new Date();
    var whenStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    var source = String(body.source || 'footer').slice(0, 80);
    var message = body.message ? String(body.message).slice(0, 4000) : '';

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // A contact message (has text) is logged + emailed, never added to the list.
    if (message) {
      var msgSheet = getOrCreateSheet(ss, MESSAGES_SHEET, ['receivedAt', 'email', 'source', 'message']);
      msgSheet.appendRow([whenStr, email, source, message]);
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New Contact Message',
        body: 'From: ' + email + '\nWhen: ' + whenStr + '\nTopic: ' + source + '\n\n' + message
      });
      return json({ success: true });
    }

    // Newsletter subscribe.
    var sheet = getOrCreateSheet(ss, SUBSCRIBERS_SHEET, ['email', 'subscribedAt', 'source']);
    if (isDuplicate(sheet, email)) {
      return json({ success: true, duplicate: true });
    }
    sheet.appendRow([email, whenStr, source]);

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Newsletter Subscriber',
      body: 'A new subscriber joined PDF Studio.\n\n' +
            'Email: ' + email + '\n' +
            'Date/time: ' + whenStr + '\n' +
            'Source: ' + source + '\n'
    });

    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: 'server_error' });
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return json({ ok: true, service: 'leads' });
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function isDuplicate(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 4. Deploy as a Web App

1. In the Apps Script editor: **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Fill in:
   - **Description:** `leads webhook`
   - **Execute as:** **Me** (`abdurrahman19011@gmail.com`) — so it can write the
     Sheet and send mail as you.
   - **Who has access:** **Anyone** — required so the website's server can POST
     without a Google login. (The optional `SHARED_TOKEN` is what protects it.)
4. **Deploy**. Google will ask you to **authorize** — approve the Sheets + Gmail
   scopes. You may see an "unverified app" screen: **Advanced → Go to <project>
   (unsafe)** → **Allow**. This is your own script; it is safe.
5. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`

> Editing the script later? Use **Deploy → Manage deployments → Edit (pencil) →
> Version: New version → Deploy** to keep the **same** URL. A brand-new
> deployment gives a new URL and you'd have to update the env var.

## 5. Quick check the Web App is live

Open the `/exec` URL in a browser — you should see `{"ok":true,"service":"leads"}`.

## 6. Set the environment variables

Local (`frontend/.env.local`, git-ignored):

```bash
LEADS_WEBHOOK_URL=https://script.google.com/macros/s/AKfyc.../exec
# only if you set SHARED_TOKEN in the Apps Script:
LEADS_WEBHOOK_TOKEN=the-same-long-random-string
```

Production (**Vercel → Project → Settings → Environment Variables**): add the
same `LEADS_WEBHOOK_URL` (and `LEADS_WEBHOOK_TOKEN` if used) for the Production
environment, then redeploy. These are server-side only — Next.js never ships
them to the browser because they are not prefixed `NEXT_PUBLIC_`.

`.env.example` documents both keys; real values stay out of git.

---

## 7. Test the whole flow

### From the browser
1. `cd frontend && npm run dev`, open <http://localhost:3000>, scroll to the
   footer subscribe box.
2. Enter a real address → you should see **"You're on the list."** only after the
   webhook confirms.
3. Open the Google Sheet → the `Subscribers` tab has a new row: `email`,
   `subscribedAt` (`yyyy-MM-dd HH:mm:ss`), `source`.
4. Check `abdurrahman19011@gmail.com` → a **"New Newsletter Subscriber"** email
   with the address and time.

### From the terminal (no browser)
```bash
# valid — expect {"ok":true}
curl -s -X POST http://localhost:3000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester@example.com","source":"footer"}'

# invalid — expect 400 {"error":"Please enter a valid email."}
curl -s -X POST http://localhost:3000/api/leads \
  -H 'Content-Type: application/json' -d '{"email":"not-an-email"}'

# duplicate — submit the valid one again; expect {"ok":true} and NO new Sheet row
```

### Expected results by case
| Case | API response | Sheet | Email to you |
|------|--------------|-------|--------------|
| Valid, new | `200 {ok:true}` | +1 row | yes |
| Valid, duplicate | `200 {ok:true}` | no new row | no |
| Invalid email | `400` | no | no |
| Webhook down / URL wrong | `502` | no | no |
| `LEADS_WEBHOOK_URL` unset | `503` | no | no |

The key guarantee: the API returns success **only** when the Apps Script replied
`{"success":true}`. Any webhook failure yields a 4xx/5xx and the UI shows an
error — it never claims a subscription that didn't happen.

## 8. Quotas & notes

- Consumer Gmail allows ~100 `MailApp` recipients/day (Workspace ~1,500) — far
  more than new-subscriber notifications need.
- To export subscribers: **File → Download → CSV** from the Sheet.
- To stop notifications but keep collecting, comment out the `MailApp.sendEmail`
  call in the subscribe branch and redeploy a new version.
