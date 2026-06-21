export function reportReadyEmail(opts: { reportUrl: string; firstBadge: string }) {
  const subject = 'Your MatchFrame report is ready';
  const text = `Your MatchFrame report is ready.

Our simulated audience has finished reviewing your photos. We've picked the photo to lead with and explained why each one is placed where it is.

View it here: ${opts.reportUrl}

— MatchFrame`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F6F6F4;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#17181B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E2E2DE;border-radius:16px;padding:32px;">
        <tr><td style="font-size:20px;font-weight:600;padding-bottom:12px;">Your MatchFrame report is ready</td></tr>
        <tr><td style="font-size:15px;color:#5E6066;line-height:1.55;padding-bottom:18px;">
          Our simulated audience has finished reviewing your photos. We&rsquo;ve picked the photo to lead with — <strong style="color:#17181B;">${escapeHtml(
            opts.firstBadge,
          )}</strong> — and explained why each one is placed where it is.
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <a href="${opts.reportUrl}" style="display:inline-block;background:#4A40A8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">View your report →</a>
        </td></tr>
        <tr><td style="font-size:13px;color:#8A8C92;border-top:1px solid #E2E2DE;padding-top:16px;">
          You&rsquo;re receiving this because a MatchFrame photo test on your account just finished.
          Your photos stay private and are deleted after your report unless you save them.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
