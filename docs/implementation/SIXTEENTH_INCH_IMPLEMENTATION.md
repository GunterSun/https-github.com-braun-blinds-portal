# 1/16 Inch Precision — Implementation Plan

## Canonical storage
All inch-based dimensions use integer sixteenths:

`total_sixteenths = whole_inches * 16 + numerator`

Examples:
- `72 in` → `1152`
- `72 1/16 in` → `1153`
- `72 5/16 in` → `1157`

Do not use floating-point values as the source of truth.

## Shared value object
Implement one shared `Dimension` type used by measurement, catalog, pricing, Quote, Invoice, order, factory, shipping and installation modules.

Required fields:
- `value_sixteenths`
- `unit`: inch
- `display_fraction`
- optional `original_input`
- optional metric conversion metadata

Required functions:
- parse mixed fractions such as `72 5/16`, `72-5/16` and `72 5/16 in`
- parse decimal inches
- parse centimeters
- normalize to nearest permitted increment
- format as reduced mixed fraction
- compare, add and subtract without floating-point drift

## Rounding rules
- Manual inch input must select an exact 1/16 increment.
- Decimal and metric imports must show the original value and proposed 1/16 conversion before approval.
- No silent rounding in formal Quote, Invoice or production data.
- Product-specific rules may deliberately deduct or add sixteenths, but must save the rule and calculation trace.

## Data model
For each measured opening preserve separately:
- raw width/height/depth
- smallest/selected measurement
- mount deduction or addition
- finished product size
- production size

Every derived dimension stores its source and rule version.

## UI
Use two coordinated controls:
- whole-inch numeric field
- fraction selector: 0, 1/16, 1/8, 3/16, 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 11/16, 3/4, 13/16, 7/8, 15/16

Allow keyboard entry and paste. Display normalized values immediately and flag invalid fractions.

## API contract
Dimension payload example:

```json
{
  "value_sixteenths": 1157,
  "display": "72 5/16 in",
  "original_input": "72.3125"
}
```

APIs must not accept ambiguous unitless decimals where the expected unit cannot be proven.

## Migration
- Inventory all existing width, height and depth columns.
- Convert in a staging migration.
- Produce an exception report for blanks, text, malformed fractions and values not exactly representable at 1/16.
- Require human review before production import.
- Preserve original source file, sheet, row and cell.

## Tests
- All 16 fraction increments parse and format correctly.
- Carrying works: `71 15/16 + 1/16 = 72`.
- Deduction works without drift.
- Decimal and metric conversions show review warnings when rounded.
- Measurement → Quote → Invoice → order → factory sheet displays the identical fraction.
- Excel export and re-import preserve the exact sixteenth value.