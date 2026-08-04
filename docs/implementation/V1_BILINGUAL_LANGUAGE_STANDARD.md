# Braun Smart Portal V1 Bilingual Language Standard

## 1. Purpose
Braun Smart Portal V1 must support English and Simplified Chinese across all core roles, pages, PDFs, notifications, and AI interactions.

The system stores one set of business data. Language selection changes labels, descriptions, templates, and presentation only; it must never duplicate customers, orders, invoices, tasks, status records, payments, measurements, or audit events.

## 2. Supported roles
- Owner / 老板
- Sales / 销售
- Factory / 工厂
- Installer / 安装工
- Customer / 客户

Each user stores a preferred language: `en` or `zh-CN`. The user may switch language without losing the current page, unsaved draft, selected order, uploaded photo, signature, or filter state.

## 3. V1 scope
English and Chinese are required for:
- Login, navigation, dashboard, search, notifications, errors, empty states, buttons, confirmations, and help text.
- Customer, Project, Room, Window, Product, Measurement, Quote, Invoice, Payment, Factory, Shipping, Installation, Warranty, Finance, and AI Assistant.
- Quote, Invoice, Receipt, Work Order, Factory Sheet, Packing List, Installation Checklist, Warranty Certificate, signature pages, and customer-facing PDF exports.
- Email, SMS, portal notifications, payment reminders, installation reminders, shipping updates, and signature requests.

## 4. Language resource architecture
No user-facing English or Chinese text may be hard-coded in business components.

Recommended structure:

```text
/locales
  /en
    common.json
    auth.json
    customer.json
    project.json
    measurement.json
    product.json
    quote.json
    invoice.json
    payment.json
    factory.json
    shipping.json
    installation.json
    warranty.json
    finance.json
    ai.json
    validation.json
  /zh-CN
    ...same namespaces...
```

Translation keys must remain stable across versions. CI must fail when one required locale is missing a key.

## 5. Business data and translations
System-owned reference data must use bilingual fields where necessary:
- `name_en`, `name_zh`
- `description_en`, `description_zh`
- `instructions_en`, `instructions_zh`

User-entered notes are preserved exactly as entered. Optional AI-assisted translation may create a separate translated view, but must never overwrite the original text.

## 6. Measurement display
All dimensions use the Braun 1/16-inch standard in both languages.

Examples:
- `72"`
- `72 5/16"`
- `84 1/16"`

`0/16` is never displayed. English and Chinese interfaces use the same underlying integer-sixteenths value.

## 7. Product terminology
Core product names must use the approved glossary:
- Drapery / 布艺窗帘
- Roman Shade / 罗马帘
- Roller Shade / 卷帘
- Zebra Shade / 斑马帘
- Honeycomb Shade / 蜂巢帘
- Shutters / 百叶窗
- Blinds / 百叶帘
- Motorized Track / 电动窗帘轨道
- Curtain Rod / 窗帘杆
- Hardware / 五金配件

AI search must resolve both languages to the same product IDs.

## 8. Documents and PDFs
Every customer-facing document supports:
1. English
2. Chinese
3. Bilingual English + Chinese

The selected output language is stored with the document version. A signed document remains immutable in its signed language and version. Regenerating in another language creates a new document rendition linked to the same immutable business version.

## 9. Signatures
Quote, Invoice, installation completion, and warranty acknowledgements support bilingual signing pages.

The signer must see:
- Document type and number
- Customer and project
- Product/window summary
- Amount or completion statement when applicable
- Consent text in the selected language
- Printed name, signature, date/time, and verification ID

A staff member, AI, or workflow cannot sign for a customer.

## 10. Notifications
Each notification has separate English and Chinese templates. The recipient's preferred language is used by default. Staff may preview and explicitly select another language before sending.

No automatic translation may alter order numbers, amounts, dates, tracking numbers, SKUs, measurements, addresses, or legal verification IDs.

## 11. AI assistant
The AI Assistant accepts English, Chinese, or mixed-language queries and returns the user's preferred language unless the user asks otherwise.

AI must:
- Use the same role permissions as the signed-in user.
- Resolve bilingual product and status terms to canonical IDs.
- Preserve exact numbers, money, dimensions, dates, order IDs, and document versions.
- Cite the underlying portal record or knowledge source when answering factual business questions.
- Never invent translations for unknown internal terms; mark them for glossary review.

## 12. Permissions and privacy
Language selection never changes permissions. Translation APIs and AI must receive only data the current user is authorized to access.

Factory and Installer roles cannot reveal customer pricing, profit, supplier payment, or unrelated orders merely because a translated view exists.

## 13. Accessibility and UI
- Language switch must be keyboard accessible and screen-reader labeled.
- Chinese and English layouts must remain usable on mobile, tablet, and desktop.
- Buttons must not truncate critical text.
- Dates, currency, phone numbers, and addresses must preserve business meaning; locale formatting must not change stored values.

## 14. Release gate
V1 cannot be released until:
- All required namespaces have complete English and Chinese keys.
- Owner, Sales, Factory, Installer, and Customer workflows pass bilingual tests.
- English, Chinese, and bilingual PDFs pass visual and content verification.
- Switching language preserves drafts and current workflow state.
- Search and AI return the same canonical records for approved bilingual terms.
- No unauthorized data appears in either language.
