# Cloudflare deployment guide

This project should be deployed on Cloudflare Pages, not Netlify.

Use this file as the deployment checklist when the site is ready to go public.

## Short answer

- Host the static website on Cloudflare Pages.
- Upload only the built `dist` folder.
- Do not upload `school_non_site_workspace`, backups, source-only tooling, or old files.
- Oversized original downloads are linked from Google Drive/Slides instead of being copied into `dist`.
- Keep readable PDF previews in the site.
- Videos now use embedded YouTube links and play inside the site.

## Important file-size handling

Cloudflare Pages Direct Upload has a per-file asset limit of `25 MiB`.

The source archive contains originals larger than that:

| File | Size |
| --- | ---: |
| `Топ 10 най мащабнипожари.pptx` | 26.67 MiB |
| `как да опазим гоо.pdf` | 25.82 MiB |
| `КАК ДА ОПАЗИМ РЕКИТЕ(1).pptx` | 25.43 MiB |

These originals are intentionally not copied into `dist`. They are linked from Google Drive/Slides instead, while the site keeps local rendered PDF previews where available. The current deploy folder should have no files over `25 MiB`.

| File | External original |
| --- | --- |
| `Топ 10 най мащабнипожари.pptx` | https://docs.google.com/presentation/d/1r7AgWpYV_waWXQzWFBUL4h57-1V_Thfr/edit?usp=drive_link&ouid=115949256847589915994&rtpof=true&sd=true |
| `КАК ДА ОПАЗИМ РЕКИТЕ(1).pptx` | https://docs.google.com/presentation/d/1GWJ6wHkEuPmKqefywkxANtdT7pkLbYJy/edit?usp=drive_link&ouid=115949256847589915994&rtpof=true&sd=true |
| `как да опазим гоо.pdf` | https://drive.google.com/file/d/1CnTHKTu1oiYmSi4_nWSIeZvK2omRzIQe/view?usp=drive_link |

## Recommended setup for this project

Use this split:

| Content | Best home | Why |
| --- | --- | --- |
| HTML, CSS, JS, icons, optimized images, rendered PDF previews | Cloudflare Pages | Fast, free static hosting |
| Original large PPTX/DOCX/PDF downloads | Google Drive or Cloudflare R2 | Avoids Pages file-size limits |
| Videos | YouTube embeds | Plays inside the site and avoids heavy hosting |
| Backups and old source folders | Local archive only | Keeps deployment clean |

This keeps the site looking the same while avoiding upload failures and unnecessary bandwidth problems.

## Credit card notes

- Cloudflare Pages can be started for free and Cloudflare advertises starting free without a credit card.
- A custom subdomain on an existing domain can also be free.
- Buying a new domain requires payment.
- Cloudflare R2 has a free monthly allowance, but because it is usage-based storage, Cloudflare may ask for billing details before enabling it.
- Google Drive is simpler if the school already has a Google account and only needs original file downloads.

## Build locally

From the project root:

```powershell
cd C:\Users\halor\Documents\school
python build_dist.py
```

After the build, deploy:

```text
C:\Users\halor\Documents\school\dist
```

Do not deploy the full project root.

## Pre-deployment file check

Run this before uploading:

```powershell
Get-ChildItem -LiteralPath "C:\Users\halor\Documents\school\dist" -Recurse -File |
  Where-Object { $_.Length -gt 25MB } |
  Sort-Object Length -Descending |
  Select-Object @{Name="MiB";Expression={[math]::Round($_.Length/1MB,2)}}, FullName
```

The result must be empty before a clean Cloudflare Pages upload.

## Deploy with Cloudflare Pages

1. Go to the Cloudflare dashboard.
2. Open `Workers & Pages`.
3. Choose `Create application`.
4. Choose `Pages`.
5. Choose `Connect to Git`.
6. Create a project name, for example:

```text
ou-panayot-hitov-eko
```

7. Select the GitHub repository:

