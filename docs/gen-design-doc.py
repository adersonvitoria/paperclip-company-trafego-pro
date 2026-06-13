#!/usr/bin/env python
# Gera o "Design documentation of your tool" para a solicitação de Basic Access
# do Developer Token da Google Ads API (campo 7 do formulário).
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, Table, TableStyle, HRFlowable,
)

OUT = os.path.join(os.path.dirname(__file__), "HeartPRO-GoogleAds-API-Design-Doc.pdf")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("H1c", parent=styles["Heading1"], fontSize=15, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor("#11324d")))
styles.add(ParagraphStyle("H2c", parent=styles["Heading2"], fontSize=12, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#1a4971")))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14, spaceAfter=6))
styles.add(ParagraphStyle("Small", parent=styles["Normal"], fontSize=8.5, leading=11, textColor=colors.HexColor("#555555")))
title_style = ParagraphStyle("Titlec", parent=styles["Title"], fontSize=20, textColor=colors.HexColor("#0b2440"))

S = styles["Body"]


def b(items):
    return ListFlowable(
        [ListItem(Paragraph(t, S), leftIndent=10) for t in items],
        bulletType="bullet", start="•", leftIndent=14,
    )


story = []
story.append(Paragraph("HeartPRO — Google Ads API Tool", title_style))
story.append(Paragraph("Design Documentation for Developer Token (Basic Access) Application", styles["H2c"]))
story.append(Paragraph(
    "Company: HeartPRO (P2A Tech) &nbsp;·&nbsp; Website: https://heartpro.cloud &nbsp;·&nbsp; "
    "Manager account (MCC): 605-725-2874 &nbsp;·&nbsp; Advertising account: 446-613-9201 &nbsp;·&nbsp; "
    "Contact: adersonvitoria@gmail.com", styles["Small"]))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc"), spaceBefore=6, spaceAfter=8))

story.append(Paragraph("1. Overview", styles["H1c"]))
story.append(Paragraph(
    "HeartPRO is a Brazilian B2B SaaS that provides a financial management platform (income statement/DRE, "
    "cash flow, accounts payable/receivable, sales, and PowerBI dashboards), sold by subscription at "
    "R$199.90/month on the annual plan. To acquire new subscribers we run Google Ads Search campaigns. "
    "We are building an <b>internal tool</b> that uses the Google Ads API to manage and report on our "
    "<b>own single advertising account</b> (446-613-9201), operated under our manager account (605-725-2874). "
    "We do not manage third-party or client accounts.", S))

story.append(Paragraph("2. Tool architecture", styles["H1c"]))
story.append(Paragraph(
    "The tool is a web application (the &ldquo;TráfegoPRO Console&rdquo;) built with Next.js (React) and a "
    "PostgreSQL database, deployed on Vercel. Credentials are stored server-side and never exposed to the "
    "browser. The Google Ads integration lives in a single server module (lib/google-ads.ts):", S))
story.append(b([
    "OAuth 2.0: the stored refresh token is exchanged for a short-lived access token at https://oauth2.googleapis.com/token.",
    "API calls are made server-to-server over REST to https://googleads.googleapis.com (v23), with the developer-token and login-customer-id headers.",
    "Access is restricted by an authenticated admin login (JWT in an httpOnly cookie); only internal employees use it.",
]))

story.append(Paragraph("3. How we use the Google Ads API", styles["H1c"]))
story.append(Paragraph("<b>3.1 Reporting (read)</b>", styles["H2c"]))
story.append(Paragraph(
    "GoogleAdsService.Search (GAQL) pulls campaign, ad group, keyword and metrics data (impressions, clicks, "
    "cost, conversions, CTR, CPC, CPA, ROAS) to render reporting dashboards and to support weekly optimization "
    "decisions. Example query: <i>SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, "
    "metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS</i>.", S))
story.append(Paragraph("<b>3.2 Campaign management (read &amp; write)</b>", styles["H2c"]))
story.append(Paragraph("The tool creates and edits our own campaigns using mutate operations on these services:", S))
story.append(b([
    "CampaignService and CampaignBudgetService — create/update Search campaigns and daily budgets.",
    "AdGroupService — create/update ad groups.",
    "AdGroupAdService — create/update Responsive Search Ads (headlines and descriptions).",
    "AdGroupCriterionService — manage keywords (with match types) and negative keywords.",
    "Bidding strategy configuration (e.g. Maximize Clicks / Target CPA) on our own campaigns.",
]))

story.append(Paragraph("4. Workflow", styles["H1c"]))
story.append(Paragraph(
    "An internal pipeline assists the team with paid-traffic launches: (1) keyword research, (2) competitor "
    "review, (3) media plan with CPA/ROAS targets, (4) measurement/tracking plan, (5) landing-page review, "
    "(6) ad copy (RSAs), (7) Search campaign blueprint, and (8) a pre-launch compliance audit. The resulting "
    "blueprint is then created in our own Google Ads account via the API mutate operations above, and the "
    "reporting module reads metrics back to monitor and optimize performance.", S))

story.append(Paragraph("5. Data, access and scope", styles["H1c"]))
data = [
    ["Accounts accessed", "One — our own account 446-613-9201, via MCC 605-725-2874"],
    ["Users", "Internal employees only (authenticated admin login)"],
    ["Operations", "Read (reporting) and write (create/edit our own campaigns)"],
    ["Third-party accounts", "None — we do not manage client accounts"],
    ["App Conversion Tracking / Remarketing API", "Not used"],
    ["Data storage", "Configuration and run history in our own PostgreSQL DB; OAuth secrets stored server-side only"],
]
t = Table(data, colWidths=[5.2 * cm, 10.3 * cm])
t.setStyle(TableStyle([
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1a4971")),
    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(t)
story.append(Spacer(1, 8))
story.append(Paragraph(
    "We acknowledge the Google Ads API policies and will keep our API contact email up to date. This token is "
    "for managing our own advertising only.", styles["Small"]))

SimpleDocTemplate(OUT, pagesize=letter, topMargin=1.6 * cm, bottomMargin=1.6 * cm,
                  leftMargin=2 * cm, rightMargin=2 * cm).build(story)
print("OK:", OUT)
