GitHub Pages: Custom domain (ozmedia.sk)

This repo is served with GitHub Pages using a custom domain. To make
https://ozmedia.sk and https://www.ozmedia.sk work (and avoid DNS/SSL errors):

1) CNAME (already added)
   - A file named `CNAME` with a single line `ozmedia.sk` has been added to the
     repository root. GitHub Pages will pick this up and use it as the custom
     domain for the site.

2) DNS records (set at your domain registrar / DNS provider)
   - For the apex domain `ozmedia.sk` add FOUR A records pointing to GitHub:
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153

   - For the `www` subdomain add a CNAME record:
     www → ozmedia.sk

   Notes:
   - If you use Cloudflare, set these DNS entries to **DNS only** (grey cloud)
     while GitHub provisions the TLS certificate (you can enable proxying later,
     but use Full (strict) format and ensure origin has a cert).
   - DNS changes may take up to 48 hours to fully propagate, but usually are
     visible within minutes to a few hours.

3) GitHub Pages settings
   - Go to your repository on GitHub → Settings → Pages.
   - Confirm the Custom domain shows `ozmedia.sk`. If not, enter it and save.
   - Once DNS is correct, enable **Enforce HTTPS**. GitHub will provision a
     Let's Encrypt certificate automatically; this can take a few minutes to
     complete.

4) Verify
   - Use `nslookup ozmedia.sk` or https://dnschecker.org to confirm DNS A records.
   - Visit https://ozmedia.sk and confirm padlock / no mixed content warnings.
   - If you still see `DNS_PROBE_FINISHED_NXDOMAIN`, double-check your registrar
     DNS config and ensure there are no typos in the domain names.

Troubleshooting tips
   - If GitHub says the domain is already taken or configured in another repo,
     remove it from that repo's Pages settings or delete that repo's `CNAME`.
   - If you use a provider that requires an ALIAS/ANAME for apex records, use
     their recommended method to point the apex to GitHub.

If you want, I can:
 - Create a `README` section with screenshots (or sample DNS UI instructions)
 - Verify your DNS records for you (paste the domain provider name or a
   screenshot of your DNS config)
 - Wait and re-check once you make the DNS changes and enable Enforce HTTPS

Tell me if you'd like me to add any provider-specific instructions (GoDaddy,
Cloudflare, Namecheap, etc.) or check your DNS after you update it.