```text
pavlinmitev232/ou-panayot-hitov-eko
```

8. Use these build settings:

```text
Framework preset: None
Build command: leave empty
Build output directory: dist
Root directory: /
```

Do not use `python build_dist.py` as the Cloudflare build command. The optimized `dist` folder is already committed to GitHub, and Cloudflare does not need to rebuild it.

9. Deploy.
10. Open the generated address:

```text
https://PROJECT_NAME.pages.dev
```

10. Test the full checklist below.

## Custom subdomain

Example target:

```text
eko.school-domain.bg
```

In Cloudflare:

1. Open `Workers & Pages`.
2. Open the Pages project.
3. Go to `Custom domains`.
4. Click `Set up a domain`.
5. Enter the subdomain, for example:

```text
eko.school-domain.bg
```

6. Continue through the verification steps.

If the domain already uses Cloudflare DNS, Cloudflare can create the CNAME record automatically.

If the domain is not managed in Cloudflare, add a CNAME at the current DNS provider:

```text
Type: CNAME
Name: eko
Target: PROJECT_NAME.pages.dev
```

Still add the custom domain inside the Pages dashboard first. Do not only add the DNS record manually.

## Handling large original documents

### Option A: Google Drive

Use this if you want the easiest school-friendly setup.

1. Create a Google Drive folder for original project files.
2. Upload the large originals.
3. Set sharing to `Anyone with the link can view`.
4. Replace each original download link in the site manifest with the Drive link.
5. Keep the rendered PDF preview inside Cloudflare Pages.

The site will still show previews locally and the original button will download/open from Drive.

### Option B: Cloudflare R2

Use this if you want a more professional static-file setup.

1. Create an R2 bucket, for example:

```text
school-eco-originals
```

2. Upload large original files to the bucket.
3. Configure public access with a custom domain or public bucket URL.
4. Replace original download links in the site manifest with R2 URLs.
5. Keep rendered PDF previews inside Cloudflare Pages.

For our current size, R2 should be very cheap and likely inside the free allowance, but billing details may be needed because it is usage-based.

## YouTube video setup

The four video links are already configured:

| Button | YouTube URL |
| --- | --- |
| `Пусни` | https://youtu.be/MScX02LepHo |
| `Пусни` | https://youtu.be/VY8fZTLkVws |
| `Пусни` | https://youtu.be/iPKg7yAYOA0 |
| `Пусни` | https://youtu.be/YBa37JOTnTM |

The local MP4 files are not copied into `dist`. The site keeps the video entries in the materials list, but playback opens an embedded YouTube player inside the page.

If a video ever needs to be changed:

1. Replace the YouTube ID in `script.js`.
2. Keep the button text as:

```text
Пусни
```

3. Run `python build_dist.py`.
4. Recheck the video button in `/downloads/`.

## Final public-site test checklist

After deployment, test these on desktop and mobile:

- [ ] Home page opens.
- [ ] Navigation works.
- [ ] Footer icons load correctly.
- [ ] `/scratch/` opens and matches the project requirements.
- [ ] `/water-resources/` opens and has the correct water resources content.
- [ ] `/forest-fires/` opens and has the correct forest fires content.
- [ ] `/healthy-eating/` opens and has the correct healthy eating content.
- [ ] `/gallery/` opens and images load.
- [ ] `/presentations/` opens.
- [ ] Presentation PDF previews open in browser.
- [ ] Original PPTX/DOCX/PDF buttons work.
- [ ] `/downloads/` opens.
- [ ] `/contacts/` opens.
- [ ] Video buttons say `Пусни`.
- [ ] Videos play in the page through YouTube embeds.
- [ ] Mobile navigation works at phone width.
- [ ] No broken icons.
- [ ] No links point to the copied original site.
- [ ] No backup/archive folders are deployed.

## Useful Cloudflare references

- Cloudflare Pages Direct Upload: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare pricing page: https://www.cloudflare.com/plans/
