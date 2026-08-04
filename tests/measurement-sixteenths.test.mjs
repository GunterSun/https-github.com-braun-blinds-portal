import assert from "node:assert/strict";
import test from "node:test";
import { formatSixteenths, parseMeasurement } from "../lib/measurement-sixteenths.ts";

test("round trips all sixteen fraction slots",()=>{for(let fraction=0;fraction<16;fraction+=1){const sixteenths=72*16+fraction;assert.equal(parseMeasurement(formatSixteenths(sixteenths,false))?.sixteenths,sixteenths)}});
test("supports mixed, hyphenated, decimal, and centimeter inputs",()=>{assert.equal(parseMeasurement("72 1/16")?.sixteenths,1153);assert.equal(parseMeasurement("72-1/16")?.sixteenths,1153);assert.equal(parseMeasurement("72.0625")?.display,"72 1/16 in");assert.equal(parseMeasurement("182.88","cm")?.sixteenths,1152)});
test("rejects ambiguous precision and preserves blanks",()=>{assert.equal(parseMeasurement(""),null);assert.throws(()=>parseMeasurement("72.06"),/1\/16/);assert.throws(()=>parseMeasurement("72 1/10"),/无法识别/)});